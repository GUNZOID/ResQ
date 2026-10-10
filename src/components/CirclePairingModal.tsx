import React, { useState } from 'react';
import type { FamilyMember } from '../types';
import { meshEngine } from '../services/meshEngine';
import {
  QrCode,
  ShieldCheck,
  X,
  Copy,
  Check,
  UserPlus,
  HeartHandshake,
} from 'lucide-react';

interface CirclePairingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMember: (member: Partial<FamilyMember>) => void;
  localNodeId: string;
}

export const CirclePairingModal: React.FC<CirclePairingModalProps> = ({
  isOpen,
  onClose,
  onAddMember,
  localNodeId,
}) => {
  const [tab, setTab] = useState<'PAIR_CODE' | 'WEBRTC'>('PAIR_CODE');
  const [copied, setCopied] = useState(false);

  const [name, setName] = useState('');
  const [relation, setRelation] = useState('Partner / Spouse');
  const [peerKey, setPeerKey] = useState('');

  const [webrtcOffer, setWebrtcOffer] = useState('');
  const [webrtcAnswerInput, setWebrtcAnswerInput] = useState('');
  const [webrtcOfferInput, setWebrtcOfferInput] = useState('');
  const [generatedAnswer, setGeneratedAnswer] = useState('');
  const [webrtcStatus, setWebrtcStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const myPairingKey = `RESQ-${localNodeId.slice(-4).toUpperCase()}-NODE`;

  const copyKey = () => {
    navigator.clipboard.writeText(myPairingKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePairSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddMember({
      name: name.trim(),
      relation,
      pairingKey: peerKey.trim() || `PAIR-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      status: 'SAFE',
      batteryLevel: 95,
      isOnline: true,
      hopsToNode: 1,
      lastLat: 37.7750 + (Math.random() - 0.5) * 0.015,
      lastLng: -122.4190 + (Math.random() - 0.5) * 0.015,
      lastSeenTimestamp: Date.now(),
      breadcrumbs: [],
    });

    setName('');
    setPeerKey('');
    onClose();
  };

  const handleGenerateOffer = async () => {
    try {
      setWebrtcStatus('Creating direct peer connection offer...');
      const offer = await meshEngine.createWebRtcOffer();
      setWebrtcOffer(offer);
      setWebrtcStatus('Offer ready! Share this token with the other phone.');
    } catch (err) {
      setWebrtcStatus('Could not generate offer token.');
    }
  };

  const handleAcceptOfferAndCreateAnswer = async () => {
    try {
      if (!webrtcOfferInput.trim()) return;
      setWebrtcStatus('Processing partner phone offer...');
      const answer = await meshEngine.acceptWebRtcOfferAndCreateAnswer(webrtcOfferInput.trim());
      setGeneratedAnswer(answer);
      setWebrtcStatus('Answer generated! Share this token back to connect.');
    } catch (err) {
      setWebrtcStatus('Invalid token format.');
    }
  };

  const handleCompleteHandshake = async () => {
    try {
      if (!webrtcAnswerInput.trim()) return;
      await meshEngine.completeWebRtcHandshake(webrtcAnswerInput.trim());
      setWebrtcStatus('Connected directly to partner node without servers!');
    } catch (err) {
      setWebrtcStatus('Handshake failed.');
    }
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm font-sans">
      <div className="w-full max-w-lg bg-[#201D1A] border border-[#332E29] rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#332E29]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#81B29A]/20 text-[#81B29A] flex items-center justify-center">
              <HeartHandshake className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[#F7F4EE]">
                Pair with Family & Neighbors
              </h2>
              <p className="text-[11px] text-[#A8A194]">
                Direct off-grid handshake without cloud servers
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#A8A194] hover:text-[#F7F4EE] hover:bg-[#27231F] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-[#332E29] bg-[#161412] text-xs">
          <button
            onClick={() => setTab('PAIR_CODE')}
            className={`flex-1 py-3 px-4 text-center font-medium transition-colors border-b-2 ${
              tab === 'PAIR_CODE'
                ? 'border-[#E07A5F] text-[#F7F4EE] bg-[#201D1A]'
                : 'border-transparent text-[#A8A194] hover:text-[#F7F4EE]'
            }`}
          >
            1. Circle Key & QR
          </button>
          <button
            onClick={() => setTab('WEBRTC')}
            className={`flex-1 py-3 px-4 text-center font-medium transition-colors border-b-2 ${
              tab === 'WEBRTC'
                ? 'border-[#E07A5F] text-[#F7F4EE] bg-[#201D1A]'
                : 'border-transparent text-[#A8A194] hover:text-[#F7F4EE]'
            }`}
          >
            2. Direct WebRTC Link
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 max-h-[75vh] overflow-y-auto space-y-4 text-xs">
          {tab === 'PAIR_CODE' ? (
            <>
              {/* My Node Credentials */}
              <div className="p-4 rounded-2xl bg-[#161412] border border-[#2C2722] space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#D6D0C4]">
                    Your Device's Emergency Key
                  </span>
                  <span className="text-[11px] text-[#81B29A] font-medium">Encrypted Link</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex-1 font-mono font-medium text-xs text-[#6495ED] bg-[#201D1A] px-3.5 py-2.5 rounded-xl border border-[#332E29]">
                    {myPairingKey}
                  </div>
                  <button
                    onClick={copyKey}
                    className="p-2.5 rounded-xl bg-[#201D1A] hover:bg-[#27231F] text-[#D6D0C4] border border-[#332E29] transition-colors"
                    title="Copy Key"
                  >
                    {copied ? <Check className="w-4 h-4 text-[#81B29A]" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                <div className="flex items-center gap-3 pt-2 border-t border-[#2C2722]">
                  <div className="w-16 h-16 bg-[#FFFDF8] p-1.5 rounded-xl shrink-0 flex items-center justify-center shadow">
                    <QrCode className="w-12 h-12 text-[#161412]" />
                  </div>
                  <p className="text-[11px] text-[#A8A194] leading-relaxed">
                    Have your family member scan this or enter your key before disaster season. Once saved, your devices discover each other automatically over mesh airwaves.
                  </p>
                </div>
              </div>

              {/* Pair New Family Member Form */}
              <form onSubmit={handlePairSubmit} className="space-y-3 pt-1">
                <h3 className="font-semibold text-sm text-[#F7F4EE] flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-[#E07A5F]" />
                  <span>Register a Loved One in Your Circle</span>
                </h3>

                <div>
                  <label className="block text-[11px] text-[#A8A194] mb-1">Their Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Grandma, Maya, Uncle John..."
                    className="w-full bg-[#161412] border border-[#332E29] rounded-xl px-3.5 py-2.5 text-[#F7F4EE] placeholder-[#8B8477] focus:outline-none focus:border-[#E07A5F]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] text-[#A8A194] mb-1">Relationship</label>
                    <select
                      value={relation}
                      onChange={(e) => setRelation(e.target.value)}
                      className="w-full bg-[#161412] border border-[#332E29] rounded-xl px-3 py-2.5 text-[#F7F4EE] focus:outline-none"
                    >
                      <option value="Partner / Spouse">Partner / Spouse</option>
                      <option value="Child">Son / Daughter</option>
                      <option value="Parent">Parent</option>
                      <option value="Sibling">Brother / Sister</option>
                      <option value="Grandparent">Grandparent</option>
                      <option value="Neighbor">Neighbor</option>
                      <option value="Volunteer Medic">Volunteer Medic</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-[#A8A194] mb-1">Their Key (Optional)</label>
                    <input
                      type="text"
                      value={peerKey}
                      onChange={(e) => setPeerKey(e.target.value)}
                      placeholder="e.g. RESQ-XXXX-NODE"
                      className="w-full bg-[#161412] border border-[#332E29] rounded-xl px-3 py-2.5 text-[#F7F4EE] placeholder-[#8B8477] focus:outline-none font-mono text-xs"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-[#E07A5F] hover:bg-[#D96B50] text-white font-medium shadow-sm transition-all active:scale-[0.98]"
                >
                  Save to Trusted Circle
                </button>
              </form>
            </>
          ) : (
            /* WebRTC Token Handshake */
            <div className="space-y-3.5">
              <div className="p-3.5 rounded-2xl bg-[#161412] border border-[#2C2722]">
                <span className="font-semibold text-xs text-[#F7F4EE] block mb-1">
                  Zero-Cloud WebRTC Direct Handshake
                </span>
                <p className="text-[11px] text-[#A8A194] leading-relaxed">
                  WebRTC connects two phones directly in their browsers without any central cloud or telecom provider.
                </p>
              </div>

              {/* Step 1 */}
              <div className="p-3.5 rounded-2xl bg-[#161412] border border-[#2C2722] space-y-2">
                <span className="font-medium text-xs text-[#D6D0C4] block">
                  Method 1: Phone A (Create Connection)
                </span>
                <button
                  onClick={handleGenerateOffer}
                  className="px-3.5 py-2 rounded-xl bg-[#E07A5F] hover:bg-[#D96B50] text-white font-medium"
                >
                  Generate Invitation Token
                </button>

                {webrtcOffer && (
                  <div className="mt-2 space-y-1">
                    <label className="block text-[10px] text-[#A8A194]">Share with Phone B:</label>
                    <textarea
                      readOnly
                      rows={3}
                      value={webrtcOffer}
                      className="w-full bg-[#201D1A] border border-[#332E29] rounded-xl p-2 font-mono text-[10px] text-[#D6D0C4]"
                    />
                  </div>
                )}

                {webrtcOffer && (
                  <div className="pt-2">
                    <label className="block text-[10px] text-[#A8A194] mb-1">
                      Paste Phone B's Response to Complete:
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={webrtcAnswerInput}
                        onChange={(e) => setWebrtcAnswerInput(e.target.value)}
                        placeholder="Paste response token..."
                        className="flex-1 bg-[#201D1A] border border-[#332E29] rounded-xl px-2.5 text-xs text-white"
                      />
                      <button
                        onClick={handleCompleteHandshake}
                        className="px-3.5 py-1.5 bg-[#81B29A] text-[#161412] font-semibold rounded-xl"
                      >
                        Link
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Step 2 */}
              <div className="p-3.5 rounded-2xl bg-[#161412] border border-[#2C2722] space-y-2">
                <span className="font-medium text-xs text-[#D6D0C4] block">
                  Method 2: Phone B (Accept Invitation)
                </span>
                <input
                  type="text"
                  value={webrtcOfferInput}
                  onChange={(e) => setWebrtcOfferInput(e.target.value)}
                  placeholder="Paste Phone A's token here..."
                  className="w-full bg-[#201D1A] border border-[#332E29] rounded-xl px-3 py-2 text-xs text-white"
                />
                <button
                  onClick={handleAcceptOfferAndCreateAnswer}
                  className="px-3.5 py-2 rounded-xl bg-[#6495ED] hover:bg-blue-600 text-white font-medium"
                >
                  Accept & Generate Response
                </button>

                {generatedAnswer && (
                  <div className="mt-2">
                    <label className="block text-[10px] text-[#A8A194]">Send back to Phone A:</label>
                    <textarea
                      readOnly
                      rows={3}
                      value={generatedAnswer}
                      className="w-full bg-[#201D1A] border border-[#332E29] rounded-xl p-2 font-mono text-[10px] text-[#D6D0C4]"
                    />
                  </div>
                )}
              </div>

              {webrtcStatus && (
                <div className="p-2.5 rounded-xl bg-[#201D1A] text-[#81B29A] text-xs">
                  {webrtcStatus}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
