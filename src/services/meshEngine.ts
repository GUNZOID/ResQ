import type { MeshPacket, EmergencyStatus, BeaconBreadcrumb, GeofenceEvent } from '../types';
import { compressLocationBreadcrumb, calculatePayloadSavings } from './compression';

export type PacketListener = (packet: MeshPacket) => void;
export type PeerStatusListener = (peerId: string, status: 'CONNECTED' | 'DISCONNECTED') => void;

class MeshEngine {
  public localNodeId: string;
  public localNodeName: string;
  private broadcastChannel: BroadcastChannel | null = null;
  private seenPacketIds: Set<string> = new Set();
  private packetListeners: Set<PacketListener> = new Set();
  private peerStatusListeners: Set<PeerStatusListener> = new Set();
  private webrtcPeerConnection: RTCPeerConnection | null = null;
  private webrtcDataChannel: RTCDataChannel | null = null;

  constructor() {
    // Generate persistent or session local node ID
    const storedId = localStorage.getItem('resq_mesh_node_id');
    if (storedId) {
      this.localNodeId = storedId;
    } else {
      this.localNodeId = `node-local-${Math.random().toString(36).substring(2, 8)}`;
      localStorage.setItem('resq_mesh_node_id', this.localNodeId);
    }
    this.localNodeName = localStorage.getItem('resq_mesh_node_name') || 'Local Survivor (You)';

    this.initBroadcastChannel();
  }

  public setLocalName(name: string) {
    this.localNodeName = name;
    localStorage.setItem('resq_mesh_node_name', name);
  }

  private initBroadcastChannel() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.broadcastChannel = new BroadcastChannel('resq_mesh_airwaves_v1');
      this.broadcastChannel.onmessage = (event) => {
        const packet: MeshPacket = event.data;
        this.processIncomingPacket(packet, 'BROADCAST_CHANNEL');
      };
    }
  }

  public subscribePackets(listener: PacketListener): () => void {
    this.packetListeners.add(listener);
    return () => {
      this.packetListeners.delete(listener);
    };
  }

  public subscribePeerStatus(listener: PeerStatusListener): () => void {
    this.peerStatusListeners.add(listener);
    return () => {
      this.peerStatusListeners.delete(listener);
    };
  }

  /**
   * Broadcasts a new packet originating from this local node
   */
  public broadcastPacket(
    type: MeshPacket['type'],
    payload: any,
    targetNodeId: string = 'BROADCAST',
    coords?: { lat: number; lng: number; battery: number; status: EmergencyStatus }
  ): MeshPacket {
    let compressedBreadcrumb: string | undefined;
    if (coords) {
      compressedBreadcrumb = compressLocationBreadcrumb(
        coords.lat,
        coords.lng,
        coords.battery,
        coords.status
      );
    }

    const rawString = JSON.stringify(payload);
    const rawBytes = new TextEncoder().encode(rawString).length;
    const compressedBytes = compressedBreadcrumb
      ? new TextEncoder().encode(compressedBreadcrumb).length
      : rawBytes;

    const packet: MeshPacket = {
      packetId: `pkt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      originNodeId: this.localNodeId,
      originName: this.localNodeName,
      targetNodeId,
      type,
      timestamp: Date.now(),
      hopCount: 0,
      maxHops: 5,
      relayPath: [this.localNodeId],
      payload,
      compressedBreadcrumb,
      rawBytes,
      compressedBytes,
    };

    this.seenPacketIds.add(packet.packetId);

    // Transmit over BroadcastChannel (cross-tab / cross-window)
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage(packet);
    }

    // Transmit over WebRTC DataChannel if active
    if (this.webrtcDataChannel && this.webrtcDataChannel.readyState === 'open') {
      try {
        this.webrtcDataChannel.send(JSON.stringify(packet));
      } catch (err) {
        console.warn('WebRTC DataChannel send error:', err);
      }
    }

    // Notify local listeners
    this.packetListeners.forEach((listener) => listener(packet));

    return packet;
  }

  /**
   * Handles incoming packet: deduplicates, relays if hops left, and dispatches to listeners
   */
  public processIncomingPacket(packet: MeshPacket, source: string) {
    if (!packet || !packet.packetId) return;

    // Check loop prevention
    if (this.seenPacketIds.has(packet.packetId)) {
      return; // Already processed
    }

    this.seenPacketIds.add(packet.packetId);
    if (this.seenPacketIds.size > 1000) {
      // Clear oldest IDs to prevent memory leaks
      const firstIds = Array.from(this.seenPacketIds).slice(0, 500);
      firstIds.forEach((id) => this.seenPacketIds.delete(id));
    }

    // Notify listeners about this packet
    this.packetListeners.forEach((listener) => listener(packet));

    // Multi-hop relay forwarding
    if (packet.hopCount < packet.maxHops && !packet.relayPath.includes(this.localNodeId)) {
      const relayedPacket: MeshPacket = {
        ...packet,
        hopCount: packet.hopCount + 1,
        relayPath: [...packet.relayPath, this.localNodeId],
      };

      // Re-broadcast to local network peers
      if (this.broadcastChannel && source !== 'BROADCAST_CHANNEL') {
        this.broadcastChannel.postMessage(relayedPacket);
      }
      if (this.webrtcDataChannel && this.webrtcDataChannel.readyState === 'open' && source !== 'WEBRTC') {
        try {
          this.webrtcDataChannel.send(JSON.stringify(relayedPacket));
        } catch (err) {
          console.warn('Relay failed over WebRTC:', err);
        }
      }
    }
  }

  /**
   * Generates a WebRTC Offer for serverless peer handshakes
   */
  public async createWebRtcOffer(): Promise<string> {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    });
    this.webrtcPeerConnection = pc;

    const dc = pc.createDataChannel('resq_mesh_channel');
    this.setupDataChannel(dc);

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    // Wait for ICE gathering to complete so the token is self-contained
    await new Promise<void>((resolve) => {
      if (pc.iceGatheringState === 'complete') {
        resolve();
      } else {
        const checkIce = () => {
          if (pc.iceGatheringState === 'complete') {
            pc.removeEventListener('icegatheringstatechange', checkIce);
            resolve();
          }
        };
        pc.addEventListener('icegatheringstatechange', checkIce);
        // Timeout safeguard
        setTimeout(resolve, 1500);
      }
    });

    const sdpString = JSON.stringify(pc.localDescription);
    return btoa(unescape(encodeURIComponent(sdpString)));
  }

  /**
   * Accepts an Offer from another node and generates an Answer token
   */
  public async acceptWebRtcOfferAndCreateAnswer(offerToken: string): Promise<string> {
    const decodedSdp = decodeURIComponent(escape(atob(offerToken)));
    const offerDesc = JSON.parse(decodedSdp);

    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    });
    this.webrtcPeerConnection = pc;

    pc.ondatachannel = (event) => {
      this.setupDataChannel(event.channel);
    };

    await pc.setRemoteDescription(new RTCSessionDescription(offerDesc));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    await new Promise<void>((resolve) => {
      if (pc.iceGatheringState === 'complete') {
        resolve();
      } else {
        const checkIce = () => {
          if (pc.iceGatheringState === 'complete') {
            pc.removeEventListener('icegatheringstatechange', checkIce);
            resolve();
          }
        };
        pc.addEventListener('icegatheringstatechange', checkIce);
        setTimeout(resolve, 1500);
      }
    });

    const sdpString = JSON.stringify(pc.localDescription);
    return btoa(unescape(encodeURIComponent(sdpString)));
  }

  /**
   * Completes the handshake by accepting the peer's Answer token
   */
  public async completeWebRtcHandshake(answerToken: string): Promise<boolean> {
    if (!this.webrtcPeerConnection) {
      throw new Error('No active peer connection initialized');
    }
    const decodedSdp = decodeURIComponent(escape(atob(answerToken)));
    const answerDesc = JSON.parse(decodedSdp);
    await this.webrtcPeerConnection.setRemoteDescription(new RTCSessionDescription(answerDesc));
    return true;
  }

  private setupDataChannel(dc: RTCDataChannel) {
    this.webrtcDataChannel = dc;
    dc.onopen = () => {
      this.peerStatusListeners.forEach((l) => l('webrtc-peer-node', 'CONNECTED'));
    };
    dc.onclose = () => {
      this.peerStatusListeners.forEach((l) => l('webrtc-peer-node', 'DISCONNECTED'));
    };
    dc.onmessage = (event) => {
      try {
        const packet: MeshPacket = JSON.parse(event.data);
        this.processIncomingPacket(packet, 'WEBRTC');
      } catch (err) {
        console.error('Error parsing incoming WebRTC packet:', err);
      }
    };
  }

  /**
   * Helper to simulate a multi-hop relay hop across virtual nodes
   */
  public simulateMultiHopBounce(
    fromNodeId: string,
    fromName: string,
    relayNodes: { id: string; name: string }[],
    type: MeshPacket['type'],
    payload: any,
    coords?: { lat: number; lng: number; battery: number; status: EmergencyStatus }
  ): MeshPacket {
    let compressedBreadcrumb: string | undefined;
    if (coords) {
      compressedBreadcrumb = compressLocationBreadcrumb(
        coords.lat,
        coords.lng,
        coords.battery,
        coords.status
      );
    }

    const relayPath = [fromNodeId, ...relayNodes.map((r) => r.id), this.localNodeId];
    const rawString = JSON.stringify(payload);
    const rawBytes = new TextEncoder().encode(rawString).length;
    const compressedBytes = compressedBreadcrumb
      ? new TextEncoder().encode(compressedBreadcrumb).length
      : rawBytes;

    const packet: MeshPacket = {
      packetId: `sim-pkt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      originNodeId: fromNodeId,
      originName: fromName,
      targetNodeId: 'TRUSTED_CIRCLE',
      type,
      timestamp: Date.now(),
      hopCount: relayNodes.length + 1,
      maxHops: 5,
      relayPath,
      payload,
      compressedBreadcrumb,
      rawBytes,
      compressedBytes,
    };

    this.processIncomingPacket(packet, 'SIMULATION');
    return packet;
  }

  public getNodeId(): string {
    return this.localNodeId;
  }

  public subscribe(listener: PacketListener): () => void {
    return this.subscribePackets(listener);
  }

  public broadcastStatus(
    status: EmergencyStatus,
    lat: number,
    lng: number,
    battery: number
  ): MeshPacket {
    return this.broadcastPacket(
      status === 'CRITICAL_SOS' ? 'SOS_ALARM' : 'STATUS_CHECKIN',
      { status, battery, lat, lng, time: Date.now() },
      'BROADCAST',
      { lat, lng, battery, status }
    );
  }

  public broadcastChatMessage(
    text: string,
    targetNodeId: string = 'BROADCAST'
  ): MeshPacket {
    return this.broadcastPacket(
      'CHAT_MESSAGE',
      { text, time: Date.now() },
      targetNodeId
    );
  }
}

export const meshEngine = new MeshEngine();
