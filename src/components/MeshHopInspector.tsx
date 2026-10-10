import React, { useState } from 'react';
import type { MeshPacket } from '../types';
import {
  Network,
  Share2,
  ArrowRight,
  Cpu,
  Radio,
  FileCheck,
  TrendingDown,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';

interface MeshHopInspectorProps {
  packets: MeshPacket[];
  localNodeId: string;
  onSimulateRelayBounce: () => void;
  onOpenWebRtcModal: () => void;
}

export const MeshHopInspector: React.FC<MeshHopInspectorProps> = ({
  packets,
  localNodeId,
  onSimulateRelayBounce,
  onOpenWebRtcModal,
}) => {
  const [selectedPacketId, setSelectedPacketId] = useState<string | null>(null);

  const selectedPacket = packets.find((p) => p.packetId === selectedPacketId) || packets[0];

  return (
    <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl p-4 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3.5">
        <div className="flex items-center gap-2">
          <Network className="w-4 h-4 text-sky-400" />
          <h2 className="text-sm font-bold text-slate-100 tracking-tight">
            Multi-Hop Mesh Relay & Packet Inspector
          </h2>
          <span className="text-xs font-mono text-slate-400">
            ({packets.length} packets routed)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onSimulateRelayBounce}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-950/80 hover:bg-sky-900 border border-sky-600/70 text-sky-300 rounded-lg text-xs font-semibold shadow transition-colors"
            title="Simulate Maya bouncing an SOS packet through Robert's mobile vehicle to you"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Simulate Multi-Hop Relay</span>
          </button>

          <button
            onClick={onOpenWebRtcModal}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition-colors"
            title="Open WebRTC P2P Direct Pair Link (No Server)"
          >
            <Radio className="w-3.5 h-3.5 text-emerald-400" />
            <span>WebRTC Direct Link</span>
          </button>
        </div>
      </div>

      {/* Low-Bandwidth Compression Metric Callout */}
      {selectedPacket && selectedPacket.compressedBreadcrumb && (
        <div className="mb-3 p-3 rounded-lg bg-slate-950/80 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div>
            <div className="flex items-center gap-2 text-slate-300 font-semibold">
              <Cpu className="w-4 h-4 text-emerald-400" />
              <span>Low-Bandwidth Coordinate Compression</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Compressed GPS binary grid token hops cleanly through constrained Bluetooth/LoRa radio bursts.
            </p>
          </div>

          <div className="flex items-center gap-3 font-mono text-[11px]">
            <div className="text-right">
              <span className="text-slate-500 block">Raw JSON</span>
              <span className="text-slate-300 font-bold">{selectedPacket.rawBytes || 248} B</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
            <div className="text-right">
              <span className="text-emerald-400 block">Compressed</span>
              <span className="text-emerald-300 font-bold">{selectedPacket.compressedBytes || 22} B</span>
            </div>
            <div className="px-2 py-1 rounded bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 font-bold flex items-center gap-1">
              <TrendingDown className="w-3 h-3" />
              <span>
                {Math.round(
                  (((selectedPacket.rawBytes || 248) - (selectedPacket.compressedBytes || 22)) /
                    (selectedPacket.rawBytes || 248)) *
                    100
                )}
                % saved
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Selected Packet Hop Trace Visualization */}
      {selectedPacket && (
        <div className="p-3 mb-3 rounded-lg bg-slate-950 border border-slate-800">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-semibold text-slate-300">
              Packet Hop Route: <span className="font-mono text-sky-400">{selectedPacket.packetId}</span>
            </span>
            <span className="font-mono text-slate-400">
              {selectedPacket.hopCount} Hops (TTL: {selectedPacket.maxHops - selectedPacket.hopCount} remaining)
            </span>
          </div>

          {/* Visual Route Nodes */}
          <div className="flex flex-wrap items-center gap-2 py-2">
            {selectedPacket.relayPath.map((nodeId, idx) => {
              const isOrigin = idx === 0;
              const isDestination = idx === selectedPacket.relayPath.length - 1;
              const isSelf = nodeId === localNodeId;

              const label = isOrigin
                ? selectedPacket.originName
                : isSelf
                ? 'Your Node (Target)'
                : `Relay Node ${nodeId.slice(-4)}`;

              return (
                <React.Fragment key={`${nodeId}-${idx}`}>
                  <div
                    className={`px-2.5 py-1.5 rounded-lg border text-xs font-mono flex items-center gap-1.5 ${
                      isSelf
                        ? 'bg-sky-950/80 border-sky-500 text-sky-300'
                        : isOrigin
                        ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                        : 'bg-slate-900 border-slate-700 text-slate-300'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-current" />
                    <span>{label}</span>
                  </div>
                  {idx < selectedPacket.relayPath.length - 1 && (
                    <ArrowRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Payload Summary */}
          <div className="mt-2 pt-2 border-t border-slate-800/80 text-[11px] font-mono text-slate-400 flex flex-wrap items-center justify-between gap-2">
            <span>Type: {selectedPacket.type}</span>
            <span>Target: {selectedPacket.targetNodeId}</span>
            <span>
              Timestamp: {new Date(selectedPacket.timestamp).toLocaleTimeString()}
            </span>
          </div>
        </div>
      )}

      {/* Packet Stream List */}
      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
        {packets.map((pkt) => (
          <div
            key={pkt.packetId}
            onClick={() => setSelectedPacketId(pkt.packetId)}
            className={`p-2 rounded-lg border text-xs flex items-center justify-between transition-colors cursor-pointer ${
              selectedPacket?.packetId === pkt.packetId
                ? 'bg-slate-800/90 border-sky-500/70 text-slate-200'
                : 'bg-slate-950/50 hover:bg-slate-900 border-slate-800/70 text-slate-400'
            }`}
          >
            <div className="flex items-center gap-2 truncate">
              <span
                className={`w-2 h-2 rounded-full ${
                  pkt.type === 'SOS_ALARM'
                    ? 'bg-red-500'
                    : pkt.type === 'GEOFENCE_ALERT'
                    ? 'bg-emerald-400'
                    : 'bg-sky-400'
                }`}
              />
              <span className="font-semibold text-slate-200 truncate">{pkt.originName}</span>
              <span className="text-[10px] font-mono text-slate-500 truncate">[{pkt.type}]</span>
            </div>

            <div className="flex items-center gap-3 font-mono text-[10px] shrink-0 text-slate-400">
              <span>{pkt.hopCount} hop{pkt.hopCount > 1 ? 's' : ''}</span>
              <span>{new Date(pkt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
