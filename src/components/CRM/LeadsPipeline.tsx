import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Filter,
  Flame,
  Sun,
  Snowflake,
  DollarSign,
  Calendar,
  MessageSquare,
  Sparkles,
  ArrowRight,
  Clock,
  Plus,
  Home,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  FileSpreadsheet,
  Download,
  AlertTriangle,
  Mail,
  Phone,
  BarChart3,
  TrendingUp,
  X,
  SlidersHorizontal,
} from 'lucide-react';
import { Lead, LeadTemperature, PipelineStage, Property } from '../../types/realEstate';

interface LeadsPipelineProps {
  leads: Lead[];
  properties: Property[];
  onSelectLead: (lead: Lead) => void;
  onUpdateLeadStage: (leadId: string, newStage: PipelineStage) => void;
  onOpenNewLeadModal: () => void;
  onStartChatWithLead: (lead: Lead) => void;
  onReengageLead?: (lead: Lead) => void;
}

const STAGES: PipelineStage[] = [
  'New Lead',
  'AI Engaged',
  'Viewing Scheduled',
  'Offer & Negotiation',
  'Closed Won',
];

const STAGE_DOTS: Record<PipelineStage, string> = {
  'New Lead': 'bg-sky-400',
  'AI Engaged': 'bg-[#dfc195]',
  'Viewing Scheduled': 'bg-indigo-400',
  'Offer & Negotiation': 'bg-rose-400',
  'Closed Won': 'bg-emerald-400',
  'Archived / Cold': 'bg-zinc-500',
};

export const LeadsPipeline: React.FC<LeadsPipelineProps> = ({
  leads,
  properties,
  onSelectLead,
  onUpdateLeadStage,
  onOpenNewLeadModal,
  onStartChatWithLead,
  onReengageLead,
}) => {
  const [temperatureFilter, setTemperatureFilter] = useState<LeadTemperature | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [filterNeedsAttention, setFilterNeedsAttention] = useState(false);
  const [sortBy, setSortBy] = useState<'budget' | 'score' | 'name'>('budget');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // KPI Calculations
  const stats = useMemo(() => {
    const totalPipelineValue = leads.reduce((acc, curr) => acc + (curr.budget || 0), 0);
    const hotLeads = leads.filter((l) => l.temperature === 'Hot');
    const hotValue = hotLeads.reduce((acc, curr) => acc + (curr.budget || 0), 0);
    const preApprovedCount = leads.filter((l) => l.preApproved).length;
    const preApprovedRate = leads.length > 0 ? Math.round((preApprovedCount / leads.length) * 100) : 0;
    const avgScore = leads.length > 0 ? Math.round(leads.reduce((acc, curr) => acc + (curr.aiScore || 0), 0) / leads.length) : 0;
    return {
      totalPipelineValue,
      hotCount: hotLeads.length,
      hotValue,
      preApprovedRate,
      avgScore,
    };
  }, [leads]);

  const staleLeads = useMemo(
    () =>
      leads.filter(
        (l) =>
          l.isStale ||
          l.tags?.includes('Needs Attention') ||
          (l.daysSinceLastContact !== undefined && l.daysSinceLastContact > 7)
      ),
    [leads]
  );

  const filteredLeads = useMemo(() => {
    let result = leads.filter((lead) => {
      const isStaleLead =
        lead.isStale ||
        lead.tags?.includes('Needs Attention') ||
        (lead.daysSinceLastContact !== undefined && lead.daysSinceLastContact > 7);

      if (filterNeedsAttention && !isStaleLead) return false;

      const matchesTemp = temperatureFilter === 'All' || lead.temperature === temperatureFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        lead.name.toLowerCase().includes(q) ||
        lead.email.toLowerCase().includes(q) ||
        lead.phone.toLowerCase().includes(q) ||
        lead.preferredLocation.toLowerCase().includes(q) ||
        (lead.tags || []).some((t) => t.toLowerCase().includes(q));

      return matchesTemp && matchesSearch;
    });

    return result.sort((a, b) => {
      let diff = 0;
      if (sortBy === 'budget') diff = (b.budget || 0) - (a.budget || 0);
      else if (sortBy === 'score') diff = (b.aiScore || 0) - (a.aiScore || 0);
      else if (sortBy === 'name') diff = a.name.localeCompare(b.name);
      return sortOrder === 'desc' ? diff : -diff;
    });
  }, [leads, temperatureFilter, searchQuery, filterNeedsAttention, sortBy, sortOrder]);

  const getTemperatureBadge = (temp: LeadTemperature) => {
    switch (temp) {
      case 'Hot':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-rose-500/10 border border-rose-500/20 text-rose-300">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            Hot Lead
          </span>
        );
      case 'Warm':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-amber-500/10 border border-amber-500/20 text-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            Warm
          </span>
        );
      case 'Cold':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-sky-500/10 border border-sky-500/20 text-sky-300">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
            Cold
          </span>
        );
    }
  };

  const handleExportCSV = () => {
    const headers = [
      'Client Name',
      'Email',
      'Phone',
      'Budget (USD)',
      'Temperature Tier',
      'Pipeline Stage',
      'Interested Property',
      'Buying Timeline',
      'Pre-Approved Financing',
      'AI Score',
      'Assigned Agent',
      'Tags',
      'AI Summary',
      'Created Date',
    ];

    const escapeCsv = (val: any) => {
      if (val === null || val === undefined) return '""';
      const s = String(val).replace(/"/g, '""');
      return `"${s}"`;
    };

    const rows = filteredLeads.map((lead) => {
      const prop = properties.find((p) => p.id === lead.interestedPropertyId);
      return [
        escapeCsv(lead.name),
        escapeCsv(lead.email),
        escapeCsv(lead.phone),
        lead.budget || 0,
        escapeCsv(lead.temperature),
        escapeCsv(lead.stage),
        escapeCsv(prop?.title || 'General Search'),
        escapeCsv(lead.timeline),
        escapeCsv(lead.preApproved ? 'Yes' : 'No'),
        lead.aiScore || 0,
        escapeCsv(lead.assignedAgent),
        escapeCsv((lead.tags || []).join('; ')),
        escapeCsv(lead.aiSummary),
        escapeCsv(lead.createdAt || new Date().toISOString().split('T')[0]),
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStr = new Date().toISOString().split('T')[0];
    const tierSuffix = temperatureFilter !== 'All' ? `_${temperatureFilter.toLowerCase()}` : '_all';
    link.setAttribute('href', url);
    link.setAttribute('download', `estateflow_leads${tierSuffix}_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Real Estate Executive KPI Dashboard */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* KPI 1: Total Pipeline Value */}
        <div className="surface-card rounded-xl p-4 sm:p-5 relative overflow-hidden group">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
              Total Pipeline Volume
            </span>
            <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-white/[0.08] text-[#dfc195] flex items-center justify-center">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-mono font-bold text-white tracking-tight">
            ${(stats.totalPipelineValue / 1000000).toFixed(2)}M
          </div>
          <p className="text-[11px] text-zinc-400 mt-1.5 flex items-center gap-1.5">
            <span className="font-mono text-emerald-400 font-semibold">{leads.length}</span>
            <span>active client engagements</span>
          </p>
        </div>

        {/* KPI 2: VIP Hot Buyers Volume */}
        <div className="surface-card rounded-xl p-4 sm:p-5 relative overflow-hidden group">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
              High-Intent VIP Buyers
            </span>
            <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-white/[0.08] text-rose-400 flex items-center justify-center">
              <Flame className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-mono font-bold text-white tracking-tight">
            {stats.hotCount} <span className="text-xs font-normal text-zinc-400 font-sans">Buyers</span>
          </div>
          <p className="text-[11px] text-zinc-400 mt-1.5">
            <span className="font-mono text-rose-300 font-semibold">${(stats.hotValue / 1000000).toFixed(1)}M</span> liquid capital
          </p>
        </div>

        {/* KPI 3: Pre-Approval Rate */}
        <div className="surface-card rounded-xl p-4 sm:p-5 relative overflow-hidden group">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
              Pre-Approved Capital
            </span>
            <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-white/[0.08] text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-mono font-bold text-white tracking-tight">
            {stats.preApprovedRate}%
          </div>
          <p className="text-[11px] text-zinc-400 mt-1.5">
            Verified financing & pre-qualified
          </p>
        </div>

        {/* KPI 4: Average AI Intent Score */}
        <div className="surface-card rounded-xl p-4 sm:p-5 relative overflow-hidden group">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
              Avg Qualification Score
            </span>
            <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-white/[0.08] text-indigo-400 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-mono font-bold text-white tracking-tight">
            {stats.avgScore} <span className="text-xs font-normal text-zinc-400 font-sans">/ 100</span>
          </div>
          <p className="text-[11px] text-zinc-400 mt-1.5">
            Automated multi-factor buyer tiering
          </p>
        </div>
      </div>

      {/* Main Controls & Header Card */}
      <div className="surface-card rounded-xl p-4 sm:p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Client Pipeline & Qualification
              </h1>
              <span className="text-[11px] font-mono text-zinc-400 bg-white/[0.04] border border-white/[0.08] px-2 py-0.5 rounded">
                {filteredLeads.length} Profiles
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Automated buyer temperature classification based on verified liquid budget, timeline urgency, and response velocity.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Export CSV Button */}
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-white/[0.08] font-medium text-xs transition cursor-pointer"
              title="Download structured spreadsheet (.csv)"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-zinc-400" />
              <span>Export CSV</span>
            </button>

            {/* Add Client Button */}
            <button
              onClick={onOpenNewLeadModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#c8a97e] hover:bg-[#dfc195] text-zinc-950 font-semibold text-xs shadow-sm transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.2]" />
              <span>Add Prospect</span>
            </button>

            {/* View Mode Switcher */}
            <div className="flex items-center bg-zinc-900 border border-white/[0.08] rounded-lg p-0.5 text-xs">
              <button
                onClick={() => setViewMode('kanban')}
                className={`px-2.5 py-1 rounded-md font-medium transition cursor-pointer text-xs ${
                  viewMode === 'kanban'
                    ? 'bg-zinc-800 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Board
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-2.5 py-1 rounded-md font-medium transition cursor-pointer text-xs ${
                  viewMode === 'table'
                    ? 'bg-zinc-800 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Table
              </button>
            </div>
          </div>
        </div>

        {/* Stale Leads Needs Attention Alert Banner */}
        {staleLeads.length > 0 && (
          <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <span className="text-xs font-semibold text-amber-200">
                  {staleLeads.length} Client{staleLeads.length > 1 ? 's' : ''} Require Follow-Up
                </span>
                <span className="text-[11px] text-zinc-400 ml-2">
                  No touchpoints logged in over 7 days. Action advised to protect engagement.
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                setFilterNeedsAttention(!filterNeedsAttention);
                if (!filterNeedsAttention) setTemperatureFilter('All');
              }}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition cursor-pointer shrink-0 ${
                filterNeedsAttention
                  ? 'bg-amber-400 text-zinc-950 font-semibold'
                  : 'bg-zinc-900 text-amber-300 hover:bg-zinc-800 border border-amber-500/30'
              }`}
            >
              {filterNeedsAttention ? 'Show All' : `Filter Stale (${staleLeads.length})`}
            </button>
          </div>
        )}

        {/* Filter Bar with Temperature Segregation tabs */}
        <div className="mt-4 pt-3.5 border-t border-white/[0.06] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Temperature Buttons */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => {
                setTemperatureFilter('All');
                setFilterNeedsAttention(false);
              }}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition cursor-pointer ${
                temperatureFilter === 'All' && !filterNeedsAttention
                  ? 'bg-zinc-800 text-white border border-white/[0.1]'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              All Tiers ({leads.length})
            </button>
            <button
              onClick={() => {
                setTemperatureFilter('Hot');
                setFilterNeedsAttention(false);
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition cursor-pointer ${
                temperatureFilter === 'Hot' && !filterNeedsAttention
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : 'text-zinc-400 hover:text-rose-300 hover:bg-zinc-900'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
              <span>Hot ({leads.filter((l) => l.temperature === 'Hot').length})</span>
            </button>
            <button
              onClick={() => {
                setTemperatureFilter('Warm');
                setFilterNeedsAttention(false);
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition cursor-pointer ${
                temperatureFilter === 'Warm' && !filterNeedsAttention
                  ? 'bg-amber-500/20 text-amber-200 border border-amber-500/30'
                  : 'text-zinc-400 hover:text-amber-200 hover:bg-zinc-900'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span>Warm ({leads.filter((l) => l.temperature === 'Warm').length})</span>
            </button>
            <button
              onClick={() => {
                setTemperatureFilter('Cold');
                setFilterNeedsAttention(false);
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition cursor-pointer ${
                temperatureFilter === 'Cold' && !filterNeedsAttention
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                  : 'text-zinc-400 hover:text-sky-300 hover:bg-zinc-900'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
              <span>Cold ({leads.filter((l) => l.temperature === 'Cold').length})</span>
            </button>
          </div>

          {/* Search Input */}
          <div className="relative min-w-[240px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by client, property, or tag..."
              className="w-full bg-zinc-900 border border-white/[0.08] rounded-lg pl-8 pr-7 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#c8a97e] transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Kanban Board View */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3.5 overflow-x-auto pb-4 lg:[grid-template-columns:repeat(5,minmax(18rem,1fr))]">
          {STAGES.map((stage) => {
            const stageLeads = filteredLeads.filter((l) => l.stage === stage);
            const stageValue = stageLeads.reduce((acc, curr) => acc + (curr.budget || 0), 0);
            const dotColor = STAGE_DOTS[stage] || 'bg-zinc-400';

            return (
              <div
                key={stage}
                className="surface-card rounded-xl p-3.5 flex flex-col min-w-[280px]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${dotColor}`} />
                    <h3 className="font-semibold text-xs tracking-tight text-zinc-200">
                      {stage}
                    </h3>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[10px] text-zinc-400 bg-white/[0.04] px-1.5 py-0.5 rounded border border-white/[0.06]">
                      ${(stageValue / 1000000).toFixed(1)}M
                    </span>
                    <span className="font-mono text-[10px] text-zinc-300 font-medium px-1.5 py-0.5 rounded bg-zinc-800">
                      {stageLeads.length}
                    </span>
                  </div>
                </div>

                {/* Cards Container */}
                <div className="space-y-3 flex-1 overflow-y-auto max-h-[760px] pr-0.5 scrollbar-none">
                  {stageLeads.length === 0 ? (
                    <div className="text-center py-10 px-3 border border-dashed border-white/[0.08] rounded-lg text-zinc-500 text-xs">
                      No prospects in this stage
                    </div>
                  ) : (
                    stageLeads.map((lead) => {
                      const prop = properties.find((p) => p.id === lead.interestedPropertyId);
                      const isStale =
                        lead.isStale ||
                        lead.tags?.includes('Needs Attention') ||
                        (lead.daysSinceLastContact !== undefined && lead.daysSinceLastContact > 7);

                      return (
                        <div
                          key={lead.id}
                          className="bg-zinc-900/90 border border-white/[0.08] hover:border-white/[0.18] rounded-lg p-3 transition shadow-sm hover:shadow-md group relative"
                        >
                          {/* Top Row: Avatar, Name, Temperature */}
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <img
                                src={lead.avatar}
                                alt={lead.name}
                                className="w-8 h-8 rounded-full object-cover ring-1 ring-white/10 shrink-0"
                              />
                              <div className="min-w-0">
                                <h4
                                  onClick={() => onSelectLead(lead)}
                                  className="text-xs font-semibold text-zinc-100 hover:text-[#dfc195] cursor-pointer transition truncate"
                                  title={lead.name}
                                >
                                  {lead.name}
                                </h4>
                                <span className="text-[10px] text-zinc-400 block truncate font-mono">
                                  {lead.phone}
                                </span>
                              </div>
                            </div>
                            <div className="shrink-0">{getTemperatureBadge(lead.temperature)}</div>
                          </div>

                          {/* Stale Lead Alert Banner */}
                          {isStale && (
                            <div className="mb-2 py-1 px-2 rounded bg-amber-500/10 border border-amber-500/20 text-amber-200 text-[11px] font-medium flex items-center justify-between gap-1.5">
                              <span className="flex items-center gap-1 text-[10px]">
                                <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
                                {lead.daysSinceLastContact ? `${lead.daysSinceLastContact}d inactive` : 'Needs contact'}
                              </span>
                              {onReengageLead && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onReengageLead(lead);
                                  }}
                                  className="px-1.5 py-0.5 rounded bg-amber-400 hover:bg-amber-300 text-zinc-950 font-semibold text-[9px] transition cursor-pointer"
                                  title="Mark contacted"
                                >
                                  Re-engage
                                </button>
                              )}
                            </div>
                          )}

                          {/* Financials & Timeline */}
                          <div className="mb-2.5 space-y-1 text-xs bg-black/30 p-2 rounded border border-white/[0.04]">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] text-zinc-400">Budget</span>
                              <span className="font-mono font-semibold text-emerald-400 text-xs">
                                ${lead.budget.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] text-zinc-400">Timeline</span>
                              <span className="text-[11px] text-zinc-300 truncate max-w-[140px] text-right">
                                {lead.timeline}
                              </span>
                            </div>
                            {lead.preApproved && (
                              <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-medium pt-0.5">
                                <ShieldCheck className="w-3 h-3" /> Pre-approved
                              </div>
                            )}
                          </div>

                          {/* Property of Interest */}
                          {prop && (
                            <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-white/[0.06] text-xs">
                              <div className="flex items-center gap-1 min-w-0">
                                <Home className="w-3 h-3 text-zinc-400 shrink-0" />
                                <span className="text-zinc-300 text-[11px] truncate">
                                  {prop.title}
                                </span>
                              </div>
                              <span className="font-mono text-zinc-300 text-[11px] shrink-0">
                                ${(prop.price / 1000).toFixed(0)}k
                              </span>
                            </div>
                          )}

                          {/* AI Match Score Progress */}
                          <div className="mb-2.5">
                            <div className="flex items-center justify-between text-[10px] mb-1">
                              <span className="text-zinc-400 flex items-center gap-1">
                                <Sparkles className="w-3 h-3 text-[#dfc195]" /> Intent Score
                              </span>
                              <span className="font-mono font-semibold text-zinc-200">{lead.aiScore}%</span>
                            </div>
                            <div className="w-full bg-zinc-800 h-1 rounded-full overflow-hidden">
                              <div
                                className="bg-[#c8a97e] h-full rounded-full transition-all duration-300"
                                style={{ width: `${lead.aiScore}%` }}
                              />
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center justify-between gap-1 pt-1.5 border-t border-white/[0.06]">
                            <button
                              onClick={() => onStartChatWithLead(lead)}
                              className="flex items-center gap-1 text-[11px] font-medium text-[#dfc195] hover:text-white transition cursor-pointer py-1 px-1.5 rounded hover:bg-white/[0.04]"
                            >
                              <MessageSquare className="w-3 h-3" />
                              Chat
                            </button>

                            <button
                              onClick={() => onSelectLead(lead)}
                              className="flex items-center gap-0.5 text-[11px] font-medium text-zinc-400 hover:text-white transition cursor-pointer py-1 px-1.5 rounded hover:bg-white/[0.04]"
                            >
                              Dossier
                              <ChevronRight className="w-3 h-3" />
                            </button>

                            {stage !== 'Closed Won' && (
                              <button
                                onClick={() => {
                                  const nextIdx = STAGES.indexOf(stage) + 1;
                                  if (nextIdx < STAGES.length) {
                                    onUpdateLeadStage(lead.id, STAGES[nextIdx]);
                                  }
                                }}
                                className="text-[11px] text-zinc-400 hover:text-[#dfc195] flex items-center gap-0.5 px-1.5 py-1 rounded hover:bg-white/[0.04] transition cursor-pointer"
                                title="Advance to next pipeline stage"
                              >
                                <span>Advance</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="surface-card rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-zinc-950/80 text-zinc-400 uppercase tracking-wider text-[10px] border-b border-white/[0.06]">
                <tr>
                  <th className="py-3 px-4 font-semibold">Client Name</th>
                  <th className="py-3 px-4 font-semibold">Budget Tier</th>
                  <th className="py-3 px-4 font-semibold">Budget (USD)</th>
                  <th className="py-3 px-4 font-semibold">Pipeline Stage</th>
                  <th className="py-3 px-4 font-semibold">Interested Listing</th>
                  <th className="py-3 px-4 font-semibold">Timeline</th>
                  <th className="py-3 px-4 font-semibold">AI Intent Score</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filteredLeads.map((lead) => {
                  const prop = properties.find((p) => p.id === lead.interestedPropertyId);
                  const isStale =
                    lead.isStale ||
                    lead.tags?.includes('Needs Attention') ||
                    (lead.daysSinceLastContact !== undefined && lead.daysSinceLastContact > 7);

                  return (
                    <tr
                      key={lead.id}
                      className="hover:bg-white/[0.02] transition cursor-pointer"
                      onClick={() => onSelectLead(lead)}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={lead.avatar}
                            alt={lead.name}
                            className="w-7 h-7 rounded-full object-cover ring-1 ring-white/10"
                          />
                          <div>
                            <div className="font-semibold text-zinc-100 text-xs flex items-center gap-1.5">
                              <span>{lead.name}</span>
                              {isStale && (
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 text-[9px]">
                                  <AlertTriangle className="w-2.5 h-2.5 text-amber-400" /> Stale
                                </span>
                              )}
                            </div>
                            <div className="text-zinc-500 text-[11px] font-mono">{lead.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">{getTemperatureBadge(lead.temperature)}</td>
                      <td className="py-3 px-4 font-mono font-semibold text-emerald-400 text-xs">
                        ${lead.budget.toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-200 border border-white/[0.06] text-[11px]">
                          {lead.stage}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {prop ? (
                          <span className="text-zinc-200 text-xs">{prop.title}</span>
                        ) : (
                          <span className="text-zinc-500">General search</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-zinc-300 text-xs">{lead.timeline}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-zinc-800 h-1 rounded-full overflow-hidden">
                            <div
                              className="bg-[#c8a97e] h-full rounded-full"
                              style={{ width: `${lead.aiScore}%` }}
                            />
                          </div>
                          <span className="font-mono text-zinc-300 text-[11px]">{lead.aiScore}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isStale && onReengageLead && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onReengageLead(lead);
                              }}
                              className="px-2 py-1 rounded bg-amber-400 hover:bg-amber-300 text-zinc-950 font-medium text-[11px] transition cursor-pointer"
                              title="Mark contacted"
                            >
                              Re-engage
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onStartChatWithLead(lead);
                            }}
                            className="px-2.5 py-1 rounded bg-zinc-800 text-[#dfc195] border border-white/[0.08] hover:bg-zinc-700 transition cursor-pointer text-[11px]"
                          >
                            Chat
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectLead(lead);
                            }}
                            className="px-2.5 py-1 rounded bg-zinc-900 text-zinc-300 hover:text-white transition cursor-pointer text-[11px]"
                          >
                            Dossier
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
