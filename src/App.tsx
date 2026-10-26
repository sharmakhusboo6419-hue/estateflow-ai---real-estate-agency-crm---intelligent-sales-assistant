/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { LeadsPipeline } from './components/CRM/LeadsPipeline';
import { LeadDetailModal } from './components/CRM/LeadDetailModal';
import { NewLeadModal } from './components/CRM/NewLeadModal';
import { AIChatSimulator } from './components/Chat/AIChatSimulator';
import { ViewingScheduler } from './components/Calendar/ViewingScheduler';
import { FollowUpHub } from './components/FollowUp/FollowUpHub';
import { PropertyCatalog } from './components/Properties/PropertyCatalog';
import { HowItWorksModal } from './components/Guide/HowItWorksModal';
import { WebhookSimulatorModal } from './components/Webhook/WebhookSimulatorModal';

import {
  INITIAL_PROPERTIES,
  INITIAL_LEADS,
  INITIAL_APPOINTMENTS,
  INITIAL_CHAT_MESSAGES,
  INITIAL_FOLLOWUPS,
} from './data/mockData';

import {
  Lead,
  LeadTemperature,
  Property,
  AppointmentSlot,
  FollowUpActivity,
  PipelineStage,
  WebhookPayload,
  WebhookProcessingResult,
} from './types/realEstate';
import { Sparkles, CheckCircle2, Flame, Webhook } from 'lucide-react';
import { evaluateLeadFreshness, markLeadAsContacted } from './utils/staleLeadEvaluator';
import { useFirebase } from './firebase/FirebaseContext';
import { FirestoreService } from './firebase/firestoreService';

export default function App() {
  const { currentUser, setSyncStatus } = useFirebase();

  const [activeTab, setActiveTab] = useState<
    'crm' | 'chat' | 'calendar' | 'followup' | 'properties' | 'guide'
  >('crm');

  const [leads, setLeads] = useState<Lead[]>(() => {
    const saved = localStorage.getItem('estateflow_leads');
    const raw: Lead[] = saved ? JSON.parse(saved) : INITIAL_LEADS;
    return raw.map(evaluateLeadFreshness);
  });

  const [properties] = useState<Property[]>(INITIAL_PROPERTIES);

  const [appointments, setAppointments] = useState<AppointmentSlot[]>(() => {
    const saved = localStorage.getItem('estateflow_appointments');
    return saved ? JSON.parse(saved) : INITIAL_APPOINTMENTS;
  });

  const [followUpActivities, setFollowUpActivities] = useState<FollowUpActivity[]>(() => {
    const saved = localStorage.getItem('estateflow_followups');
    return saved ? JSON.parse(saved) : INITIAL_FOLLOWUPS;
  });

  const [selectedLeadForDossier, setSelectedLeadForDossier] = useState<Lead | null>(null);
  const [selectedPropertyForChat, setSelectedPropertyForChat] = useState<Property>(INITIAL_PROPERTIES[0]);
  const [activeChatLead, setActiveChatLead] = useState<Lead | null>(INITIAL_LEADS[0]);
  const [isNewLeadModalOpen, setIsNewLeadModalOpen] = useState(false);
  const [isWebhookModalOpen, setIsWebhookModalOpen] = useState(false);
  const [hasGeminiKey, setHasGeminiKey] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Each workspace should open at its contextual heading, especially on mobile.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [activeTab]);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('estateflow_leads', JSON.stringify(leads));
  }, [leads]);

  useEffect(() => {
    localStorage.setItem('estateflow_appointments', JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    localStorage.setItem('estateflow_followups', JSON.stringify(followUpActivities));
  }, [followUpActivities]);

  // Check backend health
  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data.hasGeminiKey === 'boolean') {
          setHasGeminiKey(data.hasGeminiKey);
        }
      })
      .catch((e) => console.log('Health check notice:', e));
  }, []);

  // Firestore real-time sync when authenticated
  useEffect(() => {
    if (!currentUser) return;

    setSyncStatus('syncing');

    // Subscribe to remote leads
    const unsubLeads = FirestoreService.subscribeLeads(
      currentUser.uid,
      (remoteLeads) => {
        if (remoteLeads.length > 0) {
          setLeads(remoteLeads.map(evaluateLeadFreshness));
        } else {
          // If first time sign-in, upload local leads to user's Firestore
          leads.forEach((l) => FirestoreService.upsertLead(l, currentUser.uid));
        }
        setSyncStatus('synced');
      },
      (err) => {
        console.warn('Leads Firestore sync error:', err);
        setSyncStatus('error');
      }
    );

    // Subscribe to remote appointments
    const unsubAppointments = FirestoreService.subscribeAppointments(
      currentUser.uid,
      (remoteApps) => {
        if (remoteApps.length > 0) {
          setAppointments(remoteApps);
        } else {
          appointments.forEach((a) => FirestoreService.upsertAppointment(a, currentUser.uid));
        }
      }
    );

    // Subscribe to remote followups
    const unsubFollowUps = FirestoreService.subscribeFollowUps(
      currentUser.uid,
      (remoteFollowups) => {
        if (remoteFollowups.length > 0) {
          setFollowUpActivities(remoteFollowups);
        } else {
          followUpActivities.forEach((f) => FirestoreService.upsertFollowUp(f, currentUser.uid));
        }
      }
    );

    return () => {
      unsubLeads();
      unsubAppointments();
      unsubFollowUps();
    };
  }, [currentUser]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Lead update handler
  const handleUpdateLead = (updatedLead: Lead) => {
    const evaluated = evaluateLeadFreshness(updatedLead);
    setLeads((prev) => prev.map((l) => (l.id === evaluated.id ? evaluated : l)));
    if (selectedLeadForDossier?.id === evaluated.id) {
      setSelectedLeadForDossier(evaluated);
    }
    if (currentUser) {
      FirestoreService.upsertLead(evaluated, currentUser.uid).catch(console.error);
    }
  };

  // Re-engage stale lead handler
  const handleReengageLead = (lead: Lead) => {
    const contacted = markLeadAsContacted(lead);
    handleUpdateLead(contacted);
    showToast(`✅ Contact logged for ${lead.name} — 'Needs Attention' alert cleared!`);
  };

  // Update stage handler
  const handleUpdateLeadStage = (leadId: string, newStage: PipelineStage) => {
    setLeads((prev) =>
      prev.map((l) => {
        if (l.id === leadId) {
          const updated = { ...l, stage: newStage };
          if (currentUser) {
            FirestoreService.upsertLead(updated, currentUser.uid).catch(console.error);
          }
          return updated;
        }
        return l;
      })
    );
    showToast(`Lead moved to ${newStage}`);
  };

  // Add new lead handler
  const handleAddLead = (newLead: Lead) => {
    const evaluated = evaluateLeadFreshness(newLead);
    setLeads((prev) => [evaluated, ...prev]);
    showToast(`New client ${newLead.name} added as ${newLead.temperature} lead!`);
    if (currentUser) {
      FirestoreService.upsertLead(evaluated, currentUser.uid).catch(console.error);
    }
  };

  // Add appointment handler
  const handleAddAppointment = (newApp: AppointmentSlot) => {
    setAppointments((prev) => [newApp, ...prev]);
    showToast(`Viewing appointment booked for ${newApp.date} at ${newApp.time}!`);
    if (currentUser) {
      FirestoreService.upsertAppointment(newApp, currentUser.uid).catch(console.error);
    }
  };

  // Update appointment status
  const handleUpdateAppointmentStatus = (id: string, status: AppointmentSlot['status']) => {
    setAppointments((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          const updated = { ...a, status };
          if (currentUser) {
            FirestoreService.upsertAppointment(updated, currentUser.uid).catch(console.error);
          }
          return updated;
        }
        return a;
      })
    );
    showToast(`Appointment status changed to ${status}`);
  };

  // Add follow-up activity
  const handleAddFollowUp = (activity: FollowUpActivity) => {
    setFollowUpActivities((prev) => [activity, ...prev]);
    showToast(`Follow-up dispatched via ${activity.channel}`);
    if (currentUser) {
      FirestoreService.upsertFollowUp(activity, currentUser.uid).catch(console.error);
    }
  };

  // Simulated Webhook Handler for incoming SMS / WhatsApp notifications
  const handleIncomingWebhook = async (payload: WebhookPayload): Promise<WebhookProcessingResult> => {
    const startTime = performance.now();

    // 1. Identify target property or match with inventory
    let matchedProp = properties.find((p) =>
      payload.targetPropertyTitle
        ? p.title.toLowerCase().includes(payload.targetPropertyTitle.toLowerCase())
        : false
    );
    if (!matchedProp) {
      matchedProp =
        properties.find(
          (p) =>
            payload.messageText.toLowerCase().includes(p.title.toLowerCase()) ||
            payload.messageText.toLowerCase().includes(p.location.toLowerCase()) ||
            payload.messageText.toLowerCase().includes(p.propertyType.toLowerCase())
        ) || properties[0];
    }

    // 2. Trigger AI Lead Qualification Flow
    let detectedBudget = 0;
    let temperature: LeadTemperature = 'Warm';
    let timeline = 'Within 30-60 days';
    let aiReplyText = '';
    let suggestedSlots: string[] = [];
    let rationale = '';

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: payload.messageText,
          property: matchedProp,
          lead: {
            name: payload.senderName,
            temperature: 'Warm',
            budget: 0,
            stage: 'New Lead',
          },
          allProperties: properties,
          history: [],
        }),
      });

      const data = await response.json();
      detectedBudget = data.detectedBudget || 0;
      temperature = data.leadTemperature || 'Warm';
      aiReplyText = data.reply || '';
      suggestedSlots = data.suggestedSlots || [];
      timeline = data.extractedIntent || 'Immediate to 60 days';
    } catch (err) {
      console.warn('Backend qualification fallback:', err);
    }

    // Fallback extraction if budget was not returned from API
    if (!detectedBudget) {
      const budgetMatch = payload.messageText.match(/\$?(\d+[\d,]*(\.\d+)?)\s*(k|m|million|thousand)?/i);
      if (budgetMatch) {
        let num = parseFloat(budgetMatch[1].replace(/,/g, ''));
        const unit = (budgetMatch[3] || '').toLowerCase();
        if (unit === 'k' || unit === 'thousand') num *= 1000;
        if (unit === 'm' || unit === 'million') num *= 1000000;
        detectedBudget = num;
      } else {
        detectedBudget = matchedProp.price;
      }
    }

    // Deterministic budget tier rules
    if (detectedBudget >= 1000000) {
      temperature = 'Hot';
      rationale = `High budget ($${detectedBudget.toLocaleString()}) and urgent buying intent. Auto-assigned to Senior Luxury Broker.`;
    } else if (detectedBudget >= 450000) {
      temperature = 'Warm';
      rationale = `Target budget ($${detectedBudget.toLocaleString()}) within sweet-spot. Auto-scheduled for weekend open tour slots.`;
    } else {
      temperature = 'Cold';
      rationale = `Budget ($${detectedBudget.toLocaleString()}) is entry tier. Added to weekly price drop alerts.`;
    }

    if (!suggestedSlots || suggestedSlots.length === 0) {
      suggestedSlots = [
        'Tomorrow at 10:30 AM (In-person Guided Tour)',
        'Tomorrow at 2:00 PM (Senior Agent Walkthrough)',
        'Saturday at 11:00 AM (VIP Private Showing)',
      ];
    }

    if (!aiReplyText) {
      aiReplyText = `Hi ${payload.senderName}! 👋 Thank you for reaching out via ${payload.channel} regarding ${matchedProp.title}.
Listed at $${matchedProp.price.toLocaleString()} (${matchedProp.bedrooms} Beds, ${matchedProp.bathrooms} Baths, ${matchedProp.sqft.toLocaleString()} sq ft).

Our host broker ${matchedProp.agentName} has open viewing windows:
1. ${suggestedSlots[0]}
2. ${suggestedSlots[1]}

Reply with your preferred slot and we will confirm it on your calendar instantly!`;
    }

    const leadId = `lead-${Date.now()}`;
    const newLead: Lead = {
      id: leadId,
      name: payload.senderName,
      email:
        payload.senderEmail ||
        `${payload.senderName.toLowerCase().replace(/[^a-z]/g, '')}@gmail.com`,
      phone: payload.senderPhone,
      avatar: `https://images.unsplash.com/photo-${1534528741775 + (detectedBudget % 500)}?auto=format&fit=crop&w=256&q=80`,
      budget: detectedBudget,
      temperature,
      stage: 'AI Engaged',
      timeline,
      preferredLocation: matchedProp.location,
      preferredPropertyType: matchedProp.propertyType,
      interestedPropertyId: matchedProp.id,
      preApproved: detectedBudget >= 1000000,
      aiScore: temperature === 'Hot' ? 97 : temperature === 'Warm' ? 82 : 38,
      aiSummary: `Incoming ${payload.channel} webhook auto-qualified client. Detected budget: $${detectedBudget.toLocaleString()}. Tier: ${temperature}.`,
      temperatureRationale: rationale,
      lastContactAt: 'Just now',
      unreadCount: 1,
      notes: [
        `Incoming webhook event via ${payload.provider} (MsgID: ${payload.messageId}).`,
        `Client query: "${payload.messageText}"`,
        `AI auto-dispatched response via ${payload.channel}.`,
      ],
      tags: [`${payload.channel} Inbound`, `${temperature} Tier`, 'Webhook Qualified'],
      assignedAgent: matchedProp.agentName,
      createdAt: new Date().toISOString(),
    };

    // Update state in CRM
    setLeads((prev) => [newLead, ...prev]);

    // Dispatch follow-up record
    const followUpLog: FollowUpActivity = {
      id: `f-wh-${Date.now()}`,
      leadId: newLead.id,
      leadName: newLead.name,
      leadTemperature: temperature,
      propertyTitle: matchedProp.title,
      channel: payload.channel,
      message: aiReplyText,
      status: 'Sent',
      sentAt: 'Just now',
      goal: 'Instant webhook AI qualification & slot proposal',
    };
    setFollowUpActivities((prev) => [followUpLog, ...prev]);

    if (currentUser) {
      FirestoreService.upsertLead(newLead, currentUser.uid).catch(console.error);
      FirestoreService.upsertFollowUp(followUpLog, currentUser.uid).catch(console.error);
    }

    const executionTimeMs = Math.round(performance.now() - startTime);

    showToast(
      `⚡ WEBHOOK QUALIFIED: ${payload.channel} message classified ${newLead.name} as ${temperature} Lead ($${detectedBudget.toLocaleString()})!`
    );

    return {
      status: 'success',
      httpStatus: 200,
      leadId: newLead.id,
      leadName: newLead.name,
      detectedBudget,
      temperature,
      extractedTimeline: timeline,
      propertyTitle: matchedProp.title,
      aiReplyText,
      suggestedSlots,
      executionTimeMs,
      rationale,
    };
  };

  // Simulate an inbound high-intent buyer texting the agency
  const handleSimulateInboundLead = () => {
    const simulatedNames = [
      'Vikram & Ananya Patel',
      'Sterling Vance Partners',
      'Jessica & Mark Sterling',
      'Harrison Forbes, Esq.',
    ];
    const pickedName = simulatedNames[Math.floor(Math.random() * simulatedNames.length)];
    const targetProp = properties[Math.floor(Math.random() * 2)]; // pick luxury villa or penthouse

    const newInbound: Lead = {
      id: `lead-inbound-${Date.now()}`,
      name: pickedName,
      email: `${pickedName.toLowerCase().replace(/[^a-z]/g, '')}@luxurygroup.com`,
      phone: '+1 (555) 790-8841',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
      budget: 1850000,
      temperature: 'Hot',
      stage: 'AI Engaged',
      timeline: 'Immediate (< 30 days, Cash Ready)',
      preferredLocation: targetProp.location,
      preferredPropertyType: targetProp.propertyType,
      interestedPropertyId: targetProp.id,
      preApproved: true,
      aiScore: 96,
      aiSummary: `New WhatsApp inbound inquiring on ${targetProp.title}. Budget $1.85M detected. AI categorized as HOT and prepared available weekend viewing slots!`,
      temperatureRationale: 'Liquid budget >$1M and immediate purchasing timeframe. AI auto-assigned to Senior Broker.',
      lastContactAt: 'Just now',
      unreadCount: 1,
      notes: [`Auto-captured from WhatsApp property ad. Lead inquiring on ${targetProp.title}.`],
      tags: ['WhatsApp Inbound', 'Hot Buyer', 'Cash Ready'],
      assignedAgent: targetProp.agentName,
      createdAt: new Date().toISOString(),
    };

    setLeads((prev) => [newInbound, ...prev]);
    setSelectedPropertyForChat(targetProp);
    setActiveChatLead(newInbound);
    if (currentUser) {
      FirestoreService.upsertLead(newInbound, currentUser.uid).catch(console.error);
    }
    showToast(`🔥 INBOUND LEAD DETECTED: ${pickedName} ($1.85M) auto-classified as HOT!`);
  };

  return (
    <div className="min-h-[100dvh] bg-slate-950/80 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        leads={leads}
        onSimulateInboundLead={handleSimulateInboundLead}
        onOpenWebhookSimulator={() => setIsWebhookModalOpen(true)}
        hasGeminiKey={hasGeminiKey}
      />

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-[5.5rem] right-3 sm:right-5 z-[60] w-[calc(100%-1.5rem)] sm:w-auto animate-in slide-in-from-top duration-300">
          <div className="bg-slate-900/95 border border-amber-500/50 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-start gap-2.5 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Main View Container */}
      <main className="flex-1 max-w-[90rem] w-full mx-auto px-3 sm:px-5 lg:px-8 py-5 sm:py-7 lg:py-8">
        {activeTab === 'crm' && (
          <LeadsPipeline
            leads={leads}
            properties={properties}
            onSelectLead={(lead) => setSelectedLeadForDossier(lead)}
            onUpdateLeadStage={handleUpdateLeadStage}
            onOpenNewLeadModal={() => setIsNewLeadModalOpen(true)}
            onStartChatWithLead={(lead) => {
              setActiveChatLead(lead);
              const prop = properties.find((p) => p.id === lead.interestedPropertyId) || properties[0];
              setSelectedPropertyForChat(prop);
              setActiveTab('chat');
            }}
            onReengageLead={handleReengageLead}
          />
        )}

        {activeTab === 'chat' && (
          <AIChatSimulator
            properties={properties}
            selectedProperty={selectedPropertyForChat}
            onSelectProperty={(prop) => setSelectedPropertyForChat(prop)}
            activeLead={activeChatLead}
            onLeadUpdated={handleUpdateLead}
            onAppointmentBooked={handleAddAppointment}
            hasGeminiKey={hasGeminiKey}
          />
        )}

        {activeTab === 'calendar' && (
          <ViewingScheduler
            appointments={appointments}
            leads={leads}
            properties={properties}
            onAddAppointment={handleAddAppointment}
            onUpdateAppointmentStatus={handleUpdateAppointmentStatus}
            preselectedLead={activeChatLead}
          />
        )}

        {activeTab === 'followup' && (
          <FollowUpHub
            leads={leads}
            properties={properties}
            followUpActivities={followUpActivities}
            onAddFollowUp={handleAddFollowUp}
            preselectedLead={activeChatLead}
          />
        )}

        {activeTab === 'properties' && (
          <PropertyCatalog
            properties={properties}
            onSelectPropertyForChat={(prop) => {
              setSelectedPropertyForChat(prop);
              setActiveTab('chat');
            }}
          />
        )}

        {activeTab === 'guide' && (
          <HowItWorksModal
            onNavigateTab={(tab) => setActiveTab(tab)}
            onSimulateLead={handleSimulateInboundLead}
          />
        )}
      </main>

      {/* Lead Dossier Detail Modal */}
      <LeadDetailModal
        lead={selectedLeadForDossier}
        onClose={() => setSelectedLeadForDossier(null)}
        properties={properties}
        appointments={appointments}
        chatHistory={[]}
        onUpdateLead={handleUpdateLead}
        onSuggestSlots={(lead) => {
          setActiveChatLead(lead);
          setActiveTab('calendar');
        }}
        onOpenChatWithLead={(lead) => {
          setActiveChatLead(lead);
          const prop = properties.find((p) => p.id === lead.interestedPropertyId) || properties[0];
          setSelectedPropertyForChat(prop);
          setActiveTab('chat');
        }}
        onGenerateFollowUp={(lead) => {
          setActiveChatLead(lead);
          setActiveTab('followup');
        }}
      />

      {/* Manual Lead Entry Modal */}
      <NewLeadModal
        isOpen={isNewLeadModalOpen}
        onClose={() => setIsNewLeadModalOpen(false)}
        properties={properties}
        onAddLead={handleAddLead}
      />

      {/* Simulated Webhook Handler Modal for incoming SMS / WhatsApp notifications */}
      <WebhookSimulatorModal
        isOpen={isWebhookModalOpen}
        onClose={() => setIsWebhookModalOpen(false)}
        properties={properties}
        onTriggerWebhook={handleIncomingWebhook}
        onViewLeadInCRM={(leadId) => {
          setActiveTab('crm');
          const found = leads.find((l) => l.id === leadId);
          if (found) setSelectedLeadForDossier(found);
        }}
        onOpenChatWithLead={(leadId) => {
          const found = leads.find((l) => l.id === leadId);
          if (found) {
            setActiveChatLead(found);
            const prop = properties.find((p) => p.id === found.interestedPropertyId) || properties[0];
            setSelectedPropertyForChat(prop);
            setActiveTab('chat');
          }
        }}
      />
    </div>
  );
}
