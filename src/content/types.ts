import type { ComponentType } from "react";

export type WritingCategory = "Papers" | "Cooking" | "Science" | "Misc";

export interface WritingMeta {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  category: WritingCategory;
  tags?: string[];
  featured?: boolean;
  heroImage?: string;
  heroAlt?: string;
  paperTitle?: string;
  paperVenue?: string;
  paperYear?: string;
  paperUrl?: string;
}

export interface WritingHeading {
  depth: 2 | 3;
  id: string;
  text: string;
}

export interface WritingPost extends WritingMeta {
  Content: ComponentType<Record<string, unknown>>;
  wordCount: string;
  searchText: string;
  headings: WritingHeading[];
}

export interface NavItem {
  label: string;
  href: string;
}

export interface SocialLink {
  label: string;
  href: string;
  icon: string;
  iconClassName?: string;
}

export interface SiteContent {
  name: string;
  nav: NavItem[];
  socials: SocialLink[];
  portrait: { src: string; alt: string };
  currentLocation: { label: string; timeZone: string };
  metaRight: {
    status: string;
    role: string;
    location: string;
    since: string;
    email: string;
    phone: string;
  };
  categories: string[];
}

export interface HomeContent {
  headline: string;
}

export interface ContactContent {
  heading: string;
  description: string;
  email: string;
}

export interface InfoContent {
  title: string;
  subtitle: string;
  summary: string;
  portrait: {
    src: string;
    alt: string;
    credit: string;
  };
  contact: {
    email: string;
    phone?: string;
    location: string;
    website?: string;
    linkedin?: string;
  };
  skills: {
    category: string;
    items: string[];
  }[];
  experience: {
    role: string;
    organization: string;
    location: string;
    start: string;
    end: string;
    accomplishments: string[];
  }[];
  education: {
    program: string;
    institution: string;
    location: string;
    start: string;
    end: string;
    notes: string[];
  }[];
  recognitions: {
    year: string;
    title: string;
    by?: string;
  }[];
  publications: {
    title: string;
    venue: string;
    year: string;
    link?: string;
  }[];
}
