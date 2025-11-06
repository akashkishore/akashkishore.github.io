import { useEffect, useRef } from "react";
import type { JSX } from "react";

declare global {
  interface Window {
    MathJax?: {
      typesetPromise?: (elements?: Element[]) => Promise<void>;
    };
  }
}

interface EquationProps {
  latex: string;
  display?: boolean;
  className?: string;
}

export function Equation({ latex, display = false, className }: EquationProps): JSX.Element {
  const blockRef = useRef<HTMLDivElement | null>(null);
  const inlineRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const node = (display ? blockRef.current : inlineRef.current);
    if (!node) return;
    const typeset = window.MathJax?.typesetPromise;
    if (typeof typeset === "function") {
      typeset([node]).catch(() => {
        // MathJax may not be ready yet; ignore and allow subsequent renders to retry.
      });
    }
  }, [latex, display]);

  const mathMarkup = display ? `\\[${latex}\\]` : `\\(${latex}\\)`;

  if (display) {
    return (
      <div ref={blockRef} className={className}>
        {mathMarkup}
      </div>
    );
  }

  return (
    <span ref={inlineRef} className={className}>
      {mathMarkup}
    </span>
  );
}
