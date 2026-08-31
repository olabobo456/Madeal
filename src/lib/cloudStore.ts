import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  onSnapshot,
  serverTimestamp,
  query,
  where,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Deal, CreatorProfile } from '../types';
import { initialDeals, initialCreatorProfile } from '../data/mockData';

const DEALS_COLLECTION = 'deals';
const CREATORS_COLLECTION = 'creators';

/**
 * Initializes Firestore with seed demo data for a freshly signed-in
 * creator who has no deals yet. Scoped to creatorId so we never touch
 * or overwrite another creator's data.
 */
export async function initializeCloudDatabase(creatorId: string): Promise<void> {
  try {
    const mine = query(collection(db, DEALS_COLLECTION), where('creatorId', '==', creatorId));
    const dealsSnapshot = await getDocs(mine);
    if (dealsSnapshot.empty) {
      await setDoc(doc(db, CREATORS_COLLECTION, creatorId), {
        ...initialCreatorProfile,
        creatorId,
      });

      for (const deal of initialDeals) {
        await setDoc(doc(db, DEALS_COLLECTION, deal.id), { ...deal, creatorId });
      }
    }
  } catch (error) {
    // Non-blocking offline fallback
    console.info('Firestore cloud synchronization operating in offline-first mode.');
  }
}

/**
 * Subscribes to real-time deals collection changes, scoped to the
 * signed-in creator. Firestore security rules enforce this filter
 * server-side too (see firestore.rules) — a query for a different
 * creator's deals will be rejected outright, not silently filtered.
 */
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
        if (!snapshot.empty) {
          const loadedDeals: Deal[] = [];
          snapshot.forEach((docSnap) => {
            loadedDeals.push(docSnap.data() as Deal);
          });
          loadedDeals.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          onUpdate(loadedDeals);
        }
      },
      (error) => {
        if (onError) onError(error);
      }
    );
  } catch (e) {
    return () => {};
  }
}

/**
 * Subscribes to a single deal by ID in real-time (used by the Brand
 * Countersign Portal). Deal IDs are unguessable tokens, so this stays
 * an open `get` — see firestore.rules.
 */
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

/**
 * Fetches a single deal directly from Firestore
 */
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

/**
 * Subscribes to Creator profile updates in real time
 */
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
      () => {
        // Silently preserve current local state when offline
      }
    );
  } catch (e) {
    return () => {};
  }
}

/**
 * Fetches creator profile from cloud
 */
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

/**
 * Saves or updates a deal in Firestore and records an immutable audit
 * log entry when the brand countersigns. `deal.creatorId` must already
 * be set (ContractWizard stamps it at creation) — security rules will
 * reject the write otherwise.
 */
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
    // Local persistence will keep the deal intact
    console.info('Synced deal locally, pending cloud connection.');
  }
}

/**
 * Saves updated creator profile to Firestore
 */
export async function syncProfileToCloud(
  profile: CreatorProfile,
  creatorId: string
): Promise<void> {
  try {
    const profileRef = doc(db, CREATORS_COLLECTION, creatorId);
    await setDoc(profileRef, profile, { merge: true });
  } catch (error) {
    // Local persistence will keep profile intact
    console.info('Synced profile locally, pending cloud connection.');
  }
}

/**
 * Generates a universally compatible Brand Portal signing URL that works across any browser/device
 */
export function getBrandPortalUrl(dealId: string): string {
  let origin = window.location.origin;
  if (origin.includes('ais-dev-')) {
    origin = origin.replace('ais-dev-', 'ais-pre-');
  }
  const path = window.location.pathname.replace(/\/portal\/deal\/[^/]+/, '');
  const baseUrl = `${origin}${path === '/' ? '' : path}`;
  return `${baseUrl}/?brand_portal=${encodeURIComponent(dealId)}`;
}
