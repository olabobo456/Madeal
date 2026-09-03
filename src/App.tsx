import React, { useState, useEffect } from 'react';
import { Deal, CreatorProfile, EmailAlertItem } from './types';
import { getStoredDeals, saveStoredDeals, getStoredProfile, saveStoredProfile } from './utils/storage';
import {
  initializeCloudDatabase,
  subscribeToDeals,
  subscribeToProfile,
  subscribeToSingleDeal,
  getDealFromCloud,
  getProfileFromCloud,
  syncDealToCloud,
  syncProfileToCloud,
  deleteDealFromCloud,
} from './lib/cloudStore';
import {
  getStoredEmailAlerts,
  saveStoredEmailAlerts,
  createCountersignAlert,
  createPaymentReceivedAlert,
  createDeliverableDeliveredAlert,
} from './lib/emailAlerts';
import { onAuthChange, signInWithGoogle, signOutCreator } from './lib/auth';
import type { User } from 'firebase/auth';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { ContractWizard } from './components/ContractWizard';
import { ContractSignView } from './components/ContractSignView';
import { DealsHubView } from './components/DealsHubView';
import { InvoicesView } from './components/InvoicesView';
import { CommunicationsView } from './components/CommunicationsView';
import { BottomNav } from './components/BottomNav';
import { ProfileModal } from './components/ProfileModal';
import { BrandPortalModal } from './components/BrandPortalModal';
import { BrandPortalView } from './components/BrandPortalView';
import { MediaKitView } from './components/MediaKitView';
import { PricingModal } from './components/PricingModal';
import { EmailAlertsModal } from './components/EmailAlertsModal';
import { LandingPageView } from './components/LandingPageView';
import { AuthView } from './components/AuthView';
import { ShieldCheck, Clock, RefreshCw, ArrowLeft, ArrowUpRight } from 'lucide-react';
import { SponsorshipPackage } from './types';

/**
 * Universal helper to extract a brand portal deal ID from any URL structure
 */
function extractBrandPortalDealId(): string | null {
  try {
    // 1. Query parameters (?brand_portal=xxx, ?portal=xxx, ?dealId=xxx, ?deal=xxx)
    const urlParams = new URLSearchParams(window.location.search);
    const fromSearch =
      urlParams.get('brand_portal') ||
      urlParams.get('portal') ||
      urlParams.get('dealId') ||
      urlParams.get('deal');
    if (fromSearch) return fromSearch;

    // 2. Hash (#/portal/deal/xxx or #portal=xxx)
    const hash = window.location.hash;
    if (hash) {
      const hashMatch = hash.match(/(?:portal\/deal\/|portal\/|deal\/|portal=)([a-zA-Z0-9_-]+)/);
      if (hashMatch && hashMatch[1]) return hashMatch[1];
    }

    // 3. Pathname (/portal/deal/xxx)
    const pathname = window.location.pathname;
    const pathMatch =
      pathname.match(/\/portal\/deal\/([a-zA-Z0-9_-]+)/) ||
      pathname.match(/\/deal\/([a-zA-Z0-9_-]+)/);
    if (pathMatch && pathMatch[1]) return pathMatch[1];
  } catch (e) {
    // ignore
  }
  return null;
}

function isMediaKitUrl(): boolean {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('mediakit') === 'true' || window.location.hash.includes('mediakit');
  } catch (e) {
    return false;
  }
}

export default function App() {
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [creator, setCreator] = useState<CreatorProfile>(() => getStoredProfile());
  const [deals, setDeals] = useState<Deal[]>([]);
  const [emailAlerts, setEmailAlerts] = useState<EmailAlertItem[]>(getStoredEmailAlerts());
  const [currentView, setCurrentView] = useState<'dashboard' | 'contract_wizard' | 'contract_sign' | 'deals' | 'invoices' | 'communications' | 'media_kit'>('dashboard');
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [brandPreviewDeal, setBrandPreviewDeal] = useState<Deal | null>(null);
  const [activeBrandForChat, setActiveBrandForChat] = useState<string | undefined>(undefined);
  const [isMobilePreview, setIsMobilePreview] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [isEmailAlertsModalOpen, setIsEmailAlertsModalOpen] = useState(false);
  const [wizardInitialData, setWizardInitialData] = useState<Partial<Deal> | undefined>(undefined);
  const [unauthScreen, setUnauthScreen] = useState<'landing' | 'auth'>('landing');
  const [authInitialMode, setAuthInitialMode] = useState<'signin' | 'signup' | 'forgot'>('signin');

  // Standalone Brand Portal & Media Kit Detection
  const [brandPortalDealId, setBrandPortalDealId] = useState<string | null>(() => extractBrandPortalDealId());
  const [isPublicMediaKit, setIsPublicMediaKit] = useState<boolean>(() => isMediaKitUrl());
  const [standaloneBrandDeal, setStandaloneBrandDeal] = useState<Deal | null>(null);
  const [isLoadingBrandDeal, setIsLoadingBrandDeal] = useState<boolean>(() => !isMediaKitUrl() && !!extractBrandPortalDealId());

  // Track the signed-in creator. This uid becomes creatorId everywhere
  // (Firestore documents, security rules) so each creator only ever
  // reads/writes their own data. The brand portal & media kit routes
  // below stay public and don't require this.
  useEffect(() => {
    try {
      localStorage.removeItem('madeal_deals_v1');
      localStorage.removeItem('madeal_profile_v1');
    } catch {
      // ignore
    }

    const unsubscribe = onAuthChange((user) => {
      setAuthUser(user);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Listen for browser navigation changes (popstate / hashchange)
  useEffect(() => {
    const handleUrlChange = () => {
      const detectedId = extractBrandPortalDealId();
      setBrandPortalDealId(detectedId);
      setIsPublicMediaKit(isMediaKitUrl());
    };

    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, []);

  // Fetch and subscribe to single deal when in standalone brand portal mode
  useEffect(() => {
    if (!brandPortalDealId) {
      setStandaloneBrandDeal(null);
      setIsLoadingBrandDeal(false);
      return;
    }

    setIsLoadingBrandDeal(true);

    // Check if in local deals list first
    const existing = deals.find((d) => d.id === brandPortalDealId);
    if (existing) {
      setStandaloneBrandDeal(existing);
      setIsLoadingBrandDeal(false);
    }

    // Subscribe to Firestore for live real-time updates of this specific deal
    let isMounted = true;
    const fallbackTimer = setTimeout(() => {
      if (isMounted) {
        setIsLoadingBrandDeal(false);
      }
    }, 2500);

    const unsubscribeDeal = subscribeToSingleDeal(
      brandPortalDealId,
      (cloudDeal) => {
        if (!isMounted) return;
        clearTimeout(fallbackTimer);
        if (cloudDeal) {
          setStandaloneBrandDeal(cloudDeal);
        } else {
          // If not in cloud, check initial deals
          const localFallback = deals.find((d) => d.id === brandPortalDealId);
          if (localFallback) {
            setStandaloneBrandDeal(localFallback);
          }
        }
        setIsLoadingBrandDeal(false);
      },
      async () => {
        if (!isMounted) return;
        clearTimeout(fallbackTimer);
        // Fallback: try one-time fetch
        const fetched = await getDealFromCloud(brandPortalDealId);
        if (fetched) {
          setStandaloneBrandDeal(fetched);
        }
        setIsLoadingBrandDeal(false);
      }
    );

    return () => {
      isMounted = false;
      clearTimeout(fallbackTimer);
      unsubscribeDeal();
    };
  }, [brandPortalDealId]);

  // Once we know which deal a brand portal visitor is looking at, fetch
  // that deal's owning creator's public profile (by the deal's own
  // creatorId — a brand visitor is never authenticated).
  useEffect(() => {
    if (!standaloneBrandDeal?.creatorId) return;
    let isMounted = true;
    getProfileFromCloud(standaloneBrandDeal.creatorId).then((cloudProf) => {
      if (cloudProf && isMounted) {
        setCreator(cloudProf);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [standaloneBrandDeal?.creatorId]);

  // Initialize and subscribe to Firestore Cloud Sync for Creator Dashboard.
  // Only runs once a creator is signed in — creatorId scopes every read/write.
  useEffect(() => {
    if (!authUser) {
      setDeals([]);
      return;
    }
    const creatorId = authUser.uid;

    // Load locally cached creator-scoped deals & profile immediately
    const cachedDeals = getStoredDeals(creatorId);
    setDeals(cachedDeals);
    const cachedProfile = getStoredProfile(creatorId, authUser);
    setCreator(cachedProfile);

    initializeCloudDatabase(creatorId, {
      displayName: authUser.displayName,
      email: authUser.email,
      photoURL: authUser.photoURL,
    });

    const unsubscribeDeals = subscribeToDeals(creatorId, (cloudDeals) => {
      setDeals(cloudDeals);
      saveStoredDeals(cloudDeals, creatorId);
    });

    const unsubscribeProfile = subscribeToProfile(creatorId, (cloudProfile) => {
      if (cloudProfile) {
        setCreator(cloudProfile);
        saveStoredProfile(cloudProfile, creatorId);
      }
    });

    return () => {
      unsubscribeDeals();
      unsubscribeProfile();
    };
  }, [authUser]);

  // Sync to local storage whenever deals, profile, or emailAlerts changes
  useEffect(() => {
    if (authUser?.uid) {
      saveStoredDeals(deals, authUser.uid);
    }
  }, [deals, authUser?.uid]);

  useEffect(() => {
    if (authUser?.uid) {
      saveStoredProfile(creator, authUser.uid);
    }
  }, [creator, authUser?.uid]);

  useEffect(() => {
    saveStoredEmailAlerts(emailAlerts);
  }, [emailAlerts]);

  const handleSelectDeal = (deal: Deal) => {
    setSelectedDeal(deal);
    setCurrentView('contract_sign');
  };

  const handleCreateNewContract = (initialData?: Partial<Deal>) => {
    setWizardInitialData(initialData);
    setCurrentView('contract_wizard');
  };

  const handleSelectPackageToBook = (pkg: SponsorshipPackage) => {
    const ratePerItem = Math.round(pkg.price / (pkg.deliverables.length || 1));
    const pkgDeliverables = pkg.deliverables.map((del, idx) => ({
      id: `del_${Date.now()}_${idx}`,
      title: del.title,
      description: `Package inclusion: ${del.quantity}x ${del.title}`,
      type: 'custom' as const,
      quantity: del.quantity,
      baseRate: ratePerItem,
      completed: false,
    }));

    handleCreateNewContract({
      title: `${pkg.name} Sponsorship`,
      deliverables: pkgDeliverables,
      totalAmount: pkg.price,
      currency: pkg.currency || creator.defaultCurrency || 'USD',
      notes: `Package terms: ${pkg.usageTerm}. Exclusivity: ${pkg.exclusivity}. Includes ${pkg.revisions} rounds of revisions.`,
    });
  };

  const handleSaveNewDeal = (newDeal: Deal) => {
    const existingIndex = deals.findIndex((d) => d.id === newDeal.id);
    let updatedList: Deal[];
    if (existingIndex >= 0) {
      updatedList = deals.map((d) => (d.id === newDeal.id ? newDeal : d));
    } else {
      updatedList = [newDeal, ...deals];
    }
    setDeals(updatedList);
    setSelectedDeal(newDeal);
    setCurrentView('contract_sign');
    // Sync to Firestore Cloud
    syncDealToCloud(newDeal);
  };

  const handleUpdateDeal = (updatedDeal: Deal) => {
    const previousDeal = deals.find((d) => d.id === updatedDeal.id);

    // Check if brand newly countersigned
    if (
      !previousDeal?.clientSigned &&
      updatedDeal.clientSigned &&
      creator.emailAlerts?.onCountersign !== false
    ) {
      const alert = createCountersignAlert(updatedDeal, creator);
      setEmailAlerts((prev) => [alert, ...prev]);
    }

    // Check if status newly transitioned to paid
    if (
      previousDeal?.status !== 'paid' &&
      updatedDeal.status === 'paid' &&
      creator.emailAlerts?.onPaymentReceived !== false
    ) {
      const alert = createPaymentReceivedAlert(updatedDeal, creator);
      setEmailAlerts((prev) => [alert, ...prev]);
    }

    setDeals((prev) => prev.map((d) => (d.id === updatedDeal.id ? updatedDeal : d)));
    setSelectedDeal(updatedDeal);
    if (standaloneBrandDeal?.id === updatedDeal.id) {
      setStandaloneBrandDeal(updatedDeal);
    }
    // Sync to Firestore Cloud
    syncDealToCloud(updatedDeal);
  };

  const handleUpdateProfile = (updatedProfile: CreatorProfile) => {
    setCreator(updatedProfile);
    if (authUser) {
      syncProfileToCloud(updatedProfile, authUser.uid);
    }
  };

  const handleDeleteDeal = (dealId: string) => {
    setDeals((prev) => prev.filter((d) => d.id !== dealId));
    if (selectedDeal?.id === dealId) {
      setSelectedDeal(null);
      setCurrentView('deals');
    }
    deleteDealFromCloud(dealId);
  };

  const handleToggleDeliverable = (dealId: string, deliverableId: string, deliveredUrl?: string) => {
    setDeals((prevDeals) =>
      prevDeals.map((deal) => {
        if (deal.id !== dealId) return deal;

        const targetDeliverable = deal.deliverables.find((d) => d.id === deliverableId);
        const willBeCompleted = !targetDeliverable?.completed;

        const updatedDeliverables = deal.deliverables.map((del) => {
          if (del.id !== deliverableId) return del;
          return {
            ...del,
            completed: willBeCompleted,
            completedAt: willBeCompleted ? new Date().toISOString() : undefined,
            deliveredUrl: willBeCompleted ? (deliveredUrl || del.deliveredUrl) : undefined,
          };
        });

        // Trigger deliverable submitted email alert if completed
        if (
          willBeCompleted &&
          targetDeliverable &&
          creator.emailAlerts?.onDeliverableSubmitted !== false
        ) {
          const alert = createDeliverableDeliveredAlert(
            deal,
            { ...targetDeliverable, completed: true, deliveredUrl },
            creator
          );
          setEmailAlerts((prev) => [alert, ...prev]);
        }

        // Add an activity note in the deal's message thread
        const now = new Date();
        const timeStr = `${now.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} • ${now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}`;
        const newMsg = {
          id: `msg-${Date.now()}`,
          sender: 'creator' as const,
          senderName: creator.name.split(' ')[0],
          text: willBeCompleted
            ? `✅ Marked deliverable "${targetDeliverable?.title}" as Delivered!${deliveredUrl ? ` Live link: ${deliveredUrl}` : ''}`
            : `↩️ Reopened deliverable "${targetDeliverable?.title}" back to in progress.`,
          timestamp: timeStr,
          attachment: deliveredUrl
            ? {
                type: 'deliverable_link' as const,
                title: `${targetDeliverable?.title} (Live Link)`,
                url: deliveredUrl,
              }
            : undefined,
        };

        const updatedDeal: Deal = {
          ...deal,
          deliverables: updatedDeliverables,
          messages: [...deal.messages, newMsg],
        };

        if (selectedDeal?.id === dealId) {
          setSelectedDeal(updatedDeal);
        }

        if (standaloneBrandDeal?.id === dealId) {
          setStandaloneBrandDeal(updatedDeal);
        }

        // Sync deliverable toggle to cloud
        syncDealToCloud(updatedDeal);

        return updatedDeal;
      })
    );
  };

  const handleOpenCommunications = (brandName?: string) => {
    setActiveBrandForChat(brandName);
    setCurrentView('communications');
  };

  const unreadAlertsCount = emailAlerts.filter((a) => !a.read).length;

  // -------------------------------------------------------------
  // PUBLIC MEDIA KIT STANDALONE ROUTE:
  // If user opens a shared rate card link (e.g. ?mediakit=true)
  // -------------------------------------------------------------
  if (isPublicMediaKit) {
    return (
      <div className="min-h-screen bg-[#FAF3EC] text-[#230B0D] p-4 sm:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                window.history.pushState({}, '', '/');
                setIsPublicMediaKit(false);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-[#ECD9CB] text-[#59171B] text-xs font-bold rounded-xl shadow-payno-sm hover:bg-[#FAF3EC] transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Creator App</span>
            </a>
          </div>

          <MediaKitView
            creator={creator}
            onUpdateCreator={handleUpdateProfile}
            onSelectPackageToBook={(pkg) => {
              setIsPublicMediaKit(false);
              handleSelectPackageToBook(pkg);
            }}
            isPublicView={true}
          />
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // BRAND PORTAL STANDALONE ROUTE:
  // If user opens a shared brand portal link (e.g. ?brand_portal=deal_123)
  // -------------------------------------------------------------
  if (brandPortalDealId) {
    if (isLoadingBrandDeal) {
      return (
        <div className="min-h-screen bg-[#FAF3EC] text-[#230B0D] flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-white p-8 rounded-3xl border border-[#ECD9CB] shadow-payno-md max-w-md w-full space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#59171B] text-[#FED7B8] flex items-center justify-center mx-auto shadow-payno-sm animate-pulse">
              <RefreshCw className="w-6 h-6 animate-spin" />
            </div>
            <h2 className="font-heading text-xl font-bold text-[#230B0D]">
              Connecting to Partner Portal...
            </h2>
            <p className="text-xs text-[#7E635F]">
              Loading verified sponsorship agreement #{brandPortalDealId} from secure cloud ledger.
            </p>
          </div>
        </div>
      );
    }

    if (standaloneBrandDeal) {
      return (
        <BrandPortalView
          deal={standaloneBrandDeal}
          creator={creator}
          onUpdateDeal={handleUpdateDeal}
          onToggleDeliverable={handleToggleDeliverable}
          isStandalone={true}
        />
      );
    }

    // If deal not found after fetch
    return (
      <div className="min-h-screen bg-[#FAF3EC] text-[#230B0D] flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white p-8 rounded-3xl border border-[#ECD9CB] shadow-payno-md max-w-md w-full space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#FFF2E6] text-[#A63A24] flex items-center justify-center mx-auto border border-[#FED7B8]">
            <Clock className="w-6 h-6" />
          </div>
          <h2 className="font-heading text-xl font-bold text-[#230B0D]">
            Agreement Record
          </h2>
          <p className="text-xs text-[#7E635F] leading-relaxed">
            The sponsorship deed <strong className="font-mono text-[#59171B]">#{brandPortalDealId}</strong> is either preparing or has been archived.
          </p>
          <div className="pt-2">
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                window.history.pushState({}, '', '/');
                setBrandPortalDealId(null);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#59171B] text-[#FED7B8] text-xs font-bold rounded-xl shadow-payno-sm hover:bg-[#451014] transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Go to Main Dashboard</span>
            </a>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // AUTH GATE
  // Everything past this point is the private creator dashboard —
  // it requires a signed-in creator. Brand portal & media kit routes
  // above stay public and never reach this check.
  // -------------------------------------------------------------
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#FAF3EC] flex items-center justify-center">
        <RefreshCw className="w-6 h-6 animate-spin text-[#59171B]" />
      </div>
    );
  }

  if (!authUser) {
    if (unauthScreen === 'landing') {
      return (
        <LandingPageView
          onGetStarted={() => {
            setAuthInitialMode('signup');
            setUnauthScreen('auth');
          }}
          onSignIn={() => {
            setAuthInitialMode('signin');
            setUnauthScreen('auth');
          }}
        />
      );
    }

    return (
      <AuthView
        initialMode={authInitialMode}
        onBackToLanding={() => setUnauthScreen('landing')}
        onSuccess={() => {
          // onAuthChange will update authUser and seamlessly display dashboard
        }}
      />
    );
  }

  // -------------------------------------------------------------
  // CREATOR DASHBOARD INTERFACE
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-[#FAF3EC] text-[#230B0D] flex flex-col font-sans selection:bg-[#59171B]/20 selection:text-[#59171B]">
      {/* Top Header */}
      <Header
        currentView={currentView}
        creator={creator}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenPricing={() => setIsPricingModalOpen(true)}
        onOpenAlerts={() => setIsEmailAlertsModalOpen(true)}
        onOpenMediaKit={() => setCurrentView('media_kit')}
        unreadAlertsCount={unreadAlertsCount}
        statusBadge={
          currentView === 'contract_wizard'
            ? 'Drafting Agreement'
            : currentView === 'contract_sign'
            ? selectedDeal?.status === 'paid'
              ? 'Settled'
              : 'Pending Signature'
            : undefined
        }
        isMobilePreview={isMobilePreview}
        onToggleMobilePreview={() => setIsMobilePreview(!isMobilePreview)}
        onNewContract={() => handleCreateNewContract()}
        onHomeClick={() => setCurrentView('dashboard')}
      />

      {/* Main Content Area */}
      <main className="flex-1 px-3 py-5 sm:px-6">
        <div
          className={`mx-auto transition-all duration-300 ${
            isMobilePreview
              ? 'max-w-md bg-[#FAF3EC] border-4 border-[#230B0D] rounded-[2.5rem] p-4 sm:p-5 shadow-2xl min-h-[820px] ring-8 ring-[#ECD9CB]'
              : 'max-w-3xl'
          }`}
        >
          {/* Dashboard View */}
          {currentView === 'dashboard' && (
            <DashboardView
              creator={creator}
              deals={deals}
              onSelectDeal={handleSelectDeal}
              onCreateNewContract={() => handleCreateNewContract()}
              onViewAllDeals={() => setCurrentView('deals')}
              onOpenCommunications={handleOpenCommunications}
              onOpenMediaKit={() => setCurrentView('media_kit')}
              onToggleDeliverable={handleToggleDeliverable}
              onOpenBrandPreview={(d) => setBrandPreviewDeal(d)}
            />
          )}

          {/* Contract Drafting Wizard View */}
          {currentView === 'contract_wizard' && (
            <ContractWizard
              creator={creator}
              creatorId={authUser?.uid || ''}
              initialDeal={wizardInitialData}
              onSaveDeal={handleSaveNewDeal}
              onCancel={() => setCurrentView('dashboard')}
            />
          )}

          {/* Contract Sign & Invoice Execution View */}
          {currentView === 'contract_sign' && selectedDeal && (
            <ContractSignView
              deal={selectedDeal}
              creator={creator}
              onUpdateDeal={handleUpdateDeal}
              onToggleDeliverable={handleToggleDeliverable}
              onBack={() => setCurrentView('dashboard')}
              onOpenMessages={() => handleOpenCommunications(selectedDeal.brandName)}
              onOpenBrandPreview={(d) => setBrandPreviewDeal(d)}
              onDeleteDeal={handleDeleteDeal}
            />
          )}

          {/* Deals & Contracts Pipeline View */}
          {currentView === 'deals' && (
            <DealsHubView
              deals={deals}
              onSelectDeal={handleSelectDeal}
              onCreateNewContract={() => handleCreateNewContract()}
              onOpenCommunications={handleOpenCommunications}
              onToggleDeliverable={handleToggleDeliverable}
              onOpenBrandPreview={(d) => setBrandPreviewDeal(d)}
              onDeleteDeal={handleDeleteDeal}
            />
          )}

          {/* Invoices View */}
          {currentView === 'invoices' && (
            <InvoicesView
              deals={deals}
              creator={creator}
              creatorId={authUser?.uid || ''}
              onSelectDeal={handleSelectDeal}
              onOpenCommunications={handleOpenCommunications}
              onSaveDeal={handleSaveNewDeal}
              onOpenProfile={() => setIsProfileModalOpen(true)}
              onOpenBrandPreview={(d) => setBrandPreviewDeal(d)}
            />
          )}

          {/* Brand Communications View */}
          {currentView === 'communications' && (
            <CommunicationsView
              deals={deals}
              creator={creator}
              activeBrandName={activeBrandForChat}
              onUpdateDeal={handleUpdateDeal}
              onViewContract={handleSelectDeal}
              onOpenBrandPreview={(d) => setBrandPreviewDeal(d)}
            />
          )}

          {/* Public Media Kit & Rate Card View */}
          {currentView === 'media_kit' && (
            <MediaKitView
              creator={creator}
              onUpdateCreator={handleUpdateProfile}
              onSelectPackageToBook={handleSelectPackageToBook}
              isPublicView={false}
            />
          )}
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNav
        currentTab={currentView}
        onSelectTab={(tab) => {
          if (
            tab === 'dashboard' ||
            tab === 'deals' ||
            tab === 'invoices' ||
            tab === 'communications' ||
            tab === 'contract_wizard' ||
            tab === 'media_kit'
          ) {
            if (tab === 'contract_wizard') {
              handleCreateNewContract();
            } else {
              setCurrentView(tab as any);
            }
          }
        }}
        isWizardActive={currentView === 'contract_wizard'}
        onNewContractClick={() => handleCreateNewContract()}
      />

      {/* Profile Settings Modal */}
      <ProfileModal
        creator={creator}
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onSave={handleUpdateProfile}
        onOpenPricing={() => setIsPricingModalOpen(true)}
        onSignOut={() => signOutCreator()}
      />

      {/* Pricing & Creator Membership Plans Modal */}
      <PricingModal
        isOpen={isPricingModalOpen}
        onClose={() => setIsPricingModalOpen(false)}
        creator={creator}
        onUpdateCreatorProfile={handleUpdateProfile}
      />

      {/* Email Alerts & Automated Notices Modal */}
      <EmailAlertsModal
        isOpen={isEmailAlertsModalOpen}
        onClose={() => setIsEmailAlertsModalOpen(false)}
        creator={creator}
        deals={deals}
        alerts={emailAlerts}
        onUpdateAlerts={setEmailAlerts}
        onUpdateCreatorProfile={handleUpdateProfile}
        onSelectDeal={(deal) => {
          setIsEmailAlertsModalOpen(false);
          handleSelectDeal(deal);
        }}
      />

      {/* Sandboxed Brand Portal Preview Modal */}
      {brandPreviewDeal && (
        <BrandPortalModal
          deal={brandPreviewDeal}
          creator={creator}
          isOpen={!!brandPreviewDeal}
          onClose={() => setBrandPreviewDeal(null)}
          onUpdateDeal={(updatedDeal) => {
            handleUpdateDeal(updatedDeal);
            setBrandPreviewDeal(updatedDeal);
          }}
          onToggleDeliverable={handleToggleDeliverable}
        />
      )}
    </div>
  );
}
