import type { WorkItem } from "../../types";

export const eclat: WorkItem = {
  id: "eclat",
  title: "Éclat",
  year: "24",
  role: "Brand Identity",
  types: ["Other"],
  client: "Éclat",
  service: "Identity",
  cover:
    "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1600&auto=format&fit=crop",
  images: [
    "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=2000&auto=format&fit=crop",
  ],
  content: [
    {
      type: "text",
      title: "Project Overview",
      body: [
        "Éclat came to us with a beautiful product catalog but an identity that felt fragmented across touchpoints. We began with a brand workshop to capture the language clients used when they described the pieces—words like shimmer, poise, and understated luxury kept surfacing.",
        (
          <p>
            Those conversations informed a restrained palette and a modular mark system that can scale from packaging to boutique signage. The system leans on spacious typography so the metalwork remains the <em>hero</em>.
          </p>
        ),
      ],
    },
    {
      type: "image",
      src: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=2000&auto=format&fit=crop",
      alt: "Éclat branded jewelry and packaging",
      caption: "Foil-stamped monogram paired with soft-touch packaging stock.",
    },
    {
      type: "text",
      title: "Outcomes",
      body: [
        (
          <p>
            The updated identity rolled out across the flagship retail experience and a refreshed ecommerce storefront. Staff reported a <strong>22% lift in add-on sales</strong> after launch thanks to clearer packaging cues, and Éclat now uses the mark system as the anchor for seasonal campaigns.
          </p>
        ),
      ],
    },
  ],
  summary: "Jewelry brand mark and product art direction.",
  challenge: "Elegant contrast across print + web + packaging.",
  solution: "High‑contrast serif, warm neutral palette, subtle foil.",
};
