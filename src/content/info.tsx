import portraitImg from "../assets/images/Akash.jpg";
import type { InfoContent } from "./types";

export const infoContent: InfoContent = {
  title: "Akash Kishore",
  subtitle: "Computational Biology PhD Student · CMU-Pitt Joint Program",
  summary:
    "I'm a computational biology PhD student building interpretable machine learning tools to study the immune system. I work closely with experimental collaborators and care about making complex systems more understandable.",
  portrait: {
    src: portraitImg,
    alt: "Akash portrait",
    credit: "",
  },
  contact: {
    email: "akk135@pitt.edu",
    location: "Pittsburgh, PA",
    linkedin: "https://www.linkedin.com/in/akashkishore2000",
  },
  skills: [
    {
      category: "Machine Learning",
      items: ["Interpretability", "Representation learning", "Generative modeling"],
    },
    {
      category: "Computational",
      items: ["Python", "R", "bash"],
    },
    {
      category: "Biology",
      items: ["Protein design", "Immunoinformatics", "Single-cell analysis"],
    },
    {
      category: "Collaboration",
      items: ["Science communication", "Mentorship", "Team coordination"],
    },
  ],
  experience: [
    {
      role: "Research Assistant",
      organization: "Center for Systems Immunology, University of Pittsburgh",
      location: "Pittsburgh, PA",
      start: "January 2023",
      end: "June 2024",
      accomplishments: [
        "Designed models to predict co-authorship using PubMed-BERT embeddings of authors and graph attention neural networks with performance of AuC 0.9+",
        "Designed machine learning and network based experiments for spatial transcriptomic data (Visium and SLIDE-Seq) from a house dust mite allergen mouse model that identified drivers of Tfh and Th2 differentiation with performance of AuC 0.82",
        "Constructed statistical pipelines for multi-omic data to study differences in Rheumatoid Arthritis endotypes",
        "Programmed data and statistical pipelines for ChIP-Seq and ATAC-Seq data to extract Open Chromatin Regions of interest in B Cell states to construct a dynamic gene regulatory network",
      ],
    },

    {
      role: "Summer Research Intern",
      organization: "Indian Institute of Science (IISc)",
      location: "Bengaluru, India",
      start: "May 2021",
      end: "August 2021",
      accomplishments: [
        "Analysed transcriptomic datasets from NCBI GEO to confirm presence of immunosuppressive traits in the hybrid state during Epithelial Mesenchymal Transition",
        "Deployed data-processing workflows that reduced experiment turnaround time by 30%.",
      ],
    },
  ],
  education: [
    {
      program: "PhD, Computational Biology",
      institution: "Carnegie Mellon University & University of Pittsburgh",
      location: "Pittsburgh, PA",
      start: "August 2024",
      end: "Present",
      notes: [
        "Advised by Dr. Jishnu Das.",
        // "Focus: interpretable ML for immunological protein design.",
      ],
    },
    {
      program: "M.S. Automated Sciences: Biological Experimentation",
      institution: "Carnegie Mellon University",
      location: "Pittsburgh, PA",
      start: "2022",
      end: "2024",
      notes: []
    },
    {
      program: "B.E., Computer Science & Engineering",
      institution: "SSN College of Engineering, Anna University",
      location: "Chennai, India",
      start: "2018",
      end: "2022",
      notes: [
        // "Graduated with distinction with a minor focus on computer science.",
        // "Capstone: deep learning approaches for protein structure prediction.",
      ],
    },
  ],
  recognitions: [
    // {
    //   year: "2024",
    //   title: "Poster presenter, CMU-Pitt Computational Biology Retreat",
    //   by: "Carnegie Mellon University & University of Pittsburgh",
    // },
    // {
    //   year: "2023",
    //   title: "Graduate Research Fellowship",
    //   by: "CMU-Pitt Joint Program in Computational Biology",
    // },
    // {
    //   year: "2022",
    //   title: "Outstanding Undergraduate Thesis Award",
    //   by: "SSN College of Engineering",
    // },
  ],
  publications: [
    {
      title: "Full publication list available on Google Scholar",
      venue: "Google Scholar profile",
      year: "",
      link: "https://scholar.google.com/citations?user=DLXZKH4AAAAJ",
    },
  ],
};
