// One place for everything that is shared across pages.
// Edit here, not in the page files.

export const site = {
  name: "Cini",
  url: "https://ciniapp.com",
  tagline: "What to watch. Found.",
  description:
    "Cini is a movie and TV recommendation app. Pick your mood and get one great pick in seconds, then send it to your TV.",

  email: "hello@ciniapp.com", // shown only where the law asks for an email address (Privacy Policy, Terms)
  // Every other "contact us" on the site points here: the Message us form at the bottom of Support.
  messageUrl: "/support#message",
  investorEmail: "abimbola@ciniapp.com",

  // Leave a link empty ("") to hide that icon. Never ship a dead link.
  // Same links as the `socials` collection in Firestore (project kini-x).
  social: {
    instagram: "https://www.instagram.com/getcini",
    tiktok: "https://www.tiktok.com/@getcini",
    youtube: "https://www.youtube.com/@getcini",
    linkedin: "https://www.linkedin.com/company/ciniapp",
  },

  // "coming-soon" until the store listings exist. Then add the URLs.
  store: {
    status: "coming-soon" as "coming-soon" | "live",
    appStoreUrl: "",
    playStoreUrl: "",
  },

  // Where /invite (the link in a friend's text) sends people. Kept apart from `store` so the rest of the site keeps saying
  // "coming soon" until launch. Leave a URL empty ("") until its listing is live: that phone then gets the waitlist.
  invite: {
    appStoreUrl: "https://apps.apple.com/app/id6767471170",
    appStoreId: "6767471170", // for Safari's smart app banner
    playStoreUrl: "",
  },

  // Legal. Who provides Cini until an LLC exists, and which law governs the Terms.
  legal: {
    provider: "Abimbola Akala, doing business as Cini",
    governingLaw: "California",
    lastUpdated: "November 9, 2026",
    minAge: 13,
  },

  // Cini's paid plan. Used by /pro and /pro/thanks (Stripe sends people back to these pages). Keep in step with the Stripe prices.
  pro: {
    trialDays: 7,
    monthly: "$4.99",
    yearly: "$44.99",
  },

  // Flip to true once Profile > Settings > Delete account exists in the app.
  // (Apple requires in-app deletion before review.)
  inAppDeletion: false,

  // Google Apps Script web app ("Cini waitlist" project, see waitlist-apps-script.gs) that appends to the
  // "Kini Waitlist" Google Sheet. Empty = the form shows an error instead of pretending to save.
  // The "Message us" box on Support posts here (cloud function submitSupportMessage in Firebase project kini-x).
  // Empty = Send opens the visitor's email app with their message filled in instead.
  supportEndpoint: "https://us-central1-kini-x.cloudfunctions.net/submitSupportMessage",

  waitlistEndpoint: "https://script.google.com/macros/s/AKfycbzbEkczlJSABxlXFmrNK9nUtwQptycNMp6JjFRhVqMIlPvp_GQidExaaRy45O8zWqFh/exec",
};

export const nav = [
  { href: "/how-it-works", label: "How it works" },
  { href: "/about", label: "About" },
  { href: "/support", label: "Contact" },
];

export const legalNav = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/delete-account", label: "Delete account" },
  { href: "/contact", label: "Contact" },
];
