import type { Row } from "@/lib/db";

export interface User {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: string; // USER | VENDOR | ADMIN
  accountType: string; // PERSONAL | BUSINESS
  emailVerified: string | null;
  createdAt: string;
  twoFactorEnabled?: boolean;
}

export interface Tool {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  longDescription: string;
  website: string;
  logo: string;
  color: string;
  categoryId: string;
  category?: Category;
  categoryName?: string;
  categorySlug?: string;
  rating: number;
  reviewCount: number;
  startingPrice: number;
  freePlan: boolean;
  freeTrial: boolean;
  verified: boolean;
  aiPowered: boolean;
  featured: boolean;
  trending: boolean;
  popularity: number;
  releaseDate: string;
  companyName: string;
  companySize: string;
  founded: number | null;
  headquarters: string;
  pros: string[];
  cons: string[];
  faq: { q: string; a: string }[];
  integrations: string[];
  features?: ToolFeature[];
  pricing?: ToolPricing[];
  screenshots?: ToolScreenshot[];
  reviews?: Review[];
}

export interface ToolFeature {
  id: string;
  name: string;
  description: string;
}

export interface ToolPricing {
  id: string;
  planName: string;
  monthly: number;
  annual: number;
  freePlan: boolean;
  freeTrial: boolean;
  popular: boolean;
  users: number;
  storage: string;
  features: string[];
}

export interface ToolScreenshot {
  id: string;
  url: string;
  caption: string;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  order: number;
  toolCount?: number;
}

export interface Review {
  id: string;
  toolId: string;
  userId: string;
  rating: number;
  title: string;
  content: string;
  pros: string[];
  cons: string[];
  useCase: string;
  companySize: string;
  verificationType: string;
  verified: boolean;
  status: string;
  helpfulCount: number;
  createdAt: string;
  user?: { name: string; image?: string | null };
  toolName?: string;
  toolSlug?: string;
  toolLogo?: string;
  toolColor?: string;
}

export interface Deal {
  id: string;
  toolId: string | null;
  toolSlug?: string | null;
  toolName?: string | null;
  toolLogo?: string | null;
  toolColor?: string | null;
  title: string;
  description: string;
  discount: string;
  originalPrice: number;
  currentPrice: number;
  coupon: string;
  url: string;
  category: string;
  expiresAt: string | null;
  active: boolean;
  featured: boolean;
  createdAt: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  author: string;
  categoryId: string | null;
  categoryName?: string;
  categorySlug?: string;
  tags: string[];
  relatedTools: string[];
  seoTitle: string;
  metaDescription: string;
  featured: boolean;
  publishedAt: string;
  createdAt: string;
}

export interface Integration {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  category: string;
  features: string[];
  permissions: string[];
  popular: boolean;
}

export interface Subscription {
  id: string;
  name: string;
  logo: string;
  color: string;
  priceMonthly: number;
  priceYearly: number;
  billingCycle: string;
  renewalDate: string | null;
  category: string;
  active: boolean;
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  type: string;
  link: string;
  read: boolean;
  createdAt: string;
}

export interface CRMDeal {
  id: string;
  title: string;
  stage: string;
  value: number;
  contact: string;
  probability: number;
  owner: string;
  closeDate: string | null;
}

export interface CRMLead {
  id: string;
  name: string;
  email: string;
  source: string;
  score: number;
  stage: string;
  value: number;
  owner: string;
  createdAt: string;
}

export interface CRMTask {
  id: string;
  title: string;
  type: string;
  done: boolean;
  due: string | null;
}

export interface SupportTicket {
  id: string;
  subject: string;
  status: string;
  priority: string;
  tags: string[];
  assignee: string;
  createdAt: string;
  messages?: SupportMessage[];
}

export interface SupportMessage {
  id: string;
  author: string;
  body: string;
  fromAi: boolean;
  createdAt: string;
}

export interface Order {
  id: string;
  customer: string;
  status: string;
  total: number;
  channel: string;
  paymentStatus: string;
  items: { name: string; qty: number; price: number }[];
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  cost: number;
  stock: number;
  category: string;
}

export interface Automation {
  id: string;
  name: string;
  description: string;
  active: boolean;
  runs: number;
  triggers: AutomationTrigger[];
  actions: AutomationAction[];
}

export interface AutomationTrigger {
  type: string;
}
export interface AutomationAction {
  type: string;
}

export interface SocialAccount {
  id: string;
  platform: string;
  handle: string;
  connected: boolean;
  followers: number;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  channel: string;
  createdAt: string;
}

export interface APIKey {
  id: string;
  name: string;
  prefix: string;
  permissions: string[];
  lastUsed: string | null;
  revoked: boolean;
  createdAt: string;
}

export interface Webhook {
  id: string;
  url: string;
  events: string[];
  secret: string;
  active: boolean;
  lastDelivery: string | null;
}

export interface TeamMember {
  id: string;
  userId: string;
  name: string | null;
  email: string | null;
  role: string;
  permissions: string[];
  status: string;
}

export interface VendorListing {
  id: string;
  toolSlug: string;
  toolName: string;
  status: string;
  views: number;
  clicks: number;
  conversions: number;
  favorites: number;
  submittedAt: string;
}

export type ToolRow = Row;
