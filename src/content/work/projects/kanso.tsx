import type { WorkItem } from "../../types";

export const kanso: WorkItem = {
  id: "kanso",
  title: "Kanso",
  year: "25",
  role: "Design Agency",
  types: ["Web design"],
  client: "Kanso Studio",
  service: "Web design",
  cover:
    "https://images.unsplash.com/photo-1547658719-da2b51169166?q=80&w=1600&auto=format&fit=crop",
  images: [
    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=2000&auto=format&fit=crop",
  ],
  content: [
    {
      type: "text",
      title: "Discovery",
      body: [
        (
          <p>
            <strong>Kanso Studio</strong> needed a site that could flex between case studies, thought pieces, and a nimble studio blog. We audited their CMS and mapped each story type to reusable narrative patterns so the team could ship updates without design debt.
          </p>
        ),
        (
          <p>
            The information architecture now flows from a streamlined services overview into deep project narratives, and each module is written in plain English so content authors can reorganize the layout directly inside the CMS.
          </p>
        ),
      ],
    },
    {
      type: "image",
      src: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=2000&auto=format&fit=crop",
      alt: "Kanso Studio website hero section mockup",
      caption: "Homepage hero balancing oversized type with generous white space.",
    },
    {
      type: "text",
      title: "Results",
      body: [
        (
          <p>
            Post-launch analytics show readers now complete <strong>38% more sessions on mobile</strong>, largely because the modular layout keeps typography consistent across breakpoints. The studio team now ships new case studies in under an hour using the documented component library.
          </p>
        ),
      ],
    },
  ],
  summary: "Minimal, typographic portfolio site with CMS.",
  challenge: "Make large type + dense case studies feel airy.",
  solution: "Strict grid, narrow measure, soft grays, and roomy rhythm.",
};
