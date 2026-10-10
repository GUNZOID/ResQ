import React, { useState, useEffect } from 'react';
import type { UserProfile } from '../types';
import {
  X,
  User,
  HeartPulse,
  Phone,
  Calendar,
  AlertCircle,
  Check,
  Shield,
  Activity,
  Droplet,
  FileText,
} from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSaveProfile: (updated: UserProfile) => void;
}

const BLOOD_GROUPS = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
}) => {
  const [formData, setFormData] = useState<UserProfile>(profile);
  const [isSavedRecently, setIsSavedRecently] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setFormData(profile);
      setIsSavedRecently(false);
    }
  }, [isOpen, profile]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile(formData);
    setIsSavedRecently(true);
    setTimeout(() => {
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-[#12141D] w-full max-w-[440px] max-h-[90vh] overflow-hidden rounded-3xl border border-[#262A3C] shadow-2xl flex flex-col text-white select-none">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#202334] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <HeartPulse className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Emergency Medical ID</h2>
              <p className="text-[11px] text-gray-400">On-device profile for mesh & first responders</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-[#1E2232] transition-colors"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 no-scrollbar">
          {/* Blank PFP Section */}
          <div className="flex flex-col items-center justify-center pb-2">
            <div className="relative">
              {/* Blank Avatar */}
              <div className="w-20 h-20 rounded-full bg-[#181A26] border-2 border-[#2F344D] flex items-center justify-center shadow-inner group">
                <User className="w-10 h-10 text-gray-400/80" />
              </div>
              <div className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full bg-[#1F2336] border border-[#333852] text-[9px] font-bold text-gray-300">
                PFP
              </div>
            </div>
            <p className="text-xs font-semibold text-gray-200 mt-2.5">
              {formData.name || 'Anonymous ResQ User'}
            </p>
            <p className="text-[11px] text-gray-400">Mesh Node ID: Node-Self (Delhi NCR)</p>
          </div>

          {/* Name & Age Row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 space-y-1.5">
              <label className="text-[11px] font-semibold text-gray-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-gray-400" />
                Full Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter your name"
                required
                className="w-full px-3 py-2 rounded-xl bg-[#171924] border border-[#272B3C] text-sm text-white placeholder-gray-500 focus:outline-hidden focus:border-rose-500 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-gray-300 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                Age
              </label>
              <input
                type="number"
                min="1"
                max="120"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                placeholder="Age"
                required
                className="w-full px-3 py-2 rounded-xl bg-[#171924] border border-[#272B3C] text-sm text-white placeholder-gray-500 focus:outline-hidden focus:border-rose-500 transition-colors"
              />
            </div>
          </div>

          {/* Blood Group Selection */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-gray-300 flex items-center gap-1.5">
              <Droplet className="w-3.5 h-3.5 text-rose-400" />
              Blood Group
            </label>
            <div className="grid grid-cols-4 gap-2">
              {BLOOD_GROUPS.map((group) => {
                const isSelected = formData.bloodGroup === group;
                return (
                  <button
                    key={group}
                    type="button"
                    onClick={() => setFormData({ ...formData, bloodGroup: group })}
                    className={`py-1.5 rounded-xl text-xs font-bold transition-all border ${
                      isSelected
                        ? 'bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-900/40 scale-102'
                        : 'bg-[#171924] text-gray-300 border-[#272B3C] hover:border-[#383E56]'
                    }`}
                  >
                    {group}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="p-3.5 rounded-2xl bg-[#161824] border border-[#25293A] space-y-3">
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs font-bold text-white">Emergency Contact</span>
            </div>

            <div className="space-y-2">
              <div>
                <label className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
                  Contact Name & Relation
                </label>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  <input
                    type="text"
                    value={formData.emergencyContactName}
                    onChange={(e) =>
                      setFormData({ ...formData, emergencyContactName: e.target.value })
                    }
                    placeholder="e.g. Sarah Jenkins"
                    required
                    className="col-span-2 px-3 py-1.5 rounded-xl bg-[#11131C] border border-[#272B3C] text-xs text-white placeholder-gray-500 focus:outline-hidden focus:border-emerald-500"
                  />
                  <input
                    type="text"
                    value={formData.emergencyContactRelation}
                    onChange={(e) =>
                      setFormData({ ...formData, emergencyContactRelation: e.target.value })
                    }
                    placeholder="Relation"
                    className="px-2.5 py-1.5 rounded-xl bg-[#11131C] border border-[#272B3C] text-xs text-white placeholder-gray-500 focus:outline-hidden focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.emergencyContactPhone}
                  onChange={(e) =>
                    setFormData({ ...formData, emergencyContactPhone: e.target.value })
                  }
                  placeholder="+91 98765 43210"
                  required
                  className="w-full mt-1 px-3 py-1.5 rounded-xl bg-[#11131C] border border-[#272B3C] text-xs text-white placeholder-gray-500 focus:outline-hidden focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Medical Conditions & Allergies */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-gray-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-amber-400" />
                Medical Conditions, Allergies & Notes
              </span>
              <span className="text-[10px] text-gray-500 font-normal">Included in SOS packet</span>
            </label>
            <textarea
              rows={3}
              value={formData.medicalConditions}
              onChange={(e) => setFormData({ ...formData, medicalConditions: e.target.value })}
              placeholder="e.g., Asthma (inhaler carried), Penicillin allergy, Type 1 Diabetes, Pacemaker..."
              className="w-full px-3 py-2 rounded-xl bg-[#171924] border border-[#272B3C] text-xs text-white placeholder-gray-500 focus:outline-hidden focus:border-amber-500 transition-colors resize-none leading-relaxed"
            />
          </div>

          {/* Mesh Privacy Banner */}
          <div className="p-2.5 rounded-xl bg-[#141620] border border-[#222638] flex items-start gap-2">
            <Shield className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
            <p className="text-[10px] text-gray-400 leading-relaxed">
              Medical ID is stored strictly on this device and only attached to distress packets during an active emergency SOS.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-[#181A26] border border-[#272B3C] text-xs font-semibold text-gray-300 hover:text-white hover:bg-[#202334] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-950/50 transition-all flex items-center justify-center gap-1.5 active:scale-95"
            >
              {isSavedRecently ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Save Profile</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
