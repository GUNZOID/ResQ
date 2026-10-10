import type { UserProfile } from '../types';

const STORAGE_KEY = 'resq_user_profile';

export const DEFAULT_USER_PROFILE: UserProfile = {
  name: 'George',
  age: 28,
  bloodGroup: 'O+',
  emergencyContactName: 'Sarah Jenkins',
  emergencyContactPhone: '+91 98765 43210',
  emergencyContactRelation: 'Spouse',
  medicalConditions: 'Asthma (carries inhaler), Penicillin allergy',
};

export function loadUserProfile(): UserProfile {
  if (typeof window === 'undefined') return DEFAULT_USER_PROFILE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_USER_PROFILE;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_USER_PROFILE,
      ...parsed,
    };
  } catch (e) {
    console.error('Failed to load user profile:', e);
    return DEFAULT_USER_PROFILE;
  }
}

export function saveUserProfile(profile: UserProfile): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save user profile:', e);
  }
}
