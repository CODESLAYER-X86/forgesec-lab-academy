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

const root = process.cwd();

async function main() {
  const seenIds = new Set<string>();
  const seenSlugs = new Set<string>();
  const lessonIds = new Set<string>();
  let errors = 0;

  const lessonFiles = await fg("content/lessons/**/*.mdx", { cwd: root });
  for (const rel of lessonFiles) {
    const raw = fs.readFileSync(path.join(root, rel), "utf8");
    const { data, content } = matter(raw);
    const parsed = LessonFrontmatterSchema.safeParse(data);
    if (!parsed.success) {
      console.error(`Invalid lesson frontmatter in ${rel}:`, parsed.error.flatten());
      errors++;
      continue;
    }
    if (!content.trim()) {
      console.error(`Empty lesson body in ${rel}`);
      errors++;
    }
    if (seenIds.has(parsed.data.id)) {
      console.error(`Duplicate content ID: ${parsed.data.id} in ${rel}`);
      errors++;
    }
    if (seenSlugs.has(`lesson:${parsed.data.slug}`)) {
      console.error(`Duplicate lesson slug: ${parsed.data.slug} in ${rel}`);
      errors++;
    }
    seenIds.add(parsed.data.id);
    seenSlugs.add(`lesson:${parsed.data.slug}`);
    lessonIds.add(parsed.data.id);
  }

  const pathFiles = await fg("content/paths/*.yaml", { cwd: root });
  for (const rel of pathFiles) {
    const raw = fs.readFileSync(path.join(root, rel), "utf8");
    const parsed = LearningPathSchema.safeParse(yaml.load(raw));
    if (!parsed.success) {
      console.error(`Invalid learning path in ${rel}:`, parsed.error.flatten());
      errors++;
      continue;
    }
    for (const lid of parsed.data.lessons) {
      if (!lessonIds.has(lid)) {
        console.error(`Learning path ${rel} references missing lesson ID: ${lid}`);
        errors++;
      }
    }
  }

  const writeupFiles = await fg("content/writeups/*.mdx", { cwd: root });
  for (const rel of writeupFiles) {
    const raw = fs.readFileSync(path.join(root, rel), "utf8");
    const { data } = matter(raw);
    const parsed = WriteupFrontmatterSchema.safeParse(data);
    if (!parsed.success) {
      console.error(`Invalid writeup in ${rel}:`, parsed.error.flatten());
      errors++;
    }
  }

  const resourceFiles = await fg("content/resources/*.mdx", { cwd: root });
  for (const rel of resourceFiles) {
    const raw = fs.readFileSync(path.join(root, rel), "utf8");
    const { data } = matter(raw);
    const parsed = ResourceFrontmatterSchema.safeParse(data);
    if (!parsed.success) {
      console.error(`Invalid resource in ${rel}:`, parsed.error.flatten());
      errors++;
    }
  }

  const glossaryRaw = fs.readFileSync(path.join(root, "content/glossary/terms.yaml"), "utf8");
  const glossaryParsed = GlossaryFileSchema.safeParse(yaml.load(glossaryRaw));
  if (!glossaryParsed.success) {
    console.error("Invalid glossary file:", glossaryParsed.error.flatten());
    errors++;
  }

  if (errors > 0) {
    console.error(`Content validation failed with ${errors} error(s).`);
    process.exit(1);
  }

  console.log(
    `Content validation passed: ${lessonFiles.length} lessons, ${pathFiles.length} paths, ${writeupFiles.length} write-ups, ${resourceFiles.length} resources, ${glossaryParsed.data?.items.length ?? 0} glossary terms.`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
