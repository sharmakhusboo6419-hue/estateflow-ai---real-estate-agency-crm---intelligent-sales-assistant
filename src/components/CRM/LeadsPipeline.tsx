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

const STAGE_COLORS: Record<PipelineStage, { bg: string; border: string; dot: string; text: string }> = {
  'New Lead': {
    bg: 'from-blue-500/10 to-transparent',
    border: 'border-blue-500/30',
    dot: 'bg-blue-400',
    text: 'text-blue-300',
  },
  'AI Engaged': {
    bg: 'from-amber-500/10 to-transparent',
    border: 'border-amber-500/30',
    dot: 'bg-amber-400',
    text: 'text-amber-300',
  },
  'Viewing Scheduled': {
    bg: 'from-indigo-500/10 to-transparent',
    border: 'border-indigo-500/30',
    dot: 'bg-indigo-400',
    text: 'text-indigo-300',
  },
  'Offer & Negotiation': {
    bg: 'from-rose-500/10 to-transparent',
    border: 'border-rose-500/30',
    dot: 'bg-rose-400',
    text: 'text-rose-300',
  },
  'Closed Won': {
    bg: 'from-emerald-500/10 to-transparent',
    border: 'border-emerald-500/30',
    dot: 'bg-emerald-400',
    text: 'text-emerald-300',
  },
  'Archived / Cold': {
    bg: 'from-slate-500/10 to-transparent',
    border: 'border-slate-500/30',
    dot: 'bg-slate-400',
    text: 'text-slate-300',
  },
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
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/15 border border-rose-500/35 text-rose-300 shadow-sm shadow-rose-500/10">
            <Flame className="w-3.5 h-3.5 text-rose-400" />
            Hot Lead (&gt;$1M)
          </span>
        );
      case 'Warm':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/15 border border-amber-500/35 text-amber-300 shadow-sm shadow-amber-500/10">
            <Sun className="w-3.5 h-3.5 text-amber-400" />
            Warm Lead ($450k+)
          </span>
        );
      case 'Cold':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-500/15 border border-sky-500/35 text-sky-300 shadow-sm shadow-sky-500/10">
            <Snowflake className="w-3.5 h-3.5 text-sky-400" />
            Cold Lead
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
    <div className="space-y-5 sm:space-y-6 animate-in fade-in duration-300">
      {/* Real Estate Executive KPI Dashboard */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* KPI 1: Total Pipeline Value */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/20 border border-slate-800 shadow-xl relative overflow-hidden group hover:border-amber-500/30 transition">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Pipeline Value
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-white tracking-tight">
            ${(stats.totalPipelineValue / 1000000).toFixed(2)}M
          </div>
          <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-emerald-400" />
            <span className="text-emerald-400 font-bold">{leads.length}</span> active prospects in CRM
          </p>
        </div>

        {/* KPI 2: Hot Buyers Volume */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-rose-950/20 border border-slate-800 shadow-xl relative overflow-hidden group hover:border-rose-500/30 transition">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              VIP Hot Buyers
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-rose-300 tracking-tight">
            {stats.hotCount} <span className="text-xs text-slate-400 font-normal">Clients</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            <span className="text-rose-400 font-bold">${(stats.hotValue / 1000000).toFixed(1)}M</span> liquid capital ready
          </p>
        </div>

        {/* KPI 3: Mortgage Pre-Approval Rate */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/20 border border-slate-800 shadow-xl relative overflow-hidden group hover:border-emerald-500/30 transition">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Pre-Approval Rate
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-300 tracking-tight">
            {stats.preApprovedRate}%
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Verified financing & ready to submit offers
          </p>
        </div>

        {/* KPI 4: Average AI Intent Score */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/20 border border-slate-800 shadow-xl relative overflow-hidden group hover:border-indigo-500/30 transition">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Avg AI Intent Score
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-indigo-300 tracking-tight">
            {stats.avgScore} <span className="text-xs text-slate-400 font-normal">/ 100</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            High purchase readiness & responsive rate
          </p>
        </div>
      </div>

      {/* Main Controls Card */}
      <div className="bg-slate-900/95 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xl backdrop-blur-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <h1 className="text-lg sm:text-xl font-black text-white tracking-tight">
                Leads Pipeline & Client Qualification
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Autonomous AI categorization: Cold, Warm, and Hot tiers based on verified liquid budget, timeline, and urgency.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            {/* Export CSV Button */}
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 border border-slate-700/80 font-bold text-xs shadow-md transition-all hover:border-slate-600 cursor-pointer"
              title="Download structured spreadsheet (.csv) of current filtered leads"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Export CSV</span>
              <span className="text-[10px] bg-slate-900 px-1.5 py-0.5 rounded-full text-slate-400">
                {filteredLeads.length}
              </span>
            </button>

            {/* Add Client Button */}
            <button
              onClick={onOpenNewLeadModal}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add Client</span>
            </button>

            {/* View Mode Switcher */}
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1 text-xs">
              <button
                onClick={() => setViewMode('kanban')}
                className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                  viewMode === 'kanban'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Kanban
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Table View
              </button>
            </div>
          </div>
        </div>

        {/* Stale Leads Needs Attention Alert Banner */}
        {staleLeads.length > 0 && (
          <div className="mt-4 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-4 h-4 text-amber-400 animate-bounce" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-amber-300">
                    Stale Lead Alert: {staleLeads.length} Client{staleLeads.length > 1 ? 's' : ''} Require Follow-up
                  </span>
                  <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full font-bold border border-rose-500/30">
                    &gt; 7 Days Inactive
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Clients without agent touchpoints in over a week are highlighted to protect against deal drop-off.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => {
                  setFilterNeedsAttention(!filterNeedsAttention);
                  if (!filterNeedsAttention) setTemperatureFilter('All');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  filterNeedsAttention
                    ? 'bg-amber-500 text-slate-950 font-black'
                    : 'bg-slate-800 text-amber-300 hover:bg-slate-700 border border-amber-500/30'
                }`}
              >
                {filterNeedsAttention ? 'Clear Filter' : `Filter Needs Attention (${staleLeads.length})`}
              </button>
            </div>
          </div>
        )}

        {/* Filter Bar with Temperature Segregation tabs */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Temperature Buttons */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-bold text-slate-400 mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Filter:
            </span>
            <button
              onClick={() => {
                setTemperatureFilter('All');
                setFilterNeedsAttention(false);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                temperatureFilter === 'All' && !filterNeedsAttention
                  ? 'bg-slate-800 text-white font-black border border-slate-700 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              All Tiers ({leads.length})
            </button>
            <button
              onClick={() => {
                setTemperatureFilter('Hot');
                setFilterNeedsAttention(false);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                temperatureFilter === 'Hot' && !filterNeedsAttention
                  ? 'bg-rose-500/20 text-rose-300 font-bold border border-rose-500/50 shadow-sm shadow-rose-500/10'
                  : 'text-slate-400 hover:text-rose-300 hover:bg-slate-800/60'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-rose-400" />
              <span>Hot ({leads.filter((l) => l.temperature === 'Hot').length})</span>
              <span className="text-[10px] opacity-75 hidden sm:inline">&gt;$1M</span>
            </button>
            <button
              onClick={() => {
                setTemperatureFilter('Warm');
                setFilterNeedsAttention(false);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                temperatureFilter === 'Warm' && !filterNeedsAttention
                  ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/50 shadow-sm shadow-amber-500/10'
                  : 'text-slate-400 hover:text-amber-300 hover:bg-slate-800/60'
              }`}
            >
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span>Warm ({leads.filter((l) => l.temperature === 'Warm').length})</span>
              <span className="text-[10px] opacity-75 hidden sm:inline">$450k+</span>
            </button>
            <button
              onClick={() => {
                setTemperatureFilter('Cold');
                setFilterNeedsAttention(false);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                temperatureFilter === 'Cold' && !filterNeedsAttention
                  ? 'bg-sky-500/20 text-sky-300 font-bold border border-sky-500/50 shadow-sm shadow-sky-500/10'
                  : 'text-slate-400 hover:text-sky-300 hover:bg-slate-800/60'
              }`}
            >
              <Snowflake className="w-3.5 h-3.5 text-sky-400" />
              <span>Cold ({leads.filter((l) => l.temperature === 'Cold').length})</span>
            </button>

            {/* Needs Attention / Stale Filter Tab */}
            <button
              onClick={() => {
                setFilterNeedsAttention(!filterNeedsAttention);
                if (!filterNeedsAttention) setTemperatureFilter('All');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                filterNeedsAttention
                  ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/25'
                  : 'bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 border border-amber-500/30'
              }`}
            >
              <AlertTriangle className={`w-3.5 h-3.5 ${staleLeads.length > 0 ? 'text-amber-400 animate-pulse' : 'text-slate-400'}`} />
              <span>Attention Needed ({staleLeads.length})</span>
            </button>
          </div>

          {/* Search Input with quick clear */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search client, email, property, tag..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Kanban Board View */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 overflow-x-auto pb-4 lg:[grid-template-columns:repeat(5,minmax(18rem,1fr))]">
          {STAGES.map((stage) => {
            const stageLeads = filteredLeads.filter((l) => l.stage === stage);
            const stageValue = stageLeads.reduce((acc, curr) => acc + (curr.budget || 0), 0);
            const stageColor = STAGE_COLORS[stage];

            return (
              <div
                key={stage}
                className="bg-slate-900/80 border border-slate-800/80 rounded-3xl p-4 flex flex-col min-w-[280px] shadow-lg backdrop-blur-sm"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3.5 border-b border-slate-800/80 mb-3.5">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${stageColor.dot}`} />
                    <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-200">
                      {stage}
                    </h3>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                      ${(stageValue / 1000000).toFixed(1)}M
                    </span>
                    <span className="text-xs bg-slate-800 text-slate-300 font-bold px-2 py-0.5 rounded-full">
                      {stageLeads.length}
                    </span>
                  </div>
                </div>

                {/* Cards Container */}
                <div className="space-y-3.5 flex-1 overflow-y-auto max-h-[760px] pr-1 scrollbar-none">
                  {stageLeads.length === 0 ? (
                    <div className="text-center py-12 px-3 border border-dashed border-slate-800 rounded-2xl text-slate-500 text-xs">
                      No prospects in {stage}
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
                          className="bg-slate-950/70 border border-slate-800/80 hover:border-amber-500/40 rounded-2xl p-4 transition-all shadow-md hover:shadow-xl hover:shadow-black/40 group relative backdrop-blur-sm"
                        >
                          {/* Top Row: Avatar, Name, Temperature */}
                          <div className="flex items-start justify-between gap-2.5 mb-2.5">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <img
                                src={lead.avatar}
                                alt={lead.name}
                                className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-800 shrink-0"
                              />
                              <div className="min-w-0">
                                <h4
                                  onClick={() => onSelectLead(lead)}
                                  className="text-sm font-bold text-white hover:text-amber-300 cursor-pointer transition truncate"
                                  title={lead.name}
                                >
                                  {lead.name}
                                </h4>
                                <span className="text-[11px] text-slate-400 block truncate">
                                  {lead.phone}
                                </span>
                              </div>
                            </div>
                            <div className="shrink-0">{getTemperatureBadge(lead.temperature)}</div>
                          </div>

                          {/* Stale Lead Alert Banner */}
                          {isStale && (
                            <div className="mb-3 py-1.5 px-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center justify-between gap-2 animate-in fade-in">
                              <span className="flex items-center gap-1.5 text-[11px]">
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 animate-pulse flex-shrink-0" />
                                Attention ({lead.daysSinceLastContact ? `${lead.daysSinceLastContact}d inactive` : '>7d'})
                              </span>
                              {onReengageLead && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onReengageLead(lead);
                                  }}
                                  className="px-2 py-0.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[10px] transition cursor-pointer shadow-sm"
                                  title="Mark contacted and resolve Needs Attention alert"
                                >
                                  Re-engage
                                </button>
                              )}
                            </div>
                          )}

                          {/* Financials & Timeline */}
                          <div className="mb-3 space-y-1.5 text-xs bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/60">
                            <div className="flex items-center justify-between text-slate-300">
                              <span className="text-slate-400 flex items-center gap-1">
                                <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Budget
                              </span>
                              <span className="font-extrabold text-emerald-300 text-sm">
                                ${lead.budget.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-slate-300">
                              <span className="text-slate-400 flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-amber-400" /> Timeline
                              </span>
                              <span className="text-slate-300 font-medium text-right truncate max-w-[130px]">
                                {lead.timeline}
                              </span>
                            </div>
                            {lead.preApproved && (
                              <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold pt-0.5">
                                <ShieldCheck className="w-3.5 h-3.5" /> Pre-approved Mortgage
                              </div>
                            )}
                          </div>

                          {/* Property of Interest */}
                          {prop && (
                            <div className="flex items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-slate-800/80 text-xs">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <Home className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                <span className="text-slate-300 font-medium truncate">
                                  {prop.title}
                                </span>
                              </div>
                              <span className="text-amber-300 font-bold shrink-0">
                                ${(prop.price / 1000).toFixed(0)}k
                              </span>
                            </div>
                          )}

                          {/* AI Match Score Progress */}
                          <div className="mb-3">
                            <div className="flex items-center justify-between text-[11px] mb-1">
                              <span className="text-slate-400 flex items-center gap-1">
                                <Sparkles className="w-3 h-3 text-amber-400" /> AI Intent Score
                              </span>
                              <span className="font-black text-amber-300">{lead.aiScore}%</span>
                            </div>
                            <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                              <div
                                className="bg-gradient-to-r from-amber-500 to-rose-500 h-full rounded-full transition-all duration-500"
                                style={{ width: `${lead.aiScore}%` }}
                              />
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
                            <button
                              onClick={() => onStartChatWithLead(lead)}
                              className="flex items-center gap-1 text-xs font-bold text-amber-400 hover:text-amber-300 transition cursor-pointer py-1 px-2 rounded-lg hover:bg-amber-500/10"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              AI Chat
                            </button>

                            <button
                              onClick={() => onSelectLead(lead)}
                              className="flex items-center gap-1 text-xs font-semibold text-slate-300 hover:text-white transition cursor-pointer py-1 px-2 rounded-lg hover:bg-slate-800"
                            >
                              Dossier
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>

                            {stage !== 'Closed Won' && (
                              <button
                                onClick={() => {
                                  const nextIdx = STAGES.indexOf(stage) + 1;
                                  if (nextIdx < STAGES.length) {
                                    onUpdateLeadStage(lead.id, STAGES[nextIdx]);
                                  }
                                }}
                                className="text-xs text-slate-400 hover:text-amber-300 flex items-center gap-0.5 px-2 py-1 rounded-lg hover:bg-slate-900 border border-transparent hover:border-slate-800 transition cursor-pointer"
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
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-xl backdrop-blur-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-4 px-5 font-bold">Client Name</th>
                  <th className="py-4 px-4 font-bold">Budget Tier</th>
                  <th className="py-4 px-4 font-bold">Budget Amount</th>
                  <th className="py-4 px-4 font-bold">Pipeline Stage</th>
                  <th className="py-4 px-4 font-bold">Interested Listing</th>
                  <th className="py-4 px-4 font-bold">Timeline</th>
                  <th className="py-4 px-4 font-bold">AI Intent Score</th>
                  <th className="py-4 px-5 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredLeads.map((lead) => {
                  const prop = properties.find((p) => p.id === lead.interestedPropertyId);
                  const isStale =
                    lead.isStale ||
                    lead.tags?.includes('Needs Attention') ||
                    (lead.daysSinceLastContact !== undefined && lead.daysSinceLastContact > 7);

                  return (
                    <tr
                      key={lead.id}
                      className="hover:bg-slate-800/50 transition cursor-pointer"
                      onClick={() => onSelectLead(lead)}
                    >
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <img
                            src={lead.avatar}
                            alt={lead.name}
                            className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-700"
                          />
                          <div>
                            <div className="font-bold text-white text-sm flex items-center gap-1.5">
                              <span>{lead.name}</span>
                              {isStale && (
                                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-black">
                                  <AlertTriangle className="w-2.5 h-2.5 text-amber-400" /> Attention
                                </span>
                              )}
                            </div>
                            <div className="text-slate-400 text-xs">{lead.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">{getTemperatureBadge(lead.temperature)}</td>
                      <td className="py-4 px-4 font-black text-emerald-300 text-sm">
                        ${lead.budget.toLocaleString()}
                      </td>
                      <td className="py-4 px-4">
                        <span className="px-3 py-1 rounded-xl bg-slate-800 text-slate-200 border border-slate-700 font-bold text-xs">
                          {lead.stage}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        {prop ? (
                          <span className="text-slate-200 font-medium">{prop.title}</span>
                        ) : (
                          <span className="text-slate-500">General search</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-slate-300">{lead.timeline}</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-slate-800 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-amber-500 to-rose-500 h-full rounded-full"
                              style={{ width: `${lead.aiScore}%` }}
                            />
                          </div>
                          <span className="font-bold text-amber-300">{lead.aiScore}%</span>
                        </div>
                      </td>
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isStale && onReengageLead && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onReengageLead(lead);
                              }}
                              className="px-2.5 py-1 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition cursor-pointer shadow-sm"
                              title="Mark contacted and resolve alert"
                            >
                              Re-engage
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onStartChatWithLead(lead);
                            }}
                            className="px-3 py-1 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold hover:bg-amber-500/30 transition cursor-pointer"
                          >
                            Chatbot
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectLead(lead);
                            }}
                            className="px-3 py-1 rounded-xl bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
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
