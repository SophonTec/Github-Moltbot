"use client";

import { useMemo } from "react";
import DOMPurify from "dompurify";

export function SafeHtml({ html }: { html: string }) {
  const sanitized = useMemo(() => {
    return DOMPurify.sanitize(html, {
      USE_PROFILES: { html: true },
      ADD_ATTR: ["target", "rel"],
    });
  }, [html]);

  return (
    <div
      className="reader-content"
      // DOMPurify sanitizes
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
}
