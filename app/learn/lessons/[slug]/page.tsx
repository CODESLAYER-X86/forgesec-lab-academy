import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import rehypePrettyCode from "rehype-pretty-code";
import remarkGfm from "remark-gfm";
import {
  LessonInteractiveReader,
  type PrecompiledLessonPage,
} from "@/components/learning/lesson-interactive-reader";
import { mdxComponents } from "@/components/learning/mdx-components";
import { getAssignmentBySlug } from "@/modules/assignments/service";
import {
  getLessonBySlug,
  getLessonNeighbors,
  getPublishedLessons,
  paginateLesson,
} from "@/modules/content/loader";
import { getPublicQuizBySlug } from "@/modules/quizzes/service";

export const revalidate = 3600;

export async function generateStaticParams() {
  return getPublishedLessons().map((l) => ({ slug: l.meta.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const lesson = getLessonBySlug(slug);
  if (!lesson) return { title: "Lesson Not Found" };
  return {
    title: lesson.meta.title,
    description: lesson.meta.description,
    alternates: { canonical: `/learn/lessons/${lesson.meta.slug}` },
  };
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const lesson = getLessonBySlug(slug);
  if (!lesson) notFound();

  const { path: learningPath, pathLessons, previous, next } = getLessonNeighbors(lesson);

  const [quiz, assignment] = await Promise.all([
    lesson.meta.quizSlug ? getPublicQuizBySlug(lesson.meta.quizSlug) : Promise.resolve(null),
    lesson.meta.assignmentSlug
      ? getAssignmentBySlug(lesson.meta.assignmentSlug)
      : Promise.resolve(null),
  ]);

  const rawPages = paginateLesson(lesson.content, lesson.meta.estimatedMinutes, {
    hasQuiz: Boolean(quiz),
  });

  const mdxOptions = {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [
      [
        rehypePrettyCode,
        {
          theme: "github-dark-default",
          keepBackground: false,
        },
      ],
    ] as never,
  };

  const compiledPages: PrecompiledLessonPage[] = rawPages.map((p) => ({
    pageNumber: p.pageNumber,
    title: p.title,
    headings: p.headings,
    estimatedMinutes: p.estimatedMinutes,
    wordCount: p.wordCount,
    isAssessmentPage: p.isAssessmentPage,
    mdxNode: p.mdxContent ? (
      <MDXRemote
        source={p.mdxContent}
        components={mdxComponents}
        options={{ mdxOptions }}
      />
    ) : null,
  }));

  const pathItems = pathLessons.map((item) => ({
    id: item.meta.id,
    slug: item.meta.slug,
    title: item.meta.title,
    moduleNumber: item.meta.moduleNumber,
    completed: false,
  }));

  return (
    <LessonInteractiveReader
      lesson={{
        id: lesson.meta.id,
        pathId: lesson.meta.pathId,
        slug: lesson.meta.slug,
        title: lesson.meta.title,
        description: lesson.meta.description,
        moduleNumber: lesson.meta.moduleNumber,
        category: lesson.meta.category,
        difficulty: lesson.meta.difficulty,
        estimatedMinutes: lesson.meta.estimatedMinutes,
        updatedAt: lesson.meta.updatedAt,
      }}
      learningPath={
        learningPath
          ? { title: learningPath.title, slug: learningPath.slug }
          : null
      }
      pathItems={pathItems}
      previousLesson={
        previous ? { slug: previous.meta.slug, title: previous.meta.title } : null
      }
      nextLesson={next ? { slug: next.meta.slug, title: next.meta.title } : null}
      pages={compiledPages}
      quiz={quiz}
      assignment={assignment}
    />
  );
}
