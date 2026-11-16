import { describe, expect, it } from "vitest";
import type { LearningPath } from "@/modules/content/schemas";
import {
  calculatePathProgress,
  pickContinueLearningPath,
} from "@/modules/learning/progress";

const PATH_LINUX: LearningPath = {
  id: "path-linux",
  slug: "linux-fundamentals",
  title: "Linux Fundamentals",
  description: "Master essential Linux administration and hardening.",
  category: "linux",
  difficulty: "beginner",
  estimatedMinutes: 120,
  status: "published",
  instructor: "FORGESEC Faculty",
  objectives: ["Navigate shell confidently"],
  prerequisites: [],
  lessons: ["linux-001", "linux-002", "linux-003"],
};

const PATH_NET: LearningPath = {
  id: "path-net",
  slug: "networking-fundamentals",
  title: "Networking Fundamentals",
  description: "TCP/IP, ports, and DNS resolution.",
  category: "networking",
  difficulty: "beginner",
  estimatedMinutes: 90,
  status: "published",
  instructor: "FORGESEC Faculty",
  objectives: ["Read packet headers"],
  prerequisites: [],
  lessons: ["net-001", "net-002"],
};

describe("Learning path progress math", () => {
  it("computes not_started, in_progress, and completed states deterministically", () => {
    const empty = calculatePathProgress(PATH_LINUX, new Set());
    expect(empty.status).toBe("not_started");
    expect(empty.percentage).toBe(0);
    expect(empty.nextLessonId).toBe("linux-001");

    const partial = calculatePathProgress(PATH_LINUX, new Set(["linux-001"]));
    expect(partial.status).toBe("in_progress");
    expect(partial.completedLessons).toBe(1);
    expect(partial.percentage).toBe(33);
    expect(partial.nextLessonId).toBe("linux-002");

    const done = calculatePathProgress(
      PATH_LINUX,
      new Set(["linux-001", "linux-002", "linux-003"])
    );
    expect(done.status).toBe("completed");
    expect(done.percentage).toBe(100);
    expect(done.nextLessonId).toBeNull();
  });

  it("prioritizes an active in_progress path for Continue Learning", () => {
    const picked = pickContinueLearningPath(
      [PATH_LINUX, PATH_NET],
      new Set(["net-001"])
    );
    expect(picked?.pathId).toBe("path-net");
    expect(picked?.nextLessonId).toBe("net-002");
  });

  it("falls back to next unstarted path when earlier path is completed", () => {
    const picked = pickContinueLearningPath(
      [PATH_LINUX, PATH_NET],
      new Set(["linux-001", "linux-002", "linux-003"])
    );
    expect(picked?.pathId).toBe("path-net");
    expect(picked?.status).toBe("not_started");
  });
});
