/**
 * SQLite DDL for PEAKLOOP.
 * Mirrors prisma/schema.prisma (which is the canonical PostgreSQL-production
 * schema). Keeping this in sync lets the local demo run on SQLite with zero
 * binary downloads, while the Prisma schema documents the production target.
 */

export const SCHEMA = `
CREATE TABLE IF NOT EXISTS "User" (
  id TEXT PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE,
  emailVerified DATETIME,
  image TEXT,
  passwordHash TEXT,
  role TEXT DEFAULT 'USER',
  accountType TEXT DEFAULT 'PERSONAL',
  twoFactorSecret TEXT,
  twoFactorEnabled INTEGER DEFAULT 0,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_user_email ON "User"(email);

CREATE TABLE IF NOT EXISTS "Account" (
  id TEXT PRIMARY KEY,
  userId TEXT,
  type TEXT,
  provider TEXT,
  providerAccountId TEXT,
  refresh_token TEXT,
  access_token TEXT,
  expires_at INTEGER,
  token_type TEXT,
  scope TEXT,
  id_token TEXT,
  session_state TEXT,
  FOREIGN KEY (userId) REFERENCES "User"(id) ON DELETE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_account_provider ON "Account"(provider, providerAccountId);

CREATE TABLE IF NOT EXISTS "Session" (
  id TEXT PRIMARY KEY,
  sessionToken TEXT UNIQUE,
  userId TEXT,
  expires DATETIME,
  FOREIGN KEY (userId) REFERENCES "User"(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "VerificationToken" (
  identifier TEXT,
  token TEXT UNIQUE,
  expires DATETIME
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_verif ON "VerificationToken"(identifier, token);

CREATE TABLE IF NOT EXISTS "Category" (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE,
  name TEXT,
  description TEXT,
  icon TEXT DEFAULT 'Box',
  color TEXT DEFAULT '#22C55E',
  "order" INTEGER DEFAULT 0,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Tool" (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE,
  name TEXT,
  tagline TEXT,
  description TEXT,
  longDescription TEXT DEFAULT '',
  website TEXT,
  logo TEXT,
  color TEXT DEFAULT '#22C55E',
  categoryId TEXT,
  rating REAL DEFAULT 0,
  reviewCount INTEGER DEFAULT 0,
  startingPrice INTEGER DEFAULT 0,
  freePlan INTEGER DEFAULT 0,
  freeTrial INTEGER DEFAULT 0,
  verified INTEGER DEFAULT 0,
  aiPowered INTEGER DEFAULT 0,
  featured INTEGER DEFAULT 0,
  trending INTEGER DEFAULT 0,
  popularity INTEGER DEFAULT 0,
  releaseDate DATETIME DEFAULT CURRENT_TIMESTAMP,
  companyName TEXT DEFAULT '',
  companySize TEXT DEFAULT '1-10',
  founded INTEGER,
  headquarters TEXT DEFAULT '',
  pros TEXT DEFAULT '[]',
  cons TEXT DEFAULT '[]',
  faq TEXT DEFAULT '[]',
  integrations TEXT DEFAULT '[]',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (categoryId) REFERENCES "Category"(id)
);
CREATE INDEX IF NOT EXISTS idx_tool_category ON "Tool"(categoryId);
CREATE INDEX IF NOT EXISTS idx_tool_rating ON "Tool"(rating);
CREATE INDEX IF NOT EXISTS idx_tool_popularity ON "Tool"(popularity);
CREATE INDEX IF NOT EXISTS idx_tool_releasedate ON "Tool"(releaseDate);

CREATE TABLE IF NOT EXISTS "ToolCategory" (
  toolId TEXT,
  categoryId TEXT,
  PRIMARY KEY (toolId, categoryId),
  FOREIGN KEY (toolId) REFERENCES "Tool"(id) ON DELETE CASCADE,
  FOREIGN KEY (categoryId) REFERENCES "Category"(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "ToolFeature" (
  id TEXT PRIMARY KEY,
  toolId TEXT,
  name TEXT,
  description TEXT,
  "order" INTEGER DEFAULT 0,
  FOREIGN KEY (toolId) REFERENCES "Tool"(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "ToolPricing" (
  id TEXT PRIMARY KEY,
  toolId TEXT,
  planName TEXT,
  monthly INTEGER DEFAULT 0,
  annual INTEGER DEFAULT 0,
  freePlan INTEGER DEFAULT 0,
  freeTrial INTEGER DEFAULT 0,
  popular INTEGER DEFAULT 0,
  users INTEGER DEFAULT 1,
  storage TEXT DEFAULT '',
  features TEXT DEFAULT '[]',
  "order" INTEGER DEFAULT 0,
  FOREIGN KEY (toolId) REFERENCES "Tool"(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "ToolScreenshot" (
  id TEXT PRIMARY KEY,
  toolId TEXT,
  url TEXT,
  caption TEXT DEFAULT '',
  FOREIGN KEY (toolId) REFERENCES "Tool"(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "Integration" (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE,
  name TEXT,
  description TEXT,
  icon TEXT DEFAULT 'Plug',
  color TEXT DEFAULT '#38BDF8',
  category TEXT DEFAULT 'Developer',
  features TEXT DEFAULT '[]',
  permissions TEXT DEFAULT '[]',
  popular INTEGER DEFAULT 0,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Review" (
  id TEXT PRIMARY KEY,
  userId TEXT,
  toolId TEXT,
  rating INTEGER,
  title TEXT,
  content TEXT,
  pros TEXT DEFAULT '[]',
  cons TEXT DEFAULT '[]',
  useCase TEXT DEFAULT '',
  companySize TEXT DEFAULT '',
  verificationType TEXT DEFAULT '',
  verified INTEGER DEFAULT 0,
  status TEXT DEFAULT 'PENDING',
  helpfulCount INTEGER DEFAULT 0,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES "User"(id) ON DELETE CASCADE,
  FOREIGN KEY (toolId) REFERENCES "Tool"(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_review_tool ON "Review"(toolId, status);

CREATE TABLE IF NOT EXISTS "ReviewVote" (
  id TEXT PRIMARY KEY,
  userId TEXT,
  reviewId TEXT,
  vote INTEGER DEFAULT 1,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (reviewId) REFERENCES "Review"(id) ON DELETE CASCADE,
  UNIQUE (userId, reviewId)
);

CREATE TABLE IF NOT EXISTS "Deal" (
  id TEXT PRIMARY KEY,
  toolId TEXT,
  title TEXT,
  description TEXT DEFAULT '',
  discount TEXT DEFAULT '',
  originalPrice INTEGER DEFAULT 0,
  currentPrice INTEGER DEFAULT 0,
  coupon TEXT DEFAULT '',
  url TEXT DEFAULT '',
  category TEXT DEFAULT 'Productivity',
  expiresAt DATETIME,
  active INTEGER DEFAULT 1,
  featured INTEGER DEFAULT 0,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (toolId) REFERENCES "Tool"(id)
);

CREATE TABLE IF NOT EXISTS "Favorite" (
  id TEXT PRIMARY KEY,
  userId TEXT,
  toolId TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES "User"(id) ON DELETE CASCADE,
  FOREIGN KEY (toolId) REFERENCES "Tool"(id) ON DELETE CASCADE,
  UNIQUE (userId, toolId)
);

CREATE TABLE IF NOT EXISTS "Comparison" (
  id TEXT PRIMARY KEY,
  userId TEXT,
  tools TEXT DEFAULT '[]',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES "User"(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "Subscription" (
  id TEXT PRIMARY KEY,
  userId TEXT,
  name TEXT,
  logo TEXT DEFAULT '',
  color TEXT DEFAULT '#22C55E',
  priceMonthly INTEGER DEFAULT 0,
  priceYearly INTEGER DEFAULT 0,
  billingCycle TEXT DEFAULT 'MONTHLY',
  renewalDate DATETIME,
  category TEXT DEFAULT 'Productivity',
  active INTEGER DEFAULT 1,
  notes TEXT DEFAULT '',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES "User"(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "Notification" (
  id TEXT PRIMARY KEY,
  userId TEXT,
  title TEXT,
  body TEXT,
  type TEXT DEFAULT 'SYSTEM',
  link TEXT DEFAULT '',
  read INTEGER DEFAULT 0,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES "User"(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_notif_user ON "Notification"(userId, read);

CREATE TABLE IF NOT EXISTS "Organization" (
  id TEXT PRIMARY KEY,
  name TEXT,
  industry TEXT DEFAULT '',
  teamSize TEXT DEFAULT '1-10',
  primaryGoal TEXT DEFAULT '',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "TeamMember" (
  id TEXT PRIMARY KEY,
  organizationId TEXT,
  userId TEXT,
  role TEXT DEFAULT 'VIEWER',
  permissions TEXT DEFAULT '{}',
  invitedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  status TEXT DEFAULT 'ACTIVE',
  FOREIGN KEY (organizationId) REFERENCES "Organization"(id) ON DELETE CASCADE,
  FOREIGN KEY (userId) REFERENCES "User"(id) ON DELETE CASCADE,
  UNIQUE (organizationId, userId)
);

CREATE TABLE IF NOT EXISTS "Vendor" (
  id TEXT PRIMARY KEY,
  userId TEXT,
  companyName TEXT,
  website TEXT DEFAULT '',
  description TEXT DEFAULT '',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES "User"(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "VendorListing" (
  id TEXT PRIMARY KEY,
  vendorId TEXT,
  toolId TEXT,
  status TEXT DEFAULT 'DRAFT',
  message TEXT DEFAULT '',
  submittedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  reviewedAt DATETIME,
  views INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  favorites INTEGER DEFAULT 0,
  FOREIGN KEY (vendorId) REFERENCES "Vendor"(id) ON DELETE CASCADE,
  FOREIGN KEY (toolId) REFERENCES "Tool"(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "CRMContact" (
  id TEXT PRIMARY KEY,
  userId TEXT,
  name TEXT,
  email TEXT,
  phone TEXT DEFAULT '',
  company TEXT DEFAULT '',
  title TEXT DEFAULT '',
  tags TEXT DEFAULT '[]',
  notes TEXT DEFAULT '',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "CRMCompany" (
  id TEXT PRIMARY KEY,
  userId TEXT,
  name TEXT,
  industry TEXT DEFAULT '',
  size TEXT DEFAULT '',
  website TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "CRMLead" (
  id TEXT PRIMARY KEY,
  userId TEXT,
  name TEXT,
  email TEXT,
  phone TEXT DEFAULT '',
  source TEXT DEFAULT '',
  score INTEGER DEFAULT 0,
  stage TEXT DEFAULT 'Lead',
  value INTEGER DEFAULT 0,
  owner TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "CRMDeal" (
  id TEXT PRIMARY KEY,
  userId TEXT,
  title TEXT,
  stage TEXT DEFAULT 'Lead',
  value INTEGER DEFAULT 0,
  contact TEXT DEFAULT '',
  probability INTEGER DEFAULT 0,
  owner TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  closeDate DATETIME,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "CRMTask" (
  id TEXT PRIMARY KEY,
  userId TEXT,
  title TEXT,
  type TEXT DEFAULT 'TASK',
  done INTEGER DEFAULT 0,
  due DATETIME,
  relatedTo TEXT DEFAULT '',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "SupportTicket" (
  id TEXT PRIMARY KEY,
  userId TEXT,
  subject TEXT,
  status TEXT DEFAULT 'OPEN',
  priority TEXT DEFAULT 'NORMAL',
  tags TEXT DEFAULT '[]',
  assignee TEXT DEFAULT '',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "SupportMessage" (
  id TEXT PRIMARY KEY,
  ticketId TEXT,
  author TEXT DEFAULT '',
  body TEXT,
  fromAi INTEGER DEFAULT 0,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ticketId) REFERENCES "SupportTicket"(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "SocialAccount" (
  id TEXT PRIMARY KEY,
  userId TEXT,
  platform TEXT,
  handle TEXT,
  connected INTEGER DEFAULT 0,
  followers INTEGER DEFAULT 0,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Customer" (
  id TEXT PRIMARY KEY,
  userId TEXT,
  name TEXT,
  email TEXT,
  phone TEXT DEFAULT '',
  channel TEXT DEFAULT '',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Product" (
  id TEXT PRIMARY KEY,
  userId TEXT,
  name TEXT,
  sku TEXT DEFAULT '',
  price INTEGER DEFAULT 0,
  cost INTEGER DEFAULT 0,
  stock INTEGER DEFAULT 0,
  image TEXT DEFAULT '',
  category TEXT DEFAULT '',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Order" (
  id TEXT PRIMARY KEY,
  userId TEXT,
  customer TEXT DEFAULT '',
  status TEXT DEFAULT 'PENDING',
  total INTEGER DEFAULT 0,
  channel TEXT DEFAULT '',
  paymentStatus TEXT DEFAULT 'PENDING',
  items TEXT DEFAULT '[]',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Automation" (
  id TEXT PRIMARY KEY,
  userId TEXT,
  name TEXT,
  description TEXT DEFAULT '',
  active INTEGER DEFAULT 1,
  runs INTEGER DEFAULT 0,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "AutomationTrigger" (
  id TEXT PRIMARY KEY,
  automationId TEXT,
  type TEXT,
  value TEXT DEFAULT '',
  "order" INTEGER DEFAULT 0,
  FOREIGN KEY (automationId) REFERENCES "Automation"(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "AutomationAction" (
  id TEXT PRIMARY KEY,
  automationId TEXT,
  type TEXT,
  value TEXT DEFAULT '',
  "order" INTEGER DEFAULT 0,
  FOREIGN KEY (automationId) REFERENCES "Automation"(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "APIKey" (
  id TEXT PRIMARY KEY,
  userId TEXT,
  name TEXT,
  key TEXT UNIQUE,
  prefix TEXT,
  permissions TEXT DEFAULT '[]',
  lastUsed DATETIME,
  revoked INTEGER DEFAULT 0,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES "User"(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "Webhook" (
  id TEXT PRIMARY KEY,
  userId TEXT,
  url TEXT,
  events TEXT DEFAULT '[]',
  secret TEXT DEFAULT '',
  active INTEGER DEFAULT 1,
  lastDelivery DATETIME,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES "User"(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "UsageRecord" (
  id TEXT PRIMARY KEY,
  userId TEXT,
  endpoint TEXT,
  method TEXT DEFAULT 'GET',
  status INTEGER DEFAULT 200,
  latency INTEGER DEFAULT 0,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_usage_user ON "UsageRecord"(userId, createdAt);

CREATE TABLE IF NOT EXISTS "BlogCategory" (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE,
  name TEXT
);

CREATE TABLE IF NOT EXISTS "BlogPost" (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE,
  title TEXT,
  excerpt TEXT,
  content TEXT,
  coverImage TEXT DEFAULT '',
  author TEXT DEFAULT 'PEAKLOOP Team',
  categoryId TEXT,
  tags TEXT DEFAULT '[]',
  relatedTools TEXT DEFAULT '[]',
  seoTitle TEXT DEFAULT '',
  metaDescription TEXT DEFAULT '',
  featured INTEGER DEFAULT 0,
  published INTEGER DEFAULT 1,
  publishedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (categoryId) REFERENCES "BlogCategory"(id)
);

CREATE TABLE IF NOT EXISTS "Payment" (
  id TEXT PRIMARY KEY,
  userId TEXT,
  amount INTEGER,
  currency TEXT DEFAULT 'usd',
  status TEXT DEFAULT 'SUCCEEDED',
  plan TEXT DEFAULT 'FREE',
  provider TEXT DEFAULT 'stripe',
  providerId TEXT DEFAULT '',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES "User"(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "Invoice" (
  id TEXT PRIMARY KEY,
  userId TEXT,
  number TEXT UNIQUE,
  amount INTEGER,
  currency TEXT DEFAULT 'usd',
  status TEXT DEFAULT 'PAID',
  dueDate DATETIME,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES "User"(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "AuditLog" (
  id TEXT PRIMARY KEY,
  userId TEXT,
  action TEXT,
  entity TEXT DEFAULT '',
  entityId TEXT DEFAULT '',
  ip TEXT DEFAULT '',
  metadata TEXT DEFAULT '{}',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES "User"(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_audit_user ON "AuditLog"(userId);
CREATE INDEX IF NOT EXISTS idx_audit_action ON "AuditLog"(action);
`;
