import type { JSX } from "react";

export type WorkType = "Photography" | "Web design" | "Other";

export interface WorkItem {
  id: string;
  title: string;
  year: string;
  role: string;
  types: WorkType[];
  client: string;
  service: string;
  cover: string;
  images: string[];
  summary: string;
  challenge: string;
  solution: string;
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

export interface WorkContent {
  filterTabs: ("All" | WorkType)[];
  projects: WorkItem[];
}
