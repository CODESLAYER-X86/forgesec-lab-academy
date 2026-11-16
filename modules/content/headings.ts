export interface TocHeading {
  id: string;
  text: string;
  level: 2 | 3;
}

export function decodeBasicEntities(text: string): string {
  return text
    .replace(/&#x20;/gi, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

export function cleanHeadingText(raw: string): string {
  return decodeBasicEntities(raw)
    .replace(/\*\*/g, "")
    .replace(/__/g, "")
    .replace(/`/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function slugifyHeading(text: string): string {
  return decodeBasicEntities(text)
    .toLowerCase()
    .replace(/[`*_~]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export function extractHeadings(markdown: string): TocHeading[] {
  const lines = markdown.split("\n");
  const headings: TocHeading[] = [];
  let inFence = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("```") || trimmed.startsWith("~~~")) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;

    const h2 = /^##\s+(.+)$/.exec(trimmed);
    const h3 = /^###\s+(.+)$/.exec(trimmed);
    if (h2) {
      const clean = cleanHeadingText(h2[1]);
      headings.push({ id: slugifyHeading(clean), text: clean, level: 2 });
    } else if (h3) {
      const clean = cleanHeadingText(h3[1]);
      headings.push({ id: slugifyHeading(clean), text: clean, level: 3 });
    }
  }

  return headings;
}
