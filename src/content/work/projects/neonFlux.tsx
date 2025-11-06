import type { WorkItem } from "../../types";

export const neonFlux: WorkItem = {
  id: "neon-flux",
  title: "Neon Flux",
  year: "22",
  role: "Fashion Editorial",
  types: ["Photography"],
  client: "Neon Flux Apparel",
  service: "Photography",
  cover:
    "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1600&auto=format&fit=crop",
  images: [
    "https://images.unsplash.com/photo-1585386959984-a41552231658?q=80&w=2000&auto=format&fit=crop",
  ],
  content: [
    {
      type: "text",
      title: "Creative Direction",
      body: [
        (
          <p>
            Neon Flux Apparel wanted an editorial that would feel like it was ripped from the future. We built a lighting rig with layered gels and reflective plexi panels to bathe each garment in saturated gradients without blowing out the highlights.
          </p>
        ),
        (
          <p>
            Each look was paired with a minimal set dressing so silhouettes stayed crisp. A custom LUT kept skin tones natural while leaning into the brand’s signature <em>electric palette</em>.
          </p>
        ),
      ],
    },
    {
      type: "image",
      src: "https://images.unsplash.com/photo-1585386959984-a41552231658?q=80&w=2000&auto=format&fit=crop",
      alt: "Neon Flux apparel editorial portrait",
      caption: "Color gel arrays reflecting off metallic fabrics to amplify structure.",
    },
    {
      type: "text",
      title: "Impact",
      body: [
        (
          <p>
            The editorial anchored the brand’s capsule launch and drove a <strong>2.3× increase</strong> in social engagement the week of release. The lighting setups were documented so the in-house team can recreate the mood for future drops.
          </p>
        ),
      ],
    },
  ],
  summary:
    "A high‑concept editorial blending cyberpunk aesthetics with bold color lighting, created for an avant‑garde fashion brand.",
  challenge:
    "Capture a futuristic tone while keeping the collection’s craftsmanship and textures visible under vibrant lighting.",
  solution:
    "Used a mix of neon gels, reflective surfaces, and low‑key lighting setups to create a dynamic, otherworldly visual mood while highlighting fabric detail.",
};
