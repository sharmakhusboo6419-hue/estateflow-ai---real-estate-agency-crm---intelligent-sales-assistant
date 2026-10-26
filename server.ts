import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(express.json());

// Initialize Google GenAI client if API key is provided
let aiClient: GoogleGenAI | null = null;
const hasValidGeminiKey =
  !!process.env.GEMINI_API_KEY &&
  process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY' &&
  process.env.GEMINI_API_KEY.length > 15;

if (hasValidGeminiKey) {
  try {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
    console.log('[EstateFlow] GoogleGenAI initialized with live Gemini 3.8 Flash model.');
  } catch (err) {
    console.warn('Failed to initialize GoogleGenAI client:', err);
  }
}

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    hasGeminiKey: hasValidGeminiKey,
    timestamp: new Date().toISOString(),
  });
});

// Download project zip endpoint
app.get('/api/download-zip', (_req, res) => {
  const zipPath = path.resolve(__dirname, 'estateflow-ai-crm.zip');
  res.download(zipPath, 'estateflow-ai-crm.zip', (err) => {
    if (err) {
      console.error('Error sending zip file:', err);
      if (!res.headersSent) res.status(500).json({ error: 'Failed to download zip' });
    }
  });
});

// Helper for fallback AI responses
function generateFallbackChatResponse(
  userMessage: string,
  property: any,
  lead: any,
  allProperties: any[]
) {
  const lower = userMessage.toLowerCase();
  let reply = '';
  let suggestedSlots: string[] = [];
  let detectedBudget: number | null = null;
  let temperature: 'Cold' | 'Warm' | 'Hot' = lead?.temperature || 'Warm';

  // Budget detection
  const budgetMatch = userMessage.match(/\$?(\d+[\d,]*(\.\d+)?)\s*(k|m|million|thousand)?/i);
  if (budgetMatch) {
    let num = parseFloat(budgetMatch[1].replace(/,/g, ''));
    const unit = (budgetMatch[3] || '').toLowerCase();
    if (unit === 'k' || unit === 'thousand') num *= 1000;
    if (unit === 'm' || unit === 'million') num *= 1000000;
    if (num > 50000) {
      detectedBudget = num;
      if (detectedBudget >= 1000000) temperature = 'Hot';
      else if (detectedBudget >= 450000) temperature = 'Warm';
      else temperature = 'Cold';
    }
  }

  // Appointment / viewing interest detection
  const wantsViewing =
    lower.includes('tour') ||
    lower.includes('visit') ||
    lower.includes('viewing') ||
    lower.includes('appointment') ||
    lower.includes('slot') ||
    lower.includes('schedule') ||
    lower.includes('see it') ||
    lower.includes('available') ||
    lower.includes('timing');

  if (wantsViewing) {
    suggestedSlots = [
      'Tomorrow at 10:30 AM (In-person Guided Tour)',
      'Tomorrow at 2:00 PM (Senior Agent Walkthrough)',
      'Saturday at 11:00 AM (Open House VIP Pass)',
      'Saturday at 3:30 PM (Private Evening Viewing)',
    ];
    temperature = 'Hot';
  }

  const propName = property?.title || 'this property';
  const price = property?.price ? `$${property.price.toLocaleString()}` : '$750,000';
  const beds = property?.bedrooms || 3;
  const baths = property?.bathrooms || 2;
  const sqft = property?.sqft ? `${property.sqft.toLocaleString()} sq ft` : '2,200 sq ft';
  const location = property?.location || 'Downtown Metro';

  if (lower.includes('price') || lower.includes('cost') || lower.includes('how much') || lower.includes('down payment')) {
    reply = `**${propName}** is listed at **${price}**. 
- Estimated 20% down payment: $${property?.price ? (property.price * 0.2).toLocaleString() : '150,000'}
- Monthly estimated mortgage: ~$${property?.price ? Math.round((property.price * 0.8 * 0.065) / 12 + 450).toLocaleString() : '3,850'}/mo (including HOA & estimated property tax).
- Current status: **${property?.status || 'Active on Market'}**.
Would you like to review financing options or schedule a private showing?`;
  } else if (lower.includes('bed') || lower.includes('bath') || lower.includes('sq ft') || lower.includes('size') || lower.includes('dimension')) {
    reply = `Here are the exact floor plan specifications for **${propName}**:
- **Layout:** ${beds} Bedrooms, ${baths} Bathrooms
- **Interior Living Area:** ${sqft}
- **Balcony/Outdoor:** ${property?.outdoorArea || 'Private 180 sq ft landscaped terrace'}
- **Ceiling Height:** 10.5 ft high ceilings with floor-to-ceiling double-glazed windows.
Would you like me to reserve a 30-minute viewing slot to walk through the space?`;
  } else if (lower.includes('amenities') || lower.includes('parking') || lower.includes('gym') || lower.includes('pool') || lower.includes('hoa')) {
    reply = `**${propName}** includes premium luxury amenities:
- ${property?.amenities?.join(', ') || 'Heated infinity pool, 24/7 concierge, state-of-the-art fitness center, valet parking, private EV charging, rooftop resident lounge'}.
- HOA fees: ~$${property?.hoaMonthly || 420}/month (covers concierge, water, security, gym, and grounds maintenance).
- Parking: Includes 2 designated underground secure parking spaces.`;
  } else if (lower.includes('school') || lower.includes('neighborhood') || lower.includes('transit') || lower.includes('location')) {
    reply = `**Location & Neighborhood for ${propName} (${location}):**
- **Top Rated Schools:** 9/10 rated Lincoln Elementary & Oakridge High within 1.2 miles.
- **Transit & Commute:** 4 minutes walk to Metro station, 15 minutes to financial district.
- **Lifestyle:** Steps from artisan cafes, organic grocery markets, and riverside running trails.`;
  } else if (wantsViewing) {
    reply = `I would love to arrange a viewing for you at **${propName}**! Because our properties in ${location} move fast, our lead agents have opened these priority viewing slots for you:
1. **Tomorrow at 10:30 AM** (Private Walkthrough)
2. **Tomorrow at 2:00 PM** (Senior Agent Consultation)
3. **Saturday at 11:00 AM** (VIP Weekend Showing)
4. **Saturday at 3:30 PM** (Sunset Viewing)

Which time works best for your schedule? Click a slot below or tell me your preferred timing, and I will instantly lock it in!`;
  } else {
    reply = `Welcome! I'm your dedicated AI Real Estate Specialist for **${propName}** in ${location}.
This exceptional property features:
- **${price}** • ${beds} Beds • ${baths} Baths • ${sqft}
- Highlights: ${property?.features?.slice(0, 3).join(', ') || 'Modern open-concept chef kitchen, panoramic skyline views, private balcony, hardwood flooring'}.

I can answer any questions regarding pricing, mortgage estimates, HOA fees, neighborhood schools, or show you available viewing slots right now. What would you like to know?`;
  }

  return {
    reply,
    suggestedSlots,
    detectedBudget,
    leadTemperature: temperature,
    extractedIntent: wantsViewing ? 'Booking Tour' : 'Information Gathering',
  };
}

// POST /api/chat - Interactive AI Real Estate Assistant
app.post('/api/chat', async (req, res) => {
  try {
    const { message, lead, property, allProperties, history } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // If Gemini client is available, leverage gemini-3.8-flash
    if (aiClient) {
      try {
        const propertyContext = property
          ? `CURRENT PROPERTY FOCUS:
Title: ${property.title}
Price: $${property.price}
Address: ${property.address}, ${property.location}
Bedrooms: ${property.bedrooms}, Bathrooms: ${property.bathrooms}
Area: ${property.sqft} sq ft
Status: ${property.status}
Features: ${(property.features || []).join(', ')}
Amenities: ${(property.amenities || []).join(', ')}
HOA: $${property.hoaMonthly || 400}/mo
Agent: ${property.agentName} (${property.agentPhone})
Description: ${property.description}`
          : `CATALOG OVERVIEW: ${JSON.stringify(allProperties?.slice(0, 4) || [])}`;

        const leadContext = lead
          ? `CLIENT PROFILE:
Name: ${lead.name}
Current Temperature: ${lead.temperature} (Cold/Warm/Hot)
Budget: $${lead.budget || 'Not specified yet'}
Timeline: ${lead.timeline || 'Unknown'}
Status: ${lead.stage || 'New Inquiry'}`
          : 'CLIENT PROFILE: New guest visitor';

        const systemInstruction = `You are "EstateFlow AI", a world-class, ultra-responsive real estate sales agent chatbot working for a top agency.
GOALS:
1. Provide instant, crystal-clear, enticing, and accurate details about the requested property or available listings.
2. Salespeople take too long to reply, which makes leads slip away — your job is to respond warmly, concisely, and proactively keep the buyer engaged!
3. Notice buying signals, budget mentions, and urgency.
4. Categorize the lead's temperature:
   - HOT: Budget >= $1,000,000 OR timeline < 30 days OR explicitly asking for a tour / viewing / financing / making an offer.
   - WARM: Budget $400,000 - $999,000 OR timeline 1-3 months OR actively comparing homes, interested in details.
   - COLD: Budget < $400,000 OR timeline "just looking / 6+ months" OR vague/unresponsive.
5. Whenever the client expresses interest or asks about visiting, ALWAYS suggest 3 to 4 specific realistic available timing slots (e.g. "Tomorrow at 10:30 AM", "Tomorrow at 2:00 PM", "Saturday at 11:00 AM", "Sunday at 3:00 PM") and ask them to confirm.
6. Tone: Highly professional, warm, knowledgeable, polite, and persuasive without being pushy.

Output your response strictly in the following JSON format:
{
  "reply": "Your markdown formatted message to the client",
  "suggestedSlots": ["Slot 1", "Slot 2", "Slot 3"], // empty array if viewing is not relevant yet
  "detectedBudget": 850000, // or null if no budget mentioned
  "leadTemperature": "Hot" | "Warm" | "Cold",
  "extractedIntent": "Viewing Request" | "Pricing Inquiry" | "Floor Plan Inquiry" | "General Browsing",
  "bookingRequested": true | false
}
`;

        const conversationHistory = (history || []).slice(-6).map((h: any) => `${h.sender === 'user' ? 'Client' : 'AI'}: ${h.text}`).join('\n');

        const prompt = `${propertyContext}

${leadContext}

RECENT CHAT HISTORY:
${conversationHistory}

NEW CLIENT MESSAGE:
"${message}"

Return only valid JSON matching the format.`;

        // Run Gemini with timeout protection
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Gemini API timeout')), 3500)
        );

        const geminiPromise = aiClient.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            temperature: 0.7,
          },
        });

        const response: any = await Promise.race([geminiPromise, timeoutPromise]);
        const rawText = response?.text || '';

        let parsed: any = null;
        try {
          parsed = JSON.parse(rawText);
        } catch {
          try {
            const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
            parsed = JSON.parse(cleaned);
          } catch {
            parsed = {
              reply: rawText || 'Thank you for your inquiry! Let me assist you with this property.',
              suggestedSlots: ['Tomorrow at 10:30 AM', 'Saturday at 11:00 AM'],
              detectedBudget: null,
              leadTemperature: 'Warm',
              extractedIntent: 'Inquiry',
              bookingRequested: false,
            };
          }
        }

        if (parsed) {
          return res.json({
            ...parsed,
            source: 'gemini-3.8-flash',
          });
        }
      } catch (geminiError: any) {
        console.warn('Gemini API call failed, using intelligent real estate fallback:', geminiError?.message);
      }
    }

    // Fallback response engine
    const fallback = generateFallbackChatResponse(message, property, lead, allProperties || []);
    res.json({
      ...fallback,
      source: 'offline-smart-engine',
    });
  } catch (error: any) {
    console.error('Error in /api/chat:', error);
    res.status(500).json({ error: 'Failed to process chat message' });
  }
});

// POST /api/qualify - Auto-qualify and classify lead into Cold, Warm, Hot
app.post('/api/qualify', async (req, res) => {
  try {
    const { lead, interactions } = req.body;
    const budget = Number(lead?.budget) || 0;
    const timeline = (lead?.timeline || '').toLowerCase();

    let temperature: 'Cold' | 'Warm' | 'Hot' = 'Warm';
    let rationale = '';

    if (budget >= 1000000 || timeline.includes('immediate') || timeline.includes('30 days') || timeline.includes('this month')) {
      temperature = 'Hot';
      rationale = `High budget ($${budget.toLocaleString()}) and urgent buying timeline. Recommended for immediate senior agent outreach.`;
    } else if (budget >= 450000 || timeline.includes('1-3 months') || timeline.includes('soon')) {
      temperature = 'Warm';
      rationale = `Qualified budget ($${budget.toLocaleString()}) within sweet-spot range and active engagement. Prime candidate for weekend viewing slots.`;
    } else {
      temperature = 'Cold';
      rationale = `Entry budget ($${budget.toLocaleString()}) or long browsing timeframe (> 6 months). Enrolled into automated educational follow-up campaign.`;
    }

    res.json({
      temperature,
      rationale,
      nextAction:
        temperature === 'Hot'
          ? 'Call within 15 minutes & confirm viewing slot'
          : temperature === 'Warm'
          ? 'Send curated 3D virtual tour & open house invite'
          : 'Add to weekly market price drops email drip',
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/followup/generate - AI Automated Follow-up Generator
app.post('/api/followup/generate', async (req, res) => {
  try {
    const { lead, property, channel, tone, goal } = req.body;

    const leadName = lead?.name || 'Valued Client';
    const temp = lead?.temperature || 'Warm';
    const propTitle = property?.title || 'Selected Property';
    const propPrice = property?.price ? `$${property.price.toLocaleString()}` : '$850,000';
    const chan = channel || 'WhatsApp';

    if (aiClient) {
      try {
        const prompt = `Write a high-converting, personalized real estate follow-up message.
Channel: ${chan} (keep formatting appropriate: WhatsApp has emojis & friendly spacing; SMS is concise; Email has Subject line).
Lead Name: ${leadName}
Lead Category / Temperature: ${temp}
Property of Interest: ${propTitle} (${propPrice})
Selected Tone: ${tone || 'Polite & proactive'}
Goal of Follow-up: ${goal || 'Schedule viewing slot'}

Rules:
- Cold leads: Focus on newly dropped prices, new inventory alerts, or no-obligation advice.
- Warm leads: Focus on limited availability, video walk-through, or booking a private showing slot.
- Hot leads: Emphasize priority access, recent offers in building, and immediate viewing slot confirmation with Senior Broker.
- Include a clear call to action proposing available time slots.

Return JSON strictly:
{
  "subject": "Email subject line (or N/A for WhatsApp/SMS)",
  "message": "The complete message body",
  "suggestedTimeSlots": ["Tomorrow at 2:00 PM", "Saturday at 11:00 AM"],
  "callToAction": "e.g., Reply 'YES' to reserve this slot"
}`;

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Gemini API timeout')), 3500)
        );

        const geminiPromise = aiClient.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        const response: any = await Promise.race([geminiPromise, timeoutPromise]);
        const parsed = JSON.parse(response?.text || '{}');
        return res.json({ ...parsed, source: 'gemini-3.8-flash' });
      } catch (geminiError: any) {
        console.warn('Gemini follow-up generation failed, falling back:', geminiError?.message);
      }
    }

    // High quality template fallback
    let subject = `Update regarding ${propTitle}`;
    let message = '';
    const slots = ['Tomorrow at 11:00 AM', 'Thursday at 3:30 PM', 'Saturday at 1:00 PM'];

    if (temp === 'Hot') {
      subject = `[Priority] Exclusive Viewing Slots for ${propTitle}`;
      message = chan === 'WhatsApp'
        ? `Hi ${leadName}! 👋 Just checking in from EstateFlow Real Estate. We have 2 other parties inquiring about *${propTitle}* (${propPrice}) today.

Because you expressed strong interest, I reserved a private viewing window for you before open house:
🗓️ *Tomorrow at 11:00 AM* or *Thursday at 3:30 PM*

Would either of these timings work for you? Let me know and I will lock in the calendar slot right away!`
        : `Hi ${leadName}, strong buyer interest on ${propTitle}. I have private showing slots open tomorrow 11:00 AM or Thursday 3:30 PM. Reply 1 or 2 to confirm your slot!`;
    } else if (temp === 'Warm') {
      subject = `Fresh photos & available tour timings for ${propTitle}`;
      message = chan === 'WhatsApp'
        ? `Hello ${leadName}! Hope your week is going great. 🏡

We just updated the high-definition virtual tour and floor plans for *${propTitle}*. Since this fits your budget of ~$${lead?.budget ? (lead.budget / 1000).toFixed(0) + 'k' : 'mid-range'}, our lead agent is conducting 30-minute tours this weekend:
✨ *Saturday at 1:00 PM*
✨ *Saturday at 3:30 PM*

Would you like me to hold a slot for you to see it in person?`
        : `Hi ${leadName}, new weekend viewing slots just opened for ${propTitle}. Would Saturday at 1:00 PM work for a quick private walk-through?`;
    } else {
      subject = `Curated property picks & price updates for ${leadName}`;
      message = chan === 'WhatsApp'
        ? `Hi ${leadName}! 😊 Noticed you were exploring properties in the city. We just compiled our latest list of homes with recent price adjustments matching your preferences!

No pressure at all—take a look whenever convenient, or let me know if you'd like a quick 5-min market overview chat.`
        : `Hi ${leadName}, we've added 3 new homes in your preferred area with flexible financing options. Let us know if you'd like the brochures sent over!`;
    }

    res.json({
      subject,
      message,
      suggestedTimeSlots: slots,
      callToAction: 'Reply to reserve viewing slot',
      source: 'smart-template-engine',
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Configure Vite or Static File Serving
async function setupApp() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[EstateFlow Server] Running on http://0.0.0.0:${PORT}`);
  });
}

setupApp();
