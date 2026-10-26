import React, { useState } from 'react';
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
  ChevronDown,
  Mail,
  FileText,
  Check,
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

  const staleLeads = leads.filter(
    (l) => l.isStale || l.tags?.includes('Needs Attention') || (l.daysSinceLastContact !== undefined && l.daysSinceLastContact > 7)
  );

  const filteredLeads = leads.filter((lead) => {
    const isStaleLead =
      lead.isStale ||
      lead.tags?.includes('Needs Attention') ||
      (lead.daysSinceLastContact !== undefined && lead.daysSinceLastContact > 7);

    if (filterNeedsAttention && !isStaleLead) return false;

    const matchesTemp = temperatureFilter === 'All' || lead.temperature === temperatureFilter;
    const matchesSearch =
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.preferredLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (lead.tags || []).some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesTemp && matchesSearch;
  });

  const getTemperatureBadge = (temp: LeadTemperature) => {
    switch (temp) {
      case 'Hot':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-300">
            <Flame className="w-3.5 h-3.5 text-rose-400" />
            Hot lead
          </span>
        );
      case 'Warm':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-300">
            <Sun className="w-3.5 h-3.5 text-amber-400" />
            Warm lead
          </span>
        );
      case 'Cold':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-sky-300">
            <Snowflake className="w-3.5 h-3.5 text-sky-400" />
            Cold lead
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
    <div className="space-y-5 sm:space-y-6">
      {/* Header & Controls */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 lg:p-6 shadow-lg shadow-slate-950/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Users className="w-6 h-6 text-amber-400" />
              Real Estate CRM & Budget-Segregated Leads
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              AI automatically classifies leads into Cold, Warm, and Hot as per budget, timeline, and buying intent.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Export CSV Button */}
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs sm:text-sm shadow-md transition-all hover:border-slate-600 cursor-pointer"
              title="Download structured spreadsheet (.csv) of current filtered leads"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Export CSV</span>
              <span className="text-[11px] text-slate-400 font-normal">({filteredLeads.length})</span>
            </button>

            <button
              onClick={onOpenNewLeadModal}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add Client Manually
            </button>

            <div className="flex items-center bg-slate-800 border border-slate-700 rounded-xl p-1 text-xs">
              <button
                onClick={() => setViewMode('kanban')}
                className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                  viewMode === 'kanban' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Kanban Pipeline
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                  viewMode === 'table' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Table View
              </button>
            </div>
          </div>
        </div>

        {/* Stale Leads Needs Attention Alert Banner */}
        {staleLeads.length > 0 && (
          <div className="mt-4 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
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
                  Clients not contacted in more than 7 days have been automatically tagged as <strong className="text-amber-300">'Needs Attention'</strong> to prevent lead slippage.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => {
                  setFilterNeedsAttention(!filterNeedsAttention);
                  if (!filterNeedsAttention) setTemperatureFilter('All');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  filterNeedsAttention
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'bg-slate-800 text-amber-300 hover:bg-slate-700 border border-amber-500/30'
                }`}
              >
                {filterNeedsAttention ? 'Clear Filter' : `Filter Needs Attention (${staleLeads.length})`}
              </button>
            </div>
          </div>
        )}

        {/* Filter Bar with Temperature Segregation tabs */}
        <div className="mt-5 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Temperature Buttons */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-400 mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Filter:
            </span>
            <button
              onClick={() => {
                setTemperatureFilter('All');
                setFilterNeedsAttention(false);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                temperatureFilter === 'All' && !filterNeedsAttention
                  ? 'bg-slate-700 text-white font-bold border border-slate-600'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              All Tiers ({leads.length})
            </button>
            <button
              onClick={() => {
                setTemperatureFilter('Hot');
                setFilterNeedsAttention(false);
              }}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                temperatureFilter === 'Hot' && !filterNeedsAttention
                  ? 'bg-rose-500/25 text-rose-300 font-bold border border-rose-500/50'
                  : 'text-slate-400 hover:text-rose-300 hover:bg-slate-800'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-rose-400" />
              🔥 Hot ({leads.filter((l) => l.temperature === 'Hot').length})
              <span className="text-[10px] opacity-75 hidden sm:inline">&gt;$1M / Urgent</span>
            </button>
            <button
              onClick={() => {
                setTemperatureFilter('Warm');
                setFilterNeedsAttention(false);
              }}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                temperatureFilter === 'Warm' && !filterNeedsAttention
                  ? 'bg-amber-500/25 text-amber-300 font-bold border border-amber-500/50'
                  : 'text-slate-400 hover:text-amber-300 hover:bg-slate-800'
              }`}
            >
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              🌤️ Warm ({leads.filter((l) => l.temperature === 'Warm').length})
              <span className="text-[10px] opacity-75 hidden sm:inline">$400k - $1M</span>
            </button>
            <button
              onClick={() => {
                setTemperatureFilter('Cold');
                setFilterNeedsAttention(false);
              }}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                temperatureFilter === 'Cold' && !filterNeedsAttention
                  ? 'bg-sky-500/25 text-sky-300 font-bold border border-sky-500/50'
                  : 'text-slate-400 hover:text-sky-300 hover:bg-slate-800'
              }`}
            >
              <Snowflake className="w-3.5 h-3.5 text-sky-400" />
              ❄️ Cold ({leads.filter((l) => l.temperature === 'Cold').length})
              <span className="text-[10px] opacity-75 hidden sm:inline">&lt;$400k</span>
            </button>

            {/* Needs Attention / Stale Filter Tab */}
            <button
              onClick={() => {
                setFilterNeedsAttention(!filterNeedsAttention);
                if (!filterNeedsAttention) setTemperatureFilter('All');
              }}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                filterNeedsAttention
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                  : 'bg-amber-500/15 text-amber-300 hover:bg-amber-500/25 border border-amber-500/35'
              }`}
            >
              <AlertTriangle className={`w-3.5 h-3.5 ${staleLeads.length > 0 ? 'text-amber-400 animate-pulse' : 'text-slate-400'}`} />
              <span>⚠️ Needs Attention ({staleLeads.length})</span>
            </button>
          </div>

          {/* Search Input */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by client name, email, tag..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>
      </div>

      {/* Kanban Board View */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 overflow-x-auto pb-3 sm:pb-4 lg:[grid-template-columns:repeat(5,minmax(16.5rem,1fr))]">
          {STAGES.map((stage) => {
            const stageLeads = filteredLeads.filter((l) => l.stage === stage);
            return (
              <div
                key={stage}
                className="bg-slate-900/70 border border-slate-800/70 rounded-2xl p-4 flex flex-col min-w-[270px] shadow-sm"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <h3 className="font-semibold text-xs uppercase tracking-wider text-slate-200">
                      {stage}
                    </h3>
                  </div>
                  <span className="text-xs text-slate-400 font-bold tabular-nums">
                    {stageLeads.length}
                  </span>
                </div>

                {/* Cards Container */}
                <div className="space-y-3 flex-1 overflow-y-auto max-h-[720px] pr-1">
                  {stageLeads.length === 0 ? (
                    <div className="text-center py-8 px-2 border border-dashed border-slate-800 rounded-xl text-slate-500 text-xs">
                      No leads in this stage
                    </div>
                  ) : (
                    stageLeads.map((lead) => {
                      const prop = properties.find((p) => p.id === lead.interestedPropertyId);
                      return (
                        <div
                          key={lead.id}
                          className="bg-slate-950/60 border border-slate-800/70 hover:border-slate-700 rounded-xl p-4 transition-all shadow-sm hover:shadow-lg hover:shadow-black/30 group relative"
                        >
                          {/* Top Row: Avatar, Name, Temperature */}
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2.5">
                              <img
                                src={lead.avatar}
                                alt={lead.name}
                                className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-700"
                              />
                              <div>
                                <h4
                                  onClick={() => onSelectLead(lead)}
                                  className="text-sm font-bold text-white hover:text-amber-400 cursor-pointer transition line-clamp-1"
                                >
                                  {lead.name}
                                </h4>
                                <span className="text-xs text-slate-400 block">
                                  {lead.phone}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Stale Lead Alert Badge if >7 days without contact */}
                          {(lead.isStale ||
                            lead.tags?.includes('Needs Attention') ||
                            (lead.daysSinceLastContact !== undefined && lead.daysSinceLastContact > 7)) && (
                            <div className="mb-3 py-2 border-y border-amber-500/25 text-amber-300 text-xs font-bold flex items-center justify-between gap-2 animate-in fade-in">
                              <span className="flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3 text-amber-400 animate-pulse flex-shrink-0" />
                                Needs Attention ({lead.daysSinceLastContact ? `${lead.daysSinceLastContact}d inactive` : '>7d'})
                              </span>
                              {onReengageLead && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onReengageLead(lead);
                                  }}
                                  className="min-h-8 px-2 rounded-md bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition cursor-pointer"
                                  title="Mark contacted and resolve Needs Attention alert"
                                >
                                  Re-engage
                                </button>
                              )}
                            </div>
                          )}

                          {/* Temperature Badge */}
                          <div className="mb-3">{getTemperatureBadge(lead.temperature)}</div>

                          {/* Budget & Timeline */}
                          <div className="mb-3 space-y-2 text-[13px]">
                            <div className="flex items-center justify-between gap-3 text-slate-300">
                              <span className="text-slate-400 flex items-center gap-1">
                                <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Budget
                              </span>
                              <span className="font-bold text-emerald-300">
                                ${lead.budget.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex items-center justify-between gap-3 text-slate-300">
                              <span className="text-slate-400 flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-amber-400" /> Timeline
                              </span>
                              <span className="text-slate-300 font-medium text-right line-clamp-2">
                                {lead.timeline}
                              </span>
                            </div>
                            {lead.preApproved && (
                              <div className="flex items-center gap-1 text-xs text-emerald-400 font-medium pt-0.5">
                                <ShieldCheck className="w-3 h-3" /> Pre-approved Mortgage
                              </div>
                            )}
                          </div>

                          {/* Property of Interest */}
                          {prop && (
                            <div className="flex items-baseline justify-between gap-3 pb-3 mb-3 border-b border-slate-800/80">
                              <p className="min-w-0 text-[13px] font-medium text-slate-300 truncate">
                                {prop.title}
                              </p>
                              <p className="shrink-0 text-[13px] text-amber-300 font-bold">
                                ${prop.price.toLocaleString()}
                              </p>
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-800/80">
                            <button
                              onClick={() => onStartChatWithLead(lead)}
                              className="min-h-11 flex items-center gap-1 text-[13px] font-medium text-amber-400 hover:text-amber-300 transition cursor-pointer"
                            >
                              <MessageSquare className="w-3 h-3" />
                              AI Chat
                            </button>

                            <button
                              onClick={() => onSelectLead(lead)}
                              className="min-h-11 flex items-center gap-1 text-[13px] font-medium text-slate-300 hover:text-white transition cursor-pointer"
                            >
                              Dossier
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          </div>

                          {/* Quick Stage Shifter */}
                          <div className="mt-1 flex items-center justify-end gap-1">
                            {stage !== 'Closed Won' && (
                              <button
                                onClick={() => {
                                  const nextIdx = STAGES.indexOf(stage) + 1;
                                  if (nextIdx < STAGES.length) {
                                    onUpdateLeadStage(lead.id, STAGES[nextIdx]);
                                  }
                                }}
                                className="min-h-9 text-xs text-slate-400 hover:text-amber-300 flex items-center gap-0.5 px-1.5 py-1 rounded hover:bg-slate-900 cursor-pointer"
                                title="Move to next stage"
                              >
                                Advance Stage <ArrowRight className="w-2.5 h-2.5" />
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
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Client Name</th>
                  <th className="py-3.5 px-4 font-semibold">Budget Tier</th>
                  <th className="py-3.5 px-4 font-semibold">Budget Amount</th>
                  <th className="py-3.5 px-4 font-semibold">Stage</th>
                  <th className="py-3.5 px-4 font-semibold">Property Interest</th>
                  <th className="py-3.5 px-4 font-semibold">Timeline</th>
                  <th className="py-3.5 px-4 font-semibold">AI Match Score</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredLeads.map((lead) => {
                  const prop = properties.find((p) => p.id === lead.interestedPropertyId);
                  return (
                    <tr
                      key={lead.id}
                      className="hover:bg-slate-800/40 transition cursor-pointer"
                      onClick={() => onSelectLead(lead)}
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={lead.avatar}
                            alt={lead.name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <div>
                            <div className="font-bold text-white flex items-center gap-1.5">
                              <span>{lead.name}</span>
                              {(lead.isStale ||
                                lead.tags?.includes('Needs Attention') ||
                                (lead.daysSinceLastContact !== undefined && lead.daysSinceLastContact > 7)) && (
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-bold">
                                  <AlertTriangle className="w-2.5 h-2.5 text-amber-400" /> Needs Attention ({lead.daysSinceLastContact ? `${lead.daysSinceLastContact}d` : '>7d'})
                                </span>
                              )}
                            </div>
                            <div className="text-slate-400 text-[11px]">{lead.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">{getTemperatureBadge(lead.temperature)}</td>
                      <td className="py-3.5 px-4 font-bold text-emerald-400">
                        ${lead.budget.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-md bg-slate-800 text-slate-200 border border-slate-700 font-medium">
                          {lead.stage}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {prop ? (
                          <span className="text-slate-200 font-medium">{prop.title}</span>
                        ) : (
                          <span className="text-slate-500">General search</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">{lead.timeline}</td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-slate-800 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-amber-400 h-full rounded-full"
                              style={{ width: `${lead.aiScore}%` }}
                            />
                          </div>
                          <span className="font-semibold text-amber-300">{lead.aiScore}%</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {(lead.isStale ||
                          lead.tags?.includes('Needs Attention') ||
                          (lead.daysSinceLastContact !== undefined && lead.daysSinceLastContact > 7)) &&
                          onReengageLead && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onReengageLead(lead);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition mr-2 cursor-pointer shadow-sm"
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
                          className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium hover:bg-amber-500/30 transition mr-2 cursor-pointer"
                        >
                          Chatbot
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectLead(lead);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
                        >
                          View
                        </button>
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
