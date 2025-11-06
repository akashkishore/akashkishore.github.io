import portraitImg from "../assets/images/Akash.jpg";
import githubIcon from "../assets/svgs/socials/github-mark.svg";
import emailIcon from "../assets/svgs/socials/envelope.svg";
import scholarIcon from "../assets/svgs/socials/google-scholar.svg";
import instagramIcon from "../assets/svgs/socials/Instagram_Glyph_Gradient.svg";
import linkedinIcon from "../assets/svgs/socials/linkedin.svg";
import blueskyIcon from "../assets/svgs/socials/bluesky.svg";
import type { SiteContent } from "./types";

export const siteContent: SiteContent = {
  name: "Akash",
  nav: [
    { label: "Home", href: "/" },
    { label: "Info", href: "/info" },
    { label: "Work", href: "/work" },
    { label: "Contact", href: "/#contact" },
  ],
  socials: [
    {
      label: "GitHub",
      href: "https://github.com/akashkishore",
      icon: githubIcon,
      iconClassName: "dark:invert dark:brightness-110",
    },
    // {
    //   label: "Email",
    //   href: "mailto:akk135@pitt.edu",
    //   icon: emailIcon,
    //   iconClassName: "dark:invert dark:brightness-110",
    // },
    {
      label: "Google Scholar",
      href: "https://scholar.google.com/citations?user=DLXZKH4AAAAJ",
      icon: scholarIcon,
    },
    {
      label: "Instagram",
      href: "https://www.instagram.com/akash._.kishore/",
      icon: instagramIcon,
    },
    {
      label: "LinkedIn",
      href: "https://linkedin.com/in/akashkishore2000",
      icon: linkedinIcon,
    },
    {
      label: "Bluesky",
      href: "https://bsky.app/profile/akash-kishore.bsky.social",
      icon: blueskyIcon,
    },
  ],
  portrait: {
    src: portraitImg,
    alt: "Portrait",
  },
  currentLocation: {
    label: "Pittsburgh, PA",
    timeZone: "America/New_York",
  },
  metaRight: {
    status: "Available for work",
    role: "PhD Student",
    location: "",
    since: "Since 2013",
    email: "akk135 AT pitt DOT edu",
    phone: "(123) 456-7890",
  },
  categories: ["Machine Learning", "Immunology", "Protein Design", "Interpretability"],
};
