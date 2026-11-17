import { cleanHeadingText, extractHeadings, type TocHeading } from "@/modules/content/headings";

export interface LessonPageChunk {
  pageNumber: number;
  title: string;
  mdxContent: string;
  headings: TocHeading[];
  estimatedMinutes: number;
  wordCount: number;
  isAssessmentPage: boolean;
}

interface SectionUnit {
  cleanTitle: string;
  mdx: string;
  words: number;
  isRecap: boolean;
}

const TARGET_WORDS_PER_PAGE = 700;
const MAX_SINGLE_SECTION_WORDS = 1020;

export function countWords(markdown: string): number {
  const cleaned = markdown
    .replace(/```[\s\S]*?```/g, (block) => block.replace(/```[^\n]*/g, " "))
    .replace(/[|#*`_>\[\]()!-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!cleaned) return 0;
  return cleaned.split(" ").length;
}

function stripSectionPrefix(title: string): string {
  return title
    .replace(/^Section\s+\d+\s*[—–-]\s*/i, "")
    .replace(/^[A-Z]\.\s+/i, "")
    .replace(/^\d+\.\s+/, "")
    .trim();
}

function isRecapHeading(cleanTitle: string): boolean {
  return /^(?:Section\s+\d+\s*[—–-]\s*|[A-Z]\.\s+)?(?:Module Recap|Lesson Recap|Final Recap|Module Completion|Summary|Explore Your Next Learning Path)\b/i.test(
    cleanTitle
  );
}

function parseTopLevelSections(markdown: string): {
  preamble: string;
  sections: SectionUnit[];
} {
  const lines = markdown.split("\n");
  const preambleLines: string[] = [];
  const rawSections: Array<{ headingLine: string; cleanTitle: string; bodyLines: string[] }> = [];
  let inFence = false;
  let current: { headingLine: string; cleanTitle: string; bodyLines: string[] } | null = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("```") || trimmed.startsWith("~~~")) {
      inFence = !inFence;
    }

    if (!inFence) {
      const h2Match = /^##\s+(.+)$/.exec(trimmed);
      if (h2Match) {
        if (current) {
          rawSections.push(current);
        }
        const cleanTitle = cleanHeadingText(h2Match[1]);
        current = {
          headingLine: line,
          cleanTitle,
          bodyLines: [],
        };
        continue;
      }
    }

    if (current) {
      current.bodyLines.push(line);
    } else {
      preambleLines.push(line);
    }
  }

  if (current) {
    rawSections.push(current);
  }

  const preamble = preambleLines.join("\n").trim();
  const sections: SectionUnit[] = rawSections.map((sec) => {
    const mdx = `${sec.headingLine}\n${sec.bodyLines.join("\n")}`.trim();
    return {
      cleanTitle: sec.cleanTitle,
      mdx,
      words: countWords(mdx),
      isRecap: isRecapHeading(sec.cleanTitle),
    };
  });

  return { preamble, sections };
}

function splitLargeSectionOnH3(section: SectionUnit): SectionUnit[] {
  if (section.words <= MAX_SINGLE_SECTION_WORDS) return [section];

  const lines = section.mdx.split("\n");
  const topHeading = lines[0] ?? "";
  const introLines: string[] = [];
  const subBlocks: Array<{ title: string; lines: string[] }> = [];
  let currentSub: { title: string; lines: string[] } | null = null;
  let inFence = false;

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    if (trimmed.startsWith("```") || trimmed.startsWith("~~~")) {
      inFence = !inFence;
    }
    if (!inFence) {
      const h3Match = /^###\s+(.+)$/.exec(trimmed);
      if (h3Match) {
        if (currentSub) subBlocks.push(currentSub);
        currentSub = {
          title: cleanHeadingText(h3Match[1]),
          lines: [line],
        };
        continue;
      }
    }
    if (currentSub) {
      currentSub.lines.push(line);
    } else {
      introLines.push(line);
    }
  }
  if (currentSub) subBlocks.push(currentSub);

  if (subBlocks.length < 3) return [section];

  // Partition subBlocks roughly in half by word count
  const totalSubWords = subBlocks.reduce((acc, b) => acc + countWords(b.lines.join("\n")), 0);
  const halfTarget = totalSubWords / 2;
  let splitIdx = 1;
  let running = 0;
  for (let i = 0; i < subBlocks.length - 1; i++) {
    running += countWords(subBlocks[i].lines.join("\n"));
    splitIdx = i + 1;
    if (running >= halfTarget) break;
  }

  const firstBody = [
    topHeading,
    ...introLines,
    ...subBlocks.slice(0, splitIdx).flatMap((b) => b.lines),
  ]
    .join("\n")
    .trim();

  const baseClean = stripSectionPrefix(section.cleanTitle);
  const secondBody = [
    `## ${baseClean} (Continued)`,
    ...subBlocks.slice(splitIdx).flatMap((b) => b.lines),
  ]
    .join("\n")
    .trim();

  return [
    {
      cleanTitle: `${section.cleanTitle} (Part 1)`,
      mdx: firstBody,
      words: countWords(firstBody),
      isRecap: false,
    },
    {
      cleanTitle: `${baseClean} (Part 2)`,
      mdx: secondBody,
      words: countWords(secondBody),
      isRecap: false,
    },
  ];
}

function partitionUnitsBalanced(units: SectionUnit[]): SectionUnit[][] {
  if (units.length <= 1) return units.length === 1 ? [units] : [];

  const totalWords = units.reduce((sum, u) => sum + u.words, 0);
  if (totalWords <= 850) {
    return [units];
  }

  const targetPages = Math.max(
    2,
    Math.min(units.length, Math.round(totalWords / TARGET_WORDS_PER_PAGE))
  );
  const idealPerPage = totalWords / targetPages;

  const n = units.length;
  const prefix = new Array<number>(n + 1).fill(0);
  for (let i = 0; i < n; i++) {
    prefix[i + 1] = prefix[i] + units[i].words;
  }

  // DP[k][i] = min cost to partition first i units into k pages
  const INF = Number.POSITIVE_INFINITY;
  const dp: number[][] = Array.from({ length: targetPages + 1 }, () =>
    new Array<number>(n + 1).fill(INF)
  );
  const back: number[][] = Array.from({ length: targetPages + 1 }, () =>
    new Array<number>(n + 1).fill(0)
  );
  dp[0][0] = 0;

  for (let k = 1; k <= targetPages; k++) {
    for (let i = k; i <= n; i++) {
      for (let j = k - 1; j < i; j++) {
        if (!Number.isFinite(dp[k - 1][j])) continue;
        const pageWords = prefix[i] - prefix[j];
        const diff = pageWords - idealPerPage;
        const oversizePenalty = pageWords > 1050 ? (pageWords - 1050) ** 2 * 3 : 0;
        const cost = dp[k - 1][j] + diff * diff + oversizePenalty;
        if (cost < dp[k][i]) {
          dp[k][i] = cost;
          back[k][i] = j;
        }
      }
    }
  }

  const ranges: Array<[number, number]> = [];
  let cursor = n;
  for (let k = targetPages; k >= 1; k--) {
    const start = back[k][cursor];
    ranges.unshift([start, cursor]);
    cursor = start;
  }

  return ranges.map(([start, end]) => units.slice(start, end));
}

function buildReadingPageTitle(group: SectionUnit[]): string {
  if (group.length === 0) return "Lesson Content";
  const titles = group
    .map((u) => stripSectionPrefix(u.cleanTitle))
    .filter((t) => t.length > 0);

  if (titles.length === 1) return titles[0];

  const nonIntro = titles.filter(
    (t) => !/^(?:Welcome|Learning Objectives|What You Will Learn)/i.test(t)
  );
  if (titles.length === 2) {
    if (/^(?:Welcome|Learning Objectives|What You Will Learn)/i.test(titles[0]) && nonIntro[0]) {
      return `Overview & ${nonIntro[0]}`;
    }
    return `${titles[0]} & ${titles[1]}`;
  }

  const startLabel = /^(?:Welcome|Learning Objectives|What You Will Learn)/i.test(titles[0])
    ? "Overview"
    : titles[0];
  const endLabel = titles[titles.length - 1];
  return startLabel === endLabel ? startLabel : `${startLabel} & ${endLabel}`;
}

export function clampPageNumber(rawPage: string | number | undefined, totalPages: number): number {
  const safeTotal = Math.max(1, totalPages);
  if (rawPage === undefined) return 1;
  const parsed = typeof rawPage === "number" ? rawPage : Number.parseInt(rawPage, 10);
  if (!Number.isFinite(parsed) || Number.isNaN(parsed)) return 1;
  return Math.min(safeTotal, Math.max(1, parsed));
}

export function paginateLesson(
  rawContent: string,
  _totalEstimatedMinutes: number,
  options?: { hasQuiz?: boolean }
): LessonPageChunk[] {
  const hasQuiz = options?.hasQuiz ?? true;
  const { preamble, sections } = parseTopLevelSections(rawContent);

  if (sections.length === 0) {
    const words = countWords(rawContent);
    const readingChunk: LessonPageChunk = {
      pageNumber: 1,
      title: "Lesson Overview",
      mdxContent: rawContent.trim(),
      headings: extractHeadings(rawContent),
      estimatedMinutes: Math.max(1, Math.min(5, Math.round(words / 185))),
      wordCount: words,
      isAssessmentPage: !hasQuiz,
    };
    if (!hasQuiz) return [readingChunk];
    return [
      readingChunk,
      {
        pageNumber: 2,
        title: "Knowledge Check & Completion",
        mdxContent: "",
        headings: [],
        estimatedMinutes: 3,
        wordCount: 0,
        isAssessmentPage: true,
      },
    ];
  }

  const firstRecapIdx = sections.findIndex((s) => s.isRecap);
  const readingRaw = firstRecapIdx === -1 ? sections : sections.slice(0, firstRecapIdx);
  const recapRaw = firstRecapIdx === -1 ? [] : sections.slice(firstRecapIdx);

  // Attach preamble (e.g., Module 01 metadata table) onto the first reading section
  if (preamble && readingRaw.length > 0) {
    readingRaw[0] = {
      ...readingRaw[0],
      mdx: `${preamble}\n\n---\n\n${readingRaw[0].mdx}`,
      words: countWords(`${preamble}\n\n${readingRaw[0].mdx}`),
    };
  }

  const expandedReading = readingRaw.flatMap(splitLargeSectionOnH3);
  const groupedReading = partitionUnitsBalanced(expandedReading);

  const pages: LessonPageChunk[] = groupedReading.map((group, idx) => {
    const mdxContent = group.map((u) => u.mdx).join("\n\n").trim();
    const wordCount = countWords(mdxContent);
    return {
      pageNumber: idx + 1,
      title: buildReadingPageTitle(group),
      mdxContent,
      headings: extractHeadings(mdxContent),
      estimatedMinutes: Math.max(1, Math.min(5, Math.round(wordCount / 185))),
      wordCount,
      isAssessmentPage: false,
    };
  });

  const recapMdx = recapRaw.map((u) => u.mdx).join("\n\n").trim();
  const recapWords = countWords(recapMdx);
  pages.push({
    pageNumber: pages.length + 1,
    title: hasQuiz ? "Recap & Knowledge Check" : "Module Recap & Completion",
    mdxContent: recapMdx,
    headings: extractHeadings(recapMdx),
    estimatedMinutes: Math.max(2, Math.min(5, Math.round(recapWords / 185) + (hasQuiz ? 2 : 0))),
    wordCount: recapWords,
    isAssessmentPage: true,
  });

  return pages;
}
