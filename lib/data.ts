import { all, get, parse, count } from "@/lib/db";
import type {
  Tool, Category, Review, Deal, BlogPost, Integration, Subscription,
  Notification, CRMDeal, CRMLead, CRMTask, SupportTicket, Order, Product,
  Automation, SocialAccount, Customer, APIKey, Webhook, TeamMember, VendorListing,
  ToolFeature, ToolScreenshot,
} from "@/lib/types";

type AnyRow = Record<string, unknown>;

const bool = (v: unknown) => v === 1 || v === true || v === "1" || v === "true";
const jarr = (v: unknown): any[] => parse(v, []);

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------
export function getCategories(): Category[] {
  const rows = all<AnyRow>(`SELECT c.*, (SELECT COUNT(*) FROM "Tool" t WHERE t.categoryId = c.id) as toolCount FROM "Category" c ORDER BY c."order"`);
  return rows.map((r) => ({
    id: r.id as string,
    slug: r.slug as string,
    name: r.name as string,
    description: r.description as string,
    icon: (r.icon as string) || "Box",
    color: (r.color as string) || "#22C55E",
    order: Number(r.order || 0),
    toolCount: Number(r.toolCount || 0),
  }));
}

export function getCategoryBySlug(slug: string): Category | null {
  const r = get<AnyRow>(`SELECT c.*, (SELECT COUNT(*) FROM "Tool" t WHERE t.categoryId = c.id) as toolCount FROM "Category" c WHERE c.slug = ?`, [slug]);
  if (!r) return null;
  return {
    id: r.id as string, slug: r.slug as string, name: r.name as string, description: r.description as string,
    icon: (r.icon as string) || "Box", color: (r.color as string) || "#22C55E", order: Number(r.order || 0), toolCount: Number(r.toolCount || 0),
  };
}

// ---------------------------------------------------------------------------
// Tools
// ---------------------------------------------------------------------------
const TOOL_SELECT = `
  t.*, c.name as categoryName, c.slug as categorySlug
  FROM "Tool" t LEFT JOIN "Category" c ON c.id = t.categoryId
`;

function normalizeTool(r: AnyRow): Tool {
  return {
    id: r.id as string,
    slug: r.slug as string,
    name: r.name as string,
    tagline: r.tagline as string,
    description: r.description as string,
    longDescription: (r.longDescription as string) || (r.description as string),
    website: r.website as string,
    logo: (r.logo as string) || "PL",
    color: (r.color as string) || "#22C55E",
    categoryId: r.categoryId as string,
    categoryName: r.categoryName as string,
    categorySlug: r.categorySlug as string,
    rating: Number(r.rating || 0),
    reviewCount: Number(r.reviewCount || 0),
    startingPrice: Number(r.startingPrice || 0),
    freePlan: bool(r.freePlan),
    freeTrial: bool(r.freeTrial),
    verified: bool(r.verified),
    aiPowered: bool(r.aiPowered),
    featured: bool(r.featured),
    trending: bool(r.trending),
    popularity: Number(r.popularity || 0),
    releaseDate: (r.releaseDate as string) || "",
    companyName: (r.companyName as string) || "",
    companySize: (r.companySize as string) || "1-10",
    founded: r.founded ? Number(r.founded) : null,
    headquarters: (r.headquarters as string) || "",
    pros: jarr(r.pros),
    cons: jarr(r.cons),
    faq: jarr(r.faq),
    integrations: jarr(r.integrations),
  };
}

export function getToolBySlug(slug: string): Tool | null {
  const r = get<AnyRow>(`SELECT ${TOOL_SELECT} WHERE t.slug = ?`, [slug]);
  if (!r) return null;
  const tool = normalizeTool(r);
  tool.features = getToolFeatures(tool.id);
  tool.pricing = getToolPricing(tool.id);
  tool.screenshots = getToolScreenshots(tool.id);
  return tool;
}

export function getToolById(id: string): Tool | null {
  const r = get<AnyRow>(`SELECT ${TOOL_SELECT} WHERE t.id = ?`, [id]);
  if (!r) return null;
  return normalizeTool(r);
}

export function getToolFeatures(toolId: string): ToolFeature[] {
  return all<AnyRow>(`SELECT id, name, description FROM "ToolFeature" WHERE toolId = ? ORDER BY "order"`, [toolId]).map((r) => ({
    id: r.id as string, name: r.name as string, description: (r.description as string) || "",
  }));
}

export function getToolPricing(toolId: string) {
  return all<AnyRow>(`SELECT id, planName, monthly, annual, freePlan, freeTrial, popular, users, storage, features FROM "ToolPricing" WHERE toolId = ? ORDER BY "order"`, [toolId]).map((r) => ({
    id: r.id as string,
    planName: r.planName as string,
    monthly: Number(r.monthly || 0),
    annual: Number(r.annual || 0),
    freePlan: bool(r.freePlan),
    freeTrial: bool(r.freeTrial),
    popular: bool(r.popular),
    users: Number(r.users || 1),
    storage: (r.storage as string) || "",
    features: jarr(r.features),
  }));
}

export function getToolScreenshots(toolId: string): ToolScreenshot[] {
  return all<AnyRow>(`SELECT id, url, caption FROM "ToolScreenshot" WHERE toolId = ?`, [toolId]).map((r) => ({
    id: r.id as string, url: (r.url as string) || "", caption: (r.caption as string) || "",
  }));
}

export interface ToolFilters {
  q?: string;
  category?: string;
  sort?: string;
  price?: string;
  freePlan?: boolean;
  freeTrial?: boolean;
  minRating?: number;
  ai?: boolean;
  page?: number;
  perPage?: number;
}

export function getTools(filters: ToolFilters = {}): { tools: Tool[]; total: number } {
  const where: string[] = [];
  const params: unknown[] = [];

  if (filters.q) {
    where.push(`(t.name LIKE ? OR t.description LIKE ? OR t.tagline LIKE ? OR t.integrations LIKE ?)`);
    const like = `%${filters.q}%`;
    params.push(like, like, like, like);
  }
  if (filters.category) {
    where.push(`(c.slug = ? OR c.id = ?)`);
    params.push(filters.category, filters.category);
  }
  if (filters.freePlan) where.push(`t.freePlan = 1`);
  if (filters.freeTrial) where.push(`t.freeTrial = 1`);
  if (filters.ai) where.push(`t.aiPowered = 1`);
  if (filters.minRating) {
    where.push(`t.rating >= ?`);
    params.push(filters.minRating);
  }
  if (filters.price === "free") where.push(`t.startingPrice = 0`);
  if (filters.price === "under20") where.push(`t.startingPrice > 0 AND t.startingPrice <= 2000`);
  if (filters.price === "up50") where.push(`t.startingPrice <= 5000`);

  const whereSql = where.length ? ` WHERE ${where.join(" AND ")}` : "";
  const orderMap: Record<string, string> = {
    recommended: "t.popularity DESC",
    popular: "t.popularity DESC",
    "highest-rated": "t.rating DESC",
    newest: "t.releaseDate DESC",
    "price-low": "t.startingPrice ASC",
    "price-high": "t.startingPrice DESC",
    trending: "t.trending DESC, t.popularity DESC",
  };
  const order = orderMap[filters.sort || "recommended"] || orderMap.recommended;
  const page = Math.max(1, filters.page || 1);
  const perPage = Math.min(60, filters.perPage || 24);
  const offset = (page - 1) * perPage;

  const total = Number(get<AnyRow>(`SELECT COUNT(*) as c FROM "Tool" t LEFT JOIN "Category" c ON c.id = t.categoryId${whereSql}`, params)?.c ?? 0);
  const rows = all<AnyRow>(`SELECT ${TOOL_SELECT}${whereSql} ORDER BY ${order} LIMIT ? OFFSET ?`, [...params, perPage, offset]);
  return { tools: rows.map(normalizeTool), total };
}

export function searchToolResults(q: string) {
  const like = `%${q}%`;
  return all<AnyRow>(`SELECT slug, name, tagline, categoryName, categorySlug, rating, reviewCount, logo, color FROM "Tool" t LEFT JOIN "Category" c ON c.id = t.categoryId WHERE t.name LIKE ? OR t.description LIKE ? ORDER BY t.popularity DESC LIMIT 8`, [like, like]);
}

export function getTrendingTools(limit = 12): Tool[] {
  return all<AnyRow>(`SELECT ${TOOL_SELECT} ORDER BY t.trending DESC, t.popularity DESC LIMIT ?`, [limit]).map(normalizeTool);
}
export function getTopRated(limit = 12): Tool[] {
  return all<AnyRow>(`SELECT ${TOOL_SELECT} ORDER BY t.rating DESC, t.reviewCount DESC LIMIT ?`, [limit]).map(normalizeTool);
}
export function getNewTools(limit = 12): Tool[] {
  return all<AnyRow>(`SELECT ${TOOL_SELECT} ORDER BY t.releaseDate DESC LIMIT ?`, [limit]).map(normalizeTool);
}
export function getFeaturedTools(limit = 8): Tool[] {
  return all<AnyRow>(`SELECT ${TOOL_SELECT} WHERE t.featured = 1 ORDER BY t.popularity DESC LIMIT ?`, [limit]).map(normalizeTool);
}
export function getAITools(limit = 12): Tool[] {
  return all<AnyRow>(`SELECT ${TOOL_SELECT} WHERE t.aiPowered = 1 ORDER BY t.popularity DESC LIMIT ?`, [limit]).map(normalizeTool);
}

// ---------------------------------------------------------------------------
// Reviews
// ---------------------------------------------------------------------------
export function getToolReviews(toolId: string, sort = "newest", status = "APPROVED", limit = 50): Review[] {
  const orderMap: Record<string, string> = {
    newest: "r.createdAt DESC",
    helpful: "r.helpfulCount DESC",
    "highest": "r.rating DESC",
    "lowest": "r.rating ASC",
  };
  const order = orderMap[sort] || orderMap.newest;
  const rows = all<AnyRow>(`SELECT r.*, u.name as userName, u.image as userImage FROM "Review" r LEFT JOIN "User" u ON u.id = r.userId WHERE r.toolId = ? AND r.status = ? ORDER BY ${order} LIMIT ?`, [toolId, status, limit]);
  return rows.map((r) => ({
    id: r.id as string, toolId: r.toolId as string, userId: r.userId as string, rating: Number(r.rating || 0),
    title: r.title as string, content: r.content as string, pros: jarr(r.pros), cons: jarr(r.cons),
    useCase: (r.useCase as string) || "", companySize: (r.companySize as string) || "",
    verificationType: (r.verificationType as string) || "", verified: bool(r.verified), status: r.status as string,
    helpfulCount: Number(r.helpfulCount || 0), createdAt: (r.createdAt as string) || "",
    user: { name: (r.userName as string) || "Anonymous", image: r.userImage as string | null },
  }));
}

export function getRecentReviews(limit = 12): Review[] {
  const rows = all<AnyRow>(`SELECT r.*, u.name as userName, u.image as userImage, t.name as toolName, t.slug as toolSlug, t.logo as toolLogo, t.color as toolColor FROM "Review" r LEFT JOIN "User" u ON u.id = r.userId LEFT JOIN "Tool" t ON t.id = r.toolId WHERE r.status = 'APPROVED' ORDER BY r.createdAt DESC LIMIT ?`, [limit]);
  return rows.map((r) => ({
    id: r.id as string, toolId: r.toolId as string, userId: r.userId as string, rating: Number(r.rating || 0),
    title: r.title as string, content: r.content as string, pros: jarr(r.pros), cons: jarr(r.cons),
    useCase: (r.useCase as string) || "", companySize: (r.companySize as string) || "",
    verificationType: (r.verificationType as string) || "", verified: bool(r.verified), status: r.status as string,
    helpfulCount: Number(r.helpfulCount || 0), createdAt: (r.createdAt as string) || "",
    user: { name: (r.userName as string) || "Anonymous", image: r.userImage as string | null },
    toolName: (r.toolName as string) || "", toolSlug: (r.toolSlug as string) || "", toolLogo: (r.toolLogo as string) || "", toolColor: (r.toolColor as string) || "",
  } as any));
}

// ---------------------------------------------------------------------------
// Deals
// ---------------------------------------------------------------------------
export function getDeals(featuredOnly = false): Deal[] {
  const rows = all<AnyRow>(`SELECT d.*, t.slug as toolSlug, t.name as toolName, t.logo as toolLogo, t.color as toolColor FROM "Deal" d LEFT JOIN "Tool" t ON t.id = d.toolId ${featuredOnly ? "WHERE d.featured = 1" : ""} ORDER BY d.featured DESC, d.expiresAt ASC`);
  return rows.map((r) => ({
    id: r.id as string, toolId: r.toolId as string | null, toolSlug: r.toolSlug as string | null, toolName: r.toolName as string | null,
    toolLogo: r.toolLogo as string | null, toolColor: r.toolColor as string | null, title: r.title as string, description: (r.description as string) || "",
    discount: r.discount as string, originalPrice: Number(r.originalPrice || 0), currentPrice: Number(r.currentPrice || 0),
    coupon: (r.coupon as string) || "", url: (r.url as string) || "", category: (r.category as string) || "Productivity",
    expiresAt: r.expiresAt as string | null, active: bool(r.active), featured: bool(r.featured), createdAt: (r.createdAt as string) || "",
  }));
}

// ---------------------------------------------------------------------------
// Blog
// ---------------------------------------------------------------------------
export function getBlogPosts(limit = 100): BlogPost[] {
  const rows = all<AnyRow>(`SELECT p.*, c.name as categoryName, c.slug as categorySlug FROM "BlogPost" p LEFT JOIN "BlogCategory" c ON c.id = p.categoryId WHERE p.published = 1 ORDER BY p.featured DESC, p.publishedAt DESC LIMIT ?`, [limit]);
  return rows.map((r) => ({
    id: r.id as string, slug: r.slug as string, title: r.title as string, excerpt: (r.excerpt as string) || "",
    content: (r.content as string) || "", coverImage: (r.coverImage as string) || "", author: (r.author as string) || "PEAKLOOP Team",
    categoryId: r.categoryId as string | null, categoryName: r.categoryName as string, categorySlug: r.categorySlug as string,
    tags: jarr(r.tags), relatedTools: jarr(r.relatedTools), seoTitle: (r.seoTitle as string) || "", metaDescription: (r.metaDescription as string) || "",
    featured: bool(r.featured), publishedAt: (r.publishedAt as string) || "", createdAt: (r.createdAt as string) || "",
  }));
}

export function getBlogPost(slug: string): BlogPost | null {
  const r = get<AnyRow>(`SELECT p.*, c.name as categoryName, c.slug as categorySlug FROM "BlogPost" p LEFT JOIN "BlogCategory" c ON c.id = p.categoryId WHERE p.slug = ? AND p.published = 1`, [slug]);
  if (!r) return null;
  return {
    id: r.id as string, slug: r.slug as string, title: r.title as string, excerpt: (r.excerpt as string) || "",
    content: (r.content as string) || "", coverImage: (r.coverImage as string) || "", author: (r.author as string) || "PEAKLOOP Team",
    categoryId: r.categoryId as string | null, categoryName: r.categoryName as string, categorySlug: r.categorySlug as string,
    tags: jarr(r.tags), relatedTools: jarr(r.relatedTools), seoTitle: (r.seoTitle as string) || "", metaDescription: (r.metaDescription as string) || "",
    featured: bool(r.featured), publishedAt: (r.publishedAt as string) || "", createdAt: (r.createdAt as string) || "",
  };
}

// ---------------------------------------------------------------------------
// Integrations
// ---------------------------------------------------------------------------
export function getIntegrations(category?: string): Integration[] {
  const rows = all<AnyRow>(`SELECT * FROM "Integration" ${category ? "WHERE category = ?" : ""} ORDER BY popular DESC, name ASC`, category ? [category] : []);
  return rows.map((r) => ({
    id: r.id as string, slug: r.slug as string, name: r.name as string, description: (r.description as string) || "",
    icon: (r.icon as string) || "Plug", color: (r.color as string) || "#38BDF8", category: (r.category as string) || "Developer",
    features: jarr(r.features), permissions: jarr(r.permissions), popular: bool(r.popular),
  }));
}

// ---------------------------------------------------------------------------
// Per-user data
// ---------------------------------------------------------------------------
export function getSubscriptions(userId: string): Subscription[] {
  const rows = all<AnyRow>(`SELECT * FROM "Subscription" WHERE userId = ? AND active = 1 ORDER BY renewalDate ASC`, [userId]);
  return rows.map((r) => ({
    id: r.id as string, name: r.name as string, logo: (r.logo as string) || "", color: (r.color as string) || "#22C55E",
    priceMonthly: Number(r.priceMonthly || 0), priceYearly: Number(r.priceYearly || 0), billingCycle: (r.billingCycle as string) || "MONTHLY",
    renewalDate: r.renewalDate as string | null, category: (r.category as string) || "Productivity", active: bool(r.active),
  }));
}

export function getNotifications(userId: string, limit = 20): Notification[] {
  const rows = all<AnyRow>(`SELECT * FROM "Notification" WHERE userId = ? ORDER BY createdAt DESC LIMIT ?`, [userId, limit]);
  return rows.map((r) => ({
    id: r.id as string, title: r.title as string, body: r.body as string, type: (r.type as string) || "SYSTEM",
    link: (r.link as string) || "", read: bool(r.read), createdAt: (r.createdAt as string) || "",
  }));
}

export function getUnreadCount(userId: string): number {
  return Number(get<AnyRow>(`SELECT COUNT(*) as c FROM "Notification" WHERE userId = ? AND read = 0`, [userId])?.c ?? 0);
}

export function getFavoriteTools(userId: string): Tool[] {
  const rows = all<AnyRow>(`SELECT ${TOOL_SELECT} INNER JOIN "Favorite" f ON f.toolId = t.id WHERE f.userId = ? ORDER BY f.createdAt DESC`, [userId]);
  return rows.map(normalizeTool);
}

export function getSavedToolIds(userId: string): string[] {
  return all<AnyRow>(`SELECT toolId FROM "Favorite" WHERE userId = ?`, [userId]).map((r) => r.toolId as string);
}

export function getDashboardStats(userId: string) {
  const totalTools = count("Tool");
  const savedTools = count("Favorite", "WHERE userId = ?", [userId]);
  const activeSubs = count("Subscription", "WHERE userId = ? AND active = 1", [userId]);
  const monthlySpend = Number(get<AnyRow>(`SELECT COALESCE(SUM(priceMonthly), 0) as c FROM "Subscription" WHERE userId = ? AND active = 1`, [userId])?.c ?? 0);
  const upcomingRenewals = count("Subscription", "WHERE userId = ? AND active = 1 AND renewalDate >= ?", [userId, new Date().toISOString()]);
  const counts = {
    crmDeals: count("CRMDeal", "WHERE userId = ?", [userId]),
    leads: count("CRMLead", "WHERE userId = ?", [userId]),
    orders: count("Order", "WHERE userId = ?", [userId]),
    tickets: count("SupportTicket", "WHERE userId = ?", [userId]),
    unreadNotifs: getUnreadCount(userId),
  };
  return { totalTools, savedTools, activeSubs, monthlySpend, upcomingRenewals, ...counts };
}

// CRM
export function getCRMDeals(userId: string): CRMDeal[] {
  const rows = all<AnyRow>(`SELECT * FROM "CRMDeal" WHERE userId = ? ORDER BY value DESC`, [userId]);
  return rows.map((r) => ({
    id: r.id as string, title: r.title as string, stage: r.stage as string, value: Number(r.value || 0),
    contact: (r.contact as string) || "", probability: Number(r.probability || 0), owner: (r.owner as string) || "",
    closeDate: r.closeDate as string | null,
  }));
}
export function getCRMLeads(userId: string): CRMLead[] {
  const rows = all<AnyRow>(`SELECT * FROM "CRMLead" WHERE userId = ? ORDER BY score DESC`, [userId]);
  return rows.map((r) => ({
    id: r.id as string, name: r.name as string, email: (r.email as string) || "", source: (r.source as string) || "",
    score: Number(r.score || 0), stage: r.stage as string, value: Number(r.value || 0), owner: (r.owner as string) || "",
    createdAt: (r.createdAt as string) || "",
  }));
}
export function getCRMTasks(userId: string): CRMTask[] {
  const rows = all<AnyRow>(`SELECT * FROM "CRMTask" WHERE userId = ? ORDER BY done ASC, due ASC`, [userId]);
  return rows.map((r) => ({ id: r.id as string, title: r.title as string, type: (r.type as string) || "TASK", done: bool(r.done), due: r.due as string | null }));
}
export function getCRMContacts(userId: string) {
  return all<AnyRow>(`SELECT * FROM "CRMContact" WHERE userId = ? ORDER BY createdAt DESC`, [userId]);
}
export function getCRMCompanies(userId: string) {
  return all<AnyRow>(`SELECT * FROM "CRMCompany" WHERE userId = ?`, [userId]);
}
export function getCRMPipeline(userId: string) {
  return getCRMDeals(userId);
}

// Support
export function getTickets(userId: string): SupportTicket[] {
  const rows = all<AnyRow>(`SELECT * FROM "SupportTicket" WHERE userId = ? ORDER BY updatedAt DESC`, [userId]);
  return rows.map((r) => ({
    id: r.id as string, subject: r.subject as string, status: r.status as string, priority: (r.priority as string) || "NORMAL",
    tags: jarr(r.tags), assignee: (r.assignee as string) || "", createdAt: (r.createdAt as string) || "",
  }));
}
export function getTicketMessages(ticketId: string) {
  const rows = all<AnyRow>(`SELECT * FROM "SupportMessage" WHERE ticketId = ? ORDER BY createdAt ASC`, [ticketId]);
  return rows.map((r) => ({
    id: r.id as string, author: (r.author as string) || "", body: r.body as string, fromAi: bool(r.fromAi), createdAt: (r.createdAt as string) || "",
  }));
}

// Orders / products / customers
export function getOrders(userId: string): Order[] {
  const rows = all<AnyRow>(`SELECT * FROM "Order" WHERE userId = ? ORDER BY createdAt DESC`, [userId]);
  return rows.map((r) => ({
    id: r.id as string, customer: (r.customer as string) || "", status: r.status as string, total: Number(r.total || 0),
    channel: (r.channel as string) || "", paymentStatus: (r.paymentStatus as string) || "", items: jarr(r.items), createdAt: (r.createdAt as string) || "",
  }));
}
export function getProducts(userId: string): Product[] {
  const rows = all<AnyRow>(`SELECT * FROM "Product" WHERE userId = ? ORDER BY createdAt DESC`, [userId]);
  return rows.map((r) => ({
    id: r.id as string, name: r.name as string, sku: (r.sku as string) || "", price: Number(r.price || 0), cost: Number(r.cost || 0),
    stock: Number(r.stock || 0), category: (r.category as string) || "",
  }));
}
export function getCustomers(userId: string): Customer[] {
  const rows = all<AnyRow>(`SELECT * FROM "Customer" WHERE userId = ? ORDER BY createdAt DESC`, [userId]);
  return rows.map((r) => ({ id: r.id as string, name: r.name as string, email: (r.email as string) || "", phone: (r.phone as string) || "", channel: (r.channel as string) || "", createdAt: (r.createdAt as string) || "" }));
}
export function getSocialAccounts(userId: string): SocialAccount[] {
  const rows = all<AnyRow>(`SELECT * FROM "SocialAccount" WHERE userId = ?`, [userId]);
  return rows.map((r) => ({ id: r.id as string, platform: r.platform as string, handle: (r.handle as string) || "", connected: bool(r.connected), followers: Number(r.followers || 0) }));
}

// Automations
export function getAutomations(userId: string): Automation[] {
  const rows = all<AnyRow>(`SELECT * FROM "Automation" WHERE userId = ? ORDER BY createdAt DESC`, [userId]);
  return rows.map((r) => {
    const triggers = all<AnyRow>(`SELECT type FROM "AutomationTrigger" WHERE automationId = ? ORDER BY "order"`, [r.id as string]);
    const actions = all<AnyRow>(`SELECT type FROM "AutomationAction" WHERE automationId = ? ORDER BY "order"`, [r.id as string]);
    return {
      id: r.id as string, name: r.name as string, description: (r.description as string) || "", active: bool(r.active), runs: Number(r.runs || 0),
      triggers: triggers.map((t) => ({ type: t.type as string })), actions: actions.map((a) => ({ type: a.type as string })),
    };
  });
}

// API
export function getAPIKeys(userId: string): APIKey[] {
  const rows = all<AnyRow>(`SELECT * FROM "APIKey" WHERE userId = ? ORDER BY createdAt DESC`, [userId]);
  return rows.map((r) => ({
    id: r.id as string, name: r.name as string, prefix: (r.prefix as string) || "", permissions: jarr(r.permissions),
    lastUsed: r.lastUsed as string | null, revoked: bool(r.revoked), createdAt: (r.createdAt as string) || "",
  }));
}
export function getWebhooks(userId: string): Webhook[] {
  const rows = all<AnyRow>(`SELECT * FROM "Webhook" WHERE userId = ? ORDER BY createdAt DESC`, [userId]);
  return rows.map((r) => ({
    id: r.id as string, url: (r.url as string) || "", events: jarr(r.events), secret: (r.secret as string) || "",
    active: bool(r.active), lastDelivery: r.lastDelivery as string | null,
  }));
}
export function getUsageStats(userId: string) {
  const total = count("UsageRecord", "WHERE userId = ?", [userId]);
  const last30 = count("UsageRecord", "WHERE userId = ? AND createdAt >= ?", [userId, new Date(Date.now() - 30 * 86400000).toISOString()]);
  const avgLatency = Number(get<AnyRow>(`SELECT COALESCE(AVG(latency), 0) as c FROM "UsageRecord" WHERE userId = ?`, [userId])?.c ?? 0);
  return { total, last30, avgLatency: Math.round(avgLatency) };
}
export function getUsageSeries(userId: string) {
  return all<AnyRow>(`SELECT endpoint, COUNT(*) as requests, AVG(latency) as latency FROM "UsageRecord" WHERE userId = ? GROUP BY endpoint ORDER BY requests DESC`, [userId]);
}

// Billing
export interface PaymentRow { id: string; amount: number; status: string; plan: string; provider: string; createdAt: string; }
export interface InvoiceRow { id: string; number: string; amount: number; status: string; dueDate: string; createdAt: string; }
export function getPayments(userId: string): PaymentRow[] {
  return all<AnyRow>(`SELECT * FROM "Payment" WHERE userId = ? ORDER BY createdAt DESC`, [userId]).map((r) => ({
    id: r.id as string, amount: Number(r.amount || 0), status: (r.status as string) || "SUCCEEDED",
    plan: (r.plan as string) || "FREE", provider: (r.provider as string) || "stripe", createdAt: (r.createdAt as string) || "",
  }));
}
export function getInvoices(userId: string): InvoiceRow[] {
  return all<AnyRow>(`SELECT * FROM "Invoice" WHERE userId = ? ORDER BY createdAt DESC`, [userId]).map((r) => ({
    id: r.id as string, number: (r.number as string) || "", amount: Number(r.amount || 0), status: (r.status as string) || "PAID",
    dueDate: (r.dueDate as string) || "", createdAt: (r.createdAt as string) || "",
  }));
}

// Team
export function getTeamMembers(userId: string): TeamMember[] {
  const rows = all<AnyRow>(`SELECT m.*, u.name as userName, u.email as userEmail FROM "TeamMember" m LEFT JOIN "User" u ON u.id = m.userId WHERE m.organizationId IN (SELECT organizationId FROM "TeamMember" WHERE userId = ?) ORDER BY m.invitedAt DESC`, [userId]);
  return rows.map((r) => ({
    id: r.id as string, userId: r.userId as string, name: (r.userName as string) || "Invited", email: r.userEmail as string | null,
    role: r.role as string, permissions: jarr(r.permissions), status: r.status as string,
  }));
}

// Vendor
export function getVendorListings(userId: string): VendorListing[] {
  const rows = all<AnyRow>(`SELECT l.*, t.slug as toolSlug, t.name as toolName FROM "VendorListing" l JOIN "Tool" t ON t.id = l.toolId JOIN "Vendor" v ON v.id = l.vendorId WHERE v.userId = ? ORDER BY l.submittedAt DESC`, [userId]);
  return rows.map((r) => ({
    id: r.id as string, toolSlug: (r.toolSlug as string) || "", toolName: (r.toolName as string) || "", status: r.status as string,
    views: Number(r.views || 0), clicks: Number(r.clicks || 0), conversions: Number(r.conversions || 0), favorites: Number(r.favorites || 0), submittedAt: (r.submittedAt as string) || "",
  }));
}

// Admin metrics
export function getAdminMetrics() {
  return {
    users: count("User"),
    activeUsers: count("User"),
    tools: count("Tool"),
    reviews: count("Review"),
    deals: count("Deal"),
    subscriptions: count("Subscription"),
    apiRequests: count("UsageRecord"),
    revenue: Number(get<AnyRow>(`SELECT COALESCE(SUM(amount), 0) as c FROM "Payment" WHERE status = 'SUCCEEDED'`)?.c ?? 0),
    categories: count("Category"),
    pendingReviews: count("Review", "WHERE status = 'PENDING'"),
    pendingListings: count("VendorListing", "WHERE status IN ('PENDING_REVIEW','DRAFT')"),
  };
}

export function getAllToolsForAdmin() {
  return all<AnyRow>(`SELECT ${TOOL_SELECT} ORDER BY t.createdAt DESC`).map(normalizeTool);
}
export function getAdminUsers() {
  return all<AnyRow>(`SELECT id, name, email, role, accountType, createdAt, emailVerified FROM "User" ORDER BY createdAt DESC`);
}
export function getAdminReviews(limit = 50) {
  return all<AnyRow>(`SELECT r.*, t.name as toolName, t.slug as toolSlug, u.name as userName FROM "Review" r LEFT JOIN "Tool" t ON t.id = r.toolId LEFT JOIN "User" u ON u.id = r.userId ORDER BY (CASE WHEN r.status='PENDING' THEN 0 ELSE 1 END), r.createdAt DESC LIMIT ?`, [limit]);
}
export function getAllDealsAdmin() {
  return all<AnyRow>(`SELECT d.*, t.name as toolName FROM "Deal" d LEFT JOIN "Tool" t ON t.id = d.toolId ORDER BY d.createdAt DESC`);
}

export function seedRecommendations(userId: string, orgName?: string, industry?: string, teamSize?: string) {
  return getTools({ category: industry, sort: "recommended", perPage: 6 });
}

// ---------------------------------------------------------------------------
// Analytics / chart series (deterministic for the demo)
// ---------------------------------------------------------------------------
export function getRevenueSeries(months = 12) {
  const now = new Date();
  const out: { month: string; revenue: number; profit: number }[] = [];
  let revenue = 28000;
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    revenue = Math.round(revenue * (1 + (Math.sin(i) * 0.06 + 0.08)));
    out.push({
      month: d.toLocaleString("en-US", { month: "short" }),
      revenue,
      profit: Math.round(revenue * 0.38),
    });
  }
  return out;
}

export function getSpendSeries(userId: string) {
  const subs = getSubscriptions(userId);
  const map: Record<string, number> = {};
  for (const s of subs) {
    const cat = s.category || "Other";
    map[cat] = (map[cat] || 0) + s.priceMonthly;
  }
  return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
}

export function getAnalyticsMetrics(userId: string) {
  const orders = getOrders(userId);
  const revenue = orders.reduce((a, o) => a + o.total, 0);
  const customers = count("Customer", "WHERE userId = ?", [userId]);
  const products = count("Product", "WHERE userId = ?", [userId]);
  return {
    revenue,
    orders: orders.length,
    customers,
    products,
    profit: Math.round(revenue * 0.62),
    conversion: 4.6,
    retention: 92,
  };
}

export function getSalesByChannel(userId: string) {
  const orders = getOrders(userId);
  const map: Record<string, { orders: number; revenue: number }> = {};
  for (const o of orders) {
    const ch = o.channel || "Other";
    map[ch] = map[ch] || { orders: 0, revenue: 0 };
    map[ch].orders++;
    map[ch].revenue += o.total;
  }
  return Object.entries(map).map(([name, v]) => ({ name, ...v })).sort((a, b) => b.revenue - a.revenue);
}

export function getTopCustomers(userId: string) {
  const customers = getCustomers(userId);
  return customers.slice(0, 6).map((c) => ({ name: c.name, companySize: c.channel, revenue: Math.round(Math.random() * 8000 + 1000) }));
}
