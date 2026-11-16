import { z } from "zod";

export const ContentStatusSchema = z.enum(["draft", "published", "archived"]);
export const DifficultySchema = z.enum(["beginner", "intermediate", "advanced"]);

export const LessonFrontmatterSchema = z.object({
  id: z.string().min(3),
  title: z.string().min(3),
  slug: z.string().min(3),
  description: z.string().min(10),
  category: z.string().min(2),
  pathId: z.string().min(2),
  moduleNumber: z.number().int().positive(),
  difficulty: DifficultySchema,
  estimatedMinutes: z.number().int().positive(),
  tags: z.array(z.string()).min(1),
  status: ContentStatusSchema,
  updatedAt: z.string().min(4),
  quizSlug: z.string().optional(),
  assignmentSlug: z.string().optional(),
});

export const LearningPathSchema = z.object({
  id: z.string().min(3),
  slug: z.string().min(3),
  title: z.string().min(3),
  description: z.string().min(10),
  category: z.string().min(2),
  difficulty: DifficultySchema,
  estimatedMinutes: z.number().int().positive(),
  status: ContentStatusSchema,
  instructor: z.string().min(2),
  objectives: z.array(z.string()).min(1),
  prerequisites: z.array(z.string()).default([]),
  lessons: z.array(z.string()).min(1),
});

export const WriteupFrontmatterSchema = z.object({
  id: z.string().min(3),
  title: z.string().min(3),
  slug: z.string().min(3),
  description: z.string().min(10),
  category: z.string().min(2),
  difficulty: DifficultySchema,
  estimatedMinutes: z.number().int().positive(),
  tags: z.array(z.string()).min(1),
  status: ContentStatusSchema,
  updatedAt: z.string().min(4),
  author: z.string().min(2),
});

export const ResourceFrontmatterSchema = z.object({
  id: z.string().min(3),
  title: z.string().min(3),
  slug: z.string().min(3),
  description: z.string().min(10),
  category: z.string().min(2),
  difficulty: DifficultySchema,
  estimatedMinutes: z.number().int().positive(),
  tags: z.array(z.string()).min(1),
  status: ContentStatusSchema,
  updatedAt: z.string().min(4),
  resourceType: z.enum(["guide", "reference"]),
});

export const GlossaryFileSchema = z.object({
  id: z.string(),
  items: z.array(
    z.object({
      term: z.string().min(2),
      slug: z.string().min(2),
      category: z.string().min(2),
      shortDefinition: z.string().min(10),
      details: z.string().min(10),
      relatedLessonSlug: z.string().optional(),
    })
  ),
});

export type LessonFrontmatter = z.infer<typeof LessonFrontmatterSchema>;
export type LearningPath = z.infer<typeof LearningPathSchema>;
export type WriteupFrontmatter = z.infer<typeof WriteupFrontmatterSchema>;
export type ResourceFrontmatter = z.infer<typeof ResourceFrontmatterSchema>;
export type GlossaryItem = z.infer<typeof GlossaryFileSchema>["items"][number];
