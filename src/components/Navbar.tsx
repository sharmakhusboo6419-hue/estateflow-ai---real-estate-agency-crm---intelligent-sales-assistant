import React from 'react';
import {
  Building2,
  Users,
  MessageSquare,
  Calendar,
  Send,
  HelpCircle,
  Flame,
  Sun,
  Snowflake,
  Sparkles,
  Bot,
  Download,
  Webhook,
  AlertTriangle,
  LogIn,
  LogOut,
  Radio,
  ArrowUpRight,
} from 'lucide-react';
import { Lead } from '../types/realEstate';
import { useFirebase } from '../firebase/FirebaseContext';

interface NavbarProps {
  activeTab: 'crm' | 'chat' | 'calendar' | 'followup' | 'properties' | 'guide';
  setActiveTab: (tab: 'crm' | 'chat' | 'calendar' | 'followup' | 'properties' | 'guide') => void;
  leads: Lead[];
  onSimulateInboundLead: () => void;
  onOpenWebhookSimulator: () => void;
  hasGeminiKey: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  leads,
  onSimulateInboundLead,
  onOpenWebhookSimulator,
  hasGeminiKey,
}) => {
  const { currentUser, signInWithGoogle, signOut, syncStatus } = useFirebase();

  const hotCount = leads.filter((l) => l.temperature === 'Hot').length;
  const warmCount = leads.filter((l) => l.temperature === 'Warm').length;
  const coldCount = leads.filter((l) => l.temperature === 'Cold').length;
  const staleCount = leads.filter(
    (l) => l.isStale || l.tags?.includes('Needs Attention')
  ).length;

  const navItems: Array<{
    id: 'crm' | 'chat' | 'calendar' | 'followup' | 'properties' | 'guide';
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number | string;
    liveDot?: boolean;
  }> = [
    { id: 'crm', label: 'Pipeline & CRM', icon: Users, badge: leads.length },
    { id: 'chat', label: 'Sales Concierge', icon: MessageSquare, liveDot: true },
    { id: 'calendar', label: 'Viewing Schedule', icon: Calendar },
    { id: 'followup', label: 'Follow-up Cadence', icon: Send },
    { id: 'properties', label: 'Portfolio', icon: Building2, badge: 6 },
    { id: 'guide', label: 'Overview', icon: HelpCircle },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#0c0e14]/90 border-b border-white/[0.08] text-white shadow-lg shadow-black/40 backdrop-blur-xl">
      {/* Top Bar with Brand, Live Metrics & Controls */}
      <div className="max-w-[96rem] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 min-h-16 py-2.5">
          {/* Logo & Agency Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="relative">
              <div className="w-9 h-9 rounded-lg bg-zinc-900 border border-white/[0.12] flex items-center justify-center shadow-inner text-[#dfc195]">
                <Building2 className="w-4 h-4 stroke-[2]" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#0c0e14]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm tracking-tight text-zinc-100">
                  EstateFlow
                </span>
                <span className="text-[10px] font-mono font-medium tracking-wide text-zinc-400 bg-white/[0.04] border border-white/[0.08] px-1.5 py-0.5 rounded">
                  OS v2.4
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-normal hidden sm:block">
                Autonomous Brokerage Intelligence & Client Concierge
              </p>
            </div>
          </div>

          {/* Quick Metrics & Actions */}
          <div className="flex items-center justify-end gap-2 sm:gap-2.5">
            {/* Lead Temperature Quick Counters */}
            <div className="hidden xl:flex items-center gap-1 p-0.5 rounded-lg bg-zinc-900/80 border border-white/[0.06] text-xs">
              <button
                onClick={() => setActiveTab('crm')}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-zinc-300 hover:text-white hover:bg-white/[0.04] transition font-medium cursor-pointer"
                title="View Hot leads in CRM"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                <span className="text-[11px] text-zinc-400">Hot</span>
                <span className="font-mono text-[11px] font-semibold text-rose-300">{hotCount}</span>
              </button>
              <div className="w-px h-3 bg-white/[0.08]" />
              <button
                onClick={() => setActiveTab('crm')}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-zinc-300 hover:text-white hover:bg-white/[0.04] transition font-medium cursor-pointer"
                title="View Warm leads in CRM"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span className="text-[11px] text-zinc-400">Warm</span>
                <span className="font-mono text-[11px] font-semibold text-amber-300">{warmCount}</span>
              </button>
              <div className="w-px h-3 bg-white/[0.08]" />
              <button
                onClick={() => setActiveTab('crm')}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-zinc-300 hover:text-white hover:bg-white/[0.04] transition font-medium cursor-pointer"
                title="View Cold leads in CRM"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                <span className="text-[11px] text-zinc-400">Cold</span>
                <span className="font-mono text-[11px] font-semibold text-sky-300">{coldCount}</span>
              </button>
            </div>

            {/* Stale Leads Attention Badge */}
            {staleCount > 0 && (
              <button
                onClick={() => setActiveTab('crm')}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 hover:bg-amber-500/15 font-medium text-xs transition cursor-pointer"
                title="Stale leads requiring agent contact"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="hidden sm:inline text-[11px]">Attention</span>
                <span className="font-mono text-[10px] font-bold bg-amber-400/20 px-1.5 py-0.5 rounded text-amber-200">
                  {staleCount}
                </span>
              </button>
            )}

            {/* AI Engine Status Pill */}
            <div className="hidden lg:flex items-center gap-2 text-xs px-2.5 py-1.5 rounded-lg bg-zinc-900/80 border border-white/[0.06] text-zinc-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-medium text-zinc-300">
                {hasGeminiKey ? 'Gemini 3.8 Flash' : 'AI Offline Fallback'}
              </span>
            </div>

            {/* Webhook Simulator Trigger */}
            <button
              onClick={onOpenWebhookSimulator}
              className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-white/[0.08] text-zinc-300 hover:text-white transition cursor-pointer"
              title="Test incoming SMS or WhatsApp webhook event"
            >
              <Webhook className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden md:inline text-[11px]">Webhook Test</span>
              <span className="md:hidden text-[11px]">Webhook</span>
            </button>

            {/* Export Code */}
            <a
              href="/api/download-zip"
              download="estateflow-ai-crm.zip"
              className="hidden 2xl:flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-white/[0.08] text-zinc-300 hover:text-white transition cursor-pointer"
              title="Download clean project zip file"
            >
              <Download className="w-3.5 h-3.5 text-zinc-400" />
              <span className="text-[11px]">Export</span>
            </a>

            {/* Google Authentication Control */}
            {currentUser ? (
              <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-zinc-900 border border-white/[0.08] text-xs">
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'Agent'}
                    className="w-5 h-5 rounded-full ring-1 ring-white/20 object-cover"
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-[#c8a97e] text-zinc-950 font-bold flex items-center justify-center text-[10px]">
                    {currentUser.displayName?.[0] || 'A'}
                  </div>
                )}
                <div className="hidden sm:block text-left">
                  <p className="font-medium text-zinc-200 text-[11px] leading-tight truncate max-w-[80px]">
                    {currentUser.displayName || 'Agent'}
                  </p>
                  <span className="text-[9px] text-emerald-400 flex items-center gap-0.5">
                    <Radio className="w-2 h-2" /> Synced
                  </span>
                </div>
                <button
                  onClick={() => signOut()}
                  title="Sign out of Firebase"
                  className="p-1 text-zinc-400 hover:text-rose-400 transition cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => signInWithGoogle()}
                className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-white/[0.08] text-zinc-300 hover:text-white transition cursor-pointer"
                title="Sign in with Google to sync CRM leads & calendar"
              >
                <LogIn className="w-3.5 h-3.5 text-zinc-400" />
                <span className="hidden sm:inline text-[11px]">Sync Cloud</span>
              </button>
            )}

            {/* Simulate Inbound Lead Primary CTA */}
            <button
              onClick={onSimulateInboundLead}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#c8a97e] hover:bg-[#dfc195] text-zinc-950 shadow-sm transition-colors cursor-pointer"
              title="Simulate an incoming high-intent buyer inquiry"
            >
              <Sparkles className="w-3.5 h-3.5 stroke-[2.2]" />
              <span className="hidden sm:inline text-[11px] font-semibold tracking-tight">Simulate Lead</span>
              <span className="sm:hidden text-[11px]">+ Lead</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav
          aria-label="Primary navigation"
          className="relative flex items-center gap-1 overflow-x-auto py-1.5 border-t border-white/[0.06] scrollbar-none"
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-white/[0.08] text-white border border-white/[0.1] shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03] border border-transparent'
                }`}
              >
                <Icon
                  className={`w-3.5 h-3.5 transition-colors ${
                    isActive ? 'text-[#dfc195]' : 'text-zinc-400'
                  }`}
                />
                <span className="tracking-tight">{item.label}</span>
                {item.badge !== undefined && (
                  <span
                    className={`font-mono text-[10px] font-semibold px-1.5 py-0.2 rounded ${
                      isActive
                        ? 'bg-[#c8a97e]/20 text-[#dfc195] border border-[#c8a97e]/30'
                        : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
                {item.liveDot && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
