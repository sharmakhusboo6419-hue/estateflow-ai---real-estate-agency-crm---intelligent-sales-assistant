import { Lead } from '../types/realEstate';

/**
 * Evaluates whether a lead has not been contacted in > 7 days
 * and automatically applies the 'Needs Attention' tag and stale flags.
 */
export function evaluateLeadFreshness(lead: Lead): Lead {
  let days = lead.daysSinceLastContact;

  if (lead.lastContactDate) {
    const diffMs = Math.max(0, Date.now() - new Date(lead.lastContactDate).getTime());
    days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  } else if (lead.lastContactAt) {
    const match = lead.lastContactAt.match(/(\d+)\s*days?/i);
    if (match) {
      days = parseInt(match[1], 10);
    } else if (lead.lastContactAt.includes('week')) {
      days = 7;
    } else {
      days = 0;
    }
  } else {
    days = 0;
  }

  const isStale = (days !== undefined && days > 7) || lead.tags.includes('Needs Attention');
  let tags = [...lead.tags];

  if (isStale) {
    if (!tags.includes('Needs Attention')) {
      tags.push('Needs Attention');
    }
  }

  return {
    ...lead,
    daysSinceLastContact: days,
    isStale,
    tags,
  };
}

/**
 * Resets the stale status when an agent contacts or re-engages a lead.
 */
export function markLeadAsContacted(lead: Lead): Lead {
  const updatedTags = lead.tags.filter((t) => t !== 'Needs Attention');
  return {
    ...lead,
    lastContactAt: 'Just now',
    lastContactDate: new Date().toISOString(),
    daysSinceLastContact: 0,
    isStale: false,
    tags: updatedTags,
    notes: [`Agent reached out to client. Resolved 'Needs Attention' status.`, ...lead.notes],
  };
}
