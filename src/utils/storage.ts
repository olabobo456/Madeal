import { Deal, CreatorProfile } from '../types';
import { initialDeals, initialCreatorProfile } from '../data/mockData';

const DEALS_KEY = 'madeal_deals_v1';
const PROFILE_KEY = 'madeal_profile_v1';

export function getStoredDeals(): Deal[] {
  try {
    const data = localStorage.getItem(DEALS_KEY);
    if (!data) {
      localStorage.setItem(DEALS_KEY, JSON.stringify(initialDeals));
      return initialDeals;
    }
    return JSON.parse(data);
  } catch {
    return initialDeals;
  }
}

export function saveStoredDeals(deals: Deal[]): void {
  try {
    localStorage.setItem(DEALS_KEY, JSON.stringify(deals));
  } catch (e) {
    console.error('Failed to save deals to localStorage', e);
  }
}

export function getStoredProfile(): CreatorProfile {
  try {
    const data = localStorage.getItem(PROFILE_KEY);
    if (!data) {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(initialCreatorProfile));
      return initialCreatorProfile;
    }
    return JSON.parse(data);
  } catch {
    return initialCreatorProfile;
  }
}

export function saveStoredProfile(profile: CreatorProfile): void {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save profile', e);
  }
}
