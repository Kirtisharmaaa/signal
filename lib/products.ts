export interface Product {
  name: string;       // display name
  slug: string;       // URL-safe identifier used in /product/[name]
  domain: string;     // which domain this product belongs to
  keyword: string;    // search term used to find this product in digest summaries
}

export const PRODUCTS: Product[] = [
  // Page / Screen Builders
  { name: "Webflow", slug: "webflow", domain: "page-screen-builders", keyword: "Webflow" },
  { name: "Framer", slug: "framer", domain: "page-screen-builders", keyword: "Framer" },
  { name: "Wix Studio", slug: "wix-studio", domain: "page-screen-builders", keyword: "Wix" },
  { name: "Builder.io", slug: "builder-io", domain: "page-screen-builders", keyword: "Builder.io" },

  // App Builders
  { name: "Bubble", slug: "bubble", domain: "app-builders", keyword: "Bubble" },
  { name: "FlutterFlow", slug: "flutterflow", domain: "app-builders", keyword: "FlutterFlow" },
  { name: "Airtable", slug: "airtable", domain: "app-builders", keyword: "Airtable" },
  { name: "Retool", slug: "retool", domain: "app-builders", keyword: "Retool" },
  { name: "Glide", slug: "glide", domain: "app-builders", keyword: "Glide" },
  { name: "Lovable", slug: "lovable", domain: "app-builders", keyword: "Lovable" },
  { name: "Replit", slug: "replit", domain: "app-builders", keyword: "Replit" },
  { name: "Bolt.new", slug: "bolt-new", domain: "app-builders", keyword: "Bolt" },
];

export function getProductBySlug(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}
