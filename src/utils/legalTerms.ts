export interface TermExplanation {
  term: string;
  title: string;
  shortLayman: string;
  fullExplanation: string;
  creatorTip?: string;
  brandTakeaway?: string;
}

export const USAGE_TERMS_MAP: Record<string, TermExplanation> = {
  'Organic Only (No Paid Ads)': {
    term: 'Organic Only',
    title: 'Organic Feed Post Only (No Paid Ads)',
    shortLayman: 'Standard post on your profile. The brand cannot run paid ads or boost it.',
    fullExplanation:
      'The creator posts the content directly to their own social channel feed. The brand is NOT permitted to put ad budget behind it, boost the post, or run paid "Spark Ads / Whitelisting" campaigns.',
    creatorTip: 'Standard rate baseline. If the brand later decides they want to run ads on your video, you can charge an additional licensing add-on fee.',
    brandTakeaway: 'Great for organic brand awareness and genuine creator community endorsement.',
  },
  '30 Days Paid Ads / Whitelisting': {
    term: '30 Days Whitelisting',
    title: '30 Days Paid Ads & Creator Whitelisting',
    shortLayman: 'Brand can run paid ads through your account/handle for 30 days.',
    fullExplanation:
      'The brand can put ad spend behind your video (such as TikTok Spark Ads or Meta Partnership Ads) so it appears as a sponsored post coming from your handle for up to 30 days.',
    creatorTip: 'Usually commands +20% to +30% above organic base rates due to higher brand commercial value.',
    brandTakeaway: 'Allows high-converting creator-native paid acquisition directly through social ad managers.',
  },
  '90 Days Paid Ads / Whitelisting': {
    term: '90 Days Whitelisting',
    title: '90 Days Paid Ads & Creator Whitelisting',
    shortLayman: 'Brand runs paid ads through your account for a full quarter (3 months).',
    fullExplanation:
      'The brand receives 90 consecutive days of paid advertising rights across social channels using your creator likeness and content. After 90 days, all active ad sets must be turned off unless renewed.',
    creatorTip: 'Strong value proposition. Recommended to charge +40% to +60% on top of your standard organic creation fee.',
    brandTakeaway: 'Ideal for multi-month seasonal campaigns, holiday pushes, and evergreen scaling.',
  },
  '180 Days Global Paid Usage': {
    term: '180 Days Global Usage',
    title: '180 Days Multi-Channel Paid Usage',
    shortLayman: 'Brand can run ads across multiple global platforms for 6 months.',
    fullExplanation:
      'The brand can utilize the deliverables across social ads, web landing pages, and international digital ad campaigns for 6 full months.',
    creatorTip: 'High-tier commercial licensing. Ensure you price this significantly higher (+75% to +100%).',
    brandTakeaway: 'Maximum flexibility for global marketing teams and omnichannel rollouts.',
  },
  'Perpetual Digital Rights': {
    term: 'Perpetual Rights (Buyout)',
    title: 'Perpetual Digital Rights / Full Buyout',
    shortLayman: 'Brand can use and advertise your content forever with no expiration date.',
    fullExplanation:
      'The brand is granted perpetual, unrestricted rights to run ads, post, and distribute your content across digital channels forever without ever paying any renewal or recurring fees.',
    creatorTip: '⚠️ Caution: Full buyouts mean you will never earn renewal fees from this asset. Only grant this for a premium buyout multiplier (2x–4x standard rate).',
    brandTakeaway: 'Permanent digital asset ownership with zero licensing expiration risks.',
  },
};

export const EXCLUSIVITY_TERMS_MAP: Record<string, TermExplanation> = {
  'None (Non-Exclusive)': {
    term: 'Non-Exclusive',
    title: 'None (Non-Exclusive)',
    shortLayman: 'You are completely free to work with any other brand at any time.',
    fullExplanation:
      'There are zero restrictions on who the creator can work with. The creator can collaborate with competing or adjacent brands before, during, or immediately after this campaign.',
    creatorTip: 'Standard default that leaves your calendar open for all inbound brand deals.',
    brandTakeaway: 'Standard, cost-effective sponsorship terms without exclusivity premium fees.',
  },
  '30 Days Direct Competitor Exclusivity': {
    term: '30-Day Competitor Lockout',
    title: '30 Days Direct Competitor Exclusivity',
    shortLayman: 'You agree not to post paid sponsorships for direct rival brands for 1 month.',
    fullExplanation:
      'For 30 days starting from publication, the creator agrees not to publish paid promotional content for direct commercial competitors in the exact same product category (e.g. competitor energy drinks or moisturizers).',
    creatorTip: 'Because this prevents you from taking deals from competitor brands during this month, add a 20-30% exclusivity fee.',
    brandTakeaway: 'Ensures your campaign gets undivided attention and authentic focus without conflicting competitor posts.',
  },
  '60 Days Direct Competitor Exclusivity': {
    term: '60-Day Competitor Lockout',
    title: '60 Days Direct Competitor Exclusivity',
    shortLayman: 'No paid promos for direct competing products for 2 full months.',
    fullExplanation:
      'The creator will not endorse or run sponsored posts for direct category rivals for 60 days.',
    creatorTip: 'Make sure the definition of "direct competitor" is clear in notes so it does not block unrelated products.',
    brandTakeaway: 'Solid protection for seasonal launch cycles.',
  },
  '90 Days Direct Competitor Exclusivity': {
    term: '90-Day Competitor Lockout',
    title: '90 Days Direct Competitor Exclusivity',
    shortLayman: 'No paid promos for direct competing products for 3 full months (a full quarter).',
    fullExplanation:
      'A 3-month restriction blocking creator endorsements with competing brands in the defined niche.',
    creatorTip: 'Quarter-long lockouts carry significant opportunity cost for creators. Charge +40% to +50% exclusivity premium.',
    brandTakeaway: 'Maximum brand exclusivity and category dominance with this creator.',
  },
};

export const OTHER_LEGAL_TERMS: Record<string, TermExplanation> = {
  revisions: {
    term: 'Revision Rounds',
    title: 'Included Revision Rounds',
    shortLayman: 'How many times the brand can request minor edits to the draft (e.g. caption, sound, cuts).',
    fullExplanation:
      'The agreed number of review cycles included in the base rate. Revisions cover editing tweaks, text corrections, and pacing adjustments aligned with the original brief. Re-shooting from scratch with new creative concepts requires an additional fee.',
    creatorTip: '2 rounds is standard. Always specify that requests must arrive within 5 business days of draft submission.',
    brandTakeaway: 'Ensures brand compliance while keeping turnaround timelines predictable.',
  },
  lateFee: {
    term: 'Late Payment Surcharge',
    title: 'Late Payment Interest Surcharge',
    shortLayman: 'A monthly penalty percentage added if the invoice is paid past the due date.',
    fullExplanation:
      'A standard commercial penalty clause. If an invoice remains unpaid after the agreed payment terms (typically Net 30 days after posting), an interest surcharge is calculated monthly until full settlement.',
    creatorTip: 'Standard is 1.5% to 2.0% per month. Protects creators from delayed brand accounting cycles.',
    brandTakeaway: 'Standard business terms encouraging prompt finance team invoice processing.',
  },
  whitelisting: {
    term: 'Whitelisting / Spark Ads',
    title: 'What is Creator Whitelisting?',
    shortLayman: 'Granting permission for a brand to run paid ads through your social media profile.',
    fullExplanation:
      'Whitelisting (also known as Partnership Ads on Instagram or Spark Ads on TikTok) allows a brand partner to amplify a creator\'s authentic video into sponsored feeds using the brand\'s advertising budget, while showing the creator\'s handle and profile image.',
    creatorTip: 'Whitelisted ads often gain higher engagement because they feel organic, making them extremely valuable to brands.',
    brandTakeaway: 'Proven to lower customer acquisition costs by combining paid ad targeting with authentic creator credibility.',
  },
};
