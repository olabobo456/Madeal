import React, { useState, useRef, useEffect } from 'react';
import { Deal, CommunicationMessage, CreatorProfile } from '../types';
import {
  MessageSquare,
  Send,
  CheckCircle2,
  FileText,
  ChevronRight,
  ChevronLeft,
  Search,
  CheckCheck,
  Eye,
  Paperclip,
  Smile,
  ShieldCheck,
} from 'lucide-react';

interface CommunicationsViewProps {
  deals: Deal[];
  creator: CreatorProfile;
  activeBrandName?: string;
  onUpdateDeal: (deal: Deal) => void;
  onViewContract: (deal: Deal) => void;
  onOpenBrandPreview?: (deal: Deal) => void;
}

export const CommunicationsView: React.FC<CommunicationsViewProps> = ({
  deals,
  creator,
  activeBrandName,
  onUpdateDeal,
  onViewContract,
  onOpenBrandPreview,
}) => {
  // Find initial selected deal
  const [selectedDealId, setSelectedDealId] = useState<string>(
    (activeBrandName
      ? deals.find((d) => d.brandName.toLowerCase() === activeBrandName.toLowerCase())?.id
      : deals[0]?.id) || deals[0]?.id || ''
  );

  // On mobile screens, track whether we are inside the chat room or viewing the chat list
  const [isMobileChatOpen, setIsMobileChatOpen] = useState<boolean>(!!activeBrandName);
  const [searchQuery, setSearchQuery] = useState('');
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const selectedDeal = deals.find((d) => d.id === selectedDealId) || deals[0];

  // Auto-scroll chat to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedDeal?.messages, isMobileChatOpen, selectedDealId]);

  useEffect(() => {
    if (activeBrandName) {
      const match = deals.find((d) => d.brandName.toLowerCase() === activeBrandName.toLowerCase());
      if (match) {
        setSelectedDealId(match.id);
        setIsMobileChatOpen(true);
      }
    }
  }, [activeBrandName, deals]);

  // Filter deals by search
  const filteredDeals = deals.filter(
    (d) =>
      d.brandName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.messages.some((m) => m.text.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Quick canned proposal templates
  const quickTemplates = [
    {
      title: 'Agreement Review',
      prompt: `Hi ${selectedDeal?.brandName || 'team'}, checking in on the Content Creation Agreement (${selectedDeal?.invoiceNumber || ''}). Let me know if you need any adjustments before signing!`,
    },
    {
      title: 'Draft Submitted',
      prompt: `Hi ${selectedDeal?.brandName || 'team'}! I’ve completed the draft content for ${selectedDeal?.title || 'our campaign'}. Looking forward to your review within our included revision window.`,
    },
    {
      title: 'Payment Reminder',
      prompt: `Hi ${selectedDeal?.brandName || 'team'}, friendly reminder regarding invoice ${selectedDeal?.invoiceNumber || ''} for $${selectedDeal?.totalAmount.toLocaleString() || ''}. Direct payment link is ready!`,
    },
    {
      title: 'Rights Extension',
      prompt: `Hi ${selectedDeal?.brandName || 'team'}, the organic engagement is performing 40% above benchmark! Would you like to extend paid usage rights for an extra 60 days?`,
    },
  ];

  const handleSelectChat = (dealId: string) => {
    setSelectedDealId(dealId);
    setIsMobileChatOpen(true);
  };

  const handleSendMessage = () => {
    if (!inputText.trim() || !selectedDeal) return;

    const newMessage: CommunicationMessage = {
      id: 'msg-' + Date.now(),
      sender: 'creator',
      senderName: creator.name.split(' ')[0],
      text: inputText.trim(),
      timestamp: 'Just now',
    };

    const updatedDeal: Deal = {
      ...selectedDeal,
      messages: [...selectedDeal.messages, newMessage],
    };

    onUpdateDeal(updatedDeal);
    setInputText('');

    // Simulate realistic brand response
    setTimeout(() => {
      const brandReply: CommunicationMessage = {
        id: 'msg-reply-' + Date.now(),
        sender: 'brand',
        senderName: `${selectedDeal.brandName} Team`,
        text: `Thanks for the update, ${creator.name.split(' ')[0]}! We reviewed this and our partnerships team is moving ahead.`,
        timestamp: 'Just now',
      };

      const finalDeal: Deal = {
        ...updatedDeal,
        messages: [...updatedDeal.messages, brandReply],
      };
      onUpdateDeal(finalDeal);
    }, 1500);
  };

  return (
    <div className="space-y-4 pb-28">
      {/* Header with requested title and subtitle */}
      <div>
        <h1 className="font-heading text-3xl font-bold tracking-tight text-[#230B0D]">
          Brand Chats
        </h1>
        <p className="text-[#7E635F] text-xs sm:text-sm mt-0.5">
          Communicate with brands
        </p>
      </div>

      {/* Main WhatsApp/IG Style Chat Card */}
      <div className="bg-white rounded-3xl border border-[#ECD9CB] shadow-payno-md overflow-hidden flex h-[620px] sm:h-[680px]">
        
        {/* Left Column: Chats List (Hidden on mobile if a chat is actively open) */}
        <div
          className={`w-full md:w-80 lg:w-96 border-r border-[#ECD9CB] bg-[#FAF3EC]/60 flex flex-col shrink-0 ${
            isMobileChatOpen ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Search Header */}
          <div className="p-3.5 border-b border-[#ECD9CB] bg-[#FAF3EC] space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#59171B]">
                All Conversations ({deals.length})
              </span>
              <span className="text-[10px] text-[#7E635F] font-semibold bg-white px-2 py-0.5 rounded-full border border-[#ECD9CB]">
                Direct Messages
              </span>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#7E635F]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search brand or message..."
                className="w-full bg-white border border-[#ECD9CB] focus:border-[#59171B] rounded-xl pl-8 pr-3 py-1.5 text-xs text-[#230B0D] outline-none placeholder:text-[#8C726D]"
              />
            </div>
          </div>

          {/* Conversation Items List */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#ECD9CB]/40">
            {filteredDeals.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#7E635F]">
                No brand conversations found matching "{searchQuery}"
              </div>
            ) : (
              filteredDeals.map((deal) => {
                const lastMsg = deal.messages[deal.messages.length - 1];
                const isSelected = deal.id === selectedDeal?.id;

                return (
                  <button
                    key={deal.id}
                    onClick={() => handleSelectChat(deal.id)}
                    className={`w-full text-left p-3.5 transition-all flex items-start gap-3 cursor-pointer ${
                      isSelected
                        ? 'bg-white border-l-4 border-l-[#59171B] shadow-payno-sm'
                        : 'hover:bg-white/70'
                    }`}
                  >
                    {/* Brand Avatar */}
                    <div className="relative shrink-0">
                      <div className="w-10 h-10 rounded-2xl bg-[#59171B] text-[#FED7B8] font-bold text-sm flex items-center justify-center shadow-payno-sm">
                        {deal.brandName.charAt(0).toUpperCase()}
                      </div>
                      <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
                    </div>

                    {/* Chat Content Snippet */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-bold text-xs sm:text-sm text-[#230B0D] truncate">
                          {deal.brandName}
                        </span>
                        <span className="text-[10px] text-[#7E635F] shrink-0 font-medium">
                          {lastMsg?.timestamp || 'Active'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <p className="text-[11px] text-[#7E635F] truncate max-w-[170px] sm:max-w-[200px]">
                          {lastMsg?.sender === 'creator' && <span className="font-semibold">You: </span>}
                          {lastMsg?.text || 'No messages yet'}
                        </p>
                        <span className="text-[10px] text-[#59171B] font-mono font-bold shrink-0 ml-1">
                          ${deal.totalAmount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Active Conversation (WhatsApp / IG Style) */}
        {selectedDeal ? (
          <div
            className={`w-full md:flex-1 flex flex-col justify-between bg-[#FCF8F5] h-full ${
              isMobileChatOpen ? 'flex' : 'hidden md:flex'
            }`}
          >
            {/* WhatsApp/IG Top Navigation Bar */}
            <div className="p-3.5 px-4 border-b border-[#ECD9CB] bg-white flex items-center justify-between shrink-0 shadow-payno-sm">
              <div className="flex items-center gap-2.5 min-w-0">
                {/* Mobile Back Button (Returns to chat list like WhatsApp/IG) */}
                <button
                  onClick={() => setIsMobileChatOpen(false)}
                  className="md:hidden p-1.5 -ml-1 rounded-xl hover:bg-[#FAF3EC] text-[#59171B] transition-colors cursor-pointer"
                  title="Back to all chats"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                {/* Brand Avatar & Info */}
                <div className="w-9 h-9 rounded-xl bg-[#59171B] text-[#FED7B8] font-bold text-xs flex items-center justify-center shrink-0">
                  {selectedDeal.brandName.charAt(0).toUpperCase()}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-heading text-sm sm:text-base font-bold text-[#230B0D] truncate">
                      {selectedDeal.brandName}
                    </h3>
                    <span className="hidden sm:inline-block text-[10px] font-bold bg-[#FAF3EC] text-[#59171B] px-2 py-0.2 rounded-full border border-[#ECD9CB]">
                      ${selectedDeal.totalAmount.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#7E635F] truncate flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>{selectedDeal.title}</span>
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 shrink-0">
                {onOpenBrandPreview && (
                  <button
                    onClick={() => onOpenBrandPreview(selectedDeal)}
                    className="text-xs font-semibold px-2.5 py-1.5 rounded-xl bg-[#FAF3EC] border border-[#ECD9CB] hover:bg-[#F5E8DC] text-[#59171B] transition-colors flex items-center gap-1 cursor-pointer shadow-payno-sm"
                    title={`Open isolated preview for ${selectedDeal.brandName}`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Brand Preview</span>
                  </button>
                )}

                <button
                  onClick={() => onViewContract(selectedDeal)}
                  className="text-xs font-semibold px-2.5 sm:px-3 py-1.5 rounded-xl bg-white border border-[#ECD9CB] hover:border-[#DFCCBE] text-[#59171B] transition-colors flex items-center gap-1 cursor-pointer shadow-payno-sm"
                  title="View Contract & Invoices"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Agreement</span>
                </button>
              </div>
            </div>

            {/* Chat Messages Stream (Scrollable WhatsApp/IG Wall) */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-3.5 flex-1 bg-[#FAF3EC]/30">
              {/* Campaign Start Banner */}
              <div className="flex justify-center my-1">
                <div className="bg-white/80 backdrop-blur-xs border border-[#ECD9CB] rounded-full px-3.5 py-1 text-[10px] font-semibold text-[#7E635F] flex items-center gap-1.5 shadow-payno-sm">
                  <ShieldCheck className="w-3 h-3 text-[#59171B]" />
                  <span>Direct agreement channel with {selectedDeal.brandName} • Ref {selectedDeal.invoiceNumber}</span>
                </div>
              </div>

              {selectedDeal.messages.map((msg) => {
                const isCreator = msg.sender === 'creator';
                const isSystem = msg.sender === 'system';

                if (isSystem) {
                  return (
                    <div key={msg.id} className="flex justify-center my-2">
                      <div className="bg-white border border-[#ECD9CB] rounded-full px-3.5 py-1 text-[11px] font-semibold text-[#7E635F] flex items-center gap-1.5 shadow-payno-sm">
                        <CheckCircle2 className="w-3 h-3 text-[#59171B]" />
                        <span>{msg.text}</span>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isCreator ? 'items-end' : 'items-start'} space-y-0.5`}
                  >
                    <div
                      className={`max-w-[85%] sm:max-w-md rounded-2xl p-3 sm:p-3.5 text-xs sm:text-sm leading-relaxed shadow-payno-sm transition-all ${
                        isCreator
                          ? 'bg-[#59171B] text-[#FED7B8] rounded-br-xs'
                          : 'bg-white border border-[#ECD9CB] text-[#230B0D] rounded-bl-xs'
                      }`}
                    >
                      <p className={isCreator ? 'text-white' : 'text-[#230B0D]'}>{msg.text}</p>

                      {msg.attachment && (
                        <div
                          onClick={() => onViewContract(selectedDeal)}
                          className={`mt-2 p-2 rounded-xl border flex items-center justify-between gap-2 cursor-pointer transition-colors ${
                            isCreator
                              ? 'bg-black/20 border-white/20 hover:bg-black/30'
                              : 'bg-[#FAF3EC] border-[#ECD9CB] hover:bg-[#F5E8DC]'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            <FileText className="w-3.5 h-3.5 shrink-0" />
                            <span className="font-semibold text-[11px] truncate">{msg.attachment.title}</span>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 shrink-0" />
                        </div>
                      )}

                      {/* Timestamp & Read Checkmark */}
                      <div
                        className={`flex items-center justify-end gap-1 mt-1 text-[9px] ${
                          isCreator ? 'text-[#FED7B8]/70' : 'text-[#7E635F]'
                        }`}
                      >
                        <span>{msg.timestamp}</span>
                        {isCreator && <CheckCheck className="w-3 h-3 text-[#FED7B8]" />}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Proposal Prompts & Input Bar */}
            <div className="p-3 sm:p-3.5 border-t border-[#ECD9CB] bg-white space-y-2 shrink-0">
              {/* Quick Template Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {quickTemplates.map((tpl, i) => (
                  <button
                    key={i}
                    onClick={() => setInputText(tpl.prompt)}
                    className="whitespace-nowrap px-2.5 py-1 rounded-xl text-[10px] sm:text-[11px] font-semibold bg-[#FAF3EC] border border-[#ECD9CB] hover:border-[#59171B] text-[#59171B] transition-colors cursor-pointer shadow-payno-sm shrink-0"
                  >
                    + {tpl.title}
                  </button>
                ))}
              </div>

              {/* Input Field Row */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder={`Message ${selectedDeal.brandName}...`}
                  className="flex-1 bg-[#FAF3EC] border border-[#ECD9CB] focus:border-[#59171B] focus:bg-white rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-[#230B0D] outline-none placeholder:text-[#8C726D] transition-all"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputText.trim()}
                  className="p-2.5 sm:px-4 bg-[#59171B] hover:bg-[#451014] disabled:opacity-40 text-[#FED7B8] rounded-2xl transition-all cursor-pointer shadow-payno-sm active:scale-95 flex items-center gap-1.5 font-bold text-xs shrink-0"
                  title="Send Message"
                >
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">Send</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full md:flex-1 flex flex-col items-center justify-center p-8 text-center text-[#7E635F] bg-[#FAF3EC]/30">
            <MessageSquare className="w-10 h-10 text-[#ECD9CB] mb-2" />
            <p className="text-sm font-semibold text-[#230B0D]">Select a brand conversation</p>
            <p className="text-xs text-[#7E635F]">Choose a deal from the list to start chatting.</p>
          </div>
        )}
      </div>
    </div>
  );
};


