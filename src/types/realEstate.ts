export type LeadTemperature = 'Cold' | 'Warm' | 'Hot';

export type PipelineStage =
  | 'New Lead'
  | 'AI Engaged'
  | 'Viewing Scheduled'
  | 'Offer & Negotiation'
  | 'Closed Won'
  | 'Archived / Cold';

export type Channel = 'WhatsApp' | 'SMS' | 'Email';

export interface Property {
  id: string;
  title: string;
  price: number;
  address: string;
  location: string;
  propertyType: 'Penthouse' | 'Villa' | 'Apartment' | 'Townhouse' | 'Modern Loft';
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  status: 'Available' | 'Pending Tour' | 'Under Offer' | 'Sold';
  outdoorArea: string;
  hoaMonthly: number;
  yearBuilt: number;
  parkingSpaces: number;
  features: string[];
  amenities: string[];
  agentName: string;
  agentPhone: string;
  agentEmail: string;
  imageUrl: string;
  galleryUrls: string[];
  virtualTourUrl?: string;
  description: string;
  openHouseTimes?: string[];
  downPayment20: number;
  estMortgageMonthly: number;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  budget: number;
  temperature: LeadTemperature;
  stage: PipelineStage;
  timeline: string;
  preferredLocation: string;
  preferredPropertyType: string;
  interestedPropertyId?: string;
  preApproved: boolean;
  aiScore: number; // 0 to 100
  aiSummary: string;
  temperatureRationale: string;
  lastContactAt: string;
  lastContactDate?: string; // ISO date timestamp for precise inactivity calculation
  daysSinceLastContact?: number;
  isStale?: boolean; // true if > 7 days without contact
  unreadCount: number;
  notes: string[];
  tags: string[];
  assignedAgent: string;
  createdAt: string;
}

export interface AppointmentSlot {
  id: string;
  leadId: string;
  leadName: string;
  propertyId: string;
  propertyTitle: string;
  propertyLocation: string;
  date: string; // YYYY-MM-DD
  time: string; // e.g. "10:30 AM"
  durationMinutes: number;
  agentName: string;
  meetingType: 'In-Person Walkthrough' | 'VIP Private Showing' | 'Virtual 3D Tour' | 'Buyer Consultation';
  status: 'Proposed' | 'Confirmed' | 'Completed' | 'Rescheduled' | 'Cancelled';
  notes?: string;
  confirmedAt?: string;
}

export interface ChatMessage {
  id: string;
  leadId: string;
  sender: 'user' | 'ai' | 'agent';
  text: string;
  timestamp: string;
  suggestedSlots?: string[];
  detectedBudget?: number;
  leadTemperature?: LeadTemperature;
  propertyId?: string;
}

export interface FollowUpActivity {
  id: string;
  leadId: string;
  leadName: string;
  leadTemperature: LeadTemperature;
  propertyTitle: string;
  channel: Channel;
  subject?: string;
  message: string;
  status: 'Scheduled' | 'Sent' | 'Client Replied' | 'Dismissed';
  sentAt: string;
  clientReply?: string;
  goal: string;
}

export interface WebhookPayload {
  event: 'message.received';
  channel: 'WhatsApp' | 'SMS';
  provider: 'WhatsApp Business Cloud API' | 'Twilio SMS';
  messageId: string;
  senderName: string;
  senderPhone: string;
  senderEmail?: string;
  messageText: string;
  timestamp: string;
  targetPropertyTitle?: string;
}

export interface WebhookProcessingResult {
  status: 'success' | 'error';
  httpStatus: 200;
  leadId: string;
  leadName: string;
  detectedBudget: number;
  temperature: LeadTemperature;
  extractedTimeline: string;
  propertyTitle: string;
  aiReplyText: string;
  suggestedSlots: string[];
  executionTimeMs: number;
  rationale: string;
}
