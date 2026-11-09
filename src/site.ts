// One place for everything that is shared across pages.
// Edit here, not in the page files.

export const site = {
  name: "Cini",
  url: "https://ciniapp.com",
  tagline: "What to watch. Found.",
  description:
    "Cini is a movie and TV recommendation app. Pick your mood and get one great pick in seconds, then send it to your TV.",

  email: "hello@ciniapp.com", // general, support, legal
  investorEmail: "abimbola@ciniapp.com",

  // Leave a link empty ("") to hide that icon. Never ship a dead link.
  social: {
    instagram: "https://www.instagram.com/thekiniapp/",
    linkedin: "https://linkedin.com/company/thekiniapp",
  },

  // "coming-soon" until the store listings exist. Then add the URLs.
  store: {
    status: "coming-soon" as "coming-soon" | "live",
    appStoreUrl: "",
    playStoreUrl: "",
  },

  // Legal. Who provides Cini until an LLC exists, and which law governs the Terms.
  legal: {
    provider: "Abimbola Akala, doing business as Cini",
    governingLaw: "California",
    lastUpdated: "November 8, 2026",
    minAge: 13,
  },

  // Flip to true once Profile > Settings > Delete account exists in the app.
  // (Apple requires in-app deletion before review.)
  inAppDeletion: false,

  // Google Apps Script web app URL that appends to the waitlist Sheet.
  // Empty = the form shows an error instead of pretending to save.
  waitlistEndpoint: "",
};

export const nav = [
  { href: "/how-it-works", label: "How it works" },
  { href: "/about", label: "About" },
  { href: "/support", label: "Support" },
];

export const legalNav = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/delete-account", label: "Delete account" },
  { href: "/contact", label: "Contact" },
];
