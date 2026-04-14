import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export function ScrollToTop(): null {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    const scrollRegions = document.querySelectorAll<HTMLElement>("[data-scroll-region]");
    scrollRegions.forEach((scrollRegion) => {
      scrollRegion.scrollTo({ top: 0, left: 0, behavior: "auto" });
    });
  }, [pathname, hash]);

  return null;
}
