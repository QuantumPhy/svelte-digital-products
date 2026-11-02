// Exact title/category/illustrative-read summaries from the supplied support index.
export const popularArticles = [
    { title: "Getting Started Guide", category: "Basics", reads: "15.2k", slug: "getting-started" },
    { title: "How to Download Products", category: "Downloads", reads: "12.8k", slug: "how-to-download" },
    { title: "Understanding License Types", category: "Licensing", reads: "9.5k", slug: "license-types" },
    { title: "Requesting a Refund", category: "Refunds", reads: "8.1k", slug: "requesting-refund" },
    { title: "Upgrading Your License", category: "Licensing", reads: "6.7k", slug: "upgrade-license" },
    { title: "Payment Methods & Security", category: "Payments", reads: "5.3k", slug: "payment-security" }
  ];
export const articleAvailability = {
  "getting-started": [
    "Marketplace preview availability",
    "Browse the supplied product records and sample account screens. This static preview does not create an account, order, purchase entitlement or product-delivery email.",
    "products",
    "Browse sample products"
  ],
  "how-to-download": [
    "Download availability",
    "The supplied downloads screen illustrates a customer area. This preview does not grant purchase entitlements or deliver purchased files. Actual product files and access permissions must be supplied by the live operator.",
    "downloads",
    "View the sample download area"
  ],
  "license-types": [
    "License information availability",
    "The marketplace contains illustrative license labels. They do not establish rights for actual product files. The live operator must provide the applicable permissions for those products before offering them.",
    "licensing",
    "View the sample license comparison"
  ],
  "requesting-refund": [
    "Refund availability",
    "No purchase or refund-processing service is connected in this preview. The support index and FAQ are sample content; they do not establish an approved policy or initiate a refund.",
    "support",
    "Return to sample support"
  ],
  "upgrade-license": [
    "Upgrade availability",
    "The sample marketplace describes license upgrades, but no entitlement or upgrade service is connected. Selecting a sample option does not change a real license or create a charge.",
    "licensing",
    "View the sample license comparison"
  ],
  "payment-security": [
    "Payment availability",
    "Account and checkout screens are read-only in this static preview. No payment method is collected and no charge is initiated. A live operator must configure and verify its own payment service before enabling purchases.",
    "products",
    "Browse sample products"
  ]
} as const;
export function supportArticle(slug:string){const article=popularArticles.find(item=>item.slug===slug);if(!article)return null;const detail=articleAvailability[article.slug as keyof typeof articleAvailability];if(!detail)return null;return {...article,description:`Read-only support preview: ${article.title}. Account, purchase and file-delivery services are not connected in this sample marketplace.`,availabilityTitle:detail[0],body:detail[1],destination:detail[2],destinationLabel:detail[3]};}
