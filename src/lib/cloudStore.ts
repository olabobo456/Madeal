import {
  collection,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
  query,
  where,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Deal, CreatorProfile } from '../types';

const DEALS_COLLECTION = 'deals';
const CREATORS_COLLECTION = 'creators';

function buildBlankProfile(
  creatorId: string,
  displayName: string | null,
  email: string | null,
  photoURL: string | null
): CreatorProfile {
  return {
    name: displayName || 'Creator',
    handle: (displayName || 'creator').toLowerCase().replace(/[^a-z0-9]/g, '') || 'creator',
    email: email || '',
    avatarUrl: photoURL || undefined,
    bio: '',
    location: '',
    niche: 'Content Creator',
    totalEarnings: 0,
    monthlyGrowthPercent: 0,
    defaultCurrency: 'USD',
    defaultTaxRate: 0,
    plan: 'free',
    emailAlerts: {
      onCountersign: true,
      onPaymentReceived: true,
      onDeliverableSubmitted: true,
      onOverdueReminder: true,
      notificationEmail: email || '',
    },
    audienceStats: {
      totalFollowers: '0',
      avgEngagementRate: '0%',
      monthlyImpressions: '0',
      topDemographic: 'General Audience',
      topCountry: 'Global',
      femaleRatio: 50,
    },
    pastBrands: [],
    packages: [],
    rateCards: [],
  } as CreatorProfile;
}

export async function initializeCloudDatabase(
  creatorId: string,
  account?: { displayName: string | null; email: string | null; photoURL: string | null }
): Promise<void> {
  try {
    const profileRef = doc(db, CREATORS_COLLECTION, creatorId);
    const existing = await getDoc(profileRef);
    if (!existing.exists()) {
      await setDoc(profileRef, {
        ...buildBlankProfile(
          creatorId,
          account?.displayName ?? null,
          account?.email ?? null,
          account?.photoURL ?? null
        ),
        creatorId,
      });
    } else {
      const data = existing.data() as CreatorProfile;
      // If legacy profile seeded mock Sarah Jenkins, clean it up with user's real profile
      if (data.name === 'Sarah Jenkins' || data.handle === '@sarahcreates' || data.handle === 'sarahcreates') {
        await setDoc(profileRef, {
          ...buildBlankProfile(
            creatorId,
            account?.displayName ?? null,
            account?.email ?? null,
            account?.photoURL ?? null
          ),
          creatorId,
        });
      }
    }
  } catch (error) {
    console.info('Firestore cloud synchronization operating in offline-first mode.');
  }
}

export function subscribeToDeals(
  creatorId: string,
  onUpdate: (deals: Deal[]) => void,
  onError?: (err: Error) => void
) {
  try {
    const dealsRef = query(collection(db, DEALS_COLLECTION), where('creatorId', '==', creatorId));
    return onSnapshot(
      dealsRef,
      { includeMetadataChanges: false },
      (snapshot) => {
        const loadedDeals: Deal[] = [];
        snapshot.forEach((docSnap) => {
          const dealData = docSnap.data() as Deal;
          // Filter out legacy mock data if it was previously saved
          if (
            dealData.creatorHandle === '@sarahcreates' ||
            dealData.brandName === 'Lumina Skincare' ||
            dealData.brandName === 'Apex Performance' ||
            dealData.brandName === 'NordVPN' ||
            dealData.brandName === 'Bloom Nutrition'
          ) {
            deleteDealFromCloud(dealData.id);
            return;
          }
          loadedDeals.push(dealData);
        });
        loadedDeals.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        onUpdate(loadedDeals);
      },
      (error) => {
        if (onError) onError(error);
      }
    );
  } catch (e) {
    return () => {};
  }
}

export async function deleteDealFromCloud(dealId: string): Promise<void> {
  try {
    const dealRef = doc(db, DEALS_COLLECTION, dealId);
    await deleteDoc(dealRef);
  } catch (error) {
    console.warn('Could not delete deal from cloud:', error);
  }
}

export function subscribeToSingleDeal(
  dealId: string,
  onUpdate: (deal: Deal | null) => void,
  onError?: (err: Error) => void
) {
  try {
    const dealRef = doc(db, DEALS_COLLECTION, dealId);
    return onSnapshot(
      dealRef,
      (docSnap) => {
        if (docSnap.exists()) {
          onUpdate(docSnap.data() as Deal);
        } else {
          onUpdate(null);
        }
      },
      (err) => {
        if (onError) onError(err);
      }
    );
  } catch (e) {
    return () => {};
  }
}

export async function getDealFromCloud(dealId: string): Promise<Deal | null> {
  try {
    const dealRef = doc(db, DEALS_COLLECTION, dealId);
    const docSnap = await getDoc(dealRef);
    if (docSnap.exists()) {
      return docSnap.data() as Deal;
    }
  } catch (e) {
    console.warn('Could not fetch deal from cloud directly', e);
  }
  return null;
}

export function subscribeToProfile(
  creatorId: string,
  onUpdate: (profile: CreatorProfile) => void
) {
  try {
    const profileRef = doc(db, CREATORS_COLLECTION, creatorId);
    return onSnapshot(
      profileRef,
      { includeMetadataChanges: false },
      (docSnap) => {
        if (docSnap.exists()) {
          onUpdate(docSnap.data() as CreatorProfile);
        }
      },
      () => {}
    );
  } catch (e) {
    return () => {};
  }
}

export async function getProfileFromCloud(creatorId: string): Promise<CreatorProfile | null> {
  try {
    const profileRef = doc(db, CREATORS_COLLECTION, creatorId);
    const docSnap = await getDoc(profileRef);
    if (docSnap.exists()) {
      return docSnap.data() as CreatorProfile;
    }
  } catch (e) {
    console.warn('Could not fetch profile from cloud directly', e);
  }
  return null;
}

export async function syncDealToCloud(deal: Deal): Promise<void> {
  try {
    const dealRef = doc(db, DEALS_COLLECTION, deal.id);
    await setDoc(dealRef, deal, { merge: true });

    if (deal.clientSigned) {
      const auditLogRef = doc(db, 'audit_logs', `audit_${deal.id}_${Date.now()}`);
      await setDoc(auditLogRef, {
        creatorId: deal.creatorId,
        dealId: deal.id,
        invoiceNumber: deal.invoiceNumber,
        brandName: deal.brandName,
        signature: deal.signature,
        signedAt: deal.signedAt || new Date().toISOString(),
        totalAmount: deal.totalAmount,
        status: deal.status,
        timestamp: serverTimestamp(),
      });
    }
  } catch (error) {
    console.info('Synced deal locally, pending cloud connection.');
  }
}

export async function syncProfileToCloud(
  profile: CreatorProfile,
  creatorId: string
): Promise<void> {
  try {
    const profileRef = doc(db, CREATORS_COLLECTION, creatorId);
    await setDoc(profileRef, profile, { merge: true });
  } catch (error) {
    console.info('Synced profile locally, pending cloud connection.');
  }
}

export function getBrandPortalUrl(dealId: string): string {
  let origin = window.location.origin;
  if (origin.includes('ais-dev-')) {
    origin = origin.replace('ais-dev-', 'ais-pre-');
  }
  const path = window.location.pathname.replace(/\/portal\/deal\/[^/]+/, '');
  const baseUrl = `${origin}${path === '/' ? '' : path}`;
  return `${baseUrl}/?brand_portal=${encodeURIComponent(dealId)}`;
}
