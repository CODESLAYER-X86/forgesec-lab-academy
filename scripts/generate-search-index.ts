import fs from "node:fs";
import path from "node:path";
import fg from "fast-glob";
import matter from "gray-matter";
import yaml from "js-yaml";
import {
  GlossaryFileSchema,
  LearningPathSchema,
  LessonFrontmatterSchema,
  ResourceFrontmatterSchema,
  WriteupFrontmatterSchema,
} from "../modules/content/schemas";

export type SearchDocument = {
  id: string;
  title: string;
  slug: string;
  description: string;
  type: "tutorial" | "learning_path" | "writeup" | "guide" | "reference" | "glossary";
  category: string;
  difficulty?: string;
  tags: string[];
  searchableText: string;
  url: string;
};

function stripMarkdown(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/[#>*_`|[\]()]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 1400);
}

async function main() {
  const root = process.cwd();
  const docs: SearchDocument[] = [];

  const lessonFiles = await fg("content/lessons/**/*.mdx", { cwd: root });
  for (const rel of lessonFiles) {
    const raw = fs.readFileSync(path.join(root, rel), "utf8");
    const { data, content } = matter(raw);
    const meta = LessonFrontmatterSchema.parse(data);
    if (meta.status !== "published") continue;
    docs.push({
      id: meta.id,
      title: meta.title,
      slug: meta.slug,
      description: meta.description,
      type: "tutorial",
      category: meta.category,
      difficulty: meta.difficulty,
      tags: meta.tags,
      searchableText: `${meta.title} ${meta.description} ${meta.tags.join(" ")} ${stripMarkdown(content)}`,
      url: `/learn/lessons/${meta.slug}`,
    });
  }

  const pathFiles = await fg("content/paths/*.yaml", { cwd: root });
  for (const rel of pathFiles) {
    const raw = fs.readFileSync(path.join(root, rel), "utf8");
    const p = LearningPathSchema.parse(yaml.load(raw));
    if (p.status !== "published") continue;
    docs.push({
      id: `path:${p.id}`,
      title: p.title,
      slug: p.slug,
      description: p.description,
      type: "learning_path",
      category: p.category,
      difficulty: p.difficulty,
      tags: [p.category, p.difficulty, "learning-path"],
      searchableText: `${p.title} ${p.description} ${p.objectives.join(" ")}`,
      url: `/learn/paths/${p.slug}`,
    });
  }

  const writeupFiles = await fg("content/writeups/*.mdx", { cwd: root });
  for (const rel of writeupFiles) {
    const raw = fs.readFileSync(path.join(root, rel), "utf8");
    const { data, content } = matter(raw);
    const meta = WriteupFrontmatterSchema.parse(data);
    if (meta.status !== "published") continue;
    docs.push({
      id: meta.id,
      title: meta.title,
      slug: meta.slug,
      description: meta.description,
      type: "writeup",
      category: meta.category,
      difficulty: meta.difficulty,
      tags: meta.tags,
      searchableText: `${meta.title} ${meta.description} ${stripMarkdown(content)}`,
      url: `/writeups/${meta.slug}`,
    });
  }

  const resourceFiles = await fg("content/resources/*.mdx", { cwd: root });
  for (const rel of resourceFiles) {
    const raw = fs.readFileSync(path.join(root, rel), "utf8");
    const { data, content } = matter(raw);
    const meta = ResourceFrontmatterSchema.parse(data);
    if (meta.status !== "published") continue;
    docs.push({
      id: meta.id,
      title: meta.title,
      slug: meta.slug,
      description: meta.description,
      type: meta.resourceType,
      category: meta.category,
      difficulty: meta.difficulty,
      tags: meta.tags,
      searchableText: `${meta.title} ${meta.description} ${stripMarkdown(content)}`,
      url: `/resources/${meta.slug}`,
    });
  }

  const glossaryRaw = fs.readFileSync(path.join(root, "content/glossary/terms.yaml"), "utf8");
  const glossary = GlossaryFileSchema.parse(yaml.load(glossaryRaw));
  for (const item of glossary.items) {
    docs.push({
      id: `glossary:${item.slug}`,
      title: item.term,
      slug: item.slug,
      description: item.shortDefinition,
      type: "glossary",
      category: item.category,
      tags: [item.category, "glossary"],
      searchableText: `${item.term} ${item.shortDefinition} ${item.details}`,
      url: `/glossary/${item.slug}`,
    });
  }

  const outDir = path.join(root, "public", "search");
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "index.json"), JSON.stringify(docs, null, 2));
  console.log(`Generated search index with ${docs.length} published items.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
