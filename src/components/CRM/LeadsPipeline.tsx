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
  LayoutGrid,
  List,
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
          <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-medium bg-rose-500/10 border border-rose-500/20 text-rose-300">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            Hot
          </span>
        );
      case 'Warm':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-medium bg-amber-500/10 border border-amber-500/20 text-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            Warm
          </span>
        );
      case 'Cold':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-medium bg-sky-500/10 border border-sky-500/20 text-sky-300">
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
    <div className="space-y-4 animate-in fade-in duration-150">
      {/* 1. Compact 1-Row Real-Time Metric Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        <div className="surface-card rounded-lg px-3.5 py-2.5 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-500 block">
              Pipeline Volume
            </span>
            <div className="font-mono text-base sm:text-lg font-bold text-white tracking-tight">
              ${(stats.totalPipelineValue / 1000000).toFixed(2)}M
            </div>
          </div>
          <span className="font-mono text-[10px] text-zinc-400 bg-white/[0.04] px-1.5 py-0.5 rounded border border-white/[0.06]">
            {leads.length} leads
          </span>
        </div>

        <div className="surface-card rounded-lg px-3.5 py-2.5 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-500 block">
              VIP Hot Buyers
            </span>
            <div className="font-mono text-base sm:text-lg font-bold text-rose-300 tracking-tight">
              {stats.hotCount} <span className="text-xs font-normal text-zinc-400 font-sans">clients</span>
            </div>
          </div>
          <span className="font-mono text-[10px] text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">
            ${(stats.hotValue / 1000000).toFixed(1)}M
          </span>
        </div>

        <div className="surface-card rounded-lg px-3.5 py-2.5 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-500 block">
              Pre-Approved Capital
            </span>
            <div className="font-mono text-base sm:text-lg font-bold text-emerald-400 tracking-tight">
              {stats.preApprovedRate}%
            </div>
          </div>
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
        </div>

        <div className="surface-card rounded-lg px-3.5 py-2.5 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-500 block">
              Avg AI Intent Score
            </span>
            <div className="font-mono text-base sm:text-lg font-bold text-[#dfc195] tracking-tight">
              {stats.avgScore} <span className="text-xs font-normal text-zinc-400 font-sans">/ 100</span>
            </div>
          </div>
          <Sparkles className="w-4 h-4 text-[#dfc195]" />
        </div>
      </div>

      {/* 2. Unified Toolbar (Filters + Search + Actions) */}
      <div className="surface-card rounded-lg p-2.5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5">
        {/* Left: Temperature Filters */}
        <div className="flex flex-wrap items-center gap-1">
          <button
            onClick={() => {
              setTemperatureFilter('All');
              setFilterNeedsAttention(false);
            }}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition cursor-pointer ${
              temperatureFilter === 'All' && !filterNeedsAttention
                ? 'bg-zinc-800 text-white border border-white/[0.12] shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            All ({leads.length})
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

          {staleLeads.length > 0 && (
            <button
              onClick={() => {
                setFilterNeedsAttention(!filterNeedsAttention);
                if (!filterNeedsAttention) setTemperatureFilter('All');
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition cursor-pointer ${
                filterNeedsAttention
                  ? 'bg-amber-400 text-zinc-950 font-semibold'
                  : 'bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 border border-amber-500/20'
              }`}
            >
              <AlertTriangle className="w-3 h-3 text-amber-400" />
              <span>Attention ({staleLeads.length})</span>
            </button>
          )}
        </div>

        {/* Right: Search, Export & View Toggle */}
        <div className="flex items-center gap-2">
          {/* Search Box */}
          <div className="relative flex-1 md:w-56">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search leads..."
              className="w-full bg-zinc-900 border border-white/[0.08] rounded-md pl-7 pr-6 py-1 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#c8a97e]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            className="p-1.5 rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/[0.08] transition cursor-pointer"
            title="Export CSV"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          {/* Board / Table Switch */}
          <div className="flex items-center bg-zinc-900 border border-white/[0.08] rounded-md p-0.5 text-xs">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1 rounded transition cursor-pointer ${
                viewMode === 'kanban' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-white'
              }`}
              title="Kanban Board View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1 rounded transition cursor-pointer ${
                viewMode === 'table' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-white'
              }`}
              title="Table View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Add Client */}
          <button
            onClick={onOpenNewLeadModal}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#c8a97e] hover:bg-[#dfc195] text-zinc-950 font-semibold text-xs transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.2]" />
            <span className="hidden sm:inline">Add</span>
          </button>
        </div>
      </div>

      {/* 3. Kanban Board View */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 overflow-x-auto pb-4 lg:[grid-template-columns:repeat(5,minmax(17rem,1fr))]">
          {STAGES.map((stage) => {
            const stageLeads = filteredLeads.filter((l) => l.stage === stage);
            const stageValue = stageLeads.reduce((acc, curr) => acc + (curr.budget || 0), 0);
            const dotColor = STAGE_DOTS[stage] || 'bg-zinc-400';

            return (
              <div
                key={stage}
                className="surface-card rounded-lg p-3 flex flex-col min-w-[260px]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2.5 border-b border-white/[0.06] mb-2.5">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${dotColor}`} />
                    <h3 className="font-semibold text-xs tracking-tight text-zinc-200">
                      {stage}
                    </h3>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-mono text-[10px] text-zinc-400">
                      ${(stageValue / 1000000).toFixed(1)}M
                    </span>
                    <span className="font-mono text-[10px] text-zinc-300 font-medium px-1.5 py-0.2 rounded bg-zinc-800">
                      {stageLeads.length}
                    </span>
                  </div>
                </div>

                {/* Cards Container */}
                <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[calc(100dvh-17rem)] pr-0.5 scrollbar-none">
                  {stageLeads.length === 0 ? (
                    <div className="text-center py-8 px-2 border border-dashed border-white/[0.06] rounded text-zinc-500 text-[11px]">
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
                          className="bg-zinc-900/90 border border-white/[0.08] hover:border-white/[0.18] rounded-lg p-2.5 transition shadow-sm hover:shadow group relative"
                        >
                          {/* Row 1: Avatar, Name, Temperature */}
                          <div className="flex items-start justify-between gap-2 mb-1.5">
                            <div className="flex items-center gap-2 min-w-0">
                              <img
                                src={lead.avatar}
                                alt={lead.name}
                                className="w-7 h-7 rounded-full object-cover ring-1 ring-white/10 shrink-0"
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

                          {/* Stale Warning Chip */}
                          {isStale && (
                            <div className="mb-1.5 py-0.5 px-1.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-200 text-[10px] flex items-center justify-between gap-1">
                              <span className="flex items-center gap-1">
                                <AlertTriangle className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                                {lead.daysSinceLastContact ? `${lead.daysSinceLastContact}d uncontacted` : 'Needs outreach'}
                              </span>
                              {onReengageLead && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onReengageLead(lead);
                                  }}
                                  className="px-1.5 py-0.2 rounded bg-amber-400 hover:bg-amber-300 text-zinc-950 font-semibold text-[9px] cursor-pointer"
                                  title="Mark contacted"
                                >
                                  Contact
                                </button>
                              )}
                            </div>
                          )}

                          {/* Financials & Property */}
                          <div className="mb-2 space-y-0.5 text-xs bg-black/25 p-1.5 rounded border border-white/[0.04]">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] text-zinc-400">Budget</span>
                              <span className="font-mono font-semibold text-emerald-400 text-xs">
                                ${lead.budget.toLocaleString()}
                              </span>
                            </div>
                            {prop && (
                              <div className="flex items-center justify-between text-[11px] text-zinc-300 pt-0.5 border-t border-white/[0.04]">
                                <span className="truncate pr-1 text-zinc-400">{prop.title}</span>
                                <span className="font-mono text-zinc-400 shrink-0">${(prop.price / 1000).toFixed(0)}k</span>
                              </div>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center justify-between gap-1 pt-1 border-t border-white/[0.06]">
                            <button
                              onClick={() => onStartChatWithLead(lead)}
                              className="flex items-center gap-1 text-[10px] font-medium text-[#dfc195] hover:text-white transition cursor-pointer py-0.5 px-1 rounded hover:bg-white/[0.04]"
                            >
                              <MessageSquare className="w-3 h-3" />
                              Chat
                            </button>

                            <button
                              onClick={() => onSelectLead(lead)}
                              className="text-[10px] text-zinc-400 hover:text-white transition cursor-pointer py-0.5 px-1 rounded hover:bg-white/[0.04]"
                            >
                              Dossier
                            </button>

                            {stage !== 'Closed Won' && (
                              <button
                                onClick={() => {
                                  const nextIdx = STAGES.indexOf(stage) + 1;
                                  if (nextIdx < STAGES.length) {
                                    onUpdateLeadStage(lead.id, STAGES[nextIdx]);
                                  }
                                }}
                                className="text-[10px] text-zinc-400 hover:text-[#dfc195] flex items-center gap-0.5 px-1 py-0.5 rounded hover:bg-white/[0.04] transition cursor-pointer"
                                title="Advance to next stage"
                              >
                                <span>Advance</span>
                                <ArrowRight className="w-2.5 h-2.5" />
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

      {/* 4. Table View */}
      {viewMode === 'table' && (
        <div className="surface-card rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-zinc-950/80 text-zinc-400 uppercase tracking-wider text-[10px] border-b border-white/[0.06]">
                <tr>
                  <th className="py-2.5 px-4 font-semibold">Client Name</th>
                  <th className="py-2.5 px-3 font-semibold">Budget Tier</th>
                  <th className="py-2.5 px-3 font-semibold">Budget (USD)</th>
                  <th className="py-2.5 px-3 font-semibold">Pipeline Stage</th>
                  <th className="py-2.5 px-3 font-semibold">Listing Interest</th>
                  <th className="py-2.5 px-3 font-semibold">Timeline</th>
                  <th className="py-2.5 px-3 font-semibold">AI Intent</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Actions</th>
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
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-2">
                          <img
                            src={lead.avatar}
                            alt={lead.name}
                            className="w-7 h-7 rounded-full object-cover ring-1 ring-white/10"
                          />
                          <div>
                            <div className="font-semibold text-zinc-100 text-xs flex items-center gap-1.5">
                              <span>{lead.name}</span>
                              {isStale && (
                                <span className="inline-flex items-center gap-0.5 px-1 py-0.2 rounded bg-amber-500/10 text-amber-300 text-[9px]">
                                  Attention
                                </span>
                              )}
                            </div>
                            <div className="text-zinc-500 text-[10px] font-mono">{lead.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 px-3">{getTemperatureBadge(lead.temperature)}</td>
                      <td className="py-2.5 px-3 font-mono font-semibold text-emerald-400 text-xs">
                        ${lead.budget.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-200 border border-white/[0.06] text-[11px]">
                          {lead.stage}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-zinc-300 text-xs">
                        {prop ? prop.title : <span className="text-zinc-500">General search</span>}
                      </td>
                      <td className="py-2.5 px-3 text-zinc-400 text-xs">{lead.timeline}</td>
                      <td className="py-2.5 px-3 font-mono text-zinc-300 text-xs">{lead.aiScore}%</td>
                      <td className="py-2.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onStartChatWithLead(lead);
                            }}
                            className="px-2 py-0.5 rounded bg-zinc-800 text-[#dfc195] border border-white/[0.08] hover:bg-zinc-700 transition cursor-pointer text-[11px]"
                          >
                            Chat
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectLead(lead);
                            }}
                            className="px-2 py-0.5 rounded bg-zinc-900 text-zinc-300 hover:text-white transition cursor-pointer text-[11px]"
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
