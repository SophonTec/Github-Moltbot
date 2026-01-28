export type ArticleListItem = {
  id: string; // encoded URL
  url: string;
  title: string;
  sourceId: string;
  sourceName: string;
  category: "tech" | "economy";
  publishedAt?: string;
  excerpt?: string;
};

export type ArticleContent = {
  url: string;
  title: string;
  byline?: string;
  siteName?: string;
  publishedAt?: string;
  text: string;
  html?: string;
};

export type Difficulty = "original" | "intermediate" | "simple";
