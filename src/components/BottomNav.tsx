import React from 'react';
import {
  Home,
  Briefcase,
  Receipt,
  MessageSquare,
  Plus,
  Users,
  ListTodo,
  FileCheck
} from 'lucide-react';

interface BottomNavProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  isWizardActive: boolean;
  wizardStep?: number;
  onSelectWizardStep?: (step: 1 | 2 | 3) => void;
  onNewContractClick?: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
  isWizardActive,
  wizardStep = 1,
  onSelectWizardStep,
  onNewContractClick,
}) => {
  if (isWizardActive && onSelectWizardStep) {
    return (
      <nav className="fixed bottom-3 left-3 right-3 sm:bottom-4 z-40 bg-white/95 backdrop-blur-md border border-[#ECD9CB] px-4 py-2.5 max-w-lg mx-auto shadow-payno-lg rounded-3xl no-print">
        <div className="flex items-center justify-around">
          {/* Step 1: Parties */}
          <button
            onClick={() => onSelectWizardStep(1)}
            className={`flex flex-col items-center gap-1 py-1 px-4 cursor-pointer relative transition-all ${
              wizardStep === 1 ? 'text-[#59171B]' : 'text-[#7E635F] hover:text-[#230B0D]'
            }`}
          >
            {wizardStep === 1 && (
              <div className="absolute -top-2.5 left-0 right-0 h-[3px] bg-[#59171B] rounded-full mx-3 shadow-[0_0_8px_rgba(89,23,27,0.4)]" />
            )}
            <Users className="w-5 h-5" />
            <span className="text-[10px] font-bold tracking-wider uppercase">1. Parties</span>
          </button>

          {/* Step 2: Deliverables */}
          <button
            onClick={() => onSelectWizardStep(2)}
            className={`flex flex-col items-center gap-1 py-1 px-4 cursor-pointer relative transition-all ${
              wizardStep === 2 ? 'text-[#59171B]' : 'text-[#7E635F] hover:text-[#230B0D]'
            }`}
          >
            {wizardStep === 2 && (
              <div className="absolute -top-2.5 left-0 right-0 h-[3px] bg-[#59171B] rounded-full mx-3 shadow-[0_0_8px_rgba(89,23,27,0.4)]" />
            )}
            <ListTodo className="w-5 h-5" />
            <span className="text-[10px] font-bold tracking-wider uppercase">2. Rates</span>
          </button>

          {/* Step 3: Rights */}
          <button
            onClick={() => onSelectWizardStep(3)}
            className={`flex flex-col items-center gap-1 py-1 px-4 cursor-pointer relative transition-all ${
              wizardStep === 3 ? 'text-[#59171B]' : 'text-[#7E635F] hover:text-[#230B0D]'
            }`}
          >
            {wizardStep === 3 && (
              <div className="absolute -top-2.5 left-0 right-0 h-[3px] bg-[#59171B] rounded-full mx-3 shadow-[0_0_8px_rgba(89,23,27,0.4)]" />
            )}
            <FileCheck className="w-5 h-5" />
            <span className="text-[10px] font-bold tracking-wider uppercase">3. Rights</span>
          </button>
        </div>
      </nav>
    );
  }

  return (
    <nav className="fixed bottom-3 left-3 right-3 sm:bottom-4 z-40 bg-white/95 backdrop-blur-md border border-[#ECD9CB] px-4 py-2 max-w-xl mx-auto shadow-payno-lg rounded-3xl no-print">
      <div className="flex items-center justify-between">
        {/* Overview (Home) */}
        <button
          onClick={() => onSelectTab('dashboard')}
          className={`flex flex-col items-center gap-1 py-1 px-3 cursor-pointer relative transition-all ${
            currentTab === 'dashboard' ? 'text-[#59171B]' : 'text-[#7E635F] hover:text-[#230B0D]'
          }`}
        >
          {currentTab === 'dashboard' && (
            <div className="absolute -top-2 left-0 right-0 h-[2.5px] bg-[#59171B] rounded-full mx-2" />
          )}
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-semibold tracking-tight">Home</span>
        </button>

        {/* Deals */}
        <button
          onClick={() => onSelectTab('deals')}
          className={`flex flex-col items-center gap-1 py-1 px-3 cursor-pointer relative transition-all ${
            currentTab === 'deals' ? 'text-[#59171B]' : 'text-[#7E635F] hover:text-[#230B0D]'
          }`}
        >
          {currentTab === 'deals' && (
            <div className="absolute -top-2 left-0 right-0 h-[2.5px] bg-[#59171B] rounded-full mx-2" />
          )}
          <Briefcase className="w-5 h-5" />
          <span className="text-[10px] font-semibold tracking-tight">Deals</span>
        </button>

        {/* Payno Raised Floating Center Button in Deep Burgundy & Warm Beige */}
        <div className="relative -top-4">
          <button
            onClick={onNewContractClick || (() => onSelectTab('contract_wizard'))}
            className="w-12 h-12 rounded-full bg-[#59171B] hover:bg-[#451014] active:scale-95 text-[#FED7B8] shadow-payno-lg border-2 border-white flex items-center justify-center transition-all cursor-pointer group"
            title="Create New Deal"
          >
            <Plus className="w-6 h-6 stroke-[3] group-hover:rotate-90 transition-transform duration-200" />
          </button>
        </div>

        {/* Invoices */}
        <button
          onClick={() => onSelectTab('invoices')}
          className={`flex flex-col items-center gap-1 py-1 px-3 cursor-pointer relative transition-all ${
            currentTab === 'invoices' ? 'text-[#59171B]' : 'text-[#7E635F] hover:text-[#230B0D]'
          }`}
        >
          {currentTab === 'invoices' && (
            <div className="absolute -top-2 left-0 right-0 h-[2.5px] bg-[#59171B] rounded-full mx-2" />
          )}
          <Receipt className="w-5 h-5" />
          <span className="text-[10px] font-semibold tracking-tight">Invoices</span>
        </button>

        {/* Messages */}
        <button
          onClick={() => onSelectTab('communications')}
          className={`flex flex-col items-center gap-1 py-1 px-3 cursor-pointer relative transition-all ${
            currentTab === 'communications' ? 'text-[#59171B]' : 'text-[#7E635F] hover:text-[#230B0D]'
          }`}
        >
          {currentTab === 'communications' && (
            <div className="absolute -top-2 left-0 right-0 h-[2.5px] bg-[#59171B] rounded-full mx-2" />
          )}
          <MessageSquare className="w-5 h-5" />
          <span className="text-[10px] font-semibold tracking-tight">Chats</span>
        </button>
      </div>
    </nav>
  );
};

