"use client";

import { useEffect } from "react";

const sectionAlias = {
  packages: "tour-packages",
};

export default function ScrollToSection({ sectionId }) {
  useEffect(() => {
    if (!sectionId) return;
    const targetId = sectionAlias[sectionId] || sectionId;

    const scrollToTarget = () => {
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    };

    const timeout = window.setTimeout(scrollToTarget, 50);
    return () => window.clearTimeout(timeout);
  }, [sectionId]);

  return null;
}
