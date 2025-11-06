import type { WorkItem } from "../../types";
import { Equation } from "../../../components/Equation";

export const luminaCity: WorkItem = {
  id: "lumina-city",
  title: "Lumina City",
  year: "24",
  role: "Conceptual Series",
  types: ["Photography"],
  client: "Personal",
  service: "Photography",
  cover:
    "https://images.unsplash.com/photo-1535016120720-40c646be5580?q=80&w=1600&auto=format&fit=crop",
  images: [
    "https://images.unsplash.com/photo-1544989164-31dc3c645987?q=80&w=2000&auto=format&fit=crop",
  ],
  content: [
    {
      type: "text",
      title: "Intent",
      body: [
        "Lumina City is an ongoing exploration of how urban light behaves when you stretch exposure just past what the eye expects. I scouted elevated vantage points and alleyway reflections to find compositions that could hold motion and stillness in the same frame.",
        (
          <p>
            Shooting tethered to a tablet let me iterate on exposure length in real time. I kept a log of <em>drag-shutter</em> tests and color temperatures so locations could be revisited as the city cycled through weather and foot traffic patterns.
          </p>
        ),
      ],
    },
    {
      type: "math",
      title: "Drag-Shutter Reference",
      latex: "t = \\frac{N^2}{L} \\cdot 2^{EV}",
      display: true,
      caption: "Quick exposure sketch used on set when swapping from f/4 to f/8 under sodium lights.",
    },
    {
      type: "image",
      src: "https://images.unsplash.com/photo-1544989164-31dc3c645987?q=80&w=2000&auto=format&fit=crop",
      alt: "Long exposure photograph of Lumina City street scene",
      caption: "Layered light trails captured on a two-second exposure.",
    },
    {
      type: "text",
      title: "What I Learned",
      body: [
        (
          <p>
            The series reinforced that <strong>motion blur thrives when geometry stays legible</strong>. Leading lines and architectural silhouettes give the viewer something to lock onto amid the glow.
          </p>
        ),
        (
          <p>
            Planning each shot started with the exposure relationship{" "}
            <Equation latex="L = \frac{N^2}{t}" /> and then nudging shutter speed until the ambient spill painted the frame without clipping the highlights.
          </p>
        ),
      ],
    },
  ],
  summary: "Long‑exposure street series exploring motion and glow.",
  challenge: "Balance motion blur with subject clarity in low light.",
  solution: "Tripod + drag‑shutter technique; compositional anchors for legibility.",
};
