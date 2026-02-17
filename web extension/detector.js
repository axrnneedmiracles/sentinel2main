/**
 * ScamShield - Detector Logic
 * Heuristic scoring system to identify potential scam messages.
 */

const ScamDetector = {
  // RAISED Threshold: Requires more evidence than just a link.
  SCAM_THRESHOLD: 4,

  // Whitelisted Domains (Safe from "Suspicious Link" penalty)
  SAFE_DOMAINS: [
    'google.com', 'forms.gle', 'docs.google.com', 'drive.google.com',
    'facebook.com', 'instagram.com', 'whatsapp.com', 'messenger.com',
    'twitter.com', 'x.com', 'linkedin.com',
    'youtube.com', 'amazon.com', 'flipkart.com',
    'microsoft.com', 'apple.com', 'netflix.com', 'spotify.com',
    'zoom.us', 'meet.google.com', 'teams.microsoft.com'
  ],

  // Keywords and patterns
  SCORING_RULES: [
    // Urgency (Score 2)
    { pattern: /\b(urgent|immediately|fast|act now|limited time|hurry|attention)\b/i, score: 2 },

    // Financial Bait (Score 4 - Increased slightly as these are rare in normal chat)
    { pattern: /\b(prize|lottery|reward|gift|won|winner|cash|bonus|crore|lakh|rupees)\b/i, score: 4 },

    // Banking Threats
    { pattern: /\b(suspended|blocked|kyc|pan card|adhaar|expired)\b/i, score: 5 }, // High Risk
    // Lowered scores for generic banking terms to avoid single-word triggers
    { pattern: /\b(bank|account|verify|update)\b/i, score: 2 },

    // Payment Requests (Score 4)
    { pattern: /\b(upi|send money|transfer|pay|gpay|phonepe|paytm|wallet)\b/i, score: 4 },

    // OTP / Codes (Score 1)
    { pattern: /\b\d{4,8}\b/i, score: 1 },

    // High Risk TLDs (Score 5 - Instant Warning)
    { pattern: /\.(ru|tk|xyz|top|gq|cn|vip|cc)\b/i, score: 5 }
  ],

  /**
   * Analyzes text and returns a scam score.
   */
  analyze: function (text) {
    if (!text || typeof text !== 'string') return 0;

    let score = 0;
    const lowerText = text.toLowerCase();

    // 1. Check Keywords
    this.SCORING_RULES.forEach(rule => {
      if (rule.pattern.test(text)) {
        score += rule.score;
      }
    });

    // 2. Intelligent Link Analysis
    // Match any URL
    const urlRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)|([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.(?:com|org|net|edu|gov|io|co|in|us)\b)/gi;
    const foundLinks = text.match(urlRegex);

    if (foundLinks) {
      foundLinks.forEach(link => {
        let isSafe = false;
        // Check if it's in our safe list
        for (const domain of this.SAFE_DOMAINS) {
          if (link.toLowerCase().includes(domain)) {
            isSafe = true;
            break;
          }
        }

        if (!isSafe) {
          // Unknown link: Score 2 (Needs + Urgency or + Money to trigger warning)
          score += 2;
        } else {
          // Safe link: Score 0
          // (No penalty for Google Forms, Insta, etc.)
        }
      });
    }

    return score;
  },

  /**
   * Determines if a message is a potential scam.
   */
  isScam: function (text) {
    // If text is very short/common, ignore it to prevent random flagging
    if (!text || text.length < 10) return false;

    return this.analyze(text) >= this.SCAM_THRESHOLD;
  }
};

window.ScamDetector = ScamDetector;
