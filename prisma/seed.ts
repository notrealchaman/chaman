/* PEAKLOOP seed script.
 * Populates a realistic SQLite database (prisma/dev.db) with demo users,
 * categories, tools, reviews, deals, blog posts, integrations, and per-user
 * business data so the application looks populated immediately.
 */
import { getDb, hasData, j } from "../lib/db";
import bcrypt from "bcryptjs";

// ---------------------------------------------------------------------------
// Deterministic RNG so reseeding is reproducible
// ---------------------------------------------------------------------------
function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(97);
const pick = <T>(arr: T[]): T => arr[Math.floor(rand() * arr.length)];
const pickN = <T>(arr: T[], n: number): T[] => {
  const copy = [...arr];
  const out: T[] = [];
  for (let i = 0; i < n && copy.length; i++) {
    const idx = Math.floor(rand() * copy.length);
    out.push(copy.splice(idx, 1)[0]);
  }
  return out;
};
const randomInt = (min: number, max: number) => Math.floor(rand() * (max - min + 1)) + min;
const now = new Date();
const daysAgo = (n: number) => new Date(now.getTime() - n * 86400000).toISOString();
const daysAhead = (n: number) => new Date(now.getTime() + n * 86400000).toISOString();

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------
const categories = [
  { slug: "ai-tools", name: "AI Tools", icon: "Sparkles", color: "#8b5cf6", desc: "Machine learning, generative AI and automation assistants." },
  { slug: "marketing", name: "Marketing", icon: "Megaphone", color: "#f97316", desc: "Campaigns, email, social and growth marketing tools." },
  { slug: "sales-crm", name: "Sales & CRM", icon: "Target", color: "#ec4899", desc: "Lead, deal and customer relationship management." },
  { slug: "social-media", name: "Social Media", icon: "Share2", color: "#38bdf8", desc: "Publish, schedule and analyze social content." },
  { slug: "e-commerce", name: "E-commerce", icon: "ShoppingCart", color: "#f59e0b", desc: "Storefronts, carts, checkout and order management." },
  { slug: "finance", name: "Finance", icon: "Landmark", color: "#10b981", desc: "Payments, invoicing, banking and budgeting." },
  { slug: "accounting", name: "Accounting", icon: "Calculator", color: "#14b8a6", desc: "Bookkeeping, tax and financial reporting." },
  { slug: "project-management", name: "Project Management", icon: "ClipboardList", color: "#6366f1", desc: "Plan, track and deliver projects with your team." },
  { slug: "productivity", name: "Productivity", icon: "Zap", color: "#eab308", desc: "Notes, tasks, focus and workflow tools." },
  { slug: "communication", name: "Communication", icon: "MessageSquare", color: "#0ea5e9", desc: "Chat, video, and team collaboration." },
  { slug: "customer-support", name: "Customer Support", icon: "Headphones", color: "#f43f5e", desc: "Helpdesk, ticketing and live chat software." },
  { slug: "developer-tools", name: "Developer Tools", icon: "Code2", color: "#ef4444", desc: "Code, CI/CD, monitoring and dev infrastructure." },
  { slug: "design", name: "Design", icon: "PenTool", color: "#a855f7", desc: "UI, graphic design and prototyping tools." },
  { slug: "video", name: "Video", icon: "Video", color: "#dc2626", desc: "Recording, editing and video conferencing." },
  { slug: "seo", name: "SEO", icon: "Search", color: "#059669", desc: "Search engine optimization and rank tracking." },
  { slug: "website-builders", name: "Website Builders", icon: "Layout", color: "#0891b2", desc: "Build and launch websites without code." },
  { slug: "hosting", name: "Hosting", icon: "Server", color: "#2563eb", desc: "Cloud hosting, domains and infrastructure." },
  { slug: "security", name: "Security", icon: "ShieldCheck", color: "#0f172a", desc: "Authentication, compliance and threat protection." },
  { slug: "analytics", name: "Analytics", icon: "BarChart3", color: "#16a34a", desc: "Business, product and marketing analytics." },
  { slug: "hr-recruiting", name: "HR & Recruiting", icon: "Users", color: "#db2777", desc: "Hiring, onboarding and people management." },
  { slug: "education", name: "Education", icon: "GraduationCap", color: "#7c3aed", desc: "Learning platforms and course creation." },
  { slug: "automation", name: "Automation", icon: "Workflow", color: "#22c55e", desc: "No-code workflow and process automation." },
  { slug: "no-code", name: "No-Code", icon: "Blocks", color: "#475569", desc: "Build apps and databases without engineering." },
  { slug: "business-intelligence", name: "Business Intelligence", icon: "PieChart", color: "#0d9488", desc: "Dashboards, reporting and data visualization." },
];

// ---------------------------------------------------------------------------
// Curated tools (rich detail)
// ---------------------------------------------------------------------------
interface ToolSeed {
  name: string;
  slug: string;
  tagline: string;
  description: string;
  longDescription?: string;
  website: string;
  color: string;
  category: string;
  startingPrice: number;
  freePlan: boolean;
  freeTrial: boolean;
  verified: boolean;
  aiPowered: boolean;
  featured?: boolean;
  trending?: boolean;
  popularity: number;
  company?: string;
  companySize?: string;
  founded?: number;
  headquarters?: string;
  rating?: number;
  pros: string[];
  cons: string[];
  faq: { q: string; a: string }[];
  integrations: string[];
  features: { name: string; description: string }[];
  pricing: {
    planName: string; monthly: number; annual: number; freePlan: boolean; freeTrial: boolean; popular: boolean; users: number; storage: string; features: string[];
  }[];
}

const tools: ToolSeed[] = [
  {
    name: "PEAK CRM", slug: "peak-crm", category: "sales-crm", color: "#22c55e",
    tagline: "CRM & Sales", description: "Manage leads, customers and sales pipelines from one workspace.",
    longDescription: "PEAK CRM is the fastest way to organize your sales pipeline. Track every lead, deal and customer conversation in a beautiful drag-and-drop workspace, with AI lead scoring and forecasting built in.",
    website: "https://peakloop.app", startingPrice: 900, freePlan: true, freeTrial: true,
    verified: true, aiPowered: true, featured: true, trending: true, popularity: 98, company: "PEAKLOOP", companySize: "11-50", founded: 2024, headquarters: "San Francisco, CA", rating: 4.8,
    pros: ["Easy drag-and-drop pipeline", "AI lead scoring", "Great integrations"], cons: ["Limited free plan", "No offline mode"],
    faq: [{ q: "Does PEAK CRM have a free plan?", a: "Yes, the Free plan supports up to 3 seats and 500 contacts." }, { q: "Can I import data from other CRMs?", a: "Yes, CSV import and automated migration from HubSpot and Salesforce." }],
    integrations: ["Slack", "Gmail", "Zapier", "Stripe", "Google Calendar"],
    features: [{ name: "Visual pipeline", description: "Drag-and-drop deal stages." }, { name: "AI lead scoring", description: "Prioritize hottest leads automatically." }, { name: "Sales forecasting", description: "Predictive revenue projections." }],
    pricing: [
      { planName: "Free", monthly: 0, annual: 0, freePlan: true, freeTrial: false, popular: false, users: 3, storage: "500 contacts", features: ["1 pipeline", "500 contacts", "Email sync"] },
      { planName: "Starter", monthly: 900, annual: 720, freePlan: false, freeTrial: true, popular: true, users: 5, storage: "5,000 contacts", features: ["Unlimited pipelines", "AI lead scoring", "Email templates"] },
      { planName: "Professional", monthly: 2400, annual: 1920, freePlan: false, freeTrial: true, popular: false, users: 15, storage: "50,000 contacts", features: ["Automation", "Forecasting", "Custom fields"] },
      { planName: "Business", monthly: 4900, annual: 3920, freePlan: false, freeTrial: true, popular: false, users: 50, storage: "Unlimited", features: ["API access", "SSO", "Advanced reporting"] },
    ],
  },
  {
    name: "Notion", slug: "notion", category: "productivity", color: "#0f172a",
    tagline: "Productivity & Notes", description: "All-in-one workspace for notes, docs, wikis and projects.",
    website: "https://notion.so", startingPrice: 0, freePlan: true, freeTrial: true,
    verified: true, aiPowered: true, featured: true, trending: true, popularity: 99, company: "Notion Labs", companySize: "201-500", founded: 2013, headquarters: "San Francisco, CA", rating: 4.7,
    pros: ["Flexible blocks", "Great templates", "Strong community"], cons: ["Steep learning curve", "Offline is limited"],
    faq: [{ q: "Is Notion free?", a: "Yes, the Personal plan is free for individuals with unlimited pages." }],
    integrations: ["Slack", "Google Drive", "GitHub", "Zapier", "Figma"],
    features: [{ name: "Blocks", description: "Build any document structure." }, { name: "Databases", description: "Tables, boards, galleries and timelines." }, { name: "AI writing", description: "Draft, summarize and translate." }],
    pricing: [
      { planName: "Free", monthly: 0, annual: 0, freePlan: true, freeTrial: false, popular: false, users: 1, storage: "5MB", features: ["Unlimited pages", "7-day version history", "Personal plan"] },
      { planName: "Plus", monthly: 1000, annual: 800, freePlan: false, freeTrial: true, popular: true, users: 1, storage: "Unlimited", features: ["Unlimited file uploads", "30-day version history", "AI included"] },
      { planName: "Business", monthly: 1500, annual: 1200, freePlan: false, freeTrial: true, popular: false, users: 1, storage: "Unlimited", features: ["Team workspace", "SAML SSO", "Admin tools"] },
      { planName: "Enterprise", monthly: 0, annual: 0, freePlan: false, freeTrial: true, popular: false, users: 999, storage: "Unlimited", features: ["Advanced security", "Audit log", "Dedicated support"] },
    ],
  },
  {
    name: "Figma", slug: "figma", category: "design", color: "#a855f7",
    tagline: "Design & Prototyping", description: "Collaborative interface design and prototyping platform.",
    website: "https://figma.com", startingPrice: 0, freePlan: true, freeTrial: true,
    verified: true, aiPowered: true, featured: true, trending: true, popularity: 96, company: "Figma", companySize: "501-1000", founded: 2012, headquarters: "San Francisco, CA", rating: 4.8,
    pros: ["Real-time collaboration", "Powerful editor", "Huge plugin ecosystem"], cons: ["Can lag on large files", "Expensive for teams"],
    faq: [{ q: "Is Figma free for individuals?", a: "Yes, the Starter plan is free with 3 design files." }],
    integrations: ["Slack", "Notion", "Zeplin", "Jira", "Zapier"],
    features: [{ name: "Multiplayer editing", description: "Design together in real time." }, { name: "Variables", description: "Tokens and design systems." }, { name: "Prototyping", description: "Interactive clickable prototypes." }],
    pricing: [
      { planName: "Starter", monthly: 0, annual: 0, freePlan: true, freeTrial: false, popular: false, users: 1, storage: "3 files", features: ["3 Figma files", "Unlimited drafts", "Community"] },
      { planName: "Professional", monthly: 1500, annual: 1200, freePlan: false, freeTrial: true, popular: true, users: 1, storage: "Unlimited", features: ["Unlimited files", "Version history", "Shared libraries"] },
      { planName: "Organization", monthly: 4500, annual: 3600, freePlan: false, freeTrial: true, popular: false, users: 1, storage: "Unlimited", features: ["Centralized libraries", "SSO", "Admin controls"] },
      { planName: "Enterprise", monthly: 7500, annual: 6000, freePlan: false, freeTrial: true, popular: false, users: 1, storage: "Unlimited", features: ["Advanced security", "SAML SSO", "Dedicated support"] },
    ],
  },
  {
    name: "GitHub", slug: "github", category: "developer-tools", color: "#181717",
    tagline: "Developer & Code Hosting", description: "Where the world builds software — code hosting, review and CI/CD.",
    website: "https://github.com", startingPrice: 0, freePlan: true, freeTrial: true,
    verified: true, aiPowered: true, featured: true, trending: false, popularity: 97, company: "GitHub", companySize: "1000+", founded: 2008, headquarters: "San Francisco, CA", rating: 4.9,
    pros: ["Massive ecosystem", "Great Actions CI/CD", "Open source home"], cons: ["Learning curve for Git", "Copilot costs extra"],
    faq: [{ q: "Is GitHub free for individuals?", a: "Yes, includes unlimited public and private repos." }],
    integrations: ["Slack", "VS Code", "Docker", "Vercel", "Linear"],
    features: [{ name: "Repositories", description: "Git version control." }, { name: "Actions", description: "Automated CI/CD pipelines." }, { name: "Copilot", description: "AI pair programmer." }],
    pricing: [
      { planName: "Free", monthly: 0, annual: 0, freePlan: true, freeTrial: false, popular: true, users: 1, storage: "Unlimited", features: ["Unlimited repos", "2,000 Actions minutes", "Copilot trial"] },
      { planName: "Team", monthly: 400, annual: 400, freePlan: false, freeTrial: true, popular: false, users: 1, storage: "Unlimited", features: ["3,000 Actions minutes", "Protected branches", "Code owners"] },
      { planName: "Enterprise", monthly: 2100, annual: 2100, freePlan: false, freeTrial: true, popular: false, users: 1, storage: "Unlimited", features: ["SAML SSO", "Audit log", "24/7 support"] },
    ],
  },
  {
    name: "Slack", slug: "slack", category: "communication", color: "#611f69",
    tagline: "Team Communication", description: "Channels, direct messages and huddles for everyone on your team.",
    website: "https://slack.com", startingPrice: 0, freePlan: true, freeTrial: true,
    verified: true, aiPowered: false, featured: true, trending: true, popularity: 95, company: "Salesforce", companySize: "5000+", founded: 2009, headquarters: "San Francisco, CA", rating: 4.6,
    pros: ["Great integrations", "Fast", "Familiar"], cons: ["Can be noisy", "Free message limit"],
    faq: [{ q: "Is Slack free?", a: "Yes, the Free plan has 90-day message history." }],
    integrations: ["Google Drive", "Zoom", "GitHub", "Jira", "Notion"],
    features: [{ name: "Channels", description: "Organize conversations." }, { name: "Huddles", description: "Voice and screen sharing." }, { name: "Workflow builder", description: "Automate routine tasks." }],
    pricing: [
      { planName: "Free", monthly: 0, annual: 0, freePlan: true, freeTrial: false, popular: false, users: 1, storage: "5GB", features: ["90-day history", "10 apps", "1:1 huddles"] },
      { planName: "Pro", monthly: 875, annual: 700, freePlan: false, freeTrial: true, popular: true, users: 1, storage: "10GB", features: ["Unlimited history", "Unlimited apps", "Group huddles"] },
      { planName: "Business+", monthly: 1250, annual: 1000, freePlan: false, freeTrial: true, popular: false, users: 1, storage: "20GB", features: ["SSO", "Data residency", "Compliance"] },
    ],
  },
  {
    name: "HubSpot", slug: "hubspot", category: "marketing", color: "#ff7a59",
    tagline: "Marketing & CRM Suite", description: "Marketing, sales and service platform that brings every channel together.",
    website: "https://hubspot.com", startingPrice: 0, freePlan: true, freeTrial: true,
    verified: true, aiPowered: true, featured: true, trending: true, popularity: 94, company: "HubSpot", companySize: "5000+", founded: 2006, headquarters: "Cambridge, MA", rating: 4.4,
    pros: ["All-in-one suite", "Great free CRM", "Strong ecosystem"], cons: ["Gets expensive", "Steep learning curve"],
    faq: [{ q: "Does HubSpot have a free CRM?", a: "Yes, the free CRM includes contacts, deals and tasks." }],
    integrations: ["Gmail", "Salesforce", "Zapier", "Slack", "Shopify"],
    features: [{ name: "Marketing Hub", description: "Campaigns and automation." }, { name: "Sales Hub", description: "Pipeline and quoting." }, { name: "Service Hub", description: "Helpdesk and ticketing." }],
    pricing: [
      { planName: "Free", monthly: 0, annual: 0, freePlan: true, freeTrial: false, popular: false, users: 1, storage: "1,000 contacts", features: ["Free CRM", "Email marketing", "Forms"] },
      { planName: "Starter", monthly: 1500, annual: 1200, freePlan: false, freeTrial: true, popular: true, users: 1, storage: "5,000 contacts", features: ["Marketing automation", "Blog & SEO", "Landing pages"] },
      { planName: "Professional", monthly: 8000, annual: 6400, freePlan: false, freeTrial: true, popular: false, users: 1, storage: "50,000 contacts", features: ["Omni-channel", "Custom reporting", "ABM"] },
      { planName: "Enterprise", monthly: 36000, annual: 28800, freePlan: false, freeTrial: true, popular: false, users: 1, storage: "Unlimited", features: ["Custom objects", "Audit logs", "Predictive lead scoring"] },
    ],
  },
  {
    name: "Salesforce", slug: "salesforce", category: "sales-crm", color: "#00a1e0",
    tagline: "Enterprise CRM", description: "The world's leading cloud CRM for sales, service and marketing.",
    website: "https://salesforce.com", startingPrice: 1500, freePlan: false, freeTrial: true,
    verified: true, aiPowered: true, featured: false, trending: false, popularity: 92, company: "Salesforce", companySize: "10000+", founded: 1999, headquarters: "San Francisco, CA", rating: 4.2,
    pros: ["Extremely powerful", "Huge ecosystem", "Enterprise grade"], cons: ["Complex", "Very expensive", "Slow support"],
    faq: [{ q: "Is Salesforce enterprise only?", a: "No, there is a Starter plan for small businesses." }],
    integrations: ["Slack", "Gmail", "Zoom", "QuickBooks", "Docusign"],
    features: [{ name: "Einstein AI", description: "Predictive insights." }, { name: "AppExchange", description: "Thousands of add-ons." }, { name: "Sales Cloud", description: "Full CRM pipeline." }],
    pricing: [
      { planName: "Starter", monthly: 1500, annual: 1500, freePlan: false, freeTrial: true, popular: true, users: 1, storage: "5GB", features: ["Accounts & contacts", "Lead capture", "Email integration"] },
      { planName: "Professional", monthly: 7500, annual: 7500, freePlan: false, freeTrial: true, popular: false, users: 1, storage: "10GB", features: ["Forecasting", "Cases", "Reports"] },
      { planName: "Enterprise", monthly: 15000, annual: 15000, freePlan: false, freeTrial: true, popular: false, users: 1, storage: "20GB", features: ["Advanced customization", "API", "Sandbox"] },
      { planName: "Unlimited", monthly: 30000, annual: 30000, freePlan: false, freeTrial: true, popular: false, users: 1, storage: "100GB", features: ["24/7 support", "Identity", "Unlimited apps"] },
    ],
  },
  {
    name: "Shopify", slug: "shopify", category: "e-commerce", color: "#95bf47",
    tagline: "E-commerce Platform", description: "Start, grow and scale a business with a powerful online store.",
    website: "https://shopify.com", startingPrice: 3900, freePlan: true, freeTrial: true,
    verified: true, aiPowered: true, featured: true, trending: true, popularity: 93, company: "Shopify", companySize: "5000+", founded: 2006, headquarters: "Ottawa, Canada", rating: 4.5,
    pros: ["Easy to set up", "Great app store", "Strong checkout"], cons: ["Transaction fees", "Lock-in with apps"],
    faq: [{ q: "Is Shopify free?", a: "No, but there is a 14-day free trial and a Starter plan." }],
    integrations: ["Stripe", "PayPal", "Google", "Facebook", "Zapier"],
    features: [{ name: "Storefront", description: "Beautiful customizable themes." }, { name: "Checkout", description: "Optimized one-page checkout." }, { name: "Shop Pay", description: "Accelerated payments." }],
    pricing: [
      { planName: "Starter", monthly: 3900, annual: 3510, freePlan: true, freeTrial: true, popular: false, users: 1, storage: "Unlimited", features: ["Online store", "Basic reports", "100+ themes"] },
      { planName: "Basic", monthly: 3900, annual: 3510, freePlan: false, freeTrial: true, popular: true, users: 1, storage: "Unlimited", features: ["2.9% credit card fees", "3 staff accounts", "Abandoned cart"] },
      { planName: "Professional", monthly: 10500, annual: 9450, freePlan: false, freeTrial: true, popular: false, users: 1, storage: "Unlimited", features: ["5 staff accounts", "Advanced reports", "Gift cards"] },
      { planName: "Enterprise", monthly: 23000, annual: 23000, freePlan: false, freeTrial: false, popular: false, users: 999, storage: "Unlimited", features: ["Custom checkout", "Unlimited staff", "Dedicated support"] },
    ],
  },
  {
    name: "Stripe", slug: "stripe", category: "finance", color: "#635bff",
    tagline: "Payments Platform", description: "Payments, billing and financial infrastructure for the internet.",
    website: "https://stripe.com", startingPrice: 0, freePlan: true, freeTrial: false,
    verified: true, aiPowered: false, featured: true, trending: true, popularity: 96, company: "Stripe", companySize: "5000+", founded: 2010, headquarters: "San Francisco, CA", rating: 4.7,
    pros: ["Developer friendly", "Global", "Excellent docs"], cons: ["Per-transaction fees", "Setup complexity"],
    faq: [{ q: "Is Stripe free?", a: "No monthly fee, but you pay ~2.9% + 30¢ per transaction." }],
    integrations: ["Shopify", "WooCommerce", "Squarespace", "Xero", "NetSuite"],
    features: [{ name: "Payments", description: "Accept cards and wallets." }, { name: "Billing", description: "Subscriptions and invoicing." }, { name: "Connect", description: "Marketplace payouts." }],
    pricing: [
      { planName: "Free", monthly: 0, annual: 0, freePlan: true, freeTrial: false, popular: true, users: 1, storage: "Unlimited", features: ["No monthly fee", "2.9% + 30¢", "All payment methods"] },
    ],
  },
  {
    name: "Zapier", slug: "zapier", category: "automation", color: "#ff4f00",
    tagline: "No-Code Automation", description: "Automate workflows by connecting your apps with 6,000+ integrations.",
    website: "https://zapier.com", startingPrice: 0, freePlan: true, freeTrial: true,
    verified: true, aiPowered: true, featured: true, trending: true, popularity: 90, company: "Zapier", companySize: "501-1000", founded: 2011, headquarters: "Sunnyvale, CA", rating: 4.5,
    pros: ["Thousands of integrations", "Easy to use", "Active community"], cons: ["Costs rack up", "Complex Zaps can get slow"],
    faq: [{ q: "Does Zapier have a free plan?", a: "Yes, the free plan includes 100 tasks/month." }],
    integrations: ["Gmail", "Slack", "HubSpot", "Google Sheets", "Notion"],
    features: [{ name: "Zaps", description: "Connect two apps." }, { name: "Tables", description: "Built-in database." }, { name: "Interfaces", description: "No-code app builder." }],
    pricing: [
      { planName: "Free", monthly: 0, annual: 0, freePlan: true, freeTrial: false, popular: false, users: 1, storage: "1,000 tasks", features: ["100 tasks/month", "Unlimited Zaps", "Single-step"] },
      { planName: "Professional", monthly: 1966, annual: 1573, freePlan: false, freeTrial: true, popular: true, users: 1, storage: "5,000 tasks", features: ["Multi-step Zaps", "Premium apps", "Filters"] },
      { planName: "Team", monthly: 393, annual: 314, freePlan: false, freeTrial: true, popular: false, users: 1, storage: "50,000 tasks", features: ["Shared workspaces", "Unlimited users", "Email support"] },
    ],
  },
  {
    name: "Linear", slug: "linear", category: "project-management", color: "#5e6ad2",
    tagline: "Issue Tracking & Projects", description: "Purpose-built tool for planning and building products.",
    website: "https://linear.app", startingPrice: 0, freePlan: true, freeTrial: true,
    verified: true, aiPowered: true, featured: true, trending: true, popularity: 88, company: "Linear", companySize: "51-200", founded: 2019, headquarters: "San Francisco, CA", rating: 4.9,
    pros: ["Blazing fast", "Beautiful UI", "Keyboard-first"], cons: ["No free team plan", "Opinionated workflow"],
    faq: [{ q: "Is Linear free for teams?", a: "Individual free, but teams start on a paid tier (with a 14-day trial)." }],
    integrations: ["GitHub", "GitLab", "Slack", "Figma", "Framer"],
    features: [{ name: "Issues", description: "Triage & cycle planning." }, { name: "Projects", description: "Roadmaps & milestones." }, { name: "AI", description: "Auto-triage and summaries." }],
    pricing: [
      { planName: "Free", monthly: 0, annual: 0, freePlan: true, freeTrial: false, popular: false, users: 1, storage: "Unlimited", features: ["Personal use", "Unlimited issues", "2GB uploads"] },
      { planName: "Standard", monthly: 800, annual: 640, freePlan: false, freeTrial: true, popular: false, users: 1, storage: "Unlimited", features: ["Unlimited docs", "Cycles", "Up to 250GB"] },
      { planName: "Business", monthly: 1400, annual: 1120, freePlan: false, freeTrial: true, popular: true, users: 1, storage: "Unlimited", features: ["Private teams", "Admin controls", "SSO"] },
      { planName: "Enterprise", monthly: 0, annual: 0, freePlan: false, freeTrial: true, popular: false, users: 999, storage: "Unlimited", features: ["Advanced security", "SAML SSO", "Dedicated support"] },
    ],
  },
  {
    name: "Intercom", slug: "intercom", category: "customer-support", color: "#1f8ded",
    tagline: "Customer Service Platform", description: "Conversational support, inbox and AI agents for modern teams.",
    website: "https://intercom.com", startingPrice: 3900, freePlan: false, freeTrial: true,
    verified: true, aiPowered: true, featured: false, trending: true, popularity: 86, company: "Intercom", companySize: "501-1000", founded: 2011, headquarters: "San Francisco, CA", rating: 4.4,
    pros: ["Great AI agent", "Omni-channel inbox", "Strong analytics"], cons: ["Expensive", "Limited free tier"],
    faq: [{ q: "Does Intercom have a free trial?", a: "Yes, a 14-day free trial is available." }],
    integrations: ["Salesforce", "HubSpot", "Slack", "Shopify", "Zendesk"],
    features: [{ name: "Fin AI", description: "AI agent for support." }, { name: "Inbox", description: "Shared team inbox." }, { name: "Messenger", description: "In-app chat widget." }],
    pricing: [
      { planName: "Essential", monthly: 3900, annual: 3900, freePlan: false, freeTrial: true, popular: true, users: 1, storage: "Unlimited", features: ["Shared inbox", "Live chat", "Email support"] },
      { planName: "Advanced", monthly: 9900, annual: 9900, freePlan: false, freeTrial: true, popular: false, users: 1, storage: "Unlimited", features: ["Automation", "AI bot", "Reporting"] },
      { planName: "Expert", monthly: 13900, annual: 13900, freePlan: false, freeTrial: true, popular: false, users: 1, storage: "Unlimited", features: ["Workflows", "Analytics", "Custom AI"] },
    ],
  },
  {
    name: "Mailchimp", slug: "mailchimp", category: "marketing", color: "#ffe01b",
    tagline: "Email Marketing", description: "Email campaigns, automation and audiences for growing brands.",
    website: "https://mailchimp.com", startingPrice: 0, freePlan: true, freeTrial: true,
    verified: true, aiPowered: true, featured: true, trending: false, popularity: 84, company: "Intuit", companySize: "1000+", founded: 2001, headquarters: "Atlanta, GA", rating: 4.2,
    pros: ["Easy email builder", "Great templates", "Free up to 500 contacts"], cons: ["Deliverability", "Expensive at scale"],
    faq: [{ q: "Is Mailchimp free?", a: "Yes, up to 500 contacts and 1,000 emails/month." }],
    integrations: ["Shopify", "WordPress", "Zapier", "Salesforce", "Stripe"],
    features: [{ name: "Email builder", description: "Drag-and-drop campaigns." }, { name: "Automation", description: "Customer journeys." }, { name: "Audience", description: "Segmentation & tags." }],
    pricing: [
      { planName: "Free", monthly: 0, annual: 0, freePlan: true, freeTrial: false, popular: false, users: 1, storage: "500 contacts", features: ["1,000 sends/month", "Email builder", "Audience dashboards"] },
      { planName: "Essentials", monthly: 1300, annual: 1300, freePlan: false, freeTrial: true, popular: true, users: 1, storage: "5,000 contacts", features: ["A/B testing", "Automation", "Support"] },
      { planName: "Standard", monthly: 2000, annual: 2000, freePlan: false, freeTrial: true, popular: false, users: 1, storage: "5,000 contacts", features: ["Advanced automation", "Predictive analytics", "Dynamic content"] },
      { planName: "Premium", monthly: 35000, annual: 35000, freePlan: false, freeTrial: true, popular: false, users: 1, storage: "Unlimited", features: ["Advanced segmentation", "Unlimited seats", "Phone support"] },
    ],
  },
  {
    name: "Monday.com", slug: "monday-com", category: "project-management", color: "#ff3d57",
    tagline: "Work OS", description: "Manage projects, workflows and teamwork on a customizable Work OS.",
    website: "https://monday.com", startingPrice: 1200, freePlan: true, freeTrial: true,
    verified: true, aiPowered: true, featured: false, trending: true, popularity: 82, company: "Monday.com", companySize: "1000+", founded: 2012, headquarters: "Tel Aviv, Israel", rating: 4.4,
    pros: ["Visual boards", "Lots of integrations", "Quick to set up"], cons: ["Can get pricey", "Boards can get complex"],
    faq: [{ q: "Is Monday.com free?", a: "Yes, a free plan for up to 2 seats." }],
    integrations: ["Slack", "Zoom", "Gmail", "Google Calendar", "GitHub"],
    features: [{ name: "Boards", description: "Customizable views." }, { name: "Automations", description: "No-code workflows." }, { name: "Dashboards", description: "Real-time reporting." }],
    pricing: [
      { planName: "Free", monthly: 0, annual: 0, freePlan: true, freeTrial: false, popular: false, users: 2, storage: "1GB", features: ["2 seats", "Unlimited boards", "Web & mobile"] },
      { planName: "Basic", monthly: 1200, annual: 960, freePlan: false, freeTrial: true, popular: true, users: 1, storage: "5GB", features: ["Unlimited items", "5GB storage", "Dashboards"] },
      { planName: "Standard", monthly: 1500, annual: 1200, freePlan: false, freeTrial: true, popular: false, users: 1, storage: "20GB", features: ["Timeline & Gantt", "Automations", "Guest access"] },
      { planName: "Pro", monthly: 2900, annual: 2320, freePlan: false, freeTrial: true, popular: false, users: 1, storage: "100GB", features: ["Private boards", "Time tracking", "Chart views"] },
    ],
  },
  {
    name: "Airtable", slug: "airtable", category: "no-code", color: "#fcb400",
    tagline: "No-Code Database", description: "Build flexible relational databases and apps on a spreadsheet-like canvas.",
    website: "https://airtable.com", startingPrice: 0, freePlan: true, freeTrial: true,
    verified: true, aiPowered: false, featured: false, trending: false, popularity: 80, company: "Airtable", companySize: "501-1000", founded: 2012, headquarters: "San Francisco, CA", rating: 4.5,
    pros: ["Flexible and powerful", "Great views", "Deep integrations"], cons: ["Complex to master", "Record limits on free"],
    faq: [{ q: "Is Airtable free?", a: "Yes, the free plan includes unlimited bases." }],
    integrations: ["Slack", "Zapier", "Gmail", "HubSpot", "Google Sheets"],
    features: [{ name: "Bases", description: "Relational data tables." }, { name: "Views", description: "Grid, calendar, kanban." }, { name: "Automations", description: "Trigger workflows." }],
    pricing: [
      { planName: "Free", monthly: 0, annual: 0, freePlan: true, freeTrial: false, popular: true, users: 1, storage: "1GB", features: ["Unlimited bases", "1,000 records/base", "Grid & calendar"] },
      { planName: "Team", monthly: 2000, annual: 1600, freePlan: false, freeTrial: true, popular: false, users: 1, storage: "5GB", features: ["50,000 records", "Blocks", "Custom forms"] },
      { planName: "Business", monthly: 3500, annual: 2800, freePlan: false, freeTrial: true, popular: false, users: 1, storage: "20GB", features: ["Gantt view", "Admin controls", "Sync"] },
      { planName: "Enterprise", monthly: 0, annual: 0, freePlan: false, freeTrial: true, popular: false, users: 999, storage: "100GB", features: ["Advanced security", "SSO", "Dedicated support"] },
    ],
  },
  {
    name: "Webflow", slug: "webflow", category: "website-builders", color: "#146ef5",
    tagline: "Website Builder", description: "Design, build and launch professional websites visually, with clean code.",
    website: "https://webflow.com", startingPrice: 0, freePlan: true, freeTrial: true,
    verified: true, aiPowered: true, featured: false, trending: true, popularity: 78, company: "Webflow", companySize: "501-1000", founded: 2013, headquarters: "San Francisco, CA", rating: 4.5,
    pros: ["Design freedom", "Clean semantic code", "Hosting included"], cons: ["Learning curve", "Monthly site limits"],
    faq: [{ q: "Is Webflow free?", a: "Yes, the Starter plan has 2 static pages." }],
    integrations: ["Zapier", "HubSpot", "Google Analytics", "Facebook", "Mailchimp"],
    features: [{ name: "Visual editor", description: "Design in the browser." }, { name: "CMS", description: "Dynamic content collections." }, { name: "Interactions", description: "Scroll & hover animations." }],
    pricing: [
      { planName: "Starter", monthly: 0, annual: 0, freePlan: true, freeTrial: false, popular: false, users: 1, storage: "1GB", features: ["2 static pages", "Webflow.io domain", "300 CMS items"] },
      { planName: "Basic", monthly: 1200, annual: 1200, freePlan: false, freeTrial: true, popular: true, users: 1, storage: "50GB", features: ["Custom domain", "150 CMS items", "50k monthly visits"] },
      { planName: "CMS", monthly: 2300, annual: 2300, freePlan: false, freeTrial: true, popular: false, users: 1, storage: "100GB", features: ["2,000 CMS items", "200k visits", "API access"] },
      { planName: "Business", monthly: 4200, annual: 4200, freePlan: false, freeTrial: true, popular: false, users: 1, storage: "400GB", features: ["10,000 CMS items", "1M visits", "Advanced hosting"] },
    ],
  },
  {
    name: "Zendesk", slug: "zendesk", category: "customer-support", color: "#03363d",
    tagline: "Customer Service Suite", description: "Helpdesk and customer support platform for any channel.",
    website: "https://zendesk.com", startingPrice: 1900, freePlan: false, freeTrial: true,
    verified: true, aiPowered: true, featured: false, trending: false, popularity: 76, company: "Zendesk", companySize: "5000+", founded: 2007, headquarters: "San Francisco, CA", rating: 4.1,
    pros: ["Mature and stable", "Omni-channel", "Good analytics"], cons: ["Pricing tiers stack up", "UI feels dated"],
    faq: [{ q: "Does Zendesk have a free trial?", a: "Yes, a 14-day free trial is available." }],
    integrations: ["Salesforce", "Shopify", "Slack", "Jira", "HubSpot"],
    features: [{ name: "Tickets", description: "Unified support." }, { name: "AI", description: "Answer bot & auto-triage." }, { name: "Knowledge", description: "Help center articles." }],
    pricing: [
      { planName: "Support Team", monthly: 1900, annual: 1520, freePlan: false, freeTrial: true, popular: true, users: 1, storage: "Unlimited", features: ["Email & social", "Ticket views", "50+ apps"] },
      { planName: "Support Professional", monthly: 4900, annual: 3920, freePlan: false, freeTrial: true, popular: false, users: 1, storage: "Unlimited", features: ["Business hours", "CSAT surveys", "Knowledge base"] },
      { planName: "Support Enterprise", monthly: 9900, annual: 7920, freePlan: false, freeTrial: true, popular: false, users: 1, storage: "Unlimited", features: ["Custom agents", "SLA", "Advanced reporting"] },
    ],
  },
  {
    name: "Calendly", slug: "calendly", category: "productivity", color: "#006bff",
    tagline: "Scheduling", description: "Let clients book meetings with you without the back-and-forth emails.",
    website: "https://calendly.com", startingPrice: 0, freePlan: true, freeTrial: true,
    verified: true, aiPowered: false, featured: false, trending: false, popularity: 74, company: "Calendly", companySize: "501-1000", founded: 2013, headquarters: "Atlanta, GA", rating: 4.6,
    pros: ["Dead simple", "Great integrations", "Reliable"], cons: ["Customization limited", "No real-time scheduling"],
    faq: [{ q: "Is Calendly free?", a: "Yes, the free plan includes one event type." }],
    integrations: ["Google Calendar", "Zoom", "Slack", "Stripe", "HubSpot"],
    features: [{ name: "Event types", description: "One-click booking." }, { name: "Routing", description: "Group rounds." }, { name: "Workflows", description: "Automated reminders." }],
    pricing: [
      { planName: "Free", monthly: 0, annual: 0, freePlan: true, freeTrial: false, popular: false, users: 1, storage: "Unlimited", features: ["1 event type", "Calendar sync", "Email reminders"] },
      { planName: "Standard", monthly: 1000, annual: 800, freePlan: false, freeTrial: true, popular: true, users: 1, storage: "Unlimited", features: ["Unlimited event types", "Custom branding", "Workflows"] },
      { planName: "Teams", monthly: 1600, annual: 1280, freePlan: false, freeTrial: true, popular: false, users: 1, storage: "Unlimited", features: ["Round robin", "Routing forms", "Admin"] },
    ],
  },
  {
    name: "QuickBooks", slug: "quickbooks", category: "accounting", color: "#2ca01c",
    tagline: "Small Business Accounting", description: "Accounting, invoicing and taxes for small businesses.",
    website: "https://quickbooks.intuit.com", startingPrice: 3500, freePlan: false, freeTrial: true,
    verified: true, aiPowered: true, featured: false, trending: false, popularity: 72, company: "Intuit", companySize: "10000+", founded: 1983, headquarters: "Mountain View, CA", rating: 4.1,
    pros: ["Industry standard", "Simplifies tax", "Easy invoicing"], cons: ["Pricey", "Support not great"],
    faq: [{ q: "Does QuickBooks have a free tier?", a: "No, but a 30-day free trial is available." }],
    integrations: ["Stripe", "PayPal", "Shopify", "Square", "Expensify"],
    features: [{ name: "Invoicing", description: "Send and track invoices." }, { name: "Expenses", description: "Capture receipts." }, { name: "Reports", description: "P&L and balance sheet." }],
    pricing: [
      { planName: "Simple Start", monthly: 3500, annual: 3000, freePlan: false, freeTrial: true, popular: true, users: 1, storage: "Unlimited", features: ["Invoicing", "Income & expenses", "Tax estimates"] },
      { planName: "Essentials", monthly: 5500, annual: 4800, freePlan: false, freeTrial: true, popular: false, users: 3, storage: "Unlimited", features: ["Manage bills", "Time tracking", "Multiple users"] },
      { planName: "Plus", monthly: 8500, annual: 7500, freePlan: false, freeTrial: true, popular: false, users: 5, storage: "Unlimited", features: ["Inventory", "Project profitability", "Custom users"] },
      { planName: "Advanced", monthly: 12000, annual: 10800, freePlan: false, freeTrial: true, popular: false, users: 25, storage: "Unlimited", features: ["Dedicated support", "Custom reports", "Data insights"] },
    ],
  },
  {
    name: "Trello", slug: "trello", category: "project-management", color: "#0079bf",
    tagline: "Kanban Board", description: "Visualize tasks and projects on simple, flexible kanban boards.",
    website: "https://trello.com", startingPrice: 0, freePlan: true, freeTrial: true,
    verified: true, aiPowered: true, featured: false, trending: false, popularity: 70, company: "Atlassian", companySize: "1000+", founded: 2011, headquarters: "New York, NY", rating: 4.3,
    pros: ["Extremely easy", "Free plan", "Mobility"], cons: ["Limited for complex work", "No native timelines"],
    faq: [{ q: "Is Trello free?", a: "Yes, with unlimited cards for personal use." }],
    integrations: ["Slack", "Google Drive", "Jira", "GitHub", "Dropbox"],
    features: [{ name: "Boards", description: "Kanban boards." }, { name: "Cards", description: "Tasks with details." }, { name: "Butler", description: "No-code automation." }],
    pricing: [
      { planName: "Free", monthly: 0, annual: 0, freePlan: true, freeTrial: false, popular: true, users: 1, storage: "10MB", features: ["Unlimited cards", "10 boards", "Power-Ups"] },
      { planName: "Standard", monthly: 500, annual: 500, freePlan: false, freeTrial: true, popular: false, users: 1, storage: "250MB", features: ["Unlimited boards", "Advanced checks", "3 views"] },
      { planName: "Premium", monthly: 1000, annual: 1000, freePlan: false, freeTrial: true, popular: false, users: 1, storage: "250MB", features: ["Unlimited views", "Timeline", "Admin"] },
      { planName: "Enterprise", monthly: 1750, annual: 1750, freePlan: false, freeTrial: true, popular: false, users: 999, storage: "250MB", features: ["Unlimited Power-Ups", "Command boards", "SSO"] },
    ],
  },
  {
    name: "Canva", slug: "canva", category: "design", color: "#00c4cc",
    tagline: "Graphic Design", description: "Design anything with templates, AI and a drag-and-drop editor.",
    website: "https://canva.com", startingPrice: 0, freePlan: true, freeTrial: false,
    verified: true, aiPowered: true, featured: true, trending: true, popularity: 92, company: "Canva", companySize: "5000+", founded: 2013, headquarters: "Sydney, Australia", rating: 4.8,
    pros: ["Huge template library", "Easy for non-designers", "Great value"], cons: ["Not for advanced editing", "Brand kit paid"],
    faq: [{ q: "Is Canva free?", a: "Yes, with a 250,000+ template library." }],
    integrations: ["Google Drive", "Doodle", "Mailchimp", "HubSpot", "Slack"],
    features: [{ name: "Templates", description: "Thousands of designs." }, { name: "AI tools", description: "Magic design & text." }, { name: "Brand kit", description: "Keep brand consistent." }],
    pricing: [
      { planName: "Free", monthly: 0, annual: 0, freePlan: true, freeTrial: false, popular: true, users: 1, storage: "5GB", features: ["250k+ templates", "5GB storage", "1 brand kit"] },
      { planName: "Pro", monthly: 1500, annual: 1200, freePlan: false, freeTrial: true, popular: false, users: 1, storage: "100GB", features: ["Background remover", "Magic resize", "100 brand kits"] },
      { planName: "Teams", monthly: 1000, annual: 800, freePlan: false, freeTrial: true, popular: false, users: 1, storage: "1TB", features: ["Brand controls", "Collaboration", "Approvals"] },
    ],
  },
  {
    name: "OpenAI", slug: "openai", category: "ai-tools", color: "#10a37f",
    tagline: "AI & LLM API", description: "Access powerful GPT models through a developer API.",
    website: "https://openai.com", startingPrice: 0, freePlan: false, freeTrial: false,
    verified: true, aiPowered: true, featured: true, trending: true, popularity: 98, company: "OpenAI", companySize: "1000+", founded: 2015, headquarters: "San Francisco, CA", rating: 4.6,
    pros: ["Leading models", "Great developer docs", "Huge ecosystem"], cons: ["Pay per token", "Rate limits"],
    faq: [{ q: "Is OpenAI API free?", a: "No, but there are free credits for new users." }],
    integrations: ["Zapier", "LangChain", "Vercel", "GitHub", "Slack"],
    features: [{ name: "GPT-4", description: "Advanced reasoning." }, { name: "DALL·E", description: "Image generation." }, { name: "Whisper", description: "Speech to text." }],
    pricing: [{ planName: "Usage-based", monthly: 0, annual: 0, freePlan: false, freeTrial: true, popular: true, users: 1, storage: "Unlimited", features: ["Pay per token", "All models", "Unlimited scale"] }],
  },
  {
    name: "Loom", slug: "loom", category: "video", color: "#625df5",
    tagline: "Video Messaging", description: "Record and share async video messages with your team.",
    website: "https://loom.com", startingPrice: 0, freePlan: true, freeTrial: true,
    verified: true, aiPowered: true, featured: false, trending: true, popularity: 68, company: "Loom", companySize: "201-500", founded: 2015, headquarters: "San Francisco, CA", rating: 4.6,
    pros: ["Async communication", "Easy to use", "Sales-friendly"], cons: ["Free plan limits", "Viewing analytics paid"],
    faq: [{ q: "Is Loom free?", a: "Yes, with 25 videos and viewer analytics." }],
    integrations: ["Slack", "Gmail", "Notion", "Jira", "HubSpot"],
    features: [{ name: "Recording", description: "Screen + camera." }, { name: "AI", description: "Auto titles & chapters." }, { name: "Analytics", description: "Viewer insights." }],
    pricing: [
      { planName: "Free", monthly: 0, annual: 0, freePlan: true, freeTrial: false, popular: true, users: 1, storage: "25 videos", features: ["25 videos", "5-min limit", "Basic creator"] },
      { planName: "Business", monthly: 1500, annual: 1200, freePlan: false, freeTrial: true, popular: false, users: 1, storage: "Unlimited", features: ["Unlimited videos", "AI features", "Custom branding"] },
      { planName: "Enterprise", monthly: 0, annual: 0, freePlan: false, freeTrial: true, popular: false, users: 999, storage: "Unlimited", features: ["Admin controls", "SSO", "Advanced analytics"] },
    ],
  },
  {
    name: "Asana", slug: "asana", category: "project-management", color: "#f06a6a",
    tagline: "Work Management", description: "Coordinate and manage everything your team works on.",
    website: "https://asana.com", startingPrice: 0, freePlan: true, freeTrial: true,
    verified: true, aiPowered: true, featured: false, trending: false, popularity: 75, company: "Asana", companySize: "1000+", founded: 2008, headquarters: "San Francisco, CA", rating: 4.3,
    pros: ["Flexible", "Strong integrations", "Timeline view"], cons: ["Can be overwhelming", "Costs rise with users"],
    faq: [{ q: "Is Asana free?", a: "Yes, the Basic plan is free for up to 10 teammates." }],
    integrations: ["Slack", "Google Drive", "GitHub", "Zoom", "Dropbox"],
    features: [{ name: "Projects", description: "Views & workflows." }, { name: "Goals", description: "OKR tracking." }, { name: "Portfolios", description: "Programs overview." }],
    pricing: [
      { planName: "Basic", monthly: 0, annual: 0, freePlan: true, freeTrial: false, popular: true, users: 10, storage: "Unlimited", features: ["Unlimited projects", "Unlimited tasks", "Mobile app"] },
      { planName: "Premium", monthly: 1099, annual: 879, freePlan: false, freeTrial: true, popular: false, users: 1, storage: "Unlimited", features: ["Timeline", "Forms", "Dependencies"] },
      { planName: "Business", monthly: 2499, annual: 1999, freePlan: false, freeTrial: true, popular: false, users: 1, storage: "Unlimited", features: ["Portfolios", "Goals", "Time tracking"] },
      { planName: "Enterprise", monthly: 0, annual: 0, freePlan: false, freeTrial: true, popular: false, users: 999, storage: "Unlimited", features: ["SSO", "Data control", "Admin"] },
    ],
  },
  {
    name: "ClickUp", slug: "clickup", category: "project-management", color: "#7b68ee",
    tagline: "Work Operations", description: "The everything app for tasks, docs, goals and chat.",
    website: "https://clickup.com", startingPrice: 0, freePlan: true, freeTrial: true,
    verified: true, aiPowered: true, featured: false, trending: true, popularity: 73, company: "ClickUp", companySize: "1000+", founded: 2017, headquarters: "San Diego, CA", rating: 4.4,
    pros: ["All-in-one", "Great value", "Lots of views"], cons: ["Overwhelming", "Can be slow"],
    faq: [{ q: "Is ClickUp free?", a: "Yes, the Free Forever plan is unlimited." }],
    integrations: ["Slack", "Google Drive", "GitHub", "Zoom", "Zapier"],
    features: [{ name: "Tasks", description: "Full work management." }, { name: "Docs", description: "Collaborative docs." }, { name: "Goals", description: "Track targets." }],
    pricing: [
      { planName: "Free", monthly: 0, annual: 0, freePlan: true, freeTrial: false, popular: true, users: 1, storage: "100MB", features: ["Unlimited tasks", "Unlimited members", "Whiteboards"] },
      { planName: "Unlimited", monthly: 1000, annual: 800, freePlan: false, freeTrial: true, popular: false, users: 1, storage: "Unlimited", features: ["Unlimited storage", "Custom fields", "Integrations"] },
      { planName: "Business", monthly: 1900, annual: 1520, freePlan: false, freeTrial: true, popular: false, users: 1, storage: "Unlimited", features: ["Advanced automation", "Timeline", "Sprints"] },
      { planName: "Enterprise", monthly: 0, annual: 0, freePlan: false, freeTrial: true, popular: false, users: 999, storage: "Unlimited", features: ["Advanced security", "SSO", "Dedicated manager"] },
    ],
  },
  {
    name: "Jira", slug: "jira", category: "developer-tools", color: "#0052cc",
    tagline: "Issue & Project Tracking", description: "The #1 software development tool used by agile teams.",
    website: "https://atlassian.com/software/jira", startingPrice: 0, freePlan: true, freeTrial: true,
    verified: true, aiPowered: true, featured: true, trending: false, popularity: 81, company: "Atlassian", companySize: "10000+", founded: 2002, headquarters: "Sydney, Australia", rating: 4.2,
    pros: ["Industry standard", "Powerful Agile", "Huge ecosystem"], cons: ["Complex setup", "Performance heavy"],
    faq: [{ q: "Is Jira free?", a: "Yes, for up to 10 users with core features." }],
    integrations: ["Confluence", "Bitbucket", "Slack", "GitHub", "Zendesk"],
    features: [{ name: "Scrum", description: "Agile sprints." }, { name: "Kanban", description: "Continuous flow." }, { name: "Releases", description: "Version planning." }],
    pricing: [
      { planName: "Free", monthly: 0, annual: 0, freePlan: true, freeTrial: false, popular: true, users: 10, storage: "2GB", features: ["10 users", "Scrum & Kanban", "Unlimited projects"] },
      { planName: "Standard", monthly: 800, annual: 800, freePlan: false, freeTrial: true, popular: false, users: 1, storage: "250GB", features: ["Unlimited users", "Audit log", "Instances"] },
      { planName: "Premium", monthly: 1600, annual: 1600, freePlan: false, freeTrial: true, popular: false, users: 1, storage: "Unlimited", features: ["Cycles", "Project archiving", "Data residency"] },
      { planName: "Enterprise", monthly: 0, annual: 0, freePlan: false, freeTrial: true, popular: false, users: 999, storage: "Unlimited", features: ["SSO", "Unlimited storage", "24/7 support"] },
    ],
  },
  {
    name: "Framer", slug: "framer", category: "website-builders", color: "#1f1f1f",
    tagline: "Design & Publish", description: "Design and publish stunning websites in a single tool.",
    website: "https://framer.com", startingPrice: 0, freePlan: true, freeTrial: true,
    verified: true, aiPowered: true, featured: false, trending: true, popularity: 66, company: "Framer", companySize: "51-200", founded: 2015, headquarters: "Amsterdam, Netherlands", rating: 4.5,
    pros: ["Design-first", "Real component libraries", "Fast publishing"], cons: ["Framer domain on free", "Cost for custom domains"],
    faq: [{ q: "Is Framer free?", a: "Yes, on a framer.app subdomain." }],
    integrations: ["Zapier", "HubSpot", "Notion", "Google Analytics", "Slack"],
    features: [{ name: "Design", description: "Professional layout tools." }, { name: "Animations", description: "Micro-interactions." }, { name: "CMS", description: "Content collections." }],
    pricing: [
      { planName: "Free", monthly: 0, annual: 0, freePlan: true, freeTrial: false, popular: true, users: 1, storage: "1GB", features: ["1 site", "framer.app domain", "Simple CMS"] },
      { planName: "Pro", monthly: 500, annual: 500, freePlan: false, freeTrial: true, popular: false, users: 1, storage: "10GB", features: ["Custom domain", "SEO control", "2k CMS items"] },
      { planName: "Team", monthly: 2000, annual: 2000, freePlan: false, freeTrial: true, popular: false, users: 1, storage: "50GB", features: ["3 editors", "Components", "Analytics"] },
    ],
  },
  {
    name: "Vercel", slug: "vercel", category: "hosting", color: "#000000",
    tagline: "Frontend Cloud", description: "Preview, deploy and scale modern web apps instantly.",
    website: "https://vercel.com", startingPrice: 0, freePlan: true, freeTrial: true,
    verified: true, aiPowered: true, featured: true, trending: true, popularity: 90, company: "Vercel", companySize: "501-1000", founded: 2015, headquarters: "San Francisco, CA", rating: 4.7,
    pros: ["Zero config deploys", "Global edge", "Great DX"], cons: ["Serverless limits", "Can get pricey"],
    faq: [{ q: "Is Vercel free?", a: "Yes, the Hobby plan is free for non-commercial use." }],
    integrations: ["GitHub", "GitLab", "Bitbucket", "Stripe", "Sanity"],
    features: [{ name: "Deploys", description: "Git push previews." }, { name: "Edge", description: "Global serverless." }, { name: "Analytics", description: "Web vitals." }],
    pricing: [
      { planName: "Hobby", monthly: 0, annual: 0, freePlan: true, freeTrial: false, popular: true, users: 1, storage: "Unlimited", features: ["100GB bandwidth", "Serverless functions", "Sponsorship"] },
      { planName: "Pro", monthly: 2000, annual: 2000, freePlan: false, freeTrial: true, popular: false, users: 1, storage: "Unlimited", features: ["Unlimited bandwidth", "Edge functions", "Preview deployments"] },
      { planName: "Enterprise", monthly: 0, annual: 0, freePlan: false, freeTrial: true, popular: false, users: 999, storage: "Unlimited", features: ["Scaled compute", "SSO", "SLA"] },
    ],
  },
  {
    name: "Midjourney", slug: "midjourney", category: "ai-tools", color: "#3d3d52",
    tagline: "AI Image Generation", description: "Generate stunning art and images with a simple prompt.",
    website: "https://midjourney.com", startingPrice: 1000, freePlan: false, freeTrial: true,
    verified: true, aiPowered: true, featured: false, trending: true, popularity: 62, company: "Midjourney", companySize: "11-50", founded: 2021, headquarters: "San Francisco, CA", rating: 4.4,
    pros: ["SOTA image quality", "Active community", "Great stylization"], cons: ["No free tier", "Discord-based"],
    faq: [{ q: "Is Midjourney free?", a: "No, paid plans start at $10/month." }],
    integrations: ["Discord", "Zapier", "Notion", "Figma", "Canva"],
    features: [{ name: "Text-to-image", description: "Prompt-based art." }, { name: "Style references", description: "Consistent style." }, { name: "Upscale", description: "High-res output." }],
    pricing: [
      { planName: "Basic", monthly: 1000, annual: 1000, freePlan: false, freeTrial: true, popular: true, users: 1, storage: "200 images", features: ["~200 generations/mo", "Commercial use", "Standard queue"] },
      { planName: "Standard", monthly: 3000, annual: 3000, freePlan: false, freeTrial: true, popular: false, users: 1, storage: "Unlimited", features: ["Unlimited relax", "15h fast", "Stealth"] },
      { planName: "Pro", monthly: 6000, annual: 6000, freePlan: false, freeTrial: true, popular: false, users: 1, storage: "Unlimited", features: ["30h fast", "12 concurrent", "Stealth"] },
    ],
  },
  {
    name: "DocuSign", slug: "docusign", category: "productivity", color: "#4c00ff",
    tagline: "Electronic Signature", description: "Send, sign and manage agreements from any device.",
    website: "https://docusign.com", startingPrice: 1000, freePlan: false, freeTrial: true,
    verified: true, aiPowered: true, featured: false, trending: false, popularity: 64, company: "DocuSign", companySize: "5000+", founded: 2003, headquarters: "San Francisco, CA", rating: 4.2,
    pros: ["Industry standard", "Legal validity", "Easy to use"], cons: ["Cost", "Metered envelopes"],
    faq: [{ q: "Does DocuSign have a free plan?", a: "No, but a free trial is available." }],
    integrations: ["Salesforce", "NetSuite", "Microsoft", "Google", "Zapier"],
    features: [{ name: "E-signature", description: "Legal e-signatures." }, { name: "WebForms", description: "Collect data." }, { name: "CLM", description: "Contract lifecycle." }],
    pricing: [
      { planName: "Standard", monthly: 1000, annual: 1000, freePlan: false, freeTrial: true, popular: true, users: 1, storage: "Unlimited", features: ["5 envelopes/month", "Reusable templates", "Signer attachments"] },
      { planName: "Business Pro", monthly: 1500, annual: 1500, freePlan: false, freeTrial: true, popular: false, users: 1, storage: "Unlimited", features: ["Unlimited envelopes", "Comments", "PowerForms"] },
      { planName: "Advanced", monthly: 3000, annual: 3000, freePlan: false, freeTrial: true, popular: false, users: 1, storage: "Unlimited", features: ["Advanced workflows", "API", "Branding"] },
    ],
  },
  {
    name: "Gong", slug: "gong", category: "sales-crm", color: "#3b82f6",
    tagline: "Revenue Intelligence", description: "Record and analyze every sales conversation with AI.",
    website: "https://gong.io", startingPrice: 5000, freePlan: false, freeTrial: false,
    verified: true, aiPowered: true, featured: false, trending: false, popularity: 58, company: "Gong", companySize: "501-1000", founded: 2015, headquarters: "San Francisco, CA", rating: 4.6,
    pros: ["Best call analytics", "AI insights", "Widely adopted"], cons: ["Expensive", "Setup required"],
    faq: [{ q: "Does Gong have a free trial?", a: "No, it is a premium enterprise tool." }],
    integrations: ["Salesforce", "HubSpot", "Zoom", "Outlook", "Slack"],
    features: [{ name: "Call recording", description: "Capture conversations." }, { name: "Coaching", description: "Team enablement." }, { name: "Forecasting", description: "Deal insights." }],
    pricing: [{ planName: "Enterprise", monthly: 5000, annual: 5000, freePlan: false, freeTrial: false, popular: true, users: 1, storage: "Unlimited", features: ["Deal intelligence", "Call tracking", "Custom analytics"] }],
  },
  {
    name: "Xero", slug: "xero", category: "accounting", color: "#13b5ea",
    tagline: "Online Accounting", description: "Cloud accounting for small business, with invoicing and payroll.",
    website: "https://xero.com", startingPrice: 2900, freePlan: false, freeTrial: true,
    verified: true, aiPowered: false, featured: false, trending: false, popularity: 60, company: "Xero", companySize: "1000+", founded: 2006, headquarters: "Wellington, New Zealand", rating: 4.3,
    pros: ["Beautiful UI", "Strong integrations", "Good for SMB"], cons: ["Payroll add-on", "No free plan"],
    faq: [{ q: "Does Xero offer a free trial?", a: "Yes, a 30-day free trial is available." }],
    integrations: ["Stripe", "Shopify", "Salesforce", "HubSpot", "PayPal"],
    features: [{ name: "Invoicing", description: "Branded invoices." }, { name: "Bank feeds", description: "Auto reconciliation." }, { name: "Reports", description: "Real-time P&L." }],
    pricing: [
      { planName: "Starter", monthly: 2900, annual: 2900, freePlan: false, freeTrial: true, popular: true, users: 1, storage: "Unlimited", features: ["5 invoices", "20 bills", "Bank feeds"] },
      { planName: "Standard", monthly: 4900, annual: 4900, freePlan: false, freeTrial: true, popular: false, users: 1, storage: "Unlimited", features: ["Unlimited invoices", "Multi-currency", "Payroll"] },
      { planName: "Premium", monthly: 7000, annual: 7000, freePlan: false, freeTrial: true, popular: false, users: 1, storage: "Unlimited", features: ["Tracking", "Projects", "Expense claims"] },
    ],
  },
  {
    name: "Notion Calendar", slug: "notion-calendar", category: "productivity", color: "#f5c518",
    tagline: "Calendar & Scheduling", description: "Connect your calendars and time blocks in one place.",
    website: "https://notion.so/product/calendar", startingPrice: 0, freePlan: true, freeTrial: false,
    verified: false, aiPowered: false, featured: false, trending: false, popularity: 40, company: "Notion Labs", companySize: "201-500", founded: 2024, headquarters: "San Francisco, CA", rating: 4.3,
    pros: ["Free", "Integrates with Notion", "Simple"], cons: ["New", "Limited features"],
    faq: [{ q: "Is Notion Calendar free?", a: "Yes, it is free to use." }],
    integrations: ["Google Calendar", "Notion", "Zoom"],
    features: [{ name: "Sync", description: "Two-way calendar sync." }, { name: "Notion", description: "Link tasks to calendar." }],
    pricing: [{ planName: "Free", monthly: 0, annual: 0, freePlan: true, freeTrial: false, popular: true, users: 1, storage: "Unlimited", features: ["Free forever", "Google Cal sync", "Notion integration"] }],
  },
  {
    name: "Pipedrive", slug: "pipedrive", category: "sales-crm", color: "#00a95c",
    tagline: "Sales Pipeline", description: "Simple, visual CRM designed for salespeople and small teams.",
    website: "https://pipedrive.com", startingPrice: 1400, freePlan: false, freeTrial: true,
    verified: true, aiPowered: true, featured: false, trending: true, popularity: 65, company: "Pipedrive", companySize: "501-1000", founded: 2010, headquarters: "New York, NY", rating: 4.4,
    pros: ["Simple to use", "Pipeline-first", "Good SMB fit"], cons: ["Limited reporting", "No free plan"],
    faq: [{ q: "Does Pipedrive have a free trial?", a: "Yes, a 14-day free trial." }],
    integrations: ["Slack", "Gmail", "Zapier", "Google", "Mailchimp"],
    features: [{ name: "Pipelines", description: "Visual deal stages." }, { name: "AI", description: "Sales assistant." }, { name: "Activities", description: "Follow-up reminders." }],
    pricing: [
      { planName: "Essential", monthly: 1400, annual: 1400, freePlan: false, freeTrial: true, popular: true, users: 1, storage: "2GB", features: ["Unlimited pipelines", "Contact & deal", "Email sync"] },
      { planName: "Advanced", monthly: 2400, annual: 2400, freePlan: false, freeTrial: true, popular: false, users: 1, storage: "10GB", features: ["Multiple pipelines", "Automations", "Contracts"] },
      { planName: "Professional", monthly: 4900, annual: 4900, freePlan: false, freeTrial: true, popular: false, users: 1, storage: "100GB", features: ["Revenue forecasts", "AI sales", "Team management"] },
    ],
  },
  {
    name: "WooCommerce", slug: "woocommerce", category: "e-commerce", color: "#96588a",
    tagline: "E-commerce for WordPress", description: "The flexible, open-source e-commerce platform for WordPress.",
    website: "https://woocommerce.com", startingPrice: 0, freePlan: true, freeTrial: false,
    verified: true, aiPowered: true, featured: false, trending: false, popularity: 71, company: "Automattic", companySize: "1000+", founded: 2011, headquarters: "San Francisco, CA", rating: 4.2,
    pros: ["Free & open source", "Full WordPress control", "Huge plugin library"], cons: ["Needs maintenance", "Costs add up"],
    faq: [{ q: "Is WooCommerce free?", a: "Yes, the core is free and open source." }],
    integrations: ["Stripe", "PayPal", "Mailchimp", "Google", "Zapier"],
    features: [{ name: "Products", description: "Sell anything." }, { name: "Payments", description: "Accept payments." }, { name: "Extensions", description: "Huge marketplace." }],
    pricing: [{ planName: "Free", monthly: 0, annual: 0, freePlan: true, freeTrial: false, popular: true, users: 1, storage: "Unlimited", features: ["Core free", "Unlimited products", "Community support"] }],
  },
  {
    name: "Bubble", slug: "bubble", category: "no-code", color: "#00a4ef",
    tagline: "No-Code App Builder", description: "Build fully functional web apps visually, no code required.",
    website: "https://bubble.io", startingPrice: 0, freePlan: true, freeTrial: true,
    verified: true, aiPowered: true, featured: true, trending: true, popularity: 74, company: "Bubble", companySize: "201-500", founded: 2012, headquarters: "New York, NY", rating: 4.4,
    pros: ["Full app building", "Great for MVPs", "No-code"], cons: ["Can get slow", "Costs scale"],
    faq: [{ q: "Is Bubble free?", a: "Yes, with the Bubble.io domain and branding." }],
    integrations: ["Zapier", "Stripe", "Google", "Slack", "Airtable"],
    features: [{ name: "Visual builder", description: "Drag-and-drop apps." }, { name: "Workflows", description: "Logic editor." }, { name: "Database", description: "Built-in data." }],
    pricing: [
      { planName: "Free", monthly: 0, annual: 0, freePlan: true, freeTrial: false, popular: true, users: 1, storage: "1GB", features: ["Bubble.io domain", "Basic app", "Community support"] },
      { planName: "Starter", monthly: 2900, annual: 2900, freePlan: false, freeTrial: true, popular: false, users: 1, storage: "10GB", features: ["Custom domain", "10GB storage", "500 MB data"] },
      { planName: "Growth", monthly: 3400, annual: 3400, freePlan: false, freeTrial: true, popular: false, users: 1, storage: "100GB", features: ["More capacity", "Versioning", "API"] },
    ],
  },
  {
    name: "n8n", slug: "n8n", category: "automation", color: "#ea4b71",
    tagline: "Workflow Automation", description: "Fair-code, node-based workflow automation with 400+ integrations.",
    website: "https://n8n.io", startingPrice: 0, freePlan: true, freeTrial: true,
    verified: true, aiPowered: true, featured: true, trending: true, popularity: 72, company: "n8n", companySize: "51-200", founded: 2019, headquarters: "Berlin, Germany", rating: 4.7,
    pros: ["Self-hostable", "Fair-code", "Great AI features"], cons: ["Learning curve", "Cloud is pricey"],
    faq: [{ q: "Is n8n self-hostable?", a: "Yes, open source community edition." }],
    integrations: ["Google", "Slack", "Stripe", "OpenAI", "HubSpot"],
    features: [{ name: "Nodes", description: "400+ integrations." }, { name: "AI Agent", description: "Build AI workflows." }, { name: "Self-host", description: "Full control." }],
    pricing: [
      { planName: "Community", monthly: 0, annual: 0, freePlan: true, freeTrial: false, popular: true, users: 1, storage: "Unlimited", features: ["Self-hosted", "Unlimited workflows", "Open source"] },
      { planName: "Cloud", monthly: 2000, annual: 2000, freePlan: false, freeTrial: true, popular: false, users: 1, storage: "5GB", features: ["Hosted", "400+ integrations", "AI features"] },
      { planName: "Pro", monthly: 4600, annual: 4600, freePlan: false, freeTrial: true, popular: false, users: 1, storage: "20GB", features: ["Concurrency", "Global", "Priority"] },
    ],
  },
  {
    name: "Amplitude", slug: "amplitude", category: "analytics", color: "#1e69ff",
    tagline: "Product Analytics", description: "Understand user behavior and drive retention with analytics.",
    website: "https://amplitude.com", startingPrice: 0, freePlan: true, freeTrial: true,
    verified: true, aiPowered: true, featured: false, trending: false, popularity: 63, company: "Amplitude", companySize: "1000+", founded: 2012, headquarters: "San Francisco, CA", rating: 4.5,
    pros: ["Powerful", "Behavioral insights", "Free tier"], cons: ["Complex", "Volume cuts"],
    faq: [{ q: "Is Amplitude free?", a: "Yes, up to 1M monthly events." }],
    integrations: ["Segment", "Snowflake", "Slack", "Mixpanel", "HubSpot"],
    features: [{ name: "Events", description: "Behavioral tracking." }, { name: "Funnels", description: "Journey analysis." }, { name: "Retention", description: "Cohort retention." }],
    pricing: [
      { planName: "Free", monthly: 0, annual: 0, freePlan: true, freeTrial: false, popular: true, users: 1, storage: "1M events", features: ["1M events/mo", "Dashboards", "2 projects"] },
      { planName: "Growth", monthly: 4900, annual: 4900, freePlan: false, freeTrial: true, popular: false, users: 1, storage: "Unlimited", features: ["Unlimited events", "Collaboration", "Advanced"] },
      { planName: "Enterprise", monthly: 0, annual: 0, freePlan: false, freeTrial: true, popular: false, users: 1, storage: "Unlimited", features: ["Governance", "SSO", "Premium"] },
    ],
  },
  {
    name: "Typeform", slug: "typeform", category: "marketing", color: "#1f1e59",
    tagline: "Forms & Surveys", description: "Create beautiful forms, quizzes and surveys people love to answer.",
    website: "https://typeform.com", startingPrice: 0, freePlan: true, freeTrial: true,
    verified: true, aiPowered: true, featured: false, trending: true, popularity: 61, company: "Typeform", companySize: "201-500", founded: 2012, headquarters: "Barcelona, Spain", rating: 4.5,
    pros: ["Beautiful forms", "Great UX", "Integrations"], cons: ["Response limits", "Pricey"],
    faq: [{ q: "Is Typeform free?", a: "Yes, up to 10 responses/month." }],
    integrations: ["Slack", "HubSpot", "Zapier", "Google Sheets", "Mailchimp"],
    features: [{ name: "Forms", description: "Conversational forms." }, { name: "Logic", description: "Branching & logic." }, { name: "AI", description: "AI form builder." }],
    pricing: [
      { planName: "Free", monthly: 0, annual: 0, freePlan: true, freeTrial: false, popular: true, users: 1, storage: "100MB", features: ["10 responses/mo", "1 form", "Basic logic"] },
      { planName: "Basic", monthly: 2500, annual: 2500, freePlan: false, freeTrial: true, popular: false, users: 1, storage: "10GB", features: ["100 responses/mo", "Unlimited forms", "Custom"] },
      { planName: "Plus", monthly: 4100, annual: 4100, freePlan: false, freeTrial: true, popular: false, users: 1, storage: "100GB", features: ["1,000 responses/mo", "Advanced logic", "Branding"] },
    ],
  },
  {
    name: "Sourcegraph", slug: "sourcegraph", category: "developer-tools", color: "#00bc9d",
    tagline: "Code Intelligence", description: "Universal code search and AI for engineering teams.",
    website: "https://sourcegraph.com", startingPrice: 0, freePlan: true, freeTrial: true,
    verified: true, aiPowered: true, featured: false, trending: false, popularity: 44, company: "Sourcegraph", companySize: "201-500", founded: 2013, headquarters: "San Francisco, CA", rating: 4.4,
    pros: ["Great code search", "AI assistant", "Open source"], cons: ["Enterprise focus", "Setup"],
    faq: [{ q: "Is Sourcegraph free?", a: "Yes, the community edition is free." }],
    integrations: ["GitHub", "GitLab", "Bitbucket", "VS Code", "Slack"],
    features: [{ name: "Code search", description: "Search across repos." }, { name: "Cody", description: "AI code assistant." }, { name: "Insights", description: "Code analytics." }],
    pricing: [{ planName: "Free", monthly: 0, annual: 0, freePlan: true, freeTrial: false, popular: true, users: 1, storage: "Unlimited", features: ["Community edition", "Code search", "Cody free"] }],
  },
  {
    name: "ActiveCampaign", slug: "activecampaign", category: "marketing", color: "#9c3cff",
    tagline: "Marketing Automation", description: "Email marketing, automation and CRM rooted in customer lifetime value.",
    website: "https://activecampaign.com", startingPrice: 1500, freePlan: false, freeTrial: true,
    verified: true, aiPowered: true, featured: false, trending: false, popularity: 52, company: "ActiveCampaign", companySize: "501-1000", founded: 2003, headquarters: "Chicago, IL", rating: 4.4,
    pros: ["Great automation", "Strong segmentation", "Good value"], cons: ["Learning curve", "Support"],
    faq: [{ q: "Does ActiveCampaign have a free trial?", a: "Yes, a 14-day free trial." }],
    integrations: ["Salesforce", "Shopify", "WordPress", "Zapier", "Stripe"],
    features: [{ name: "Automations", description: "Visual journeys." }, { name: "Email", description: "Campaigns & broadcasts." }, { name: "CRM", description: "Sales tracking." }],
    pricing: [
      { planName: "Starter", monthly: 1500, annual: 1500, freePlan: false, freeTrial: true, popular: true, users: 1, storage: "1,000 contacts", features: ["Email marketing", "Automation", "Unlimited emails"] },
      { planName: "Plus", monthly: 4900, annual: 4900, freePlan: false, freeTrial: true, popular: false, users: 1, storage: "2,500 contacts", features: ["CRM apps", "Lead scoring", "Onboarding"] },
      { planName: "Pro", monthly: 8000, annual: 8000, freePlan: false, freeTrial: true, popular: false, users: 1, storage: "5,000 contacts", features: ["Predictive sending", "Attribution", "Custom"] },
    ],
  },
  {
    name: "Make", slug: "make", category: "automation", color: "#6d00cc",
    tagline: "Visual Automation", description: "Create complex automations with a drag-and-drop visual builder.",
    website: "https://make.com", startingPrice: 0, freePlan: true, freeTrial: true,
    verified: true, aiPowered: true, featured: true, trending: true, popularity: 70, company: "Make", companySize: "201-500", founded: 2014, headquarters: "Prague, Czechia", rating: 4.5,
    pros: ["Powerful scenarios", "Great pricing", "Visual builder"], cons: ["Learning curve", "Ops can get complex"],
    faq: [{ q: "Is Make free?", a: "Yes, with 1,000 operations/month." }],
    integrations: ["Google", "Slack", "Stripe", "OpenAI", "HubSpot"],
    features: [{ name: "Scenarios", description: "Visual automation." }, { name: "AI", description: "AI-powered scenarios." }, { name: "Integrations", description: "1,500+ apps." }],
    pricing: [
      { planName: "Free", monthly: 0, annual: 0, freePlan: true, freeTrial: false, popular: true, users: 1, storage: "Unlimited", features: ["1,000 ops/mo", "1,500 apps", "15-min interval"] },
      { planName: "Core", monthly: 902, annual: 902, freePlan: false, freeTrial: true, popular: false, users: 1, storage: "Unlimited", features: ["10,000 ops/mo", "1-min interval", "Priority"] },
      { planName: "Pro", monthly: 1875, annual: 1875, freePlan: false, freeTrial: true, popular: false, users: 1, storage: "Unlimited", features: ["100k ops/mo", "Custom", "Multi-region"] },
    ],
  },
  {
    name: "Toggl", slug: "toggl", category: "productivity", color: "#e57cd8",
    tagline: "Time Tracking", description: "Simple time tracking, reporting and project budgeting.",
    website: "https://toggl.com", startingPrice: 0, freePlan: true, freeTrial: true,
    verified: true, aiPowered: false, featured: false, trending: false, popularity: 55, company: "Toggl", companySize: "51-200", founded: 2006, headquarters: "Tallinn, Estonia", rating: 4.5,
    pros: ["Simple", "Free plan", "Reports"], cons: ["Basic invoicing", "Integrations paid"],
    faq: [{ q: "Is Toggl free?", a: "Yes, up to 5 users." }],
    integrations: ["Slack", "Jira", "Trello", "Asana", "Google"],
    features: [{ name: "Timer", description: "One-click tracking." }, { name: "Reports", description: "Team reporting." }, { name: "Billable", description: "Time-based billing." }],
    pricing: [
      { planName: "Free", monthly: 0, annual: 0, freePlan: true, freeTrial: false, popular: true, users: 5, storage: "Unlimited", features: ["5 users", "Time tracking", "Weekly reports"] },
      { planName: "Premium", monthly: 900, annual: 900, freePlan: false, freeTrial: true, popular: false, users: 1, storage: "Unlimited", features: ["Billable rates", "Estimates", "Alerts"] },
      { planName: "Business", monthly: 2000, annual: 2000, freePlan: false, freeTrial: true, popular: false, users: 1, storage: "Unlimited", features: ["Profitability", "Timesheets", "Locking"] },
    ],
  },
  {
    name: "Freshdesk", slug: "freshdesk", category: "customer-support", color: "#f2a336",
    tagline: "Helpdesk Software", description: "Customer support software that scales with your team.",
    website: "https://freshdesk.com", startingPrice: 0, freePlan: true, freeTrial: true,
    verified: true, aiPowered: true, featured: true, trending: false, popularity: 77, company: "Freshworks", companySize: "1000+", founded: 2010, headquarters: "Chennai, India", rating: 4.3,
    pros: ["Generous free plan", "Easy to use", "AI included"], cons: ["Limited customization", "Add-ons cost"],
    faq: [{ q: "Is Freshdesk free?", a: "Yes, the Growth plan includes 10 agents free." }],
    integrations: ["Salesforce", "Shopify", "Slack", "Zapier", "HubSpot"],
    features: [{ name: "Tickets", description: "Multi-channel support." }, { name: "AI", description: "Freddy AI agent." }, { name: "Knowledge", description: "Help center." }],
    pricing: [
      { planName: "Free", monthly: 0, annual: 0, freePlan: true, freeTrial: false, popular: true, users: 10, storage: "Unlimited", features: ["10 agents", "Email & social", "Tickets"] },
      { planName: "Growth", monthly: 1500, annual: 1500, freePlan: false, freeTrial: true, popular: false, users: 1, storage: "Unlimited", features: ["Automation", "SLA", "Knowledge base"] },
      { planName: "Pro", monthly: 4900, annual: 4900, freePlan: false, freeTrial: true, popular: false, users: 1, storage: "Unlimited", features: ["AI", "Custom roles", "Analytics"] },
      { planName: "Enterprise", monthly: 7900, annual: 7900, freePlan: false, freeTrial: true, popular: false, users: 1, storage: "Unlimited", features: ["Predictions", "Audit logs", "Dedicated"] },
    ],
  },
  {
    name: "Paddle", slug: "paddle", category: "finance", color: "#00c4b8",
    tagline: "Merchant of Record", description: "Sell software globally with Paddle handling tax, billing and compliance.",
    website: "https://paddle.com", startingPrice: 500, freePlan: true, freeTrial: true,
    verified: true, aiPowered: false, featured: false, trending: false, popularity: 50, company: "Paddle", companySize: "501-1000", founded: 2012, headquarters: "London, UK", rating: 4.4,
    pros: ["Global tax handled", "Easy checkout", "No repo setup"], cons: ["Fee %, not flat", "Payout timing"],
    faq: [{ q: "Is Paddle free?", a: "No monthly fee; 5% + $0.50 per transaction." }],
    integrations: ["Webflow", "Stripe", "Slack", "Zapier", "HubSpot"],
    features: [{ name: "Checkout", description: "Optimized conversions." }, { name: "Tax", description: "Global VAT/GST." }, { name: "Subscriptions", description: "Billing & dunning." }],
    pricing: [{ planName: "Standard", monthly: 500, annual: 500, freePlan: true, freeTrial: true, popular: true, users: 1, storage: "Unlimited", features: ["5% + $.50", "Global tax", "Subscriptions"] }],
  },
];
// Note: any tools here referencing categories not in list map fine (we use category slug).
// Ensure "sales-crm" category exists (it does). Entries with unknown categories fall back gracefully.

// ---------------------------------------------------------------------------
// Extra generated lightweight tools to populate the directory (scale)
// ---------------------------------------------------------------------------
const pluginAdjectives = ["Launch", "Swift", "Nova", "Bright", "Sky", "Nimbus", "Forge", "Vertex", "Orbit", "Pulse", "Lumen", "Nord", "Echo", "Ridge", "Stride", "Beacon", "Halcyon", "Cedar", "Cobalt", "Sage", "Quanta", "Vivid", "Apex", "Cadence", "Dune", "Flint", "Grove", "Halo", "Iris", "Jasper"];
const pluginNouns = ["Desk", "Flow", "Hub", "Stack", "Base", "Kit", "Grid", "Loop", "Spark", "Sync", "Trail", "Board", "Line", "Mark", "Note", "Pilot", "Port", "Quest", "Row", "Suite", "Track", "Vault", "Wave", "Zone", "View", "Task", "Team", "Mail", "Bots", "Ops"];
const pluginSuffix = ["Pro", "Suite", "Cloud", "HQ", "360", "One", "Lite", "Max", "Plus", "Community"];
function genToolName(i: number) {
  const a = pluginAdjectives[i % pluginAdjectives.length];
  const b = pluginNouns[(i * 7 + 3) % pluginNouns.length];
  const s = pluginSuffix[(i * 5) % pluginSuffix.length];
  return `${a}${b} ${s}`;
}
const genTaglines = ["Teams", "Business", "Growth", "Sales", "Support", "Marketing", "Workflow", "Ops", "Analytics", "Productivity"];
const genDescs = [
  "A modern tool to help teams work faster and stay organized.",
  "Everything you need to run your next campaign in one place.",
  "Built for growing businesses that want to move quickly.",
  "Streamline operations and automate repetitive busywork.",
  "Beautifully designed to keep your whole team on the same page.",
  "The simple, powerful way to manage your daily workflow.",
];

const allTools: ToolSeed[] = [...tools];
const catSlugs = categories.map((c) => c.slug);
const used = new Set(allTools.map((t) => t.slug));
function genTool(i: number): ToolSeed {
  const name = genToolName(i);
  let slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  if (used.has(slug)) slug = `${slug}-${i}`;
  used.add(slug);
  const cat = catSlugs[(i * 3 + 1) % catSlugs.length];
  const catDef = categories.find((c) => c.slug === cat)!;
  const tagline = genTaglines[(i * 13) % genTaglines.length];
  return {
    name: name.replace(/ (Pro|Suite|Cloud|HQ|360|One|Lite|Max|Plus|Community)$/, ""),
    slug, category: cat, color: catDef.color,
    tagline: `${tagline} Software`,
    description: genDescs[i % genDescs.length],
    website: `https://${slug}.example.com`,
    startingPrice: randomInt(0, 6000),
    freePlan: rand() > 0.4,
    freeTrial: rand() > 0.3,
    verified: rand() > 0.5,
    aiPowered: rand() > 0.6,
    featured: false,
    trending: rand() > 0.85,
    popularity: randomInt(5, 70),
    company: `${name.replace(/ (Pro|Suite|Cloud|HQ|360|One|Lite|Max|Plus|Community)$/, "")} Inc`,
    companySize: pick(["1-10", "11-50", "51-200", "201-500", "500+"]),
    founded: randomInt(2014, 2025),
    headquarters: pick(["New York, NY", "London, UK", "Berlin, Germany", "Austin, TX", "Toronto, Canada", "Sydney, Australia"]),
    rating: Math.round((3.6 + rand() * 1.3) * 10) / 10,
    pros: ["Easy to use", "Great support", "Integrates with your stack"],
    cons: ["No free plan", "Limited export"],
    faq: [{ q: "Is this tool good for small teams?", a: "Yes, it's designed for SMB teams." }],
    integrations: pickN(["Slack", "Gmail", "Google Drive", "Zapier", "Stripe", "HubSpot"], randomInt(2, 5)),
    features: [
      { name: "Core workflow", description: "Essential features for daily work." },
      { name: "Collaboration", description: "Work together in real time." },
      { name: "Reporting", description: "Actionable insights." },
    ],
    pricing: [
      { planName: "Free", monthly: 0, annual: 0, freePlan: true, freeTrial: false, popular: false, users: 1, storage: "1GB", features: ["Basic features", "Community support"] },
      { planName: "Pro", monthly: randomInt(800, 3000), annual: randomInt(640, 2400), freePlan: false, freeTrial: true, popular: true, users: 5, storage: "10GB", features: ["Unlimited features", "Priority support", "Integrations"] },
      { planName: "Business", monthly: randomInt(3000, 8000), annual: randomInt(2400, 6400), freePlan: false, freeTrial: true, popular: false, users: 25, storage: "100GB", features: ["Advanced security", "Automation", "Analytics"] },
    ],
  };
}
const GENERATED_COUNT = 1200;
for (let i = 0; i < GENERATED_COUNT; i++) allTools.push(genTool(i));

// ---------------------------------------------------------------------------
// Integrations
// ---------------------------------------------------------------------------
const integrationDefs: {
  slug: string; name: string; category: string; icon: string; color: string; desc: string; features: string[]; perms: string[]; popular: boolean;
}[] = [
  { slug: "stripe", name: "Stripe", category: "Payments", icon: "CreditCard", color: "#635bff", desc: "Accept payments and manage billing.", features: ["Payments", "Subscriptions", "Invoicing"], perms: ["read:payments", "write:payments"], popular: true },
  { slug: "google", name: "Google Workspace", category: "Cloud", icon: "Cloud", color: "#4285f4", desc: "Email, docs and calendars.", features: ["Gmail", "Drive", "Calendar"], perms: ["read:mail", "write:calendar"], popular: true },
  { slug: "gmail", name: "Gmail", category: "Communication", icon: "Mail", color: "#ea4335", desc: "Connect your inbox to workflows.", features: ["Email", "Labels", "Threads"], perms: ["read:mail", "send:mail"], popular: true },
  { slug: "slack", name: "Slack", category: "Communication", icon: "MessageSquare", color: "#611f69", desc: "Send notifications and messages.", features: ["Messages", "Channels", "Huddles"], perms: ["write:messages", "read:channels"], popular: true },
  { slug: "discord", name: "Discord", category: "Communication", icon: "MessagesSquare", color: "#5865f2", desc: "Community chat and alerts.", features: ["Messages", "Roles", "Bots"], perms: ["write:messages", "read:channels"], popular: false },
  { slug: "whatsapp", name: "WhatsApp Business", category: "Communication", icon: "MessageCircle", color: "#25d366", desc: "Business messaging at scale.", features: ["Chats", "Broadcasts", "Catalogs"], perms: ["read:chats", "write:chats"], popular: true },
  { slug: "shopify", name: "Shopify", category: "E-commerce", icon: "ShoppingCart", color: "#95bf47", desc: "Sync products, orders and customers.", features: ["Products", "Orders", "Customers"], perms: ["read:products", "write:orders"], popular: true },
  { slug: "woocommerce", name: "WooCommerce", category: "E-commerce", icon: "ShoppingBag", color: "#96588a", desc: "WordPress commerce integration.", features: ["Products", "Orders"], perms: ["read:products", "write:orders"], popular: false },
  { slug: "zapier", name: "Zapier", category: "Automation", icon: "Workflow", color: "#ff4f00", desc: "Connect 6,000+ apps with no code.", features: ["Zaps", "Tables", "Interfaces"], perms: ["read:zaps", "write:zaps"], popular: true },
  { slug: "hubspot", name: "HubSpot", category: "CRM", icon: "Target", color: "#ff7a59", desc: "Sync contacts and deals.", features: ["Contacts", "Deals", "Emails"], perms: ["read:crm", "write:crm"], popular: true },
  { slug: "salesforce", name: "Salesforce", category: "CRM", icon: "Briefcase", color: "#00a1e0", desc: "Enterprise CRM sync.", features: ["Leads", "Opportunities", "Cases"], perms: ["read:crm", "write:crm"], popular: true },
  { slug: "mailchimp", name: "Mailchimp", category: "Marketing", icon: "Mail", color: "#ffe01b", desc: "Email audiences and campaigns.", features: ["Audiences", "Campaigns", "Automation"], perms: ["read:audiences", "write:campaigns"], popular: false },
  { slug: "facebook", name: "Facebook", category: "Social", icon: "Facebook", color: "#1877f2", desc: "Pages, ads and messenger.", features: ["Pages", "Ads", "Messenger"], perms: ["read:pages", "write:pages"], popular: true },
  { slug: "instagram", name: "Instagram", category: "Social", icon: "Instagram", color: "#e1306c", desc: "Comments, DMs and analytics.", features: ["DMs", "Comments", "Media"], perms: ["read:dms", "write:dms"], popular: true },
  { slug: "tiktok", name: "TikTok", category: "Social", icon: "Music", color: "#000000", desc: "Short-form video marketing.", features: ["Videos", "Comments", "Analytics"], perms: ["read:media", "write:media"], popular: false },
  { slug: "x", name: "X (Twitter)", category: "Social", icon: "Twitter", color: "#1d9bf0", desc: "Tweets, threads and analytics.", features: ["Tweets", "DMs", "Analytics"], perms: ["read:tweets", "write:tweets"], popular: true },
  { slug: "openai", name: "OpenAI", category: "AI", icon: "Sparkles", color: "#10a37f", desc: "GPT, DALL·E and Whisper APIs.", features: ["Chat", "Images", "Transcription"], perms: ["read:ai", "write:ai"], popular: true },
  { slug: "googlecloud", name: "Google Cloud", category: "Cloud", icon: "Cloud", color: "#4285f4", desc: "Cloud compute and storage.", features: ["Compute", "Storage", "Database"], perms: ["read:cloud", "write:cloud"], popular: false },
  { slug: "aws", name: "AWS", category: "Cloud", icon: "Cloud", color: "#ff9900", desc: "Amazon cloud infrastructure.", features: ["S3", "Lambda", "EC2"], perms: ["read:cloud", "write:cloud"], popular: false },
  { slug: "github", name: "GitHub", category: "Developer", icon: "Code2", color: "#181717", desc: "Repos, issues and Actions.", features: ["Repos", "Issues", "Actions"], perms: ["read:repo", "write:repo"], popular: true },
  { slug: "figma", name: "Figma", category: "Design", icon: "PenTool", color: "#a855f7", desc: "Design files and prototypes.", features: ["Files", "Prototypes", "Comments"], perms: ["read:files", "write:comments"], popular: true },
  { slug: "notion", name: "Notion", category: "Productivity", icon: "FileText", color: "#0f172a", desc: "Pages, databases and docs.", features: ["Pages", "Databases", "Blocks"], perms: ["read:pages", "write:pages"], popular: true },
  { slug: "linear", name: "Linear", category: "Developer", icon: "ListTodo", color: "#5e6ad2", desc: "Issues and projects.", features: ["Issues", "Cycles", "Projects"], perms: ["read:issues", "write:issues"], popular: false },
  { slug: "vercel", name: "Vercel", category: "Developer", icon: "Rocket", color: "#000000", desc: "Deploy and monitor apps.", features: ["Deploys", "Domains", "Analytics"], perms: ["read:deploys", "write:deploys"], popular: true },
  { slug: "sentry", name: "Sentry", category: "Developer", icon: "Bug", color: "#fb4226", desc: "Error monitoring and tracing.", features: ["Errors", "Releases", "Performance"], perms: ["read:errors", "write:releases"], popular: false },
];

// ---------------------------------------------------------------------------
// Blog
// ---------------------------------------------------------------------------
const blogCategories = [
  { slug: "ai", name: "AI" }, { slug: "business", name: "Business" }, { slug: "marketing", name: "Marketing" },
  { slug: "saas", name: "SaaS" }, { slug: "productivity", name: "Productivity" }, { slug: "technology", name: "Technology" },
  { slug: "startups", name: "Startups" },
];
const blogPosts = [
  { slug: "best-crm-software-2026", title: "Best CRM Software in 2026", category: "saas", author: "PEAKLOOP Team", excerpt: "We tested 40 CRMs so you don't have to. Here are the best CRM tools for every team size and budget in 2026.", seoTitle: "The Best CRM Software in 2026 (Reviewed)", metaDescription: "The definitive guide to the best CRM software in 2026, compared by price, features and reviews.", tags: ["CRM", "Sales", "SaaS"], relatedTools: ["peak-crm", "hubspot", "salesforce", "pipedrive"], featured: true, content: "<h2>Why your team needs a CRM</h2><p>A CRM keeps every lead, deal and customer in one place...</p><h2>How we tested</h2><p>We evaluated pricing, ease of use, integrations and support.</p>" },
  { slug: "best-ai-writing-tools", title: "Best AI Writing Tools", category: "ai", author: "Maya Chen", excerpt: "From initial drafts to final polish, these AI writing tools save your team hours every week.", seoTitle: "Best AI Writing Tools 2026", metaDescription: "Compare the best AI writing tools for 2026.", tags: ["AI", "Writing", "Productivity"], relatedTools: ["openai", "notion"], featured: true, content: "<h2>The rise of AI writing</h2><p>AI writing tools have come a long way...</p>" },
  { slug: "best-project-management-software", title: "Best Project Management Software", category: "productivity", author: "Leo Martins", excerpt: "The right project management tool keeps teams aligned. We compare the top options.", seoTitle: "Best Project Management Software 2026", metaDescription: "Compare the best project management tools.", tags: ["Project Management", "Productivity", "Teams"], relatedTools: ["linear", "monday-com", "asana", "clickup"], featured: false, content: "<h2>Finding the right fit</h2><p>Every team works differently...</p>" },
  { slug: "how-to-choose-saas-stack", title: "How to Choose Your SaaS Stack", category: "business", author: "PEAKLOOP Team", excerpt: "A practical framework for selecting the software that powers your business.", seoTitle: "How to Choose Your SaaS Stack", metaDescription: "A framework for choosing your SaaS stack.", tags: ["SaaS", "Business", "Strategy"], relatedTools: ["notion", "slack", "stripe"], featured: false, content: "<h2>Start from your goals</h2><p>Your software stack should serve your goals...</p>" },
  { slug: "2026-saas-trends", title: "5 SaaS Trends to Watch in 2026", category: "technology", author: "Maya Chen", excerpt: "From AI agents to vertical SaaS, here's what's shaping software this year.", seoTitle: "5 SaaS Trends to Watch in 2026", metaDescription: "The SaaS trends defining 2026.", tags: ["Trends", "AI", "SaaS"], relatedTools: ["openai", "n8n", "make"], featured: true, content: "<h2>1. AI agents take over</h2><p>AI is moving from assistants to autonomous agents...</p>" },
  { slug: "email-marketing-guide", title: "The Complete Email Marketing Guide", category: "marketing", author: "Sofia Reyes", excerpt: "Improve open rates and conversions with proven email marketing strategies.", seoTitle: "The Complete Email Marketing Guide", metaDescription: "A complete guide to email marketing.", tags: ["Email", "Marketing"], relatedTools: ["mailchimp", "activecampaign", "hubspot"], featured: false, content: "<h2>Build your list</h2><p>Your email list is your most valuable asset...</p>" },
  { slug: "automation-for-startups", title: "Automation for Startups", category: "startups", author: "Leo Martins", excerpt: "How small teams can automate workflows and reclaim 20 hours a week.", seoTitle: "Automation for Startups", metaDescription: "How startups can automate workflows.", tags: ["Automation", "Startups", "Productivity"], relatedTools: ["zapier", "make", "n8n"], featured: false, content: "<h2>Start small</h2><p>Automation doesn't have to start with a full stack...</p>" },
  { slug: "convert-saas-leads", title: "How to Convert More SaaS Leads", category: "marketing", author: "Sofia Reyes", excerpt: "Proven tactics to turn more trial users into paying customers.", seoTitle: "How to Convert More SaaS Leads", metaDescription: "Tactics to convert SaaS leads.", tags: ["Sales", "Marketing", "SaaS"], relatedTools: ["hubspot", "salesforce", "intercom"], featured: false, content: "<h2>Understand your funnel</h2><p>Every conversion is a step in a journey...</p>" },
  { slug: "future-of-work-ai", title: "The Future of Work Is AI-Native", category: "technology", author: "Maya Chen", excerpt: "How AI-native tools are reshaping how businesses operate.", seoTitle: "The Future of Work Is AI-Native", metaDescription: "How AI-native tools reshape work.", tags: ["AI", "Future", "Work"], relatedTools: ["openai", "notion", "linear"], featured: false, content: "<h2>AI-native workflows</h2><p>The best tools are becoming AI-native...</p>" },
  { slug: "peakloop-launch", title: "Welcome to PEAKLOOP", category: "startups", author: "PEAKLOOP Team", excerpt: "Everything your business needs. Connected. Learn about our mission.", seoTitle: "Welcome to PEAKLOOP", metaDescription: "PEAKLOOP is the operating system for modern businesses.", tags: ["Announcement", "PEAKLOOP"], relatedTools: [], featured: true, content: "<h2>Discover. Connect. Automate. Grow.</h2><p>PEAKLOOP is the platform where businesses find and manage the software that powers them...</p>" },
];

// ---------------------------------------------------------------------------
// Deals
// ---------------------------------------------------------------------------
const dealDefs = [
  { toolSlug: "peak-crm", title: "PEAK CRM 40% OFF", discount: "40% OFF", original: 900, current: 540, coupon: "PEAK40", category: "Business", featured: true, days: 12, desc: "Save 40% on the Starter plan for the first year." },
  { toolSlug: "notion", title: "Notion Plus Deal", discount: "25% OFF", original: 1000, current: 750, coupon: "NOTION25", category: "Productivity", featured: true, days: 6, desc: "25% off Notion Plus for teams." },
  { toolSlug: "figma", title: "Figma Pro 20% OFF", discount: "20% OFF", original: 1500, current: 1200, coupon: "FIGMA20", category: "Design", featured: false, days: 20, desc: "20% off Figma Professional." },
  { toolSlug: "hubspot", title: "HubSpot Starter Bundle", discount: "30% OFF", original: 1500, current: 1050, coupon: "HUB30", category: "Marketing", featured: true, days: 3, desc: "30% off the HubSpot Starter bundle." },
  { toolSlug: "vercel", title: "Vercel Pro 15%", discount: "15% OFF", original: 2000, current: 1700, coupon: "VERCEL15", category: "Developer", featured: false, days: 9, desc: "15% off Vercel Pro for startups." },
  { toolSlug: "zapier", title: "Zapier Professional", discount: "50% OFF", original: 1966, current: 983, coupon: "ZAP50", category: "Automation", featured: true, days: 15, desc: "50% off your first 3 months." },
  { toolSlug: "mailchimp", title: "Mailchimp Essentials", discount: "10% OFF", original: 1300, current: 1170, coupon: "MAIL10", category: "Marketing", featured: false, days: 8, desc: "10% off Mailchimp Essentials." },
  { toolSlug: "bubble", title: "Bubble Starter 1yr", discount: "35% OFF", original: 2900, current: 1885, coupon: "BUBBLE35", category: "No-Code", featured: false, days: 30, desc: "35% off Bubble Starter for a full year." },
  { toolSlug: "n8n", title: "n8n Cloud 20%", discount: "20% OFF", original: 2000, current: 1600, coupon: "N8N20", category: "Automation", featured: true, days: 5, desc: "20% off n8n Cloud annual." },
];

// ---------------------------------------------------------------------------
// Users & business data
// ---------------------------------------------------------------------------
const firstNames = ["Ava", "Liam", "Mia", "Noah", "Emma", "Oliver", "Sophia", "Lucas", "Isla", "Mason", "Zoe", "Ethan", "Luna", "Leo", "Nora", "Kai", "Ivy", "Owen", "Ruby", "Finn"];
const lastNames = ["Brooks", "Chen", "Garcia", "Patel", "Kim", "Nguyen", "Silva", "Rossi", "Kowalski", "Anders", "Novak", "Fischer", "Dubois", "Tanaka", "Okafor", "Larsen", "Moreau", "Castillo", "Petrov", "Santos"];
const channelDefs = ["Instagram", "Facebook", "WhatsApp", "X", "TikTok", "Email", "Website"];
const companyNames = ["Northwind", "Acme", "Lumina", "Vertex", "Halcyon", "Brightline", "Cobalt", "Atlas", "Nimbus", "Quartz", "Bloom", "Ridgeway", "Sagewood", "Summit", "Juniper", "Harbor", "Oakmont", "Solstice", "Meridian", "Crescent"];

function genPerson() {
  return `${pick(firstNames)} ${pick(lastNames)}`;
}

export async function main() {
  const db = getDb();
  if (hasData()) {
    console.log("Database already seeded — skipping.");
    return;
  }
  console.log("Seeding PEAKLOOP...");

  const priceStmt = db.prepare(`INSERT INTO "ToolPricing" (id, toolId, planName, monthly, annual, freePlan, freeTrial, popular, users, storage, features, "order") VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`);

  // Categories
  const catIds: Record<string, string> = {};
  for (let i = 0; i < categories.length; i++) {
    const c = categories[i];
    catIds[c.slug] = `cat_${c.slug}`;
    db.prepare(`INSERT INTO "Category" (id, slug, name, description, icon, color, "order") VALUES (?,?,?,?,?,?,?)`).run(catIds[c.slug], c.slug, c.name, c.desc, c.icon, c.color, i);
  }

  // Tools
  const toolSlugToId: Record<string, string> = {};
  const toolRating: Record<string, number> = {};
  const toolCat: Record<string, string> = {};
  for (let i = 0; i < allTools.length; i++) {
    const t = allTools[i];
    const id = `tool_${i}`;
    toolSlugToId[t.slug] = id;
    toolRating[id] = t.rating ?? 4.2;
    const catId = catIds[t.category] ?? catIds["productivity"];
    toolCat[id] = catId;
    db.prepare(`INSERT INTO "Tool" (
      id, slug, name, tagline, description, longDescription, website, logo, color, categoryId,
      rating, reviewCount, startingPrice, freePlan, freeTrial, verified, aiPowered, featured, trending, popularity,
      releaseDate, companyName, companySize, founded, headquarters, pros, cons, faq, integrations, createdAt
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(
      id, t.slug, t.name, t.tagline, t.description, t.longDescription ?? t.description, t.website,
      t.name.replace(/[^a-zA-Z]/g, "").slice(0, 2).toUpperCase(), t.color, catId,
      0, 0, t.startingPrice, t.freePlan ? 1 : 0, t.freeTrial ? 1 : 0, t.verified ? 1 : 0, t.aiPowered ? 1 : 0, t.featured ? 1 : 0, t.trending ? 1 : 0, t.popularity,
      daysAgo(randomInt(30, 900)), t.company ?? t.name, t.companySize ?? "1-10", t.founded ?? 2020, t.headquarters ?? "",
      j(t.pros), j(t.cons), j(t.faq), j(t.integrations), daysAgo(randomInt(1, 900))
    );
    db.prepare(`INSERT OR IGNORE INTO "ToolCategory" (toolId, categoryId) VALUES (?,?)`).run(id, catId);
    for (let f = 0; f < (t.features ?? []).length; f++) {
      const feat = t.features[f];
      db.prepare(`INSERT INTO "ToolFeature" (id, toolId, name, description, "order") VALUES (?,?,?,?,?)`).run(`feat_${i}_${f}`, id, feat.name, feat.description, f);
    }
    for (let p = 0; p < (t.pricing ?? []).length; p++) {
      const pl = t.pricing[p];
      priceStmt.run(`price_${i}_${p}`, id, pl.planName, pl.monthly, pl.annual, pl.freePlan ? 1 : 0, pl.freeTrial ? 1 : 0, pl.popular ? 1 : 0, pl.users, pl.storage, j(pl.features), p);
    }
    for (let s = 0; s < 3; s++) {
      db.prepare(`INSERT INTO "ToolScreenshot" (id, toolId, url, caption) VALUES (?,?,?,?)`).run(`shot_${i}_${s}`, id, `https://picsum.photos/seed/${t.slug}${s}/1200/700`, `Screenshot ${s + 1}`);
    }
  }

  // Integrations
  for (let i = 0; i < integrationDefs.length; i++) {
    const ig = integrationDefs[i];
    db.prepare(`INSERT INTO "Integration" (id, slug, name, description, icon, color, category, features, permissions, popular) VALUES (?,?,?,?,?,?,?,?,?,?)`).run(
      `int_${i}`, ig.slug, ig.name, ig.desc, ig.icon, ig.color, ig.category, j(ig.features), j(ig.perms), ig.popular ? 1 : 0
    );
  }

  // Blog
  const blogCatIds: Record<string, string> = {};
  for (let i = 0; i < blogCategories.length; i++) {
    const bc = blogCategories[i];
    blogCatIds[bc.slug] = `bc_${bc.slug}`;
    db.prepare(`INSERT INTO "BlogCategory" (id, slug, name) VALUES (?,?,?)`).run(`bc_${bc.slug}`, bc.slug, bc.name);
  }
  for (let i = 0; i < blogPosts.length; i++) {
    const bp = blogPosts[i];
    db.prepare(`INSERT INTO "BlogPost" (id, slug, title, excerpt, content, coverImage, author, categoryId, tags, relatedTools, seoTitle, metaDescription, featured, published, publishedAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(
      `post_${i}`, bp.slug, bp.title, bp.excerpt, bp.content, `https://picsum.photos/seed/${bp.slug}/1200/600`, bp.author, blogCatIds[bp.category] ?? null, j(bp.tags), j(bp.relatedTools), bp.seoTitle, bp.metaDescription, bp.featured ? 1 : 0, 1, daysAgo(randomInt(1, 90))
    );
  }

  // Users
  const demoId = "user_demo";
  const adminId = "user_admin";
  const vendorId = "user_vendor";
  const user2Id = "user_sarah";
  const passwordHash = bcrypt.hashSync("password123", 10);
  db.prepare(`INSERT INTO "User" (id, name, email, emailVerified, image, passwordHash, role, accountType, createdAt) VALUES (?,?,?,?,?,?,?,?,?)`).run(demoId, "Ava Brooks", "demo@peakloop.app", daysAgo(30), null, passwordHash, "USER", "BUSINESS", daysAgo(30));
  db.prepare(`INSERT INTO "User" (id, name, email, emailVerified, passwordHash, role, accountType) VALUES (?,?,?,?,?,?,?)`).run(adminId, "PEAKLOOP Admin", "admin@peakloop.app", daysAgo(120), passwordHash, "ADMIN", "BUSINESS");
  db.prepare(`INSERT INTO "User" (id, name, email, emailVerified, passwordHash, role, accountType) VALUES (?,?,?,?,?,?,?)`).run(vendorId, "Leo Martins", "vendor@peakloop.app", daysAgo(60), passwordHash, "VENDOR", "BUSINESS");
  db.prepare(`INSERT INTO "User" (id, name, email, emailVerified, passwordHash, role, accountType) VALUES (?,?,?,?,?,?,?)`).run(user2Id, "Sarah Nguyen", "sarah@peakloop.app", daysAgo(20), passwordHash, "USER", "PERSONAL");
  // Extra reviewer users so reviews have distinct authors
  const reviewerDefs = [
    ["u_ext", "Ethan Anders", "ethan@example.com"], ["u_priya", "Priya Patel", "priya@example.com"],
    ["u_tom", "Tom Okafor", "tom@example.com"], ["u_nina", "Nina Dubois", "nina@example.com"],
    ["u_omar", "Omar Farah", "omar@example.com"], ["u_lucy", "Lucy Zhao", "lucy@example.com"],
    ["u_ken", "Kenji Mori", "kenji@example.com"],
  ];
  for (const [rid, rname, remail] of reviewerDefs) {
    db.prepare(`INSERT INTO "User" (id, name, email, emailVerified, passwordHash, role, accountType) VALUES (?,?,?,?,?,?,?)`).run(rid, rname, remail, daysAgo(randomInt(5, 90)), passwordHash, "USER", "PERSONAL");
  }

  // Organizations + team
  const orgId = "org_peakloop";
  const org2Id = "org_northstar";
  db.prepare(`INSERT INTO "Organization" (id, name, industry, teamSize, primaryGoal) VALUES (?,?,?,?,?)`).run(orgId, "Peakworks Studio", "Software", "11-50", "Scale SaaS revenue");
  db.prepare(`INSERT INTO "Organization" (id, name, industry, teamSize, primaryGoal) VALUES (?,?,?,?,?)`).run(org2Id, "Northstar Agency", "Marketing", "1-10", "Grow client retention");
  const teams = [
    { org: orgId, user: demoId, role: "OWNER" }, { org: orgId, user: user2Id, role: "MANAGER" },
    { org: org2Id, user: user2Id, role: "OWNER" }, { org: org2Id, user: demoId, role: "ADMIN" },
  ];
  for (const tm of teams) {
    db.prepare(`INSERT INTO "TeamMember" (id, organizationId, userId, role, permissions, status) VALUES (?,?,?,?,?,?)`).run(
      `tm_${tm.org}_${tm.user}`, tm.org, tm.user, tm.role, j({ crm: ["view", "create", "edit"], analytics: ["view"], orders: ["view", "create"] }), "ACTIVE"
    );
  }

  // Vendor + listing
  db.prepare(`INSERT INTO "Vendor" (id, userId, companyName, website, description) VALUES (?,?,?,?,?)`).run("vendor_1", vendorId, "PEAKLOOP", "https://peakloop.app", "The operating system for modern businesses.");
  db.prepare(`INSERT INTO "VendorListing" (id, vendorId, toolId, status, message, submittedAt, reviewedAt, views, clicks, conversions, favorites) VALUES (?,?,?,?,?,?,?,?,?,?,?)`).run(
    "vl_1", "vendor_1", toolSlugToId["peak-crm"] ?? "", "APPROVED", "", daysAgo(20), daysAgo(15), 2450, 980, 145, 820
  );

  // Reviews
  const demoUsers = [demoId, user2Id, adminId, "u_ext", "u_priya", "u_tom", "u_nina", "u_omar", "u_lucy", "u_ken"];
  const reviewTexts = [
    "This tool has been a game changer for our team. The automation saves us hours every single week.",
    "Great value for the price. Setup was quick and support was responsive when we needed help.",
    "We switched from a more expensive option and haven't looked back. Highly recommended.",
    "Powerful but there's a learning curve. Once you get it though, it's indispensable.",
    "The best part is the integrations — everything just works together seamlessly.",
    "Solid product. The dashboard is clean and the reporting is genuinely useful for decision-making.",
    "Reliable and fast. It became part of our daily workflow within a week.",
    "Customer support was fantastic when migrating our data. Really impressed.",
    "Does exactly what it promises. The free plan is generous for getting started.",
    "We scaled from 3 to 40 seats and it kept up without a hitch.",
  ];
  const reviewTitles = ["Essential for our workflow", "Great value", "Highly recommend", "Powerful and polished", "Exceeded expectations", "What a time saver", "Solid and reliable", "Best in class", "Easy to adopt", "Worth every penny"];
  let reviewIdx = 0;
  const reviewCounts: Record<string, number> = {};
  for (const slug in toolSlugToId) {
    const toolId = toolSlugToId[slug];
    const nReviews = allTools.some((x) => x.slug === slug && (x.featured || x.rating)) ? randomInt(14, 48) : randomInt(0, 3);
    reviewCounts[toolId] = nReviews;
    for (let r = 0; r < nReviews; r++) {
      const uid = pick(demoUsers);
      const base = toolRating[toolId];
      const rating = Math.min(5, Math.max(1, Math.round(base + (rand() - 0.5) * 1.6)));
      const verified = rand() > 0.3;
      const status = rand() > 0.12 ? "APPROVED" : "PENDING";
      const useCase = pick(["CRM", "Marketing", "Operations", "Finance", "Support", "Product"]);
      db.prepare(`INSERT INTO "Review" (id, userId, toolId, rating, title, content, pros, cons, useCase, companySize, verificationType, verified, status, helpfulCount, createdAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(
        `rev_${reviewIdx}`, uid, toolId, rating, pick(reviewTitles), pick(reviewTexts),
        j(["Easy onboarding", "Clean UI", "Great support"]), j(["Pricing", "Limited export"]), useCase,
        pick(["1-10", "11-50", "51-200", "201-500"]),
        verified ? pick(["Verified User", "Verified Purchase", "Business User"]) : "", verified ? 1 : 0,
        status, randomInt(0, 80), daysAgo(randomInt(0, 400))
      );
      reviewIdx++;
    }
  }
  for (const toolId in reviewCounts) {
    db.prepare(`UPDATE "Tool" SET rating = ?, reviewCount = ? WHERE id = ?`).run(toolRating[toolId], reviewCounts[toolId], toolId);
  }

  // Deals
  for (let i = 0; i < dealDefs.length; i++) {
    const d = dealDefs[i];
    db.prepare(`INSERT INTO "Deal" (id, toolId, title, description, discount, originalPrice, currentPrice, coupon, url, category, expiresAt, active, featured) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(
      `deal_${i}`, toolSlugToId[d.toolSlug] ?? null, d.title, d.desc, d.discount, d.original, d.current, d.coupon, `https://peakloop.app/deals`, d.category, daysAhead(d.days), 1, d.featured ? 1 : 0
    );
  }

  // Subscriptions
  const subDefs = [
    { name: "Notion", logo: "NW", color: "#0f172a", monthly: 1000, yearly: 8000, cycle: "MONTHLY", renewal: daysAhead(11), category: "Productivity" },
    { name: "Figma", logo: "FG", color: "#a855f7", monthly: 1500, yearly: 12000, cycle: "MONTHLY", renewal: daysAhead(17), category: "Design" },
    { name: "GitHub", logo: "GH", color: "#181717", monthly: 400, yearly: 4800, cycle: "MONTHLY", renewal: daysAhead(24), category: "Developer Tools" },
    { name: "Stripe", logo: "ST", color: "#635bff", monthly: 0, yearly: 0, cycle: "MONTHLY", renewal: daysAhead(1), category: "Finance" },
    { name: "Linear", logo: "LN", color: "#5e6ad2", monthly: 800, yearly: 7680, cycle: "MONTHLY", renewal: daysAhead(5), category: "Project Management" },
    { name: "Slack", logo: "SL", color: "#611f69", monthly: 875, yearly: 8400, cycle: "MONTHLY", renewal: daysAhead(30), category: "Communication" },
    { name: "Zapier", logo: "ZP", color: "#ff4f00", monthly: 1966, yearly: 18876, cycle: "MONTHLY", renewal: daysAhead(9), category: "Automation" },
    { name: "OCR", logo: "OC", color: "#10b981", monthly: 600, yearly: 6000, cycle: "MONTHLY", renewal: daysAhead(2), category: "Productivity" },
  ];
  for (let i = 0; i < subDefs.length; i++) {
    const s = subDefs[i];
    db.prepare(`INSERT INTO "Subscription" (id, userId, name, logo, color, priceMonthly, priceYearly, billingCycle, renewalDate, category, active, createdAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`).run(
      `sub_${i}`, demoId, s.name, s.logo, s.color, s.monthly, s.yearly, s.cycle, s.renewal, s.category, 1, daysAgo(randomInt(10, 200))
    );
  }

  // Notifications
  const notifDefs = [
    { title: "Price drop on Notion", body: "Notion Plus is now 25% off — save $3/month.", type: "PRICE_DROP", link: "/deals", read: false },
    { title: "Subscription renewal soon", body: "Your PEAK CRM subscription renews in 5 days.", type: "RENEWAL", link: "/dashboard/subscriptions", read: false },
    { title: "New review on PEAK CRM", body: "A new 5-star review was posted for PEAK CRM.", type: "REVIEW", link: "/tools/peak-crm", read: false },
    { title: "CRM task assigned", body: "Follow up with Acme Inc — Proposal stage.", type: "CRM", link: "/dashboard/crm", read: false },
    { title: "New order via Instagram", body: "Order #1024 for 2 blue shirts ($40) received.", type: "ORDER", link: "/dashboard/orders", read: false },
    { title: "Support ticket opened", body: "Ticket #2041 needs triage.", type: "SUPPORT", link: "/dashboard/support", read: true },
    { title: "Welcome to PEAKLOOP", body: "Complete your setup and personalize recommendations.", type: "SYSTEM", link: "/dashboard/overview", read: true },
    { title: "Security check passed", body: "Your account security is excellent.", type: "SECURITY", link: "/dashboard/security", read: false },
  ];
  for (let i = 0; i < notifDefs.length; i++) {
    const n = notifDefs[i];
    db.prepare(`INSERT INTO "Notification" (id, userId, title, body, type, link, read, createdAt) VALUES (?,?,?,?,?,?,?,?)`).run(
      `notif_${i}`, demoId, n.title, n.body, n.type, n.link, n.read ? 1 : 0, daysAgo(randomInt(0, 8))
    );
  }

  // Favorites + comparison
  const favSlugs = ["peak-crm", "figma", "notion", "linear", "stripe", "zapier"];
  for (let i = 0; i < favSlugs.length; i++) {
    db.prepare(`INSERT INTO "Favorite" (id, userId, toolId, createdAt) VALUES (?,?,?,?)`).run(`fav_${i}`, demoId, toolSlugToId[favSlugs[i]], daysAgo(randomInt(1, 40)));
  }
  db.prepare(`INSERT INTO "Comparison" (id, userId, tools, createdAt) VALUES (?,?,?,?)`).run(`cmp_1`, demoId, j(["peak-crm", "hubspot", "salesforce"]), daysAgo(3));

  // CRM data
  const contactNames = ["Jordan Lee", "Priya Patel", "Tom Okafor", "Lena Fischer", "Marco Rossi", "Hana Tanaka", "Eli Novak", "Nina Dubois", "Owen Peters", "Ruby Santos"];
  for (let i = 0; i < contactNames.length; i++) {
    db.prepare(`INSERT INTO "CRMContact" (id, userId, name, email, phone, company, title, tags, notes, createdAt, updatedAt) VALUES (?,?,?,?,?,?,?,?,?,?,?)`).run(
      `ct_${i}`, demoId, contactNames[i], contactNames[i].split(" ")[0].toLowerCase() + "@example.com", "+1-555-" + (1000 + i), pick(companyNames), pick(["CEO", "CMO", "CTO", "Founder", "Manager"]), j(pickN(["hot", "lead", "vip", "partner"], 2)), "Interested in enterprise plan.", daysAgo(randomInt(1, 90)), daysAgo(randomInt(1, 90))
    );
  }
  for (let i = 0; i < 6; i++) {
    db.prepare(`INSERT INTO "CRMCompany" (id, userId, name, industry, size, website, notes, createdAt) VALUES (?,?,?,?,?,?,?,?)`).run(
      `cc_${i}`, demoId, companyNames[i], pick(["Software", "Marketing", "Finance", "Retail"]), pick(["1-10", "11-50", "51-200", "201-500"]), `https://${companyNames[i].toLowerCase()}.com`, "Priority account.", daysAgo(randomInt(1, 90))
    );
  }
  const stages = ["Lead", "Qualified", "Proposal", "Negotiation", "Won", "Lost"];
  for (let i = 0; i < 14; i++) {
    const stage = stages[i % stages.length];
    const value = randomInt(500, 15000) * 100;
    db.prepare(`INSERT INTO "CRMLead" (id, userId, name, email, phone, source, score, stage, value, owner, notes, createdAt, updatedAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(
      `ld_${i}`, demoId, genPerson(), genPerson().split(" ")[0].toLowerCase() + "@example.com", "+1-555-" + (2000 + i), pick(["Website", "Referral", "LinkedIn", "Ads", "Email"]), randomInt(20, 95), stage, value, pick(["Ava Brooks", "Sarah Nguyen", "Leo Martins"]), "Nurturing.", daysAgo(randomInt(1, 80)), daysAgo(randomInt(0, 30))
    );
  }
  for (let i = 0; i < 12; i++) {
    const stage = stages[Math.floor(rand() * 5)];
    db.prepare(`INSERT INTO "CRMDeal" (id, userId, title, stage, value, contact, probability, owner, notes, closeDate, createdAt, updatedAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`).run(
      `dl_${i}`, demoId, `${pick(["Enterprise", "Pro", "Growth", "Lifetime", "Annual"])} plan — ${pick(companyNames)}`, stage, randomInt(1000, 30000) * 100, genPerson(), randomInt(20, 90), pick(["Ava Brooks", "Sarah Nguyen", "Leo Martins"]), "", daysAhead(randomInt(10, 90)), daysAgo(randomInt(1, 70)), daysAgo(randomInt(0, 20))
    );
  }
  const taskDefs = [
    { title: "Follow up with Acme Inc", type: "CALL", due: daysAhead(1) },
    { title: "Send proposal to Lumina", type: "EMAIL", due: daysAhead(2) },
    { title: "Demo with Northwind", type: "MEETING", due: daysAhead(3) },
    { title: "Update Q3 forecast", type: "TASK", due: daysAhead(5) },
    { title: "Review renewal for Vertex", type: "TASK", due: daysAhead(4) },
    { title: "Close Brightline deal", type: "CALL", due: daysAhead(6) },
    { title: "Prepare pricing deck", type: "TASK", due: daysAhead(7) },
    { title: "Intro call with Halcyon", type: "MEETING", due: daysAhead(2) },
  ];
  for (let i = 0; i < taskDefs.length; i++) {
    const t = taskDefs[i];
    db.prepare(`INSERT INTO "CRMTask" (id, userId, title, type, done, due, relatedTo, createdAt) VALUES (?,?,?,?,?,?,?,?)`).run(
      `task_${i}`, demoId, t.title, t.type, rand() > 0.7 ? 1 : 0, t.due, pick(companyNames), daysAgo(randomInt(1, 30))
    );
  }

  // Support
  const ticketDefs = [
    { subject: "Cannot connect Stripe account", status: "OPEN", priority: "HIGH", tags: ["bug", "payments"], assignee: "Ava Brooks" },
    { subject: "How to export CRM contacts?", status: "IN_PROGRESS", priority: "NORMAL", tags: ["question", "crm"], assignee: "Lena Fischer" },
    { subject: "Request: bulk email feature", status: "WAITING", priority: "LOW", tags: ["feature"], assignee: "" },
    { subject: "Login issues after password reset", status: "RESOLVED", priority: "HIGH", tags: ["auth"], assignee: "Support Bot" },
    { subject: "Invoice billing cycle mismatch", status: "CLOSED", priority: "NORMAL", tags: ["billing"], assignee: "Tomas Silva" },
    { subject: "AI assistant not answering", status: "OPEN", priority: "URGENT", tags: ["ai"], assignee: "" },
    { subject: "Add team member permissions", status: "WAITING", priority: "NORMAL", tags: ["team"], assignee: "Nina Dubois" },
  ];
  for (let i = 0; i < ticketDefs.length; i++) {
    const t = ticketDefs[i];
    db.prepare(`INSERT INTO "SupportTicket" (id, userId, subject, status, priority, tags, assignee, createdAt, updatedAt) VALUES (?,?,?,?,?,?,?,?,?)`).run(
      `tkt_${i}`, demoId, t.subject, t.status, t.priority, j(t.tags), t.assignee, daysAgo(randomInt(1, 20)), daysAgo(randomInt(0, 5))
    );
    db.prepare(`INSERT INTO "SupportMessage" (id, ticketId, author, body, fromAi, createdAt) VALUES (?,?,?,?,?,?)`).run(
      `msg_${i}_1`, `tkt_${i}`, t.assignee || "Customer", "Hi, I'm experiencing an issue with this. Can you help?", 0, daysAgo(randomInt(1, 20))
    );
    db.prepare(`INSERT INTO "SupportMessage" (id, ticketId, author, body, fromAi, createdAt) VALUES (?,?,?,?,?,?)`).run(
      `msg_${i}_2`, `tkt_${i}`, "PEAK AI", "I've reviewed your ticket. Let me draft a suggested response for you.", 1, daysAgo(randomInt(1, 19))
    );
  }

  // Social accounts
  const socialDefs = [
    { platform: "Instagram", handle: "@peakworks", followers: 12400, connected: true },
    { platform: "Facebook", handle: "Peakworks Studio", followers: 8900, connected: true },
    { platform: "WhatsApp", handle: "+1 (555) 010-1010", followers: 0, connected: true },
    { platform: "X", handle: "@peakworks", followers: 3200, connected: true },
    { platform: "TikTok", handle: "@peakworks", followers: 21000, connected: true },
  ];
  for (let i = 0; i < socialDefs.length; i++) {
    const s = socialDefs[i];
    db.prepare(`INSERT INTO "SocialAccount" (id, userId, platform, handle, connected, followers, createdAt) VALUES (?,?,?,?,?,?,?)`).run(
      `sa_${i}`, demoId, s.platform, s.handle, s.connected ? 1 : 0, s.followers, daysAgo(randomInt(30, 300))
    );
  }

  // Products
  const productDefs = [
    { name: "Blue Shirt", sku: "BLUE-SHIRT", price: 2000, cost: 800, stock: 42, category: "Apparel" },
    { name: "White Tee", sku: "WHT-TEE", price: 1500, cost: 600, stock: 18, category: "Apparel" },
    { name: "Logo Hoodie", sku: "LOGO-HD", price: 4500, cost: 1800, stock: 7, category: "Apparel" },
    { name: "Sticker Pack", sku: "STK-PACK", price: 500, cost: 100, stock: 200, category: "Merch" },
    { name: "Mug", sku: "MUG-01", price: 1200, cost: 300, stock: 55, category: "Merch" },
    { name: "Cap", sku: "CAP-01", price: 1800, cost: 700, stock: 23, category: "Apparel" },
  ];
  for (let i = 0; i < productDefs.length; i++) {
    const p = productDefs[i];
    db.prepare(`INSERT INTO "Product" (id, userId, name, sku, price, cost, stock, image, category, createdAt) VALUES (?,?,?,?,?,?,?,?,?,?)`).run(
      `prod_${i}`, demoId, p.name, p.sku, p.price, p.cost, p.stock, `https://picsum.photos/seed/${p.sku}/400/400`, p.category, daysAgo(randomInt(10, 90))
    );
  }
  for (let i = 0; i < 12; i++) {
    const total = randomInt(2, 6) * 1000;
    const status = pick(["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"]);
    const items = j([{ name: pick(["Blue Shirt", "White Tee", "Hoodie", "Cap"]), qty: randomInt(1, 3), price: randomInt(500, 4500) }]);
    db.prepare(`INSERT INTO "Order" (id, userId, customer, status, total, channel, paymentStatus, items, createdAt, updatedAt) VALUES (?,?,?,?,?,?,?,?,?,?)`).run(
      `ord_${i}`, demoId, genPerson(), status, total, pick(channelDefs), status === "PAID" || status === "DELIVERED" || status === "SHIPPED" ? "PAID" : "PENDING", items, daysAgo(randomInt(1, 60)), daysAgo(randomInt(0, 30))
    );
  }
  for (let i = 0; i < 10; i++) {
    db.prepare(`INSERT INTO "Customer" (id, userId, name, email, phone, channel, createdAt, updatedAt) VALUES (?,?,?,?,?,?,?,?)`).run(
      `cust_${i}`, demoId, genPerson(), genPerson().split(" ")[0].toLowerCase() + "@gmail.com", "+1-555-" + (3000 + i), pick(channelDefs), daysAgo(randomInt(1, 80)), daysAgo(randomInt(0, 40))
    );
  }

  // Automations
  const autoDefs = [
    { name: "New customer onboarding", desc: "When a new customer is created, add to CRM, send welcome email, create task.", triggers: ["New customer created"], actions: ["Add customer to CRM", "Send welcome email", "Create follow-up task", "Notify sales team"] },
    { name: "Abandoned cart recovery", desc: "When a cart dies, send reminder email.", triggers: ["Cart abandoned"], actions: ["Send reminder email", "Create task", "Notify owner"] },
    { name: "Support ticket triage", desc: "When a ticket is created, tag it and assign an agent.", triggers: ["Ticket created"], actions: ["Tag ticket", "Assign agent", "Send AI reply"] },
    { name: "Social order flow", desc: "When a social DM order is received, create order and update inventory.", triggers: ["Social DM order"], actions: ["Create order", "Update inventory", "Add customer", "Send confirmation"] },
    { name: "Lead scoring update", desc: "When a lead is added, score it and route to sales.", triggers: ["Lead created"], actions: ["Score lead", "Route to sales", "Notify manager"] },
  ];
  for (let i = 0; i < autoDefs.length; i++) {
    const a = autoDefs[i];
    const id = `auto_${i}`;
    db.prepare(`INSERT INTO "Automation" (id, userId, name, description, active, runs, createdAt) VALUES (?,?,?,?,?,?,?)`).run(
      id, demoId, a.name, a.desc, rand() > 0.2 ? 1 : 0, randomInt(20, 900), daysAgo(randomInt(5, 90))
    );
    for (let t = 0; t < a.triggers.length; t++) {
      db.prepare(`INSERT INTO "AutomationTrigger" (id, automationId, type, value, "order") VALUES (?,?,?,?,?)`).run(`atrg_${i}_${t}`, id, a.triggers[t], "", t);
    }
    for (let ac = 0; ac < a.actions.length; ac++) {
      db.prepare(`INSERT INTO "AutomationAction" (id, automationId, type, value, "order") VALUES (?,?,?,?,?)`).run(`aact_${i}_${ac}`, id, a.actions[ac], "", ac);
    }
  }

  // API keys, webhooks, usage
  db.prepare(`INSERT INTO "APIKey" (id, userId, name, key, prefix, permissions, lastUsed, revoked, createdAt) VALUES (?,?,?,?,?,?,?,?,?)`).run(
    "api_1", demoId, "Production", "pl_live_" + Buffer.from(Math.random().toString(36).slice(2)).toString("hex").slice(0, 24), "pl_live_", j(["read:tools", "read:deals", "write:inbox"]), daysAgo(1), 0, daysAgo(40)
  );
  db.prepare(`INSERT INTO "APIKey" (id, userId, name, key, prefix, permissions, lastUsed, revoked, createdAt) VALUES (?,?,?,?,?,?,?,?,?)`).run(
    "api_2", demoId, "Staging", "pl_test_" + Buffer.from(Math.random().toString(36).slice(2)).toString("hex").slice(0, 24), "pl_test_", j(["read:tools"]), daysAgo(3), 0, daysAgo(30)
  );
  db.prepare(`INSERT INTO "Webhook" (id, userId, url, events, secret, active, lastDelivery, createdAt) VALUES (?,?,?,?,?,?,?,?)`).run(
    "wh_1", demoId, "https://example.com/hooks/peakloop", j(["price_drop", "order.created"]), Buffer.from(Math.random().toString(36)).toString("hex").slice(0, 32), 1, daysAgo(1), daysAgo(40)
  );
  const endpoints = ["/api/v1/tools", "/api/v1/tools/peak-crm", "/api/v1/categories", "/api/v1/reviews", "/api/v1/deals", "/api/v1/tools/notion"];
  for (let i = 0; i < 200; i++) {
    db.prepare(`INSERT INTO "UsageRecord" (id, userId, endpoint, method, status, latency, createdAt) VALUES (?,?,?,?,?,?,?)`).run(
      `ur_${i}`, demoId, pick(endpoints), pick(["GET", "POST", "GET", "GET"]), pick([200, 200, 200, 201, 404]), randomInt(20, 400), daysAgo(randomInt(0, 30))
    );
  }

  // Payments & invoices
  const planDefs = ["FREE", "PRO", "BUSINESS"];
  for (let i = 0; i < 6; i++) {
    const plan = planDefs[i % planDefs.length];
    db.prepare(`INSERT INTO "Payment" (id, userId, amount, currency, status, plan, provider, providerId, createdAt) VALUES (?,?,?,?,?,?,?,?,?)`).run(
      `pay_${i}`, demoId, plan === "FREE" ? 0 : plan === "PRO" ? 900 : 2900, "usd", i === 4 ? "REFUNDED" : "SUCCEEDED", plan, "stripe", "pi_" + i, daysAgo(randomInt(1, 90))
    );
  }
  for (let i = 0; i < 4; i++) {
    db.prepare(`INSERT INTO "Invoice" (id, userId, number, amount, currency, status, dueDate, createdAt) VALUES (?,?,?,?,?,?,?,?)`).run(
      `inv_${i}`, demoId, `INV-2026-${1000 + i}`, [900, 2900, 900, 2900][i], "usd", "PAID", daysAhead(randomInt(5, 25)), daysAgo(randomInt(5, 60))
    );
  }

  // Audit logs
  const auditDefs = [
    { action: "USER.LOGIN", entity: "User", entityId: demoId },
    { action: "TOOL.FAVORITE_ADDED", entity: "Tool", entityId: toolSlugToId["figma"] },
    { action: "SUBSCRIPTION.CREATED", entity: "Subscription", entityId: "sub_0" },
    { action: "TICKET.UPDATED", entity: "SupportTicket", entityId: "tkt_0" },
    { action: "CRM.DEAL.STAGE_CHANGED", entity: "CRMDeal", entityId: "dl_0" },
    { action: "APIKEY.CREATED", entity: "APIKey", entityId: "api_1" },
    { action: "ORDER.CREATED", entity: "Order", entityId: "ord_0" },
  ];
  for (let i = 0; i < auditDefs.length; i++) {
    const a = auditDefs[i];
    db.prepare(`INSERT INTO "AuditLog" (id, userId, action, entity, entityId, ip, metadata, createdAt) VALUES (?,?,?,?,?,?,?,?)`).run(
      `audit_${i}`, demoId, a.action, a.entity, a.entityId, "127.0.0.1", j({ ua: "Seeded" }), daysAgo(randomInt(0, 30))
    );
  }

  console.log(`Seeded ${categories.length} categories, ${allTools.length} tools, ${reviewIdx} reviews, ${dealDefs.length} deals, ${blogPosts.length} posts.`);
}

if (typeof require !== "undefined" && require.main === module) {
  main().catch((e) => { console.error(e); process.exit(1); });
}
