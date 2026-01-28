export type FeedSource = {
  id: string;
  name: string;
  url: string;
  category: "tech" | "economy";
};

// Public RSS feeds. Keep this list small and reputable.
// Note: some publishers block full-text fetches; we fall back to showing excerpts.
export const FEEDS: FeedSource[] = [
  {
    id: "arstechnica",
    name: "Ars Technica",
    url: "https://feeds.arstechnica.com/arstechnica/index",
    category: "tech",
  },
  {
    id: "techcrunch",
    name: "TechCrunch",
    url: "https://techcrunch.com/feed/",
    category: "tech",
  },
  {
    id: "mit-tech-review",
    name: "MIT Technology Review",
    url: "https://www.technologyreview.com/feed/",
    category: "tech",
  },
  {
    id: "imf-blog",
    name: "IMF Blog",
    url: "https://www.imf.org/en/Blogs/RSS",
    category: "economy",
  },
  {
    id: "world-bank-blog",
    name: "World Bank Blogs",
    url: "https://blogs.worldbank.org/rss.xml",
    category: "economy",
  },
];
