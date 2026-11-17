import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import type {
  AssignmentProgressRecord,
  AuditLogEntry,
  BookmarkRecord,
  ContentActivityRecord,
  LessonProgressRecord,
  PracticalAssignment,
  QuizAttemptRecord,
  ServerQuiz,
  SessionUser,
} from "@/lib/types/domain";

export interface PreviewDatabase {
  users: SessionUser[];
  lessonProgress: LessonProgressRecord[];
  bookmarks: BookmarkRecord[];
  contentActivity: ContentActivityRecord[];
  quizzes: ServerQuiz[];
  quizAttempts: QuizAttemptRecord[];
  assignments: PracticalAssignment[];
  assignmentProgress: AssignmentProgressRecord[];
  auditLogs: AuditLogEntry[];
}

const DB_DIR =
  process.env.VERCEL === "1"
    ? path.join(os.tmpdir(), "forgesec-preview")
    : path.join(process.cwd(), ".data");
const DB_FILE = path.join(DB_DIR, "preview-db.json");

let memoryFallbackDb: PreviewDatabase | null = null;

function createInitialSeed(): PreviewDatabase {
  const now = new Date().toISOString();
  const earlier = new Date(Date.now() - 86400000 * 2).toISOString();
  const oneDayAgo = new Date(Date.now() - 86400000).toISOString();

  return {
    users: [
      {
        id: "preview-student-01",
        email: "student@forgesec.academy",
        displayName: "Nadia Rahman",
        bio: "Computer science undergraduate studying Linux system administration and defensive security.",
        interests: ["Linux", "Networking", "Web Security"],
        role: "student",
        isPermanentAdmin: false,
        canManageQuizzes: false,
        canManageAssignments: false,
        accountStatus: "active",
        createdAt: earlier,
        authMode: "preview",
      },
      {
        id: "preview-instructor-01",
        email: "instructor@forgesec.academy",
        displayName: "Tariq Hasan",
        bio: "Linux systems instructor maintaining assessment labs and practical assignments.",
        interests: ["Linux", "System Hardening"],
        role: "instructor",
        isPermanentAdmin: false,
        canManageQuizzes: true,
        canManageAssignments: true,
        accountStatus: "active",
        createdAt: earlier,
        authMode: "preview",
      },
      {
        id: "preview-admin-01",
        email: "admin@forgesec.academy",
        displayName: "FORGESEC Lead Admin",
        bio: "Platform administrator overseeing security policies, permissions, and curriculum quality.",
        interests: ["Security Architecture", "Access Control"],
        role: "admin",
        isPermanentAdmin: true,
        canManageQuizzes: true,
        canManageAssignments: true,
        accountStatus: "active",
        createdAt: earlier,
        authMode: "preview",
      },
    ],
    lessonProgress: [
      {
        userId: "preview-student-01",
        lessonId: "linux-001",
        pathId: "linux-fundamentals",
        completed: true,
        completedAt: earlier,
        updatedAt: earlier,
      },
      {
        userId: "preview-student-01",
        lessonId: "linux-002",
        pathId: "linux-fundamentals",
        completed: true,
        completedAt: oneDayAgo,
        updatedAt: oneDayAgo,
      },
    ],
    bookmarks: [
      {
        id: "bm-1",
        userId: "preview-student-01",
        contentId: "linux-005",
        contentType: "tutorial",
        title: "Users, Groups and File Permissions",
        slug: "users-groups-and-file-permissions",
        createdAt: oneDayAgo,
      },
      {
        id: "bm-2",
        userId: "preview-student-01",
        contentId: "resource-001",
        contentType: "reference",
        title: "Linux Essential Command Reference",
        slug: "linux-essential-command-reference",
        createdAt: oneDayAgo,
      },
    ],
    contentActivity: [
      {
        id: "act-1",
        userId: "preview-student-01",
        contentId: "linux-001",
        contentType: "tutorial",
        title: "Introduction to Linux and the Terminal",
        slug: "introduction-to-linux-and-the-terminal",
        viewedAt: earlier,
      },
      {
        id: "act-2",
        userId: "preview-student-01",
        contentId: "linux-002",
        contentType: "tutorial",
        title: "Linux Filesystem and Navigation",
        slug: "linux-filesystem-and-navigation",
        viewedAt: oneDayAgo,
      },
      {
        id: "act-3",
        userId: "preview-student-01",
        contentId: "linux-003",
        contentType: "tutorial",
        title: "File and Directory Management",
        slug: "file-and-directory-management",
        viewedAt: now,
      },
    ],
    quizzes: [
      {
        id: "quiz-linux-fundamentals",
        slug: "linux-fundamentals-check",
        title: "Module 01 Knowledge Check — Linux & Terminal",
        description: "Verify your grasp of the Linux kernel, Bash shell, command syntax, and foundational terminal commands.",
        category: "linux",
        difficulty: "beginner",
        lessonId: "linux-001",
        passPercentage: 100,
        status: "published",
        createdAt: earlier,
        updatedAt: earlier,
        questions: [
          {
            id: "q-lf-1",
            prompt: "What is the primary purpose of the Linux kernel?",
            questionType: "single_choice",
            sortOrder: 1,
            explanation: "The Linux kernel manages CPU, memory, and hardware communication between software and physical devices.",
            correctOptionIds: ["q-lf-1-b"],
            options: [
              { id: "q-lf-1-a", label: "A", optionText: "To provide a graphical desktop environment", sortOrder: 1 },
              { id: "q-lf-1-b", label: "B", optionText: "To manage hardware and essential system resources", sortOrder: 2 },
              { id: "q-lf-1-c", label: "C", optionText: "To browse websites over HTTP", sortOrder: 3 },
              { id: "q-lf-1-d", label: "D", optionText: "To store user passwords in plaintext", sortOrder: 4 },
            ],
          },
          {
            id: "q-lf-2",
            prompt: "Which command displays the full path of your current working directory?",
            questionType: "single_choice",
            sortOrder: 2,
            explanation: "pwd stands for 'print working directory' and outputs the absolute path of your shell location.",
            correctOptionIds: ["q-lf-2-b"],
            options: [
              { id: "q-lf-2-a", label: "A", optionText: "ls", sortOrder: 1 },
              { id: "q-lf-2-b", label: "B", optionText: "pwd", sortOrder: 2 },
              { id: "q-lf-2-c", label: "C", optionText: "whoami", sortOrder: 3 },
              { id: "q-lf-2-d", label: "D", optionText: "uname -r", sortOrder: 4 },
            ],
          },
          {
            id: "q-lf-3",
            prompt: "Which commands provide built-in documentation or brief usage summaries in Linux? (Select all that apply)",
            questionType: "multiple_select",
            sortOrder: 3,
            explanation: "Both man <command> and <command> --help display command usage and option documentation.",
            correctOptionIds: ["q-lf-3-a", "q-lf-3-c"],
            options: [
              { id: "q-lf-3-a", label: "A", optionText: "man uname", sortOrder: 1 },
              { id: "q-lf-3-b", label: "B", optionText: "clear", sortOrder: 2 },
              { id: "q-lf-3-c", label: "C", optionText: "bash --help", sortOrder: 3 },
              { id: "q-lf-3-d", label: "D", optionText: "history", sortOrder: 4 },
            ],
          },
          {
            id: "q-lf-4",
            prompt: "In the terminal, whoami prints the kernel release number while uname -r prints your username.",
            questionType: "true_false",
            sortOrder: 4,
            explanation: "False — whoami outputs your effective username, whereas uname -r displays the Linux kernel release version.",
            correctOptionIds: ["q-lf-4-b"],
            options: [
              { id: "q-lf-4-a", label: "A", optionText: "True", sortOrder: 1 },
              { id: "q-lf-4-b", label: "B", optionText: "False", sortOrder: 2 },
            ],
          },
          {
            id: "q-lf-5",
            prompt: "Type the command that prints only the Linux kernel release version.",
            questionType: "command_input",
            sortOrder: 5,
            placeholder: "e.g. uname ...",
            explanation: "uname -r outputs the running Linux kernel release string (for example, 6.8.0-generic).",
            correctOptionIds: [],
            acceptedAnswers: ["uname -r", "uname --kernel-release"],
            options: [],
          },
        ],
      },
      {
        id: "quiz-linux-filesystem",
        slug: "linux-filesystem-check",
        title: "Module 02 Knowledge Check — Filesystem & Navigation",
        description: "Test your understanding of the root directory, system folders, absolute vs. relative paths, and CLI navigation.",
        category: "linux",
        difficulty: "beginner",
        lessonId: "linux-002",
        passPercentage: 100,
        status: "published",
        createdAt: earlier,
        updatedAt: earlier,
        questions: [
          {
            id: "q-fs-1",
            prompt: "What does the / directory represent in Linux?",
            questionType: "single_choice",
            sortOrder: 1,
            explanation: "/ is the root directory at the top of the entire Linux filesystem hierarchy.",
            correctOptionIds: ["q-fs-1-b"],
            options: [
              { id: "q-fs-1-a", label: "A", optionText: "The home directory of the current user", sortOrder: 1 },
              { id: "q-fs-1-b", label: "B", optionText: "The root of the entire filesystem", sortOrder: 2 },
              { id: "q-fs-1-c", label: "C", optionText: "A temporary cache directory", sortOrder: 3 },
              { id: "q-fs-1-d", label: "D", optionText: "The administrator's desktop folder", sortOrder: 4 },
            ],
          },
          {
            id: "q-fs-2",
            prompt: "Which top-level directory typically stores system-wide configuration files?",
            questionType: "single_choice",
            sortOrder: 2,
            explanation: "/etc stores host-specific system and service configuration files.",
            correctOptionIds: ["q-fs-2-b"],
            options: [
              { id: "q-fs-2-a", label: "A", optionText: "/bin", sortOrder: 1 },
              { id: "q-fs-2-b", label: "B", optionText: "/etc", sortOrder: 2 },
              { id: "q-fs-2-c", label: "C", optionText: "/tmp", sortOrder: 3 },
              { id: "q-fs-2-d", label: "D", optionText: "/home", sortOrder: 4 },
            ],
          },
          {
            id: "q-fs-3",
            prompt: "Which command displays hidden files (dotfiles) inside a directory?",
            questionType: "single_choice",
            sortOrder: 3,
            explanation: "ls -a includes entries starting with a dot (.) such as .bashrc and .ssh.",
            correctOptionIds: ["q-fs-3-c"],
            options: [
              { id: "q-fs-3-a", label: "A", optionText: "pwd", sortOrder: 1 },
              { id: "q-fs-3-b", label: "B", optionText: "cd ~", sortOrder: 2 },
              { id: "q-fs-3-c", label: "C", optionText: "ls -a", sortOrder: 3 },
              { id: "q-fs-3-d", label: "D", optionText: "find /", sortOrder: 4 },
            ],
          },
          {
            id: "q-fs-4",
            prompt: "You are inside /home/student/Documents and want to move up one level to /home/student. Which command does this?",
            questionType: "single_choice",
            sortOrder: 4,
            explanation: "cd .. moves into the parent directory of your current working directory.",
            correctOptionIds: ["q-fs-4-a"],
            options: [
              { id: "q-fs-4-a", label: "A", optionText: "cd ..", sortOrder: 1 },
              { id: "q-fs-4-b", label: "B", optionText: "cd /", sortOrder: 2 },
              { id: "q-fs-4-c", label: "C", optionText: "cd .", sortOrder: 3 },
              { id: "q-fs-4-d", label: "D", optionText: "ls -l", sortOrder: 4 },
            ],
          },
          {
            id: "q-fs-5",
            prompt: "Type the command to list all files in /etc including hidden dotfiles with detailed permissions.",
            questionType: "command_input",
            sortOrder: 5,
            placeholder: "e.g. ls ...",
            explanation: "ls -la /etc (or ls -al /etc) combines -l (long metadata) and -a (hidden dotfiles).",
            correctOptionIds: [],
            acceptedAnswers: ["ls -la /etc", "ls -al /etc", "ls -l -a /etc", "ls -a -l /etc"],
            options: [],
          },
        ],
      },
      {
        id: "quiz-linux-file-management",
        slug: "linux-file-management-check",
        title: "Module 03 Knowledge Check — File & Directory Management",
        description: "Verify your command of creating, copying, moving, renaming, inspecting, and safely removing files.",
        category: "linux",
        difficulty: "beginner",
        lessonId: "linux-003",
        passPercentage: 100,
        status: "published",
        createdAt: earlier,
        updatedAt: earlier,
        questions: [
          {
            id: "q-fm-1",
            prompt: "Which command creates an empty file named example.txt?",
            questionType: "single_choice",
            sortOrder: 1,
            explanation: "touch creates an empty file if it does not already exist (or updates its timestamp).",
            correctOptionIds: ["q-fm-1-b"],
            options: [
              { id: "q-fm-1-a", label: "A", optionText: "mkdir example.txt", sortOrder: 1 },
              { id: "q-fm-1-b", label: "B", optionText: "touch example.txt", sortOrder: 2 },
              { id: "q-fm-1-c", label: "C", optionText: "cp example.txt", sortOrder: 3 },
              { id: "q-fm-1-d", label: "D", optionText: "rmdir example.txt", sortOrder: 4 },
            ],
          },
          {
            id: "q-fm-2",
            prompt: "Which command copies a directory along with all of its nested contents?",
            questionType: "single_choice",
            sortOrder: 2,
            explanation: "cp -r performs a recursive copy across subdirectories and files.",
            correctOptionIds: ["q-fm-2-c"],
            options: [
              { id: "q-fm-2-a", label: "A", optionText: "mv -r", sortOrder: 1 },
              { id: "q-fm-2-b", label: "B", optionText: "cp", sortOrder: 2 },
              { id: "q-fm-2-c", label: "C", optionText: "cp -r", sortOrder: 3 },
              { id: "q-fm-2-d", label: "D", optionText: "rmdir", sortOrder: 4 },
            ],
          },
          {
            id: "q-fm-3",
            prompt: "Which command renames old_notes.txt to new_notes.txt?",
            questionType: "single_choice",
            sortOrder: 3,
            explanation: "mv moves or renames files and directories within the filesystem.",
            correctOptionIds: ["q-fm-3-a"],
            options: [
              { id: "q-fm-3-a", label: "A", optionText: "mv old_notes.txt new_notes.txt", sortOrder: 1 },
              { id: "q-fm-3-b", label: "B", optionText: "rename old_notes.txt new_notes.txt", sortOrder: 2 },
              { id: "q-fm-3-c", label: "C", optionText: "touch old_notes.txt new_notes.txt", sortOrder: 3 },
              { id: "q-fm-3-d", label: "D", optionText: "file old_notes.txt new_notes.txt", sortOrder: 4 },
            ],
          },
          {
            id: "q-fm-4",
            prompt: "rmdir can safely remove a directory only when that directory is completely empty.",
            questionType: "true_false",
            sortOrder: 4,
            explanation: "True — rmdir refuses to delete directories that still contain files or subdirectories.",
            correctOptionIds: ["q-fm-4-a"],
            options: [
              { id: "q-fm-4-a", label: "A", optionText: "True", sortOrder: 1 },
              { id: "q-fm-4-b", label: "B", optionText: "False", sortOrder: 2 },
            ],
          },
          {
            id: "q-fm-5",
            prompt: "Type the command to create nested directories notes/linux/day1 in a single command.",
            questionType: "command_input",
            sortOrder: 5,
            placeholder: "e.g. mkdir ...",
            explanation: "mkdir -p creates parent directories as needed without failing if intermediate folders do not yet exist.",
            correctOptionIds: [],
            acceptedAnswers: ["mkdir -p notes/linux/day1"],
            options: [],
          },
        ],
      },
      {
        id: "quiz-linux-text",
        slug: "linux-text-processing-check",
        title: "Module 04 Knowledge Check — Text Processing & Logs",
        description: "Assess your command of less, grep, wc, sort, cut, pipes, and output redirection.",
        category: "linux",
        difficulty: "beginner",
        lessonId: "linux-004",
        passPercentage: 100,
        status: "published",
        createdAt: earlier,
        updatedAt: earlier,
        questions: [
          {
            id: "q-tx-1",
            prompt: "Which command allows you to read a large text log interactively page by page?",
            questionType: "single_choice",
            sortOrder: 1,
            explanation: "less opens an interactive pager that lets you scroll forward, backward, and search without flooding the terminal.",
            correctOptionIds: ["q-tx-1-b"],
            options: [
              { id: "q-tx-1-a", label: "A", optionText: "cat", sortOrder: 1 },
              { id: "q-tx-1-b", label: "B", optionText: "less", sortOrder: 2 },
              { id: "q-tx-1-c", label: "C", optionText: "wc", sortOrder: 3 },
              { id: "q-tx-1-d", label: "D", optionText: "touch", sortOrder: 4 },
            ],
          },
          {
            id: "q-tx-2",
            prompt: "What does grep -n \"FAILED\" application.log do?",
            questionType: "single_choice",
            sortOrder: 2,
            explanation: "grep filters lines matching FAILED and the -n flag prints each matching line's line number.",
            correctOptionIds: ["q-tx-2-c"],
            options: [
              { id: "q-tx-2-a", label: "A", optionText: "Deletes failed login entries from disk", sortOrder: 1 },
              { id: "q-tx-2-b", label: "B", optionText: "Sorts the log alphabetically", sortOrder: 2 },
              { id: "q-tx-2-c", label: "C", optionText: "Displays matching lines along with their line numbers", sortOrder: 3 },
              { id: "q-tx-2-d", label: "D", optionText: "Counts total words in the log", sortOrder: 4 },
            ],
          },
          {
            id: "q-tx-3",
            prompt: "Which redirection operator appends command output to a file without erasing existing contents?",
            questionType: "single_choice",
            sortOrder: 3,
            explanation: ">> appends output to the end of a file, whereas > overwrites existing contents.",
            correctOptionIds: ["q-tx-3-b"],
            options: [
              { id: "q-tx-3-a", label: "A", optionText: ">", sortOrder: 1 },
              { id: "q-tx-3-b", label: "B", optionText: ">>", sortOrder: 2 },
              { id: "q-tx-3-c", label: "C", optionText: "|", sortOrder: 3 },
              { id: "q-tx-3-d", label: "D", optionText: "cut -d", sortOrder: 4 },
            ],
          },
          {
            id: "q-tx-4",
            prompt: "uniq removes duplicate lines even when matching lines are not adjacent in an unsorted file.",
            questionType: "true_false",
            sortOrder: 4,
            explanation: "False — uniq only collapses adjacent duplicate lines, which is why sort | uniq is standard practice.",
            correctOptionIds: ["q-tx-4-b"],
            options: [
              { id: "q-tx-4-a", label: "A", optionText: "True", sortOrder: 1 },
              { id: "q-tx-4-b", label: "B", optionText: "False", sortOrder: 2 },
            ],
          },
          {
            id: "q-tx-5",
            prompt: "Type the command to count the total number of lines in auth.log.",
            questionType: "command_input",
            sortOrder: 5,
            placeholder: "e.g. wc ...",
            explanation: "wc -l prints the line count of a file.",
            correctOptionIds: [],
            acceptedAnswers: ["wc -l auth.log", "wc --lines auth.log"],
            options: [],
          },
        ],
      },
      {
        id: "quiz-linux-permissions",
        slug: "linux-permissions-check",
        title: "Module 05 Knowledge Check — Users, Groups & Permissions",
        description: "Test your fluency with root vs. regular users, octal modes, symbolic chmod, and ownership.",
        category: "linux",
        difficulty: "beginner",
        lessonId: "linux-005",
        passPercentage: 100,
        status: "published",
        createdAt: earlier,
        updatedAt: earlier,
        questions: [
          {
            id: "q-pm-1",
            prompt: "Which Linux account holds full administrative privileges across the system?",
            questionType: "single_choice",
            sortOrder: 1,
            explanation: "root is the superuser account with UID 0 and full administrative privileges.",
            correctOptionIds: ["q-pm-1-c"],
            options: [
              { id: "q-pm-1-a", label: "A", optionText: "guest", sortOrder: 1 },
              { id: "q-pm-1-b", label: "B", optionText: "student", sortOrder: 2 },
              { id: "q-pm-1-c", label: "C", optionText: "root", sortOrder: 3 },
              { id: "q-pm-1-d", label: "D", optionText: "nobody", sortOrder: 4 },
            ],
          },
          {
            id: "q-pm-2",
            prompt: "What permissions does chmod 640 grant?",
            questionType: "single_choice",
            sortOrder: 2,
            explanation: "6 = rw- (owner), 4 = r-- (group), 0 = --- (others).",
            correctOptionIds: ["q-pm-2-a"],
            options: [
              { id: "q-pm-2-a", label: "A", optionText: "Owner read/write, group read, others none", sortOrder: 1 },
              { id: "q-pm-2-b", label: "B", optionText: "Owner read/execute, group write, others read", sortOrder: 2 },
              { id: "q-pm-2-c", label: "C", optionText: "Full permissions for everyone", sortOrder: 3 },
              { id: "q-pm-2-d", label: "D", optionText: "Read-only for owner and group", sortOrder: 4 },
            ],
          },
          {
            id: "q-pm-3",
            prompt: "Which symbolic chmod command removes write permission from the group on notes.txt?",
            questionType: "single_choice",
            sortOrder: 3,
            explanation: "g represents group and -w removes write permission.",
            correctOptionIds: ["q-pm-3-b"],
            options: [
              { id: "q-pm-3-a", label: "A", optionText: "chmod u-w notes.txt", sortOrder: 1 },
              { id: "q-pm-3-b", label: "B", optionText: "chmod g-w notes.txt", sortOrder: 2 },
              { id: "q-pm-3-c", label: "C", optionText: "chmod o+w notes.txt", sortOrder: 3 },
              { id: "q-pm-3-d", label: "D", optionText: "chown g-w notes.txt", sortOrder: 4 },
            ],
          },
          {
            id: "q-pm-4",
            prompt: "Which command changes the user or group owner of a file?",
            questionType: "single_choice",
            sortOrder: 4,
            explanation: "chown updates file user and group ownership.",
            correctOptionIds: ["q-pm-4-b"],
            options: [
              { id: "q-pm-4-a", label: "A", optionText: "chmod", sortOrder: 1 },
              { id: "q-pm-4-b", label: "B", optionText: "chown", sortOrder: 2 },
              { id: "q-pm-4-c", label: "C", optionText: "groups", sortOrder: 3 },
            ],
          },
          {
            id: "q-pm-5",
            prompt: "Type the octal chmod command that gives the owner read/write and zero permissions to group or others on id_ed25519.",
            questionType: "command_input",
            sortOrder: 5,
            placeholder: "e.g. chmod ...",
            explanation: "chmod 600 restricts a private key or secret file strictly to owner read and write.",
            correctOptionIds: [],
            acceptedAnswers: ["chmod 600 id_ed25519", "chmod 0600 id_ed25519"],
            options: [],
          },
        ],
      },
      {
        id: "quiz-linux-packages",
        slug: "linux-packages-check",
        title: "Module 06 Knowledge Check — Software & APT Packages",
        description: "Evaluate your command of APT repository refreshes, searching, installing, inspecting, and purging packages.",
        category: "linux",
        difficulty: "beginner",
        lessonId: "linux-006",
        passPercentage: 100,
        status: "published",
        createdAt: earlier,
        updatedAt: earlier,
        questions: [
          {
            id: "q-pk-1",
            prompt: "What does sudo apt update do?",
            questionType: "single_choice",
            sortOrder: 1,
            explanation: "apt update refreshes package index metadata from configured repositories without installing upgrades.",
            correctOptionIds: ["q-pk-1-b"],
            options: [
              { id: "q-pk-1-a", label: "A", optionText: "Installs all available software upgrades automatically", sortOrder: 1 },
              { id: "q-pk-1-b", label: "B", optionText: "Refreshes package information from configured repositories", sortOrder: 2 },
              { id: "q-pk-1-c", label: "C", optionText: "Removes unused dependencies", sortOrder: 3 },
              { id: "q-pk-1-d", label: "D", optionText: "Lists every running service", sortOrder: 4 },
            ],
          },
          {
            id: "q-pk-2",
            prompt: "Which command removes a package along with its package-managed system-wide configuration files?",
            questionType: "single_choice",
            sortOrder: 2,
            explanation: "sudo apt purge removes both the package binaries and package-managed system configuration files.",
            correctOptionIds: ["q-pk-2-c"],
            options: [
              { id: "q-pk-2-a", label: "A", optionText: "sudo apt update", sortOrder: 1 },
              { id: "q-pk-2-b", label: "B", optionText: "sudo apt remove", sortOrder: 2 },
              { id: "q-pk-2-c", label: "C", optionText: "sudo apt purge", sortOrder: 3 },
              { id: "q-pk-2-d", label: "D", optionText: "apt search", sortOrder: 4 },
            ],
          },
          {
            id: "q-pk-3",
            prompt: "Which command searches available package metadata for curl?",
            questionType: "single_choice",
            sortOrder: 3,
            explanation: "apt search <keyword> queries configured APT package lists for matching packages.",
            correctOptionIds: ["q-pk-3-a"],
            options: [
              { id: "q-pk-3-a", label: "A", optionText: "apt search curl", sortOrder: 1 },
              { id: "q-pk-3-b", label: "B", optionText: "dpkg --purge curl", sortOrder: 2 },
              { id: "q-pk-3-c", label: "C", optionText: "apt autoremove curl", sortOrder: 3 },
            ],
          },
          {
            id: "q-pk-4",
            prompt: "Which commands inspect details or installation status of a package named tree? (Select all that apply)",
            questionType: "multiple_select",
            sortOrder: 4,
            explanation: "apt show displays package metadata and dpkg -l lists installation status.",
            correctOptionIds: ["q-pk-4-a", "q-pk-4-c"],
            options: [
              { id: "q-pk-4-a", label: "A", optionText: "apt show tree", sortOrder: 1 },
              { id: "q-pk-4-b", label: "B", optionText: "rm -r tree", sortOrder: 2 },
              { id: "q-pk-4-c", label: "C", optionText: "dpkg -l tree", sortOrder: 3 },
            ],
          },
          {
            id: "q-pk-5",
            prompt: "Type the command to inspect detailed package metadata for openssh-client using APT.",
            questionType: "command_input",
            sortOrder: 5,
            placeholder: "e.g. apt ...",
            explanation: "apt show <package> prints version, maintainer, dependencies, and description metadata.",
            correctOptionIds: [],
            acceptedAnswers: ["apt show openssh-client", "apt-cache show openssh-client"],
            options: [],
          },
        ],
      },
      {
        id: "quiz-linux-processes",
        slug: "linux-processes-check",
        title: "Module 07 Knowledge Check — Process Management",
        description: "Verify your grasp of PIDs, ps/top process monitoring, background jobs, and graceful termination.",
        category: "linux",
        difficulty: "beginner",
        lessonId: "linux-007",
        passPercentage: 100,
        status: "published",
        createdAt: earlier,
        updatedAt: earlier,
        questions: [
          {
            id: "q-pr-1",
            prompt: "What does PID stand for in Linux?",
            questionType: "single_choice",
            sortOrder: 1,
            explanation: "PID stands for Process ID, the unique numerical identifier assigned to a running process.",
            correctOptionIds: ["q-pr-1-b"],
            options: [
              { id: "q-pr-1-a", label: "A", optionText: "Program Information Display", sortOrder: 1 },
              { id: "q-pr-1-b", label: "B", optionText: "Process ID", sortOrder: 2 },
              { id: "q-pr-1-c", label: "C", optionText: "Package Identifier", sortOrder: 3 },
              { id: "q-pr-1-d", label: "D", optionText: "Parent Interface Descriptor", sortOrder: 4 },
            ],
          },
          {
            id: "q-pr-2",
            prompt: "Which command provides an interactive, continuously updating view of running processes?",
            questionType: "single_choice",
            sortOrder: 2,
            explanation: "top continuously updates active CPU, memory, and process metrics.",
            correctOptionIds: ["q-pr-2-c"],
            options: [
              { id: "q-pr-2-a", label: "A", optionText: "free -h", sortOrder: 1 },
              { id: "q-pr-2-b", label: "B", optionText: "jobs", sortOrder: 2 },
              { id: "q-pr-2-c", label: "C", optionText: "top", sortOrder: 3 },
              { id: "q-pr-2-d", label: "D", optionText: "whoami", sortOrder: 4 },
            ],
          },
          {
            id: "q-pr-3",
            prompt: "Which command displays background jobs started inside your current shell?",
            questionType: "single_choice",
            sortOrder: 3,
            explanation: "jobs lists foreground/background jobs owned by the active shell session.",
            correctOptionIds: ["q-pr-3-a"],
            options: [
              { id: "q-pr-3-a", label: "A", optionText: "jobs", sortOrder: 1 },
              { id: "q-pr-3-b", label: "B", optionText: "fg", sortOrder: 2 },
              { id: "q-pr-3-c", label: "C", optionText: "kill 0", sortOrder: 3 },
            ],
          },
          {
            id: "q-pr-4",
            prompt: "Which command requests graceful termination (SIGTERM) of a process with PID 2450?",
            questionType: "single_choice",
            sortOrder: 4,
            explanation: "kill <PID> sends SIGTERM by default so the process can clean up before exiting.",
            correctOptionIds: ["q-pr-4-b"],
            options: [
              { id: "q-pr-4-a", label: "A", optionText: "ps -p 2450", sortOrder: 1 },
              { id: "q-pr-4-b", label: "B", optionText: "kill 2450", sortOrder: 2 },
              { id: "q-pr-4-c", label: "C", optionText: "sleep 2450 &", sortOrder: 3 },
            ],
          },
          {
            id: "q-pr-5",
            prompt: "Type the command to list all running processes across all users in BSD-style full format.",
            questionType: "command_input",
            sortOrder: 5,
            placeholder: "e.g. ps ...",
            explanation: "ps aux lists processes for all users (a), with user/CPU/mem columns (u), including processes without a controlling terminal (x).",
            correctOptionIds: [],
            acceptedAnswers: ["ps aux", "ps -ef"],
            options: [],
          },
        ],
      },
      {
        id: "quiz-linux-sysadmin",
        slug: "linux-sysadmin-check",
        title: "Module 08 Knowledge Check — Services & systemd",
        description: "Test your understanding of systemd units, checking active vs. enabled states, and managing system services.",
        category: "linux",
        difficulty: "beginner",
        lessonId: "linux-008",
        passPercentage: 100,
        status: "published",
        createdAt: earlier,
        updatedAt: earlier,
        questions: [
          {
            id: "q-sa-1",
            prompt: "Which command displays detailed runtime status information for the cron service?",
            questionType: "single_choice",
            sortOrder: 1,
            explanation: "systemctl status <service> displays unit state, PID, and recent journal lines.",
            correctOptionIds: ["q-sa-1-a"],
            options: [
              { id: "q-sa-1-a", label: "A", optionText: "systemctl status cron", sortOrder: 1 },
              { id: "q-sa-1-b", label: "B", optionText: "systemctl enable cron", sortOrder: 2 },
              { id: "q-sa-1-c", label: "C", optionText: "ps aux cron", sortOrder: 3 },
              { id: "q-sa-1-d", label: "D", optionText: "chmod cron", sortOrder: 4 },
            ],
          },
          {
            id: "q-sa-2",
            prompt: "What does sudo systemctl enable cron do?",
            questionType: "single_choice",
            sortOrder: 2,
            explanation: "enable configures the unit to start automatically during system boot (without necessarily starting it right now).",
            correctOptionIds: ["q-sa-2-b"],
            options: [
              { id: "q-sa-2-a", label: "A", optionText: "Immediately stops cron", sortOrder: 1 },
              { id: "q-sa-2-b", label: "B", optionText: "Configures cron for automatic startup at boot", sortOrder: 2 },
              { id: "q-sa-2-c", label: "C", optionText: "Deletes the cron unit file", sortOrder: 3 },
            ],
          },
          {
            id: "q-sa-3",
            prompt: "Which command checks whether the ssh service is currently active right now?",
            questionType: "single_choice",
            sortOrder: 3,
            explanation: "systemctl is-active checks runtime activity, whereas is-enabled checks boot configuration.",
            correctOptionIds: ["q-sa-3-b"],
            options: [
              { id: "q-sa-3-a", label: "A", optionText: "systemctl is-enabled ssh", sortOrder: 1 },
              { id: "q-sa-3-b", label: "B", optionText: "systemctl is-active ssh", sortOrder: 2 },
              { id: "q-sa-3-c", label: "C", optionText: "systemctl list-unit-files ssh", sortOrder: 3 },
            ],
          },
          {
            id: "q-sa-4",
            prompt: "Which command asks systemd to restart a service cleanly?",
            questionType: "single_choice",
            sortOrder: 4,
            explanation: "sudo systemctl restart <service> stops and starts the unit cleanly.",
            correctOptionIds: ["q-sa-4-c"],
            options: [
              { id: "q-sa-4-a", label: "A", optionText: "systemctl list-units", sortOrder: 1 },
              { id: "q-sa-4-b", label: "B", optionText: "systemctl enable service-name", sortOrder: 2 },
              { id: "q-sa-4-c", label: "C", optionText: "sudo systemctl restart service-name", sortOrder: 3 },
            ],
          },
          {
            id: "q-sa-5",
            prompt: "Type the command to view the most recent 20 journal log entries for the ssh unit without a pager.",
            questionType: "command_input",
            sortOrder: 5,
            placeholder: "e.g. journalctl ...",
            explanation: "journalctl -u ssh -n 20 --no-pager inspects the last 20 lines of the ssh systemd unit log directly.",
            correctOptionIds: [],
            acceptedAnswers: [
              "journalctl -u ssh -n 20 --no-pager",
              "journalctl -n 20 -u ssh --no-pager",
              "journalctl -u ssh -n 20",
            ],
            options: [],
          },
        ],
      },
      {
        id: "quiz-networking",
        slug: "networking-basics-check",
        title: "Module 09 Knowledge Check — Linux Networking",
        description: "Verify your knowledge of interfaces, IP routes, DNS resolution, and listening TCP/UDP sockets.",
        category: "networking",
        difficulty: "beginner",
        lessonId: "linux-009",
        passPercentage: 100,
        status: "published",
        createdAt: earlier,
        updatedAt: earlier,
        questions: [
          {
            id: "q-nt-1",
            prompt: "Which command displays your system's network interfaces and assigned IP addresses?",
            questionType: "single_choice",
            sortOrder: 1,
            explanation: "ip addr shows network interfaces along with link state and IPv4/IPv6 addresses.",
            correctOptionIds: ["q-nt-1-a"],
            options: [
              { id: "q-nt-1-a", label: "A", optionText: "ip addr", sortOrder: 1 },
              { id: "q-nt-1-b", label: "B", optionText: "systemctl status", sortOrder: 2 },
              { id: "q-nt-1-c", label: "C", optionText: "ps aux", sortOrder: 3 },
            ],
          },
          {
            id: "q-nt-2",
            prompt: "What does a default gateway normally do?",
            questionType: "single_choice",
            sortOrder: 2,
            explanation: "The default gateway acts as the next-hop router for traffic leaving the local subnet.",
            correctOptionIds: ["q-nt-2-b"],
            options: [
              { id: "q-nt-2-a", label: "A", optionText: "Stores user SSH keys", sortOrder: 1 },
              { id: "q-nt-2-b", label: "B", optionText: "Routes traffic toward destinations outside the local network", sortOrder: 2 },
              { id: "q-nt-2-c", label: "C", optionText: "Assigns file permissions", sortOrder: 3 },
            ],
          },
          {
            id: "q-nt-3",
            prompt: "Which command resolves a hostname through the system's configured name-resolution mechanisms?",
            questionType: "single_choice",
            sortOrder: 3,
            explanation: "getent hosts queries system NSS/DNS resolution just like standard applications.",
            correctOptionIds: ["q-nt-3-c"],
            options: [
              { id: "q-nt-3-a", label: "A", optionText: "ip link", sortOrder: 1 },
              { id: "q-nt-3-b", label: "B", optionText: "ping -c 4 127.0.0.1", sortOrder: 2 },
              { id: "q-nt-3-c", label: "C", optionText: "getent hosts example.com", sortOrder: 3 },
            ],
          },
          {
            id: "q-nt-4",
            prompt: "Which command lists listening TCP and UDP sockets along with numeric ports?",
            questionType: "single_choice",
            sortOrder: 4,
            explanation: "ss -tulnp displays TCP (-t), UDP (-u), listening (-l), numeric (-n), and process (-p) details.",
            correctOptionIds: ["q-nt-4-b"],
            options: [
              { id: "q-nt-4-a", label: "A", optionText: "ip neigh", sortOrder: 1 },
              { id: "q-nt-4-b", label: "B", optionText: "ss -tulnp", sortOrder: 2 },
              { id: "q-nt-4-c", label: "C", optionText: "ip route", sortOrder: 3 },
            ],
          },
          {
            id: "q-nt-5",
            prompt: "Type the command to display the Linux kernel IP routing table.",
            questionType: "command_input",
            sortOrder: 5,
            placeholder: "e.g. ip ...",
            explanation: "ip route (or ip route show) prints the default gateway and local subnet routes.",
            correctOptionIds: [],
            acceptedAnswers: ["ip route", "ip route show", "ip r"],
            options: [],
          },
        ],
      },
      {
        id: "quiz-linux-ssh",
        slug: "linux-ssh-check",
        title: "Module 10 Knowledge Check — SSH & Remote Access",
        description: "Verify your understanding of encrypted SSH connections, client vs. server roles, custom ports, and host keys.",
        category: "linux",
        difficulty: "beginner",
        lessonId: "linux-010",
        passPercentage: 100,
        status: "published",
        createdAt: earlier,
        updatedAt: earlier,
        questions: [
          {
            id: "q-sh-1",
            prompt: "What does SSH stand for?",
            questionType: "single_choice",
            sortOrder: 1,
            explanation: "SSH stands for Secure Shell, an encrypted protocol for remote command-line access.",
            correctOptionIds: ["q-sh-1-b"],
            options: [
              { id: "q-sh-1-a", label: "A", optionText: "Secure System Hosting", sortOrder: 1 },
              { id: "q-sh-1-b", label: "B", optionText: "Secure Shell", sortOrder: 2 },
              { id: "q-sh-1-c", label: "C", optionText: "System Service Handler", sortOrder: 3 },
              { id: "q-sh-1-d", label: "D", optionText: "Server Socket Host", sortOrder: 4 },
            ],
          },
          {
            id: "q-sh-2",
            prompt: "Which component initiates an SSH connection to a remote host?",
            questionType: "single_choice",
            sortOrder: 2,
            explanation: "The SSH client initiates connections while the SSH server (sshd) listens for incoming requests.",
            correctOptionIds: ["q-sh-2-c"],
            options: [
              { id: "q-sh-2-a", label: "A", optionText: "SSH server", sortOrder: 1 },
              { id: "q-sh-2-b", label: "B", optionText: "Network gateway", sortOrder: 2 },
              { id: "q-sh-2-c", label: "C", optionText: "SSH client", sortOrder: 3 },
              { id: "q-sh-2-d", label: "D", optionText: "DNS resolver", sortOrder: 4 },
            ],
          },
          {
            id: "q-sh-3",
            prompt: "Which command connects to 192.168.1.100 as user student on custom SSH port 2222?",
            questionType: "single_choice",
            sortOrder: 3,
            explanation: "The -p flag specifies a non-default TCP destination port for ssh.",
            correctOptionIds: ["q-sh-3-b"],
            options: [
              { id: "q-sh-3-a", label: "A", optionText: "ssh student@192.168.1.100:2222", sortOrder: 1 },
              { id: "q-sh-3-b", label: "B", optionText: "ssh -p 2222 student@192.168.1.100", sortOrder: 2 },
              { id: "q-sh-3-c", label: "C", optionText: "ssh -port 2222 192.168.1.100", sortOrder: 3 },
            ],
          },
          {
            id: "q-sh-4",
            prompt: "SSH defaults to TCP port 22 and uses host-key verification to help confirm the identity of a remote server.",
            questionType: "true_false",
            sortOrder: 4,
            explanation: "True — SSH runs on TCP port 22 by default and verifies the remote server's host key before authenticating.",
            correctOptionIds: ["q-sh-4-a"],
            options: [
              { id: "q-sh-4-a", label: "A", optionText: "True", sortOrder: 1 },
              { id: "q-sh-4-b", label: "B", optionText: "False", sortOrder: 2 },
            ],
          },
          {
            id: "q-sh-5",
            prompt: "Type the command to generate a new Ed25519 SSH key pair.",
            questionType: "command_input",
            sortOrder: 5,
            placeholder: "e.g. ssh-keygen ...",
            explanation: "ssh-keygen -t ed25519 generates a modern Ed25519 public/private SSH key pair.",
            correctOptionIds: [],
            acceptedAnswers: ["ssh-keygen -t ed25519"],
            options: [],
          },
        ],
      },
      {
        "id": "quiz-net-01",
        "slug": "net-intro-networking-check",
        "title": "Module 01 Knowledge Check — Introduction to Computer Networking",
        "description": "Verify your understanding of computer networks, LAN/WAN/WLAN/PAN topologies, routers, switches, network architectures, and basic Linux networking commands.",
        "category": "networking",
        "difficulty": "beginner",
        "lessonId": "net-001",
        "passPercentage": 100,
        "status": "published",
        "createdAt": earlier,
        "updatedAt": now,
        "questions": [
          {
            "id": "q-net-01-1",
            "prompt": "What is the main purpose of a computer network?",
            "questionType": "single_choice",
            "sortOrder": 1,
            "explanation": "A computer network connects computing devices so they can communicate, exchange data, and share resources.",
            "correctOptionIds": [
              "q-net-01-1-b"
            ],
            "options": [
              {
                "id": "q-net-01-1-a",
                "label": "A",
                "optionText": "To increase the physical size of a computer.",
                "sortOrder": 1
              },
              {
                "id": "q-net-01-1-b",
                "label": "B",
                "optionText": "To allow devices to communicate and share resources.",
                "sortOrder": 2
              },
              {
                "id": "q-net-01-1-c",
                "label": "C",
                "optionText": "To replace computer operating systems.",
                "sortOrder": 3
              },
              {
                "id": "q-net-01-1-d",
                "label": "D",
                "optionText": "To prevent computers from exchanging information.",
                "sortOrder": 4
              }
            ]
          },
          {
            "id": "q-net-01-2",
            "prompt": "A student connects wireless earbuds to a smartphone using Bluetooth. Which network type best describes this connection?",
            "questionType": "single_choice",
            "sortOrder": 2,
            "explanation": "A Personal Area Network (PAN) connects personal devices over very short distances, such as Bluetooth accessories.",
            "correctOptionIds": [
              "q-net-01-2-c"
            ],
            "options": [
              {
                "id": "q-net-01-2-a",
                "label": "A",
                "optionText": "WAN",
                "sortOrder": 1
              },
              {
                "id": "q-net-01-2-b",
                "label": "B",
                "optionText": "LAN",
                "sortOrder": 2
              },
              {
                "id": "q-net-01-2-c",
                "label": "C",
                "optionText": "PAN",
                "sortOrder": 3
              },
              {
                "id": "q-net-01-2-d",
                "label": "D",
                "optionText": "MAN",
                "sortOrder": 4
              }
            ]
          },
          {
            "id": "q-net-01-3",
            "prompt": "What is the primary purpose of a network protocol?",
            "questionType": "single_choice",
            "sortOrder": 3,
            "explanation": "Network protocols define the agreed-upon rules and formats that allow devices to exchange data accurately.",
            "correctOptionIds": [
              "q-net-01-3-b"
            ],
            "options": [
              {
                "id": "q-net-01-3-a",
                "label": "A",
                "optionText": "To increase computer storage.",
                "sortOrder": 1
              },
              {
                "id": "q-net-01-3-b",
                "label": "B",
                "optionText": "To define rules for communication between devices.",
                "sortOrder": 2
              },
              {
                "id": "q-net-01-3-c",
                "label": "C",
                "optionText": "To replace IP addresses.",
                "sortOrder": 3
              },
              {
                "id": "q-net-01-3-d",
                "label": "D",
                "optionText": "To physically connect computers.",
                "sortOrder": 4
              }
            ]
          },
          {
            "id": "q-net-01-4",
            "prompt": "Which device primarily connects multiple devices within a local Ethernet network and forwards frames using MAC addresses?",
            "questionType": "single_choice",
            "sortOrder": 4,
            "explanation": "An Ethernet switch connects devices within a local area network (LAN) and forwards frames based on MAC addresses.",
            "correctOptionIds": [
              "q-net-01-4-c"
            ],
            "options": [
              {
                "id": "q-net-01-4-a",
                "label": "A",
                "optionText": "Modem",
                "sortOrder": 1
              },
              {
                "id": "q-net-01-4-b",
                "label": "B",
                "optionText": "Router",
                "sortOrder": 2
              },
              {
                "id": "q-net-01-4-c",
                "label": "C",
                "optionText": "Switch",
                "sortOrder": 3
              },
              {
                "id": "q-net-01-4-d",
                "label": "D",
                "optionText": "Monitor",
                "sortOrder": 4
              }
            ]
          },
          {
            "id": "q-net-01-5",
            "prompt": "You open a website, and your browser requests information from a remote web server. Which architecture does this represent?",
            "questionType": "single_choice",
            "sortOrder": 5,
            "explanation": "In a client-server architecture, clients (such as web browsers) request services or resources from centralized servers.",
            "correctOptionIds": [
              "q-net-01-5-b"
            ],
            "options": [
              {
                "id": "q-net-01-5-a",
                "label": "A",
                "optionText": "Peer-to-peer",
                "sortOrder": 1
              },
              {
                "id": "q-net-01-5-b",
                "label": "B",
                "optionText": "Client-server",
                "sortOrder": 2
              },
              {
                "id": "q-net-01-5-c",
                "label": "C",
                "optionText": "Personal area network",
                "sortOrder": 3
              },
              {
                "id": "q-net-01-5-d",
                "label": "D",
                "optionText": "Standalone local loop",
                "sortOrder": 4
              }
            ]
          },
          {
            "id": "q-net-01-6",
            "prompt": "You type a website name into your browser. Which service helps translate the domain name into an IP address?",
            "questionType": "single_choice",
            "sortOrder": 6,
            "explanation": "The Domain Name System (DNS) resolves human-readable domain names into IP addresses.",
            "correctOptionIds": [
              "q-net-01-6-b"
            ],
            "options": [
              {
                "id": "q-net-01-6-a",
                "label": "A",
                "optionText": "DHCP",
                "sortOrder": 1
              },
              {
                "id": "q-net-01-6-b",
                "label": "B",
                "optionText": "DNS",
                "sortOrder": 2
              },
              {
                "id": "q-net-01-6-c",
                "label": "C",
                "optionText": "FTP",
                "sortOrder": 3
              },
              {
                "id": "q-net-01-6-d",
                "label": "D",
                "optionText": "SSH",
                "sortOrder": 4
              }
            ]
          },
          {
            "id": "q-net-01-7",
            "prompt": "Which of the following are valid Linux commands introduced for inspecting network interfaces, link states, and routes? (Select all that apply)",
            "questionType": "multiple_select",
            "sortOrder": 7,
            "explanation": "ip addr, ip link, and ip route inspect IP addresses, network interfaces, and the routing table on Linux.",
            "correctOptionIds": [
              "q-net-01-7-a",
              "q-net-01-7-b",
              "q-net-01-7-c"
            ],
            "options": [
              {
                "id": "q-net-01-7-a",
                "label": "A",
                "optionText": "ip addr",
                "sortOrder": 1
              },
              {
                "id": "q-net-01-7-b",
                "label": "B",
                "optionText": "ip link",
                "sortOrder": 2
              },
              {
                "id": "q-net-01-7-c",
                "label": "C",
                "optionText": "ip route",
                "sortOrder": 3
              },
              {
                "id": "q-net-01-7-d",
                "label": "D",
                "optionText": "chmod 777",
                "sortOrder": 4
              }
            ]
          },
          {
            "id": "q-net-01-8",
            "prompt": "Which of the following devices commonly participate in delivering home Internet connectivity? (Select all that apply)",
            "questionType": "multiple_select",
            "sortOrder": 8,
            "explanation": "Routers, switches, modems, and wireless access points work together to provide wired and wireless network access.",
            "correctOptionIds": [
              "q-net-01-8-a",
              "q-net-01-8-b",
              "q-net-01-8-c"
            ],
            "options": [
              {
                "id": "q-net-01-8-a",
                "label": "A",
                "optionText": "Router",
                "sortOrder": 1
              },
              {
                "id": "q-net-01-8-b",
                "label": "B",
                "optionText": "Switch",
                "sortOrder": 2
              },
              {
                "id": "q-net-01-8-c",
                "label": "C",
                "optionText": "Wireless Access Point",
                "sortOrder": 3
              },
              {
                "id": "q-net-01-8-d",
                "label": "D",
                "optionText": "Text Editor",
                "sortOrder": 4
              }
            ]
          },
          {
            "id": "q-net-01-9",
            "prompt": "A Wide Area Network (WAN) connects networks across large geographical distances, and the Internet is the largest example of a WAN.",
            "questionType": "true_false",
            "sortOrder": 9,
            "explanation": "True — WANs span cities, countries, or the globe, and the Internet is a global WAN of interconnected networks.",
            "correctOptionIds": [
              "q-net-01-9-a"
            ],
            "options": [
              {
                "id": "q-net-01-9-a",
                "label": "A",
                "optionText": "True",
                "sortOrder": 1
              },
              {
                "id": "q-net-01-9-b",
                "label": "B",
                "optionText": "False",
                "sortOrder": 2
              }
            ]
          },
          {
            "id": "q-net-01-10",
            "prompt": "A switch and a router perform the exact same primary role: a switch connects different networks across the Internet while a router only connects two Bluetooth devices.",
            "questionType": "true_false",
            "sortOrder": 10,
            "explanation": "False — switches connect devices within a local network (LAN), while routers forward packets between different networks.",
            "correctOptionIds": [
              "q-net-01-10-b"
            ],
            "options": [
              {
                "id": "q-net-01-10-a",
                "label": "A",
                "optionText": "True",
                "sortOrder": 1
              },
              {
                "id": "q-net-01-10-b",
                "label": "B",
                "optionText": "False",
                "sortOrder": 2
              }
            ]
          }
        ]
      },
      {
        "id": "quiz-net-02",
        "slug": "net-osi-tcpip-check",
        "title": "Module 02 Knowledge Check — OSI Model and TCP/IP Model",
        "description": "Test your grasp of the 7-layer OSI model, the 4-layer TCP/IP model, encapsulation and decapsulation, and layer responsibilities.",
        "category": "networking",
        "difficulty": "beginner",
        "lessonId": "net-002",
        "passPercentage": 100,
        "status": "published",
        "createdAt": earlier,
        "updatedAt": now,
        "questions": [
          {
            "id": "q-net-02-1",
            "prompt": "Why do networking models divide communication into layers?",
            "questionType": "single_choice",
            "sortOrder": 1,
            "explanation": "Networking models divide communication into layers to make complex processes easier to understand, standardize, and troubleshoot.",
            "correctOptionIds": [
              "q-net-02-1-b"
            ],
            "options": [
              {
                "id": "q-net-02-1-a",
                "label": "A",
                "optionText": "To make computers faster automatically.",
                "sortOrder": 1
              },
              {
                "id": "q-net-02-1-b",
                "label": "B",
                "optionText": "To organize networking responsibilities and simplify communication.",
                "sortOrder": 2
              },
              {
                "id": "q-net-02-1-c",
                "label": "C",
                "optionText": "To eliminate network protocols.",
                "sortOrder": 3
              },
              {
                "id": "q-net-02-1-d",
                "label": "D",
                "optionText": "To prevent devices from exchanging data.",
                "sortOrder": 4
              }
            ]
          },
          {
            "id": "q-net-02-2",
            "prompt": "How many layers are present in the OSI model?",
            "questionType": "single_choice",
            "sortOrder": 2,
            "explanation": "The OSI model contains seven layers: Application, Presentation, Session, Transport, Network, Data Link, and Physical.",
            "correctOptionIds": [
              "q-net-02-2-c"
            ],
            "options": [
              {
                "id": "q-net-02-2-a",
                "label": "A",
                "optionText": "Four",
                "sortOrder": 1
              },
              {
                "id": "q-net-02-2-b",
                "label": "B",
                "optionText": "Five",
                "sortOrder": 2
              },
              {
                "id": "q-net-02-2-c",
                "label": "C",
                "optionText": "Seven",
                "sortOrder": 3
              },
              {
                "id": "q-net-02-2-d",
                "label": "D",
                "optionText": "Eight",
                "sortOrder": 4
              }
            ]
          },
          {
            "id": "q-net-02-3",
            "prompt": "A network device forwards IP packets between different networks. Which OSI layer is primarily responsible for this function?",
            "questionType": "single_choice",
            "sortOrder": 3,
            "explanation": "The Network Layer (Layer 3) handles logical IP addressing and routing packets between networks.",
            "correctOptionIds": [
              "q-net-02-3-b"
            ],
            "options": [
              {
                "id": "q-net-02-3-a",
                "label": "A",
                "optionText": "Data Link",
                "sortOrder": 1
              },
              {
                "id": "q-net-02-3-b",
                "label": "B",
                "optionText": "Network",
                "sortOrder": 2
              },
              {
                "id": "q-net-02-3-c",
                "label": "C",
                "optionText": "Physical",
                "sortOrder": 3
              },
              {
                "id": "q-net-02-3-d",
                "label": "D",
                "optionText": "Transport",
                "sortOrder": 4
              }
            ]
          },
          {
            "id": "q-net-02-4",
            "prompt": "A computer is sending a large amount of data using TCP. Which OSI layer handles segmentation, reliable delivery, and retransmission?",
            "questionType": "single_choice",
            "sortOrder": 4,
            "explanation": "The Transport Layer (Layer 4) handles end-to-end communication, including TCP segmentation, sequence numbering, acknowledgments, and retransmission.",
            "correctOptionIds": [
              "q-net-02-4-b"
            ],
            "options": [
              {
                "id": "q-net-02-4-a",
                "label": "A",
                "optionText": "Application",
                "sortOrder": 1
              },
              {
                "id": "q-net-02-4-b",
                "label": "B",
                "optionText": "Transport",
                "sortOrder": 2
              },
              {
                "id": "q-net-02-4-c",
                "label": "C",
                "optionText": "Network",
                "sortOrder": 3
              },
              {
                "id": "q-net-02-4-d",
                "label": "D",
                "optionText": "Physical",
                "sortOrder": 4
              }
            ]
          },
          {
            "id": "q-net-02-5",
            "prompt": "Imagine a parcel delivery company that adds labels and packaging information before sending a parcel. Which networking process is most similar to this activity?",
            "questionType": "single_choice",
            "sortOrder": 5,
            "explanation": "Encapsulation adds protocol headers/trailers at each layer as data moves down the sending device's networking stack.",
            "correctOptionIds": [
              "q-net-02-5-b"
            ],
            "options": [
              {
                "id": "q-net-02-5-a",
                "label": "A",
                "optionText": "Decapsulation",
                "sortOrder": 1
              },
              {
                "id": "q-net-02-5-b",
                "label": "B",
                "optionText": "Encapsulation",
                "sortOrder": 2
              },
              {
                "id": "q-net-02-5-c",
                "label": "C",
                "optionText": "Routing",
                "sortOrder": 3
              },
              {
                "id": "q-net-02-5-d",
                "label": "D",
                "optionText": "Decryption",
                "sortOrder": 4
              }
            ]
          },
          {
            "id": "q-net-02-6",
            "prompt": "A student wants to identify the default gateway configured on a Linux computer. Which command should the student use?",
            "questionType": "single_choice",
            "sortOrder": 6,
            "explanation": "ip route displays the kernel routing table, including the default route and its gateway address.",
            "correctOptionIds": [
              "q-net-02-6-c"
            ],
            "options": [
              {
                "id": "q-net-02-6-a",
                "label": "A",
                "optionText": "ip link",
                "sortOrder": 1
              },
              {
                "id": "q-net-02-6-b",
                "label": "B",
                "optionText": "ip addr",
                "sortOrder": 2
              },
              {
                "id": "q-net-02-6-c",
                "label": "C",
                "optionText": "ip route",
                "sortOrder": 3
              },
              {
                "id": "q-net-02-6-d",
                "label": "D",
                "optionText": "ls",
                "sortOrder": 4
              }
            ]
          },
          {
            "id": "q-net-02-7",
            "prompt": "Which of the following are responsibilities associated with the OSI Data Link Layer? (Select all correct answers)",
            "questionType": "multiple_select",
            "sortOrder": 7,
            "explanation": "The Data Link Layer (Layer 2) handles framing, MAC addressing, and local-link frame delivery.",
            "correctOptionIds": [
              "q-net-02-7-a",
              "q-net-02-7-b",
              "q-net-02-7-c"
            ],
            "options": [
              {
                "id": "q-net-02-7-a",
                "label": "A",
                "optionText": "Framing",
                "sortOrder": 1
              },
              {
                "id": "q-net-02-7-b",
                "label": "B",
                "optionText": "MAC addressing",
                "sortOrder": 2
              },
              {
                "id": "q-net-02-7-c",
                "label": "C",
                "optionText": "Local frame delivery",
                "sortOrder": 3
              },
              {
                "id": "q-net-02-7-d",
                "label": "D",
                "optionText": "Domain-name resolution",
                "sortOrder": 4
              }
            ]
          },
          {
            "id": "q-net-02-8",
            "prompt": "Which statements about the TCP/IP model are correct? (Select all correct answers)",
            "questionType": "multiple_select",
            "sortOrder": 8,
            "explanation": "The commonly taught TCP/IP model has four layers: Application, Transport, Internet, and Network Access.",
            "correctOptionIds": [
              "q-net-02-8-a",
              "q-net-02-8-b",
              "q-net-02-8-c"
            ],
            "options": [
              {
                "id": "q-net-02-8-a",
                "label": "A",
                "optionText": "The commonly taught model has four layers.",
                "sortOrder": 1
              },
              {
                "id": "q-net-02-8-b",
                "label": "B",
                "optionText": "The Internet Layer handles IP addressing and routing.",
                "sortOrder": 2
              },
              {
                "id": "q-net-02-8-c",
                "label": "C",
                "optionText": "The Network Access Layer combines Data Link and Physical responsibilities.",
                "sortOrder": 3
              },
              {
                "id": "q-net-02-8-d",
                "label": "D",
                "optionText": "The TCP/IP model has seven layers.",
                "sortOrder": 4
              }
            ]
          },
          {
            "id": "q-net-02-9",
            "prompt": "During encapsulation, protocol information is added as data moves down the sending device's networking layers.",
            "questionType": "true_false",
            "sortOrder": 9,
            "explanation": "True — encapsulation occurs as data moves down the sending device's layers and protocol headers are added.",
            "correctOptionIds": [
              "q-net-02-9-a"
            ],
            "options": [
              {
                "id": "q-net-02-9-a",
                "label": "A",
                "optionText": "True",
                "sortOrder": 1
              },
              {
                "id": "q-net-02-9-b",
                "label": "B",
                "optionText": "False",
                "sortOrder": 2
              }
            ]
          },
          {
            "id": "q-net-02-10",
            "prompt": "The OSI and TCP/IP models organize networking responsibilities in exactly the same number of layers.",
            "questionType": "true_false",
            "sortOrder": 10,
            "explanation": "False — the OSI model has seven layers, while the commonly taught TCP/IP model has four.",
            "correctOptionIds": [
              "q-net-02-10-b"
            ],
            "options": [
              {
                "id": "q-net-02-10-a",
                "label": "A",
                "optionText": "True",
                "sortOrder": 1
              },
              {
                "id": "q-net-02-10-b",
                "label": "B",
                "optionText": "False",
                "sortOrder": 2
              }
            ]
          }
        ]
      },
      {
        "id": "quiz-net-ip-routing",
        "slug": "net-ip-routing-check",
        "title": "Module 03 Knowledge Check — IP Addressing and Subnetting",
        "description": "Verify your grasp of 32-bit IPv4 and 128-bit IPv6 addresses, RFC 1918 private ranges, DHCP, CIDR prefixes, broadcast addresses, and subnetting.",
        "category": "networking",
        "difficulty": "beginner",
        "lessonId": "net-003",
        "passPercentage": 100,
        "status": "published",
        "createdAt": earlier,
        "updatedAt": now,
        "questions": [
          {
            "id": "q-net-ip-routing-1",
            "prompt": "How many bits are used in an IPv4 address?",
            "questionType": "single_choice",
            "sortOrder": 1,
            "explanation": "IPv4 addresses contain 32 bits written as four 8-bit octets.",
            "correctOptionIds": [
              "q-net-ip-routing-1-c"
            ],
            "options": [
              {
                "id": "q-net-ip-routing-1-a",
                "label": "A",
                "optionText": "128 bits",
                "sortOrder": 1
              },
              {
                "id": "q-net-ip-routing-1-b",
                "label": "B",
                "optionText": "16 bits",
                "sortOrder": 2
              },
              {
                "id": "q-net-ip-routing-1-c",
                "label": "C",
                "optionText": "32 bits",
                "sortOrder": 3
              },
              {
                "id": "q-net-ip-routing-1-d",
                "label": "D",
                "optionText": "64 bits",
                "sortOrder": 4
              }
            ]
          },
          {
            "id": "q-net-ip-routing-2",
            "prompt": "Which of the following is a valid example of an IPv6 address?",
            "questionType": "single_choice",
            "sortOrder": 2,
            "explanation": "IPv6 uses 128-bit addresses written in hexadecimal notation separated by colons, such as 2001:db8::1.",
            "correctOptionIds": [
              "q-net-ip-routing-2-b"
            ],
            "options": [
              {
                "id": "q-net-ip-routing-2-a",
                "label": "A",
                "optionText": "192.168.1.10",
                "sortOrder": 1
              },
              {
                "id": "q-net-ip-routing-2-b",
                "label": "B",
                "optionText": "2001:db8::1",
                "sortOrder": 2
              },
              {
                "id": "q-net-ip-routing-2-c",
                "label": "C",
                "optionText": "255.255.255.0",
                "sortOrder": 3
              },
              {
                "id": "q-net-ip-routing-2-d",
                "label": "D",
                "optionText": "10.0.0.1",
                "sortOrder": 4
              }
            ]
          },
          {
            "id": "q-net-ip-routing-3",
            "prompt": "Which of the following is a private IPv4 address?",
            "questionType": "single_choice",
            "sortOrder": 3,
            "explanation": "172.20.5.10 falls inside the RFC 1918 private range 172.16.0.0/12 (172.16.0.0 – 172.31.255.255).",
            "correctOptionIds": [
              "q-net-ip-routing-3-b"
            ],
            "options": [
              {
                "id": "q-net-ip-routing-3-a",
                "label": "A",
                "optionText": "8.8.8.8",
                "sortOrder": 1
              },
              {
                "id": "q-net-ip-routing-3-b",
                "label": "B",
                "optionText": "172.20.5.10",
                "sortOrder": 2
              },
              {
                "id": "q-net-ip-routing-3-c",
                "label": "C",
                "optionText": "1.1.1.1",
                "sortOrder": 3
              },
              {
                "id": "q-net-ip-routing-3-d",
                "label": "D",
                "optionText": "203.0.113.10",
                "sortOrder": 4
              }
            ]
          },
          {
            "id": "q-net-ip-routing-4",
            "prompt": "Which protocol commonly assigns dynamic IP addresses automatically?",
            "questionType": "single_choice",
            "sortOrder": 4,
            "explanation": "DHCP (Dynamic Host Configuration Protocol) automatically assigns IP addresses and network settings to hosts.",
            "correctOptionIds": [
              "q-net-ip-routing-4-c"
            ],
            "options": [
              {
                "id": "q-net-ip-routing-4-a",
                "label": "A",
                "optionText": "HTTP",
                "sortOrder": 1
              },
              {
                "id": "q-net-ip-routing-4-b",
                "label": "B",
                "optionText": "FTP",
                "sortOrder": 2
              },
              {
                "id": "q-net-ip-routing-4-c",
                "label": "C",
                "optionText": "DHCP",
                "sortOrder": 3
              },
              {
                "id": "q-net-ip-routing-4-d",
                "label": "D",
                "optionText": "SSH",
                "sortOrder": 4
              }
            ]
          },
          {
            "id": "q-net-ip-routing-5",
            "prompt": "What does /24 mean in CIDR notation?",
            "questionType": "single_choice",
            "sortOrder": 5,
            "explanation": "In CIDR notation, /24 indicates that 24 bits belong to the network prefix.",
            "correctOptionIds": [
              "q-net-ip-routing-5-b"
            ],
            "options": [
              {
                "id": "q-net-ip-routing-5-a",
                "label": "A",
                "optionText": "24 host bits",
                "sortOrder": 1
              },
              {
                "id": "q-net-ip-routing-5-b",
                "label": "B",
                "optionText": "24 network bits",
                "sortOrder": 2
              },
              {
                "id": "q-net-ip-routing-5-c",
                "label": "C",
                "optionText": "24 total addresses",
                "sortOrder": 3
              },
              {
                "id": "q-net-ip-routing-5-d",
                "label": "D",
                "optionText": "24 network devices",
                "sortOrder": 4
              }
            ]
          },
          {
            "id": "q-net-ip-routing-6",
            "prompt": "What is the broadcast address of 192.168.1.0/24?",
            "questionType": "single_choice",
            "sortOrder": 6,
            "explanation": "192.168.1.255 has all host bits set to 1, making it the broadcast address for 192.168.1.0/24.",
            "correctOptionIds": [
              "q-net-ip-routing-6-d"
            ],
            "options": [
              {
                "id": "q-net-ip-routing-6-a",
                "label": "A",
                "optionText": "192.168.1.0",
                "sortOrder": 1
              },
              {
                "id": "q-net-ip-routing-6-b",
                "label": "B",
                "optionText": "192.168.1.1",
                "sortOrder": 2
              },
              {
                "id": "q-net-ip-routing-6-c",
                "label": "C",
                "optionText": "192.168.1.254",
                "sortOrder": 3
              },
              {
                "id": "q-net-ip-routing-6-d",
                "label": "D",
                "optionText": "192.168.1.255",
                "sortOrder": 4
              }
            ]
          },
          {
            "id": "q-net-ip-routing-7",
            "prompt": "Which statements about private IP addresses are correct? (Select all correct answers)",
            "questionType": "multiple_select",
            "sortOrder": 7,
            "explanation": "Private IPv4 addresses are used inside local networks, can be reused across organizations, and rely on NAT for external Internet traffic.",
            "correctOptionIds": [
              "q-net-ip-routing-7-a",
              "q-net-ip-routing-7-b",
              "q-net-ip-routing-7-d"
            ],
            "options": [
              {
                "id": "q-net-ip-routing-7-a",
                "label": "A",
                "optionText": "They are commonly used inside home and office networks.",
                "sortOrder": 1
              },
              {
                "id": "q-net-ip-routing-7-b",
                "label": "B",
                "optionText": "They can be reused in different private networks.",
                "sortOrder": 2
              },
              {
                "id": "q-net-ip-routing-7-c",
                "label": "C",
                "optionText": "They are always directly reachable from the public Internet.",
                "sortOrder": 3
              },
              {
                "id": "q-net-ip-routing-7-d",
                "label": "D",
                "optionText": "A router commonly uses NAT to provide external connectivity to private-network devices.",
                "sortOrder": 4
              }
            ]
          },
          {
            "id": "q-net-ip-routing-8",
            "prompt": "You have the network 192.168.1.0/24 and borrow 2 host bits to create equal-sized subnets. Which statements are correct? (Select all correct answers)",
            "questionType": "multiple_select",
            "sortOrder": 8,
            "explanation": "Borrowing 2 bits from /24 yields 2^2 = 4 subnets with a /26 prefix, each containing 64 total addresses and 62 usable host addresses.",
            "correctOptionIds": [
              "q-net-ip-routing-8-a",
              "q-net-ip-routing-8-b",
              "q-net-ip-routing-8-d"
            ],
            "options": [
              {
                "id": "q-net-ip-routing-8-a",
                "label": "A",
                "optionText": "Four subnets are created.",
                "sortOrder": 1
              },
              {
                "id": "q-net-ip-routing-8-b",
                "label": "B",
                "optionText": "The new prefix is /26.",
                "sortOrder": 2
              },
              {
                "id": "q-net-ip-routing-8-c",
                "label": "C",
                "optionText": "Each subnet has 128 total addresses.",
                "sortOrder": 3
              },
              {
                "id": "q-net-ip-routing-8-d",
                "label": "D",
                "optionText": "Each subnet normally has 62 usable host addresses.",
                "sortOrder": 4
              }
            ]
          },
          {
            "id": "q-net-ip-routing-9",
            "prompt": "A computer can have multiple IP addresses if it has multiple network interfaces or address configurations.",
            "questionType": "true_false",
            "sortOrder": 9,
            "explanation": "True — a device can have multiple interfaces (loopback, Ethernet, Wi-Fi, VPN) and multiple IP addresses.",
            "correctOptionIds": [
              "q-net-ip-routing-9-a"
            ],
            "options": [
              {
                "id": "q-net-ip-routing-9-a",
                "label": "A",
                "optionText": "True",
                "sortOrder": 1
              },
              {
                "id": "q-net-ip-routing-9-b",
                "label": "B",
                "optionText": "False",
                "sortOrder": 2
              }
            ]
          },
          {
            "id": "q-net-ip-routing-10",
            "prompt": "A /27 IPv4 subnet contains 32 total addresses and normally 30 usable host addresses.",
            "questionType": "true_false",
            "sortOrder": 10,
            "explanation": "True — 2^(32-27) = 32 total addresses, minus network and broadcast addresses = 30 usable host addresses.",
            "correctOptionIds": [
              "q-net-ip-routing-10-a"
            ],
            "options": [
              {
                "id": "q-net-ip-routing-10-a",
                "label": "A",
                "optionText": "True",
                "sortOrder": 1
              },
              {
                "id": "q-net-ip-routing-10-b",
                "label": "B",
                "optionText": "False",
                "sortOrder": 2
              }
            ]
          }
        ]
      },
      {
        "id": "quiz-net-04",
        "slug": "net-mac-arp-switching-check",
        "title": "Module 04 Knowledge Check — MAC Address, ARP and Switching",
        "description": "Assess your understanding of 48-bit MAC addresses, Layer 2 switching, ARP resolution and caching, Ethernet broadcast, default gateways, and VLANs.",
        "category": "networking",
        "difficulty": "beginner",
        "lessonId": "net-004",
        "passPercentage": 100,
        "status": "published",
        "createdAt": earlier,
        "updatedAt": now,
        "questions": [
          {
            "id": "q-net-04-1",
            "prompt": "What is the typical length of an Ethernet MAC address?",
            "questionType": "single_choice",
            "sortOrder": 1,
            "explanation": "A standard Ethernet MAC address is 48 bits (6 bytes) written as six hexadecimal pairs.",
            "correctOptionIds": [
              "q-net-04-1-a"
            ],
            "options": [
              {
                "id": "q-net-04-1-a",
                "label": "A",
                "optionText": "48 bits",
                "sortOrder": 1
              },
              {
                "id": "q-net-04-1-b",
                "label": "B",
                "optionText": "128 bits",
                "sortOrder": 2
              },
              {
                "id": "q-net-04-1-c",
                "label": "C",
                "optionText": "64 bits",
                "sortOrder": 3
              },
              {
                "id": "q-net-04-1-d",
                "label": "D",
                "optionText": "32 bits",
                "sortOrder": 4
              }
            ]
          },
          {
            "id": "q-net-04-2",
            "prompt": "Which protocol is used to discover the MAC address associated with a local IPv4 address?",
            "questionType": "single_choice",
            "sortOrder": 2,
            "explanation": "ARP (Address Resolution Protocol) resolves local IPv4 addresses into link-layer MAC addresses.",
            "correctOptionIds": [
              "q-net-04-2-c"
            ],
            "options": [
              {
                "id": "q-net-04-2-a",
                "label": "A",
                "optionText": "DNS",
                "sortOrder": 1
              },
              {
                "id": "q-net-04-2-b",
                "label": "B",
                "optionText": "DHCP",
                "sortOrder": 2
              },
              {
                "id": "q-net-04-2-c",
                "label": "C",
                "optionText": "ARP",
                "sortOrder": 3
              },
              {
                "id": "q-net-04-2-d",
                "label": "D",
                "optionText": "HTTP",
                "sortOrder": 4
              }
            ]
          },
          {
            "id": "q-net-04-3",
            "prompt": "What does a network switch primarily use to forward Ethernet frames?",
            "questionType": "single_choice",
            "sortOrder": 3,
            "explanation": "Switches inspect destination MAC addresses and consult their MAC address table to forward Ethernet frames.",
            "correctOptionIds": [
              "q-net-04-3-b"
            ],
            "options": [
              {
                "id": "q-net-04-3-a",
                "label": "A",
                "optionText": "Domain names",
                "sortOrder": 1
              },
              {
                "id": "q-net-04-3-b",
                "label": "B",
                "optionText": "Destination MAC addresses",
                "sortOrder": 2
              },
              {
                "id": "q-net-04-3-c",
                "label": "C",
                "optionText": "File names",
                "sortOrder": 3
              },
              {
                "id": "q-net-04-3-d",
                "label": "D",
                "optionText": "Application passwords",
                "sortOrder": 4
              }
            ]
          },
          {
            "id": "q-net-04-4",
            "prompt": "What is the purpose of an ARP cache?",
            "questionType": "single_choice",
            "sortOrder": 4,
            "explanation": "The ARP cache temporarily stores discovered IPv4-to-MAC mappings so hosts do not have to broadcast an ARP request for every packet.",
            "correctOptionIds": [
              "q-net-04-4-b"
            ],
            "options": [
              {
                "id": "q-net-04-4-a",
                "label": "A",
                "optionText": "Store website passwords",
                "sortOrder": 1
              },
              {
                "id": "q-net-04-4-b",
                "label": "B",
                "optionText": "Store discovered IP-to-MAC mappings temporarily",
                "sortOrder": 2
              },
              {
                "id": "q-net-04-4-c",
                "label": "C",
                "optionText": "Store downloaded files",
                "sortOrder": 3
              },
              {
                "id": "q-net-04-4-d",
                "label": "D",
                "optionText": "Assign public IP addresses",
                "sortOrder": 4
              }
            ]
          },
          {
            "id": "q-net-04-5",
            "prompt": "What is the Ethernet broadcast MAC address?",
            "questionType": "single_choice",
            "sortOrder": 5,
            "explanation": "FF:FF:FF:FF:FF:FF has all 48 bits set to 1 and represents the Ethernet broadcast MAC address.",
            "correctOptionIds": [
              "q-net-04-5-c"
            ],
            "options": [
              {
                "id": "q-net-04-5-a",
                "label": "A",
                "optionText": "00:00:00:00:00:00",
                "sortOrder": 1
              },
              {
                "id": "q-net-04-5-b",
                "label": "B",
                "optionText": "AA:AA:AA:AA:AA:AA",
                "sortOrder": 2
              },
              {
                "id": "q-net-04-5-c",
                "label": "C",
                "optionText": "FF:FF:FF:FF:FF:FF",
                "sortOrder": 3
              },
              {
                "id": "q-net-04-5-d",
                "label": "D",
                "optionText": "11:11:11:11:11:11",
                "sortOrder": 4
              }
            ]
          },
          {
            "id": "q-net-04-6",
            "prompt": "Your computer wants to send a packet to an Internet server outside its local subnet. Which MAC address does it use in the outgoing local Ethernet frame?",
            "questionType": "single_choice",
            "sortOrder": 6,
            "explanation": "When the destination IP is outside the local subnet, the local Ethernet frame is addressed to the default gateway's MAC address.",
            "correctOptionIds": [
              "q-net-04-6-c"
            ],
            "options": [
              {
                "id": "q-net-04-6-a",
                "label": "A",
                "optionText": "The remote server's MAC address",
                "sortOrder": 1
              },
              {
                "id": "q-net-04-6-b",
                "label": "B",
                "optionText": "Its own MAC address as the destination",
                "sortOrder": 2
              },
              {
                "id": "q-net-04-6-c",
                "label": "C",
                "optionText": "The default gateway's MAC address",
                "sortOrder": 3
              },
              {
                "id": "q-net-04-6-d",
                "label": "D",
                "optionText": "The DNS server's MAC address in every case",
                "sortOrder": 4
              }
            ]
          },
          {
            "id": "q-net-04-7",
            "prompt": "Which statements about ARP are correct? (Select all correct answers)",
            "questionType": "multiple_select",
            "sortOrder": 7,
            "explanation": "ARP resolves IPv4 addresses using broadcast requests and unicast replies; IPv6 uses Neighbor Discovery Protocol (NDP) instead.",
            "correctOptionIds": [
              "q-net-04-7-a",
              "q-net-04-7-b",
              "q-net-04-7-d"
            ],
            "options": [
              {
                "id": "q-net-04-7-a",
                "label": "A",
                "optionText": "ARP is used for IPv4 address resolution.",
                "sortOrder": 1
              },
              {
                "id": "q-net-04-7-b",
                "label": "B",
                "optionText": "ARP requests are broadcast on the local network.",
                "sortOrder": 2
              },
              {
                "id": "q-net-04-7-c",
                "label": "C",
                "optionText": "IPv6 uses ARP in the same way as IPv4.",
                "sortOrder": 3
              },
              {
                "id": "q-net-04-7-d",
                "label": "D",
                "optionText": "ARP replies can provide the requested MAC address.",
                "sortOrder": 4
              }
            ]
          },
          {
            "id": "q-net-04-8",
            "prompt": "Which statements about VLANs are correct? (Select all correct answers)",
            "questionType": "multiple_select",
            "sortOrder": 8,
            "explanation": "VLANs logically segment a physical switch into separate Layer 2 broadcast domains and require Layer 3 routing for inter-VLAN traffic.",
            "correctOptionIds": [
              "q-net-04-8-a",
              "q-net-04-8-b",
              "q-net-04-8-c"
            ],
            "options": [
              {
                "id": "q-net-04-8-a",
                "label": "A",
                "optionText": "VLANs can separate departments on a shared physical network.",
                "sortOrder": 1
              },
              {
                "id": "q-net-04-8-b",
                "label": "B",
                "optionText": "VLANs create separate Layer 2 broadcast domains.",
                "sortOrder": 2
              },
              {
                "id": "q-net-04-8-c",
                "label": "C",
                "optionText": "Communication between different VLANs generally requires Layer 3 routing.",
                "sortOrder": 3
              },
              {
                "id": "q-net-04-8-d",
                "label": "D",
                "optionText": "VLANs replace IP addresses.",
                "sortOrder": 4
              }
            ]
          },
          {
            "id": "q-net-04-9",
            "prompt": "A switch can learn which port a device is connected to by examining the source MAC address of incoming frames.",
            "questionType": "true_false",
            "sortOrder": 9,
            "explanation": "True — switches build their MAC address table by inspecting the source MAC address and ingress port of incoming frames.",
            "correctOptionIds": [
              "q-net-04-9-a"
            ],
            "options": [
              {
                "id": "q-net-04-9-a",
                "label": "A",
                "optionText": "True",
                "sortOrder": 1
              },
              {
                "id": "q-net-04-9-b",
                "label": "B",
                "optionText": "False",
                "sortOrder": 2
              }
            ]
          },
          {
            "id": "q-net-04-10",
            "prompt": "When a computer sends traffic to a remote Internet destination, the destination MAC address in its local Ethernet frame is normally the remote server's MAC address.",
            "questionType": "true_false",
            "sortOrder": 10,
            "explanation": "False — the destination IP is the remote server, but the local Ethernet frame's destination MAC is the next-hop default gateway.",
            "correctOptionIds": [
              "q-net-04-10-b"
            ],
            "options": [
              {
                "id": "q-net-04-10-a",
                "label": "A",
                "optionText": "True",
                "sortOrder": 1
              },
              {
                "id": "q-net-04-10-b",
                "label": "B",
                "optionText": "False",
                "sortOrder": 2
              }
            ]
          }
        ]
      },
      {
        "id": "quiz-net-tcp-udp",
        "slug": "net-tcp-udp-ports-check",
        "title": "Module 05 Knowledge Check — TCP, UDP and Network Ports",
        "description": "Test your understanding of TCP three-way handshakes, UDP datagrams, well-known and ephemeral ports, five-tuples, and socket inspection with ss.",
        "category": "networking",
        "difficulty": "beginner",
        "lessonId": "net-005",
        "passPercentage": 100,
        "status": "published",
        "createdAt": earlier,
        "updatedAt": now,
        "questions": [
          {
            "id": "q-net-tcp-udp-1",
            "prompt": "Which Transport Layer protocol provides reliable and ordered delivery of a byte stream?",
            "questionType": "single_choice",
            "sortOrder": 1,
            "explanation": "TCP provides reliable, ordered byte-stream delivery using sequence numbers, acknowledgements, and retransmissions.",
            "correctOptionIds": [
              "q-net-tcp-udp-1-b"
            ],
            "options": [
              {
                "id": "q-net-tcp-udp-1-a",
                "label": "A",
                "optionText": "IP",
                "sortOrder": 1
              },
              {
                "id": "q-net-tcp-udp-1-b",
                "label": "B",
                "optionText": "TCP",
                "sortOrder": 2
              },
              {
                "id": "q-net-tcp-udp-1-c",
                "label": "C",
                "optionText": "UDP",
                "sortOrder": 3
              },
              {
                "id": "q-net-tcp-udp-1-d",
                "label": "D",
                "optionText": "ARP",
                "sortOrder": 4
              }
            ]
          },
          {
            "id": "q-net-tcp-udp-2",
            "prompt": "What is the correct order of the TCP three-way handshake?",
            "questionType": "single_choice",
            "sortOrder": 2,
            "explanation": "The client sends SYN, the server replies with SYN-ACK, and the client completes connection setup with ACK.",
            "correctOptionIds": [
              "q-net-tcp-udp-2-c"
            ],
            "options": [
              {
                "id": "q-net-tcp-udp-2-a",
                "label": "A",
                "optionText": "ACK → SYN → SYN-ACK",
                "sortOrder": 1
              },
              {
                "id": "q-net-tcp-udp-2-b",
                "label": "B",
                "optionText": "SYN → ACK → SYN-ACK",
                "sortOrder": 2
              },
              {
                "id": "q-net-tcp-udp-2-c",
                "label": "C",
                "optionText": "SYN → SYN-ACK → ACK",
                "sortOrder": 3
              },
              {
                "id": "q-net-tcp-udp-2-d",
                "label": "D",
                "optionText": "SYN-ACK → ACK → SYN",
                "sortOrder": 4
              }
            ]
          },
          {
            "id": "q-net-tcp-udp-3",
            "prompt": "Which protocol is connectionless and does not guarantee packet delivery?",
            "questionType": "single_choice",
            "sortOrder": 3,
            "explanation": "UDP is a connectionless transport protocol that sends datagrams without built-in delivery or ordering guarantees.",
            "correctOptionIds": [
              "q-net-tcp-udp-3-b"
            ],
            "options": [
              {
                "id": "q-net-tcp-udp-3-a",
                "label": "A",
                "optionText": "TCP",
                "sortOrder": 1
              },
              {
                "id": "q-net-tcp-udp-3-b",
                "label": "B",
                "optionText": "UDP",
                "sortOrder": 2
              },
              {
                "id": "q-net-tcp-udp-3-c",
                "label": "C",
                "optionText": "SSH",
                "sortOrder": 3
              },
              {
                "id": "q-net-tcp-udp-3-d",
                "label": "D",
                "optionText": "HTTPS",
                "sortOrder": 4
              }
            ]
          },
          {
            "id": "q-net-tcp-udp-4",
            "prompt": "Which port is commonly used by SSH?",
            "questionType": "single_choice",
            "sortOrder": 4,
            "explanation": "SSH commonly listens on TCP port 22.",
            "correctOptionIds": [
              "q-net-tcp-udp-4-b"
            ],
            "options": [
              {
                "id": "q-net-tcp-udp-4-a",
                "label": "A",
                "optionText": "21",
                "sortOrder": 1
              },
              {
                "id": "q-net-tcp-udp-4-b",
                "label": "B",
                "optionText": "22",
                "sortOrder": 2
              },
              {
                "id": "q-net-tcp-udp-4-c",
                "label": "C",
                "optionText": "53",
                "sortOrder": 3
              },
              {
                "id": "q-net-tcp-udp-4-d",
                "label": "D",
                "optionText": "80",
                "sortOrder": 4
              }
            ]
          },
          {
            "id": "q-net-tcp-udp-5",
            "prompt": "A client connects to a web server at 93.184.216.34:443 from 192.168.1.10:51520. What is the client's source port?",
            "questionType": "single_choice",
            "sortOrder": 5,
            "explanation": "In 192.168.1.10:51520 → 93.184.216.34:443, 51520 is the client's ephemeral source port and 443 is the server's destination port.",
            "correctOptionIds": [
              "q-net-tcp-udp-5-c"
            ],
            "options": [
              {
                "id": "q-net-tcp-udp-5-a",
                "label": "A",
                "optionText": "443",
                "sortOrder": 1
              },
              {
                "id": "q-net-tcp-udp-5-b",
                "label": "B",
                "optionText": "80",
                "sortOrder": 2
              },
              {
                "id": "q-net-tcp-udp-5-c",
                "label": "C",
                "optionText": "51520",
                "sortOrder": 3
              },
              {
                "id": "q-net-tcp-udp-5-d",
                "label": "D",
                "optionText": "22",
                "sortOrder": 4
              }
            ]
          },
          {
            "id": "q-net-tcp-udp-6",
            "prompt": "Which Linux command displays listening TCP and UDP sockets using numeric addresses?",
            "questionType": "single_choice",
            "sortOrder": 6,
            "explanation": "ss -tuln lists listening (-l) TCP (-t) and UDP (-u) sockets with numeric (-n) addresses and ports.",
            "correctOptionIds": [
              "q-net-tcp-udp-6-b"
            ],
            "options": [
              {
                "id": "q-net-tcp-udp-6-a",
                "label": "A",
                "optionText": "ip addr",
                "sortOrder": 1
              },
              {
                "id": "q-net-tcp-udp-6-b",
                "label": "B",
                "optionText": "ss -tuln",
                "sortOrder": 2
              },
              {
                "id": "q-net-tcp-udp-6-c",
                "label": "C",
                "optionText": "ping -c 4 1.1.1.1",
                "sortOrder": 3
              },
              {
                "id": "q-net-tcp-udp-6-d",
                "label": "D",
                "optionText": "getent hosts example.com",
                "sortOrder": 4
              }
            ]
          },
          {
            "id": "q-net-tcp-udp-7",
            "prompt": "Which of the following are characteristics of TCP? (Select all correct answers)",
            "questionType": "multiple_select",
            "sortOrder": 7,
            "explanation": "TCP is connection-oriented, establishes sessions via the three-way handshake, and provides ordered, reliable delivery with flow control.",
            "correctOptionIds": [
              "q-net-tcp-udp-7-a",
              "q-net-tcp-udp-7-b",
              "q-net-tcp-udp-7-d",
              "q-net-tcp-udp-7-e"
            ],
            "options": [
              {
                "id": "q-net-tcp-udp-7-a",
                "label": "A",
                "optionText": "Connection-oriented communication",
                "sortOrder": 1
              },
              {
                "id": "q-net-tcp-udp-7-b",
                "label": "B",
                "optionText": "Reliable delivery mechanisms",
                "sortOrder": 2
              },
              {
                "id": "q-net-tcp-udp-7-c",
                "label": "C",
                "optionText": "No ordering guarantee",
                "sortOrder": 3
              },
              {
                "id": "q-net-tcp-udp-7-d",
                "label": "D",
                "optionText": "Flow control",
                "sortOrder": 4
              },
              {
                "id": "q-net-tcp-udp-7-e",
                "label": "E",
                "optionText": "Three-way handshake",
                "sortOrder": 5
              }
            ]
          },
          {
            "id": "q-net-tcp-udp-8",
            "prompt": "Which of the following are commonly associated with UDP? (Select all correct answers)",
            "questionType": "multiple_select",
            "sortOrder": 8,
            "explanation": "UDP is commonly used for DHCP, standard DNS queries, and low-latency real-time voice/video streams.",
            "correctOptionIds": [
              "q-net-tcp-udp-8-a",
              "q-net-tcp-udp-8-b",
              "q-net-tcp-udp-8-d"
            ],
            "options": [
              {
                "id": "q-net-tcp-udp-8-a",
                "label": "A",
                "optionText": "DHCP",
                "sortOrder": 1
              },
              {
                "id": "q-net-tcp-udp-8-b",
                "label": "B",
                "optionText": "DNS queries in common configurations",
                "sortOrder": 2
              },
              {
                "id": "q-net-tcp-udp-8-c",
                "label": "C",
                "optionText": "TCP three-way handshake",
                "sortOrder": 3
              },
              {
                "id": "q-net-tcp-udp-8-d",
                "label": "D",
                "optionText": "Real-time voice and video communication",
                "sortOrder": 4
              },
              {
                "id": "q-net-tcp-udp-8-e",
                "label": "E",
                "optionText": "Built-in retransmission of every lost datagram",
                "sortOrder": 5
              }
            ]
          },
          {
            "id": "q-net-tcp-udp-9",
            "prompt": "A service listening on a local port is always accessible from the Internet.",
            "questionType": "true_false",
            "sortOrder": 9,
            "explanation": "False — a service bound to 127.0.0.1 or protected by a firewall/NAT is not directly reachable from the public Internet.",
            "correctOptionIds": [
              "q-net-tcp-udp-9-b"
            ],
            "options": [
              {
                "id": "q-net-tcp-udp-9-a",
                "label": "A",
                "optionText": "True",
                "sortOrder": 1
              },
              {
                "id": "q-net-tcp-udp-9-b",
                "label": "B",
                "optionText": "False",
                "sortOrder": 2
              }
            ]
          },
          {
            "id": "q-net-tcp-udp-10",
            "prompt": "A five-tuple includes the transport protocol, source IP, source port, destination IP and destination port.",
            "questionType": "true_false",
            "sortOrder": 10,
            "explanation": "True — the five-tuple uniquely identifies a network communication flow.",
            "correctOptionIds": [
              "q-net-tcp-udp-10-a"
            ],
            "options": [
              {
                "id": "q-net-tcp-udp-10-a",
                "label": "A",
                "optionText": "True",
                "sortOrder": 1
              },
              {
                "id": "q-net-tcp-udp-10-b",
                "label": "B",
                "optionText": "False",
                "sortOrder": 2
              }
            ]
          }
        ]
      },
      {
        "id": "quiz-net-dns",
        "slug": "net-dns-diagnostics-check",
        "title": "Module 06 Knowledge Check — DNS, DHCP and NAT",
        "description": "Verify your fluency with DNS resolution and record types (A, AAAA, MX, PTR), the DHCP DORA process, and Network Address Translation (NAT/PAT).",
        "category": "networking",
        "difficulty": "beginner",
        "lessonId": "net-006",
        "passPercentage": 100,
        "status": "published",
        "createdAt": earlier,
        "updatedAt": now,
        "questions": [
          {
            "id": "q-net-dns-1",
            "prompt": "What is the primary purpose of DNS?",
            "questionType": "single_choice",
            "sortOrder": 1,
            "explanation": "DNS resolves human-readable domain names into DNS records such as IPv4 (A) and IPv6 (AAAA) addresses.",
            "correctOptionIds": [
              "q-net-dns-1-c"
            ],
            "options": [
              {
                "id": "q-net-dns-1-a",
                "label": "A",
                "optionText": "Automatically assign IP addresses to devices.",
                "sortOrder": 1
              },
              {
                "id": "q-net-dns-1-b",
                "label": "B",
                "optionText": "Translate network addresses into MAC addresses.",
                "sortOrder": 2
              },
              {
                "id": "q-net-dns-1-c",
                "label": "C",
                "optionText": "Help resolve domain names into DNS records, including IP addresses.",
                "sortOrder": 3
              },
              {
                "id": "q-net-dns-1-d",
                "label": "D",
                "optionText": "Encrypt all network communication.",
                "sortOrder": 4
              }
            ]
          },
          {
            "id": "q-net-dns-2",
            "prompt": "Which DNS component handles queries on behalf of a client and may contact other DNS servers to obtain an answer?",
            "questionType": "single_choice",
            "sortOrder": 2,
            "explanation": "A recursive resolver performs DNS lookups on behalf of clients, returning cached answers or querying upstream DNS servers.",
            "correctOptionIds": [
              "q-net-dns-2-a"
            ],
            "options": [
              {
                "id": "q-net-dns-2-a",
                "label": "A",
                "optionText": "Recursive resolver",
                "sortOrder": 1
              },
              {
                "id": "q-net-dns-2-b",
                "label": "B",
                "optionText": "Ethernet switch",
                "sortOrder": 2
              },
              {
                "id": "q-net-dns-2-c",
                "label": "C",
                "optionText": "DHCP client",
                "sortOrder": 3
              },
              {
                "id": "q-net-dns-2-d",
                "label": "D",
                "optionText": "Default gateway",
                "sortOrder": 4
              }
            ]
          },
          {
            "id": "q-net-dns-3",
            "prompt": "Which DNS record maps a domain name to an IPv4 address?",
            "questionType": "single_choice",
            "sortOrder": 3,
            "explanation": "An A record maps a hostname to a 32-bit IPv4 address.",
            "correctOptionIds": [
              "q-net-dns-3-c"
            ],
            "options": [
              {
                "id": "q-net-dns-3-a",
                "label": "A",
                "optionText": "MX",
                "sortOrder": 1
              },
              {
                "id": "q-net-dns-3-b",
                "label": "B",
                "optionText": "AAAA",
                "sortOrder": 2
              },
              {
                "id": "q-net-dns-3-c",
                "label": "C",
                "optionText": "A",
                "sortOrder": 3
              },
              {
                "id": "q-net-dns-3-d",
                "label": "D",
                "optionText": "PTR",
                "sortOrder": 4
              }
            ]
          },
          {
            "id": "q-net-dns-4",
            "prompt": "What does the letter D represent in the DHCP DORA process?",
            "questionType": "single_choice",
            "sortOrder": 4,
            "explanation": "DORA stands for Discover, Offer, Request, and Acknowledge.",
            "correctOptionIds": [
              "q-net-dns-4-b"
            ],
            "options": [
              {
                "id": "q-net-dns-4-a",
                "label": "A",
                "optionText": "Delivery",
                "sortOrder": 1
              },
              {
                "id": "q-net-dns-4-b",
                "label": "B",
                "optionText": "Discover",
                "sortOrder": 2
              },
              {
                "id": "q-net-dns-4-c",
                "label": "C",
                "optionText": "Destination",
                "sortOrder": 3
              },
              {
                "id": "q-net-dns-4-d",
                "label": "D",
                "optionText": "Domain",
                "sortOrder": 4
              }
            ]
          },
          {
            "id": "q-net-dns-5",
            "prompt": "Which UDP port is commonly used by a DHCP server for IPv4?",
            "questionType": "single_choice",
            "sortOrder": 5,
            "explanation": "DHCPv4 servers listen on UDP port 67, while DHCPv4 clients use UDP port 68.",
            "correctOptionIds": [
              "q-net-dns-5-c"
            ],
            "options": [
              {
                "id": "q-net-dns-5-a",
                "label": "A",
                "optionText": "22",
                "sortOrder": 1
              },
              {
                "id": "q-net-dns-5-b",
                "label": "B",
                "optionText": "53",
                "sortOrder": 2
              },
              {
                "id": "q-net-dns-5-c",
                "label": "C",
                "optionText": "67",
                "sortOrder": 3
              },
              {
                "id": "q-net-dns-5-d",
                "label": "D",
                "optionText": "443",
                "sortOrder": 4
              }
            ]
          },
          {
            "id": "q-net-dns-6",
            "prompt": "What is the primary purpose of NAT in a typical home network?",
            "questionType": "single_choice",
            "sortOrder": 6,
            "explanation": "NAT translates private internal IPv4 addresses to an external public IP address when communicating outside the local network.",
            "correctOptionIds": [
              "q-net-dns-6-a"
            ],
            "options": [
              {
                "id": "q-net-dns-6-a",
                "label": "A",
                "optionText": "Translate private network addresses for communication with external networks.",
                "sortOrder": 1
              },
              {
                "id": "q-net-dns-6-b",
                "label": "B",
                "optionText": "Automatically resolve domain names.",
                "sortOrder": 2
              },
              {
                "id": "q-net-dns-6-c",
                "label": "C",
                "optionText": "Assign every device a unique public IP address.",
                "sortOrder": 3
              },
              {
                "id": "q-net-dns-6-d",
                "label": "D",
                "optionText": "Replace the need for a default gateway.",
                "sortOrder": 4
              }
            ]
          },
          {
            "id": "q-net-dns-7",
            "prompt": "Which of the following are valid DNS record types? (Select all correct answers)",
            "questionType": "multiple_select",
            "sortOrder": 7,
            "explanation": "A, AAAA, MX, and PTR are standard DNS record types; DHCP is a dynamic host configuration protocol.",
            "correctOptionIds": [
              "q-net-dns-7-a",
              "q-net-dns-7-b",
              "q-net-dns-7-c",
              "q-net-dns-7-e"
            ],
            "options": [
              {
                "id": "q-net-dns-7-a",
                "label": "A",
                "optionText": "A",
                "sortOrder": 1
              },
              {
                "id": "q-net-dns-7-b",
                "label": "B",
                "optionText": "AAAA",
                "sortOrder": 2
              },
              {
                "id": "q-net-dns-7-c",
                "label": "C",
                "optionText": "MX",
                "sortOrder": 3
              },
              {
                "id": "q-net-dns-7-d",
                "label": "D",
                "optionText": "DHCP",
                "sortOrder": 4
              },
              {
                "id": "q-net-dns-7-e",
                "label": "E",
                "optionText": "PTR",
                "sortOrder": 5
              }
            ]
          },
          {
            "id": "q-net-dns-8",
            "prompt": "Which of the following are characteristics of DHCP? (Select all correct answers)",
            "questionType": "multiple_select",
            "sortOrder": 8,
            "explanation": "DHCP assigns IP addresses, subnet masks, default gateways, and DNS servers via the DORA sequence; NAT performs address translation.",
            "correctOptionIds": [
              "q-net-dns-8-a",
              "q-net-dns-8-b",
              "q-net-dns-8-c",
              "q-net-dns-8-d"
            ],
            "options": [
              {
                "id": "q-net-dns-8-a",
                "label": "A",
                "optionText": "It can provide an IP address.",
                "sortOrder": 1
              },
              {
                "id": "q-net-dns-8-b",
                "label": "B",
                "optionText": "It can provide a default gateway.",
                "sortOrder": 2
              },
              {
                "id": "q-net-dns-8-c",
                "label": "C",
                "optionText": "It can provide DNS server information.",
                "sortOrder": 3
              },
              {
                "id": "q-net-dns-8-d",
                "label": "D",
                "optionText": "It uses the DORA process in common IPv4 address allocation.",
                "sortOrder": 4
              },
              {
                "id": "q-net-dns-8-e",
                "label": "E",
                "optionText": "It translates private IP addresses into public IP addresses.",
                "sortOrder": 5
              }
            ]
          },
          {
            "id": "q-net-dns-9",
            "prompt": "NAT and a firewall perform exactly the same function.",
            "questionType": "true_false",
            "sortOrder": 9,
            "explanation": "False — NAT translates network addresses, whereas a firewall enforces traffic-filtering security rules.",
            "correctOptionIds": [
              "q-net-dns-9-b"
            ],
            "options": [
              {
                "id": "q-net-dns-9-a",
                "label": "A",
                "optionText": "True",
                "sortOrder": 1
              },
              {
                "id": "q-net-dns-9-b",
                "label": "B",
                "optionText": "False",
                "sortOrder": 2
              }
            ]
          },
          {
            "id": "q-net-dns-10",
            "prompt": "A DNS resolver may return a cached answer without contacting root, TLD or authoritative DNS servers for every query.",
            "questionType": "true_false",
            "sortOrder": 10,
            "explanation": "True — resolvers cache DNS responses up to their TTL to reduce latency and upstream query traffic.",
            "correctOptionIds": [
              "q-net-dns-10-a"
            ],
            "options": [
              {
                "id": "q-net-dns-10-a",
                "label": "A",
                "optionText": "True",
                "sortOrder": 1
              },
              {
                "id": "q-net-dns-10-b",
                "label": "B",
                "optionText": "False",
                "sortOrder": 2
              }
            ]
          }
        ]
      },
      {
        "id": "quiz-net-07",
        "slug": "net-linux-troubleshooting-check",
        "title": "Module 07 Knowledge Check — Linux Networking and Troubleshooting",
        "description": "Evaluate your command of systematic Linux network diagnostics using ip link, ip addr, ip route, ping, traceroute, dig, getent, ss, and tcpdump.",
        "category": "networking",
        "difficulty": "beginner",
        "lessonId": "net-007",
        "passPercentage": 100,
        "status": "published",
        "createdAt": earlier,
        "updatedAt": now,
        "questions": [
          {
            "id": "q-net-07-1",
            "prompt": "Which Linux command displays network interfaces and their link-layer status?",
            "questionType": "single_choice",
            "sortOrder": 1,
            "explanation": "ip link displays network interfaces and their link-layer state (such as UP or LOWER_UP).",
            "correctOptionIds": [
              "q-net-07-1-a"
            ],
            "options": [
              {
                "id": "q-net-07-1-a",
                "label": "A",
                "optionText": "ip link",
                "sortOrder": 1
              },
              {
                "id": "q-net-07-1-b",
                "label": "B",
                "optionText": "curl",
                "sortOrder": 2
              },
              {
                "id": "q-net-07-1-c",
                "label": "C",
                "optionText": "dig",
                "sortOrder": 3
              },
              {
                "id": "q-net-07-1-d",
                "label": "D",
                "optionText": "ip route",
                "sortOrder": 4
              }
            ]
          },
          {
            "id": "q-net-07-2",
            "prompt": "Which command displays the IP addresses assigned to your network interfaces?",
            "questionType": "single_choice",
            "sortOrder": 2,
            "explanation": "ip addr displays IPv4 and IPv6 addresses assigned to network interfaces.",
            "correctOptionIds": [
              "q-net-07-2-b"
            ],
            "options": [
              {
                "id": "q-net-07-2-a",
                "label": "A",
                "optionText": "ss -tn",
                "sortOrder": 1
              },
              {
                "id": "q-net-07-2-b",
                "label": "B",
                "optionText": "ip addr",
                "sortOrder": 2
              },
              {
                "id": "q-net-07-2-c",
                "label": "C",
                "optionText": "tcpdump",
                "sortOrder": 3
              },
              {
                "id": "q-net-07-2-d",
                "label": "D",
                "optionText": "traceroute",
                "sortOrder": 4
              }
            ]
          },
          {
            "id": "q-net-07-3",
            "prompt": "Your Linux computer needs to send traffic to a destination outside its local network. Which routing component is commonly used when no more specific route matches?",
            "questionType": "single_choice",
            "sortOrder": 3,
            "explanation": "The default gateway is the next-hop router used when no more specific route matches a destination IP.",
            "correctOptionIds": [
              "q-net-07-3-c"
            ],
            "options": [
              {
                "id": "q-net-07-3-a",
                "label": "A",
                "optionText": "DNS resolver",
                "sortOrder": 1
              },
              {
                "id": "q-net-07-3-b",
                "label": "B",
                "optionText": "Loopback interface",
                "sortOrder": 2
              },
              {
                "id": "q-net-07-3-c",
                "label": "C",
                "optionText": "Default gateway",
                "sortOrder": 3
              },
              {
                "id": "q-net-07-3-d",
                "label": "D",
                "optionText": "Listening port",
                "sortOrder": 4
              }
            ]
          },
          {
            "id": "q-net-07-4",
            "prompt": "Which command sends four ICMP Echo Requests to test connectivity to an external IP address?",
            "questionType": "single_choice",
            "sortOrder": 4,
            "explanation": "ping -c 4 1.1.1.1 sends four ICMP Echo Requests and stops.",
            "correctOptionIds": [
              "q-net-07-4-d"
            ],
            "options": [
              {
                "id": "q-net-07-4-a",
                "label": "A",
                "optionText": "dig -c 4 1.1.1.1",
                "sortOrder": 1
              },
              {
                "id": "q-net-07-4-b",
                "label": "B",
                "optionText": "ss -c 4 1.1.1.1",
                "sortOrder": 2
              },
              {
                "id": "q-net-07-4-c",
                "label": "C",
                "optionText": "curl -c 4 1.1.1.1",
                "sortOrder": 3
              },
              {
                "id": "q-net-07-4-d",
                "label": "D",
                "optionText": "ping -c 4 1.1.1.1",
                "sortOrder": 4
              }
            ]
          },
          {
            "id": "q-net-07-5",
            "prompt": "Your computer can ping 1.1.1.1, but getent hosts example.com fails. What is a likely area to investigate?",
            "questionType": "single_choice",
            "sortOrder": 5,
            "explanation": "Successful IP reachability (ping 1.1.1.1) combined with failed hostname resolution points to a DNS problem.",
            "correctOptionIds": [
              "q-net-07-5-a"
            ],
            "options": [
              {
                "id": "q-net-07-5-a",
                "label": "A",
                "optionText": "DNS resolution",
                "sortOrder": 1
              },
              {
                "id": "q-net-07-5-b",
                "label": "B",
                "optionText": "Monitor resolution",
                "sortOrder": 2
              },
              {
                "id": "q-net-07-5-c",
                "label": "C",
                "optionText": "Keyboard configuration",
                "sortOrder": 3
              },
              {
                "id": "q-net-07-5-d",
                "label": "D",
                "optionText": "File permissions",
                "sortOrder": 4
              }
            ]
          },
          {
            "id": "q-net-07-6",
            "prompt": "Which command is useful for checking whether a local service is listening on a network port?",
            "questionType": "single_choice",
            "sortOrder": 6,
            "explanation": "ss -tuln lists listening TCP and UDP sockets with numeric port numbers.",
            "correctOptionIds": [
              "q-net-07-6-b"
            ],
            "options": [
              {
                "id": "q-net-07-6-a",
                "label": "A",
                "optionText": "ip addr",
                "sortOrder": 1
              },
              {
                "id": "q-net-07-6-b",
                "label": "B",
                "optionText": "ss -tuln",
                "sortOrder": 2
              },
              {
                "id": "q-net-07-6-c",
                "label": "C",
                "optionText": "dig example.com",
                "sortOrder": 3
              },
              {
                "id": "q-net-07-6-d",
                "label": "D",
                "optionText": "ping 127.0.0.1",
                "sortOrder": 4
              }
            ]
          },
          {
            "id": "q-net-07-7",
            "prompt": "Which commands can help investigate DNS resolution or resolver configuration? (Select all correct answers)",
            "questionType": "multiple_select",
            "sortOrder": 7,
            "explanation": "dig, getent hosts, and resolvectl status inspect DNS queries and system resolver settings.",
            "correctOptionIds": [
              "q-net-07-7-a",
              "q-net-07-7-b",
              "q-net-07-7-c"
            ],
            "options": [
              {
                "id": "q-net-07-7-a",
                "label": "A",
                "optionText": "dig example.com",
                "sortOrder": 1
              },
              {
                "id": "q-net-07-7-b",
                "label": "B",
                "optionText": "getent hosts example.com",
                "sortOrder": 2
              },
              {
                "id": "q-net-07-7-c",
                "label": "C",
                "optionText": "resolvectl status",
                "sortOrder": 3
              },
              {
                "id": "q-net-07-7-d",
                "label": "D",
                "optionText": "ip link",
                "sortOrder": 4
              }
            ]
          },
          {
            "id": "q-net-07-8",
            "prompt": "Which statements about tcpdump are correct? (Select all correct answers)",
            "questionType": "multiple_select",
            "sortOrder": 8,
            "explanation": "tcpdump captures packets and supports filters like icmp or port 53 to verify actual traffic on an interface.",
            "correctOptionIds": [
              "q-net-07-8-a",
              "q-net-07-8-b",
              "q-net-07-8-d"
            ],
            "options": [
              {
                "id": "q-net-07-8-a",
                "label": "A",
                "optionText": "It can capture network packets.",
                "sortOrder": 1
              },
              {
                "id": "q-net-07-8-b",
                "label": "B",
                "optionText": "It can filter traffic using expressions such as icmp or port 53.",
                "sortOrder": 2
              },
              {
                "id": "q-net-07-8-c",
                "label": "C",
                "optionText": "It automatically repairs incorrect routing tables.",
                "sortOrder": 3
              },
              {
                "id": "q-net-07-8-d",
                "label": "D",
                "optionText": "It can help inspect ICMP traffic generated by ping.",
                "sortOrder": 4
              }
            ]
          },
          {
            "id": "q-net-07-9",
            "prompt": "If ping fails, the destination must be offline.",
            "questionType": "true_false",
            "sortOrder": 9,
            "explanation": "False — a host may be online while blocking or rate-limiting ICMP Echo Requests via a firewall.",
            "correctOptionIds": [
              "q-net-07-9-b"
            ],
            "options": [
              {
                "id": "q-net-07-9-a",
                "label": "A",
                "optionText": "True",
                "sortOrder": 1
              },
              {
                "id": "q-net-07-9-b",
                "label": "B",
                "optionText": "False",
                "sortOrder": 2
              }
            ]
          },
          {
            "id": "q-net-07-10",
            "prompt": "A systematic troubleshooting process should normally investigate basic interface and IP configuration before moving to DNS and application-level testing.",
            "questionType": "true_false",
            "sortOrder": 10,
            "explanation": "True — verifying link, IP, route, and gateway reachability first isolates lower-layer issues before debugging DNS or applications.",
            "correctOptionIds": [
              "q-net-07-10-a"
            ],
            "options": [
              {
                "id": "q-net-07-10-a",
                "label": "A",
                "optionText": "True",
                "sortOrder": 1
              },
              {
                "id": "q-net-07-10-b",
                "label": "B",
                "optionText": "False",
                "sortOrder": 2
              }
            ]
          }
        ]
      },
      {
        "id": "quiz-net-08",
        "slug": "net-traffic-analysis-check",
        "title": "Module 08 Knowledge Check — Network Traffic Analysis",
        "description": "Test your mastery of packet structure, tcpdump capture commands, Wireshark display filters, TCP flag analysis, and HTTPS metadata visibility.",
        "category": "networking",
        "difficulty": "beginner",
        "lessonId": "net-008",
        "passPercentage": 100,
        "status": "published",
        "createdAt": earlier,
        "updatedAt": now,
        "questions": [
          {
            "id": "q-net-08-1",
            "prompt": "What is the primary purpose of network traffic analysis?",
            "questionType": "single_choice",
            "sortOrder": 1,
            "explanation": "Network traffic analysis captures and inspects packets to understand communication behavior, troubleshoot issues, and investigate security events.",
            "correctOptionIds": [
              "q-net-08-1-b"
            ],
            "options": [
              {
                "id": "q-net-08-1-a",
                "label": "A",
                "optionText": "To increase monitor brightness",
                "sortOrder": 1
              },
              {
                "id": "q-net-08-1-b",
                "label": "B",
                "optionText": "To capture and understand network communication",
                "sortOrder": 2
              },
              {
                "id": "q-net-08-1-c",
                "label": "C",
                "optionText": "To create IP addresses",
                "sortOrder": 3
              },
              {
                "id": "q-net-08-1-d",
                "label": "D",
                "optionText": "To install network drivers",
                "sortOrder": 4
              }
            ]
          },
          {
            "id": "q-net-08-2",
            "prompt": "Which tool provides a graphical interface for packet analysis?",
            "questionType": "single_choice",
            "sortOrder": 2,
            "explanation": "Wireshark provides an interactive graphical packet analyzer with Packet List, Packet Details, and Packet Bytes panes.",
            "correctOptionIds": [
              "q-net-08-2-a"
            ],
            "options": [
              {
                "id": "q-net-08-2-a",
                "label": "A",
                "optionText": "Wireshark",
                "sortOrder": 1
              },
              {
                "id": "q-net-08-2-b",
                "label": "B",
                "optionText": "mkdir",
                "sortOrder": 2
              },
              {
                "id": "q-net-08-2-c",
                "label": "C",
                "optionText": "chmod",
                "sortOrder": 3
              },
              {
                "id": "q-net-08-2-d",
                "label": "D",
                "optionText": "systemctl",
                "sortOrder": 4
              }
            ]
          },
          {
            "id": "q-net-08-3",
            "prompt": "Which tcpdump command captures ICMP traffic?",
            "questionType": "single_choice",
            "sortOrder": 3,
            "explanation": "sudo tcpdump -ni any icmp filters captured packets to ICMP traffic only.",
            "correctOptionIds": [
              "q-net-08-3-b"
            ],
            "options": [
              {
                "id": "q-net-08-3-a",
                "label": "A",
                "optionText": "sudo tcpdump -ni any dns",
                "sortOrder": 1
              },
              {
                "id": "q-net-08-3-b",
                "label": "B",
                "optionText": "sudo tcpdump -ni any icmp",
                "sortOrder": 2
              },
              {
                "id": "q-net-08-3-c",
                "label": "C",
                "optionText": "sudo tcpdump -ni any arp",
                "sortOrder": 3
              },
              {
                "id": "q-net-08-3-d",
                "label": "D",
                "optionText": "sudo tcpdump -ni any port 443",
                "sortOrder": 4
              }
            ]
          },
          {
            "id": "q-net-08-4",
            "prompt": "Which Wireshark display filter shows DNS packets?",
            "questionType": "single_choice",
            "sortOrder": 4,
            "explanation": "The display filter dns shows packets Wireshark identifies as DNS traffic.",
            "correctOptionIds": [
              "q-net-08-4-c"
            ],
            "options": [
              {
                "id": "q-net-08-4-a",
                "label": "A",
                "optionText": "http",
                "sortOrder": 1
              },
              {
                "id": "q-net-08-4-b",
                "label": "B",
                "optionText": "tcp",
                "sortOrder": 2
              },
              {
                "id": "q-net-08-4-c",
                "label": "C",
                "optionText": "dns",
                "sortOrder": 3
              },
              {
                "id": "q-net-08-4-d",
                "label": "D",
                "optionText": "arp",
                "sortOrder": 4
              }
            ]
          },
          {
            "id": "q-net-08-5",
            "prompt": "What does the TCP SYN flag normally indicate?",
            "questionType": "single_choice",
            "sortOrder": 5,
            "explanation": "The SYN (synchronize) flag initiates a new TCP connection during the three-way handshake.",
            "correctOptionIds": [
              "q-net-08-5-a"
            ],
            "options": [
              {
                "id": "q-net-08-5-a",
                "label": "A",
                "optionText": "A request to start a TCP connection",
                "sortOrder": 1
              },
              {
                "id": "q-net-08-5-b",
                "label": "B",
                "optionText": "A DNS response",
                "sortOrder": 2
              },
              {
                "id": "q-net-08-5-c",
                "label": "C",
                "optionText": "A normal connection termination",
                "sortOrder": 3
              },
              {
                "id": "q-net-08-5-d",
                "label": "D",
                "optionText": "An encrypted DNS query",
                "sortOrder": 4
              }
            ]
          },
          {
            "id": "q-net-08-6",
            "prompt": "Which statement about HTTPS traffic is correct?",
            "questionType": "single_choice",
            "sortOrder": 6,
            "explanation": "HTTPS encrypts HTTP application payloads with TLS, while IP addresses, TCP ports, packet timing, and sizes remain observable.",
            "correctOptionIds": [
              "q-net-08-6-b"
            ],
            "options": [
              {
                "id": "q-net-08-6-a",
                "label": "A",
                "optionText": "All packet information becomes invisible.",
                "sortOrder": 1
              },
              {
                "id": "q-net-08-6-b",
                "label": "B",
                "optionText": "HTTPS encrypts application data, but some network metadata remains visible.",
                "sortOrder": 2
              },
              {
                "id": "q-net-08-6-c",
                "label": "C",
                "optionText": "HTTPS does not use network ports.",
                "sortOrder": 3
              },
              {
                "id": "q-net-08-6-d",
                "label": "D",
                "optionText": "HTTPS is the same as HTTP without encryption.",
                "sortOrder": 4
              }
            ]
          },
          {
            "id": "q-net-08-7",
            "prompt": "Which fields can help identify a network connection? (Select all correct answers)",
            "questionType": "multiple_select",
            "sortOrder": 7,
            "explanation": "Source/destination IP addresses and transport ports identify the communicating endpoints.",
            "correctOptionIds": [
              "q-net-08-7-a",
              "q-net-08-7-b",
              "q-net-08-7-c"
            ],
            "options": [
              {
                "id": "q-net-08-7-a",
                "label": "A",
                "optionText": "Source IP address",
                "sortOrder": 1
              },
              {
                "id": "q-net-08-7-b",
                "label": "B",
                "optionText": "Destination IP address",
                "sortOrder": 2
              },
              {
                "id": "q-net-08-7-c",
                "label": "C",
                "optionText": "Source and destination ports",
                "sortOrder": 3
              },
              {
                "id": "q-net-08-7-d",
                "label": "D",
                "optionText": "Keyboard language",
                "sortOrder": 4
              }
            ]
          },
          {
            "id": "q-net-08-8",
            "prompt": "Which are valid reasons to use network traffic analysis? (Select all correct answers)",
            "questionType": "multiple_select",
            "sortOrder": 8,
            "explanation": "Packet analysis is used to investigate suspicious activity, diagnose DNS/routing failures, and verify TCP handshakes.",
            "correctOptionIds": [
              "q-net-08-8-a",
              "q-net-08-8-b",
              "q-net-08-8-c"
            ],
            "options": [
              {
                "id": "q-net-08-8-a",
                "label": "A",
                "optionText": "Investigating suspicious connections",
                "sortOrder": 1
              },
              {
                "id": "q-net-08-8-b",
                "label": "B",
                "optionText": "Troubleshooting DNS failures",
                "sortOrder": 2
              },
              {
                "id": "q-net-08-8-c",
                "label": "C",
                "optionText": "Inspecting TCP handshakes",
                "sortOrder": 3
              },
              {
                "id": "q-net-08-8-d",
                "label": "D",
                "optionText": "Increasing CPU clock speed",
                "sortOrder": 4
              }
            ]
          },
          {
            "id": "q-net-08-9",
            "prompt": "A packet capture shows a DNS query but no visible DNS response. This proves the DNS server is offline.",
            "questionType": "true_false",
            "sortOrder": 9,
            "explanation": "False — a missing response in a capture is a clue to investigate (e.g., firewall drop, wrong interface, timeout), not proof the server is offline.",
            "correctOptionIds": [
              "q-net-08-9-b"
            ],
            "options": [
              {
                "id": "q-net-08-9-a",
                "label": "A",
                "optionText": "True",
                "sortOrder": 1
              },
              {
                "id": "q-net-08-9-b",
                "label": "B",
                "optionText": "False",
                "sortOrder": 2
              }
            ]
          },
          {
            "id": "q-net-08-10",
            "prompt": "Capturing traffic from networks without authorization can violate privacy and security rules.",
            "questionType": "true_false",
            "sortOrder": 10,
            "explanation": "True — packet captures can expose sensitive traffic; only capture packets on systems and networks you own or are explicitly authorized to inspect.",
            "correctOptionIds": [
              "q-net-08-10-a"
            ],
            "options": [
              {
                "id": "q-net-08-10-a",
                "label": "A",
                "optionText": "True",
                "sortOrder": 1
              },
              {
                "id": "q-net-08-10-b",
                "label": "B",
                "optionText": "False",
                "sortOrder": 2
              }
            ]
          }
        ]
      },
      {
        id: "quiz-web-http-anatomy",
        slug: "web-http-anatomy-check",
        title: "Module 01 Knowledge Check — HTTP Anatomy & Trust Boundaries",
        description: "Verify your grasp of HTTP headers, secure session cookie flags (HttpOnly, Secure, SameSite), and server-side validation.",
        category: "web-security",
        difficulty: "intermediate",
        lessonId: "web-001",
        passPercentage: 100,
        status: "published",
        createdAt: earlier,
        updatedAt: now,
        questions: [
          {
            id: "q-wha-1",
            prompt: "Which cookie attribute prevents client-side JavaScript (document.cookie) from reading a session token?",
            questionType: "single_choice",
            sortOrder: 1,
            explanation: "HttpOnly instructs the browser not to expose the cookie to client-side scripts.",
            correctOptionIds: ["q-wha-1-b"],
            options: [
              { id: "q-wha-1-a", label: "A", optionText: "SameSite=None", sortOrder: 1 },
              { id: "q-wha-1-b", label: "B", optionText: "HttpOnly", sortOrder: 2 },
              { id: "q-wha-1-c", label: "C", optionText: "Max-Age", sortOrder: 3 },
            ],
          },
          {
            id: "q-wha-2",
            prompt: "Which cookie attributes protect against cross-site request forgery (CSRF) and plaintext HTTP leakage? (Select all that apply)",
            questionType: "multiple_select",
            sortOrder: 2,
            explanation: "Secure limits transmission to HTTPS connections and SameSite=Lax or Strict restricts cross-site cookie attachment.",
            correctOptionIds: ["q-wha-2-a", "q-wha-2-c"],
            options: [
              { id: "q-wha-2-a", label: "A", optionText: "Secure", sortOrder: 1 },
              { id: "q-wha-2-b", label: "B", optionText: "Domain=*", sortOrder: 2 },
              { id: "q-wha-2-c", label: "C", optionText: "SameSite=Lax", sortOrder: 3 },
            ],
          },
          {
            id: "q-wha-3",
            prompt: "Why must authorization and input validation always be enforced on the server even when checked in browser forms?",
            questionType: "single_choice",
            sortOrder: 3,
            explanation: "Browsers run on untrusted client machines where hidden fields, localStorage, and headers can all be forged directly.",
            correctOptionIds: ["q-wha-3-b"],
            options: [
              { id: "q-wha-3-a", label: "A", optionText: "Browsers automatically strip HTML attributes over HTTPS", sortOrder: 1 },
              { id: "q-wha-3-b", label: "B", optionText: "Clients can bypass browser checks and send forged HTTP requests directly", sortOrder: 2 },
              { id: "q-wha-3-c", label: "C", optionText: "Cookies cannot be transmitted to server endpoints otherwise", sortOrder: 3 },
            ],
          },
          {
            id: "q-wha-4",
            prompt: "Type the curl command to inspect only the HTTP response headers from http://localhost:3000.",
            questionType: "command_input",
            sortOrder: 4,
            placeholder: "e.g. curl ...",
            explanation: "curl -I sends a HEAD request and prints the HTTP response status line and headers.",
            correctOptionIds: [],
            acceptedAnswers: ["curl -I http://localhost:3000", "curl --head http://localhost:3000"],
            options: [],
          },
        ],
      },
      {
        id: "quiz-web-security-headers",
        slug: "web-security-headers-check",
        title: "Module 02 Knowledge Check — Security Headers, CSP & SOP",
        description: "Test your understanding of Same-Origin Policy tuples, Content-Security-Policy directives, MIME sniffing, and HSTS.",
        category: "web-security",
        difficulty: "intermediate",
        lessonId: "web-002",
        passPercentage: 100,
        status: "published",
        createdAt: earlier,
        updatedAt: now,
        questions: [
          {
            id: "q-wsh-1",
            prompt: "Which three components define a browser origin under the Same-Origin Policy?",
            questionType: "single_choice",
            sortOrder: 1,
            explanation: "Two URLs share an origin only if their scheme (protocol), host, and port all match.",
            correctOptionIds: ["q-wsh-1-a"],
            options: [
              { id: "q-wsh-1-a", label: "A", optionText: "Scheme, host, and port", sortOrder: 1 },
              { id: "q-wsh-1-b", label: "B", optionText: "Host, path, and query string", sortOrder: 2 },
              { id: "q-wsh-1-c", label: "C", optionText: "Cookies, headers, and IP address", sortOrder: 3 },
            ],
          },
          {
            id: "q-wsh-2",
            prompt: "Which Content-Security-Policy directive blocks any site from embedding the page in an <iframe> (clickjacking defense)?",
            questionType: "single_choice",
            sortOrder: 2,
            explanation: "frame-ancestors 'none' instructs compliant browsers never to render the document inside a frame or iframe.",
            correctOptionIds: ["q-wsh-2-c"],
            options: [
              { id: "q-wsh-2-a", label: "A", optionText: "object-src 'self'", sortOrder: 1 },
              { id: "q-wsh-2-b", label: "B", optionText: "default-src 'unsafe-inline'", sortOrder: 2 },
              { id: "q-wsh-2-c", label: "C", optionText: "frame-ancestors 'none'", sortOrder: 3 },
            ],
          },
          {
            id: "q-wsh-3",
            prompt: "Which HTTP headers mitigate MIME-type confusion and enforce HTTPS on subsequent visits? (Select all that apply)",
            questionType: "multiple_select",
            sortOrder: 3,
            explanation: "X-Content-Type-Options: nosniff prevents MIME sniffing and Strict-Transport-Security enforces HTTPS.",
            correctOptionIds: ["q-wsh-3-a", "q-wsh-3-b"],
            options: [
              { id: "q-wsh-3-a", label: "A", optionText: "X-Content-Type-Options: nosniff", sortOrder: 1 },
              { id: "q-wsh-3-b", label: "B", optionText: "Strict-Transport-Security", sortOrder: 2 },
              { id: "q-wsh-3-c", label: "C", optionText: "X-Powered-By", sortOrder: 3 },
            ],
          },
          {
            id: "q-wsh-4",
            prompt: "https://app.example.com:443 and http://app.example.com:80 are considered the same origin by browsers.",
            questionType: "true_false",
            sortOrder: 4,
            explanation: "False — both the scheme (https vs http) and port (443 vs 80) differ, so browsers treat them as cross-origin.",
            correctOptionIds: ["q-wsh-4-b"],
            options: [
              { id: "q-wsh-4-a", label: "A", optionText: "True", sortOrder: 1 },
              { id: "q-wsh-4-b", label: "B", optionText: "False", sortOrder: 2 },
            ],
          },
        ],
      },
    ],
    quizAttempts: [
      {
        id: "att-1",
        quizId: "quiz-linux-fundamentals",
        quizSlug: "linux-fundamentals-check",
        quizTitle: "Linux Fundamentals Knowledge Check",
        userId: "preview-student-01",
        score: 3,
        totalQuestions: 3,
        percentage: 100,
        passed: true,
        submittedAt: oneDayAgo,
      },
    ],
    assignments: [
      {
        id: "assign-01",
        slug: "explore-linux-environment",
        title: "Verify Your Local Linux Shell Environment",
        objective: "Identify your kernel version, current user, shell path, and manual page documentation from your terminal.",
        category: "linux",
        difficulty: "beginner",
        lessonId: "linux-001",
        prerequisites: ["Local Linux terminal, WSL2, or authorized Ubuntu VM"],
        instructions: [
          "Open your local terminal and run whoami, uname -a, and echo $SHELL.",
          "Run man ls to view the manual page for ls, search with /size, and press q to exit.",
          "Record the distribution and kernel release shown on your system."
        ],
        expectedOutcome: "You can verify system identity and navigate man pages confidently without external search.",
        safetyWarning: "Execute these commands only on your own computer or an authorized lab environment.",
        status: "published",
        createdAt: earlier,
        updatedAt: earlier,
      },
      {
        id: "assign-02",
        slug: "explore-linux-filesystem",
        title: "Explore the Linux Filesystem Hierarchy",
        objective: "Inspect core system directories (/etc, /var, /home, /tmp) and practice switching between absolute and relative paths.",
        category: "linux",
        difficulty: "beginner",
        lessonId: "linux-002",
        prerequisites: ["Completed Module 02"],
        instructions: [
          "Run pwd and ls -la / to map top-level directories.",
          "Navigate into /etc using an absolute path and inspect read-only metadata with ls -l.",
          "Return to your home directory using cd ~."
        ],
        expectedOutcome: "Clear understanding of where configuration files, logs, and user home directories reside.",
        safetyWarning: "Do not modify or delete any files inside system directories such as /etc or /var.",
        status: "published",
        createdAt: earlier,
        updatedAt: earlier,
      },
      {
        id: "assign-03",
        slug: "manage-local-workspace-files",
        title: "Build and Organize a Practice Workspace",
        objective: "Create nested directories, copy configuration templates, rename files, and safely clean up temporary artifacts.",
        category: "linux",
        difficulty: "beginner",
        lessonId: "linux-003",
        prerequisites: ["Completed Module 03"],
        instructions: [
          "Create ~/forgesec-workspace/notes and ~/forgesec-workspace/backups using mkdir -p.",
          "Create sample.txt with touch, copy it to backups/sample.bak, and rename the original using mv.",
          "Verify structure with ls -R ~/forgesec-workspace."
        ],
        expectedOutcome: "Full command-line fluency creating, copying, moving, and inspecting local workspace directories.",
        safetyWarning: "Double-check target paths before running rm -r; practice strictly inside ~/forgesec-workspace.",
        status: "published",
        createdAt: earlier,
        updatedAt: earlier,
      },
      {
        id: "assign-04",
        slug: "analyze-sample-auth-logs",
        title: "Analyze Sample Authentication Logs",
        objective: "Filter failed authentication events and summarize repeated patterns using grep, sort, uniq, and wc.",
        category: "linux",
        difficulty: "beginner",
        lessonId: "linux-004",
        prerequisites: ["Completed Module 04"],
        instructions: [
          "Create a local sample-auth.log file with both Accepted and Failed login lines.",
          "Isolate failed lines using grep -n \"Failed\" sample-auth.log.",
          "Count unique matching entries via sort | uniq -c | wc -l."
        ],
        expectedOutcome: "Ability to slice and count log indicators cleanly from the shell.",
        safetyWarning: "Practice exclusively on synthetic or self-owned local log files.",
        status: "published",
        createdAt: earlier,
        updatedAt: earlier,
      },
      {
        id: "assign-05",
        slug: "audit-local-file-permissions",
        title: "Audit and Harden Local File Permissions",
        objective: "Apply least-privilege chmod octal permissions (600, 700, 640) inside a local scratch folder.",
        category: "linux",
        difficulty: "beginner",
        lessonId: "linux-005",
        prerequisites: ["Completed Module 05"],
        instructions: [
          "Create secret-key.txt and helper.sh inside ~/forgesec-workspace.",
          "Run chmod 600 secret-key.txt and chmod 700 helper.sh.",
          "Verify exact mode bits with ls -l."
        ],
        expectedOutcome: "ls -l confirms -rw------- and -rwx------ with zero group/world access.",
        safetyWarning: "Never run recursive chmod across system directories.",
        status: "published",
        createdAt: earlier,
        updatedAt: earlier,
      },
      {
        id: "assign-06",
        slug: "inspect-installed-packages",
        title: "Inspect Package Repositories and Installed Tools",
        objective: "Query installed packages, inspect metadata with apt show, and audit recent package history.",
        category: "linux",
        difficulty: "beginner",
        lessonId: "linux-006",
        prerequisites: ["Debian/Ubuntu environment with APT"],
        instructions: [
          "Run apt list --installed | head -n 20 to review installed packages.",
          "Inspect details for openssh-client using apt show openssh-client.",
          "Review configured sources read-only in /etc/apt/sources.list."
        ],
        expectedOutcome: "Clear visibility into package origins and versions.",
        safetyWarning: "Only inspect repositories or install signed packages from official distribution mirrors.",
        status: "published",
        createdAt: earlier,
        updatedAt: earlier,
      },
      {
        id: "assign-07",
        slug: "inspect-running-processes",
        title: "Inspect Active Processes and Resource Usage",
        objective: "List running processes, filter by user or command name, and observe parent/child PID relationships.",
        category: "linux",
        difficulty: "beginner",
        lessonId: "linux-007",
        prerequisites: ["Completed Module 07"],
        instructions: [
          "Run ps aux | head -n 20 and identify PID, USER, %CPU, and COMMAND columns.",
          "Start sleep 120 & in the background, inspect it with jobs and ps, then terminate it gracefully with kill.",
          "Confirm the background process is gone."
        ],
        expectedOutcome: "Practical familiarity inspecting processes and terminating test jobs safely.",
        safetyWarning: "Only send signals to test processes owned by your user account.",
        status: "published",
        createdAt: earlier,
        updatedAt: earlier,
      },
      {
        id: "assign-08",
        slug: "audit-local-systemd-services",
        title: "Audit Local Systemd Services",
        objective: "Enumerate active systemd service units and verify which background daemons start on boot.",
        category: "linux",
        difficulty: "beginner",
        lessonId: "linux-008",
        prerequisites: ["Systemd-based Linux distribution"],
        instructions: [
          "Run systemctl list-units --type=service --state=running.",
          "Check status for a core local service such as systemd-journald.",
          "Review recent unit logs using journalctl -n 20 --no-pager."
        ],
        expectedOutcome: "Ability to verify running services and read unit logs cleanly.",
        safetyWarning: "Do not stop critical system services on a shared or production machine.",
        status: "published",
        createdAt: earlier,
        updatedAt: earlier,
      },
      {
        id: "assign-09",
        slug: "inspect-local-network-interfaces",
        title: "Inspect Local Interfaces and Listening Sockets",
        objective: "Inspect host IPv4/IPv6 addresses, routing table, and active listening TCP/UDP sockets.",
        category: "networking",
        difficulty: "beginner",
        lessonId: "linux-009",
        prerequisites: ["Completed Module 09 or Networking Module 01"],
        instructions: [
          "Run ip addr show and ip route show.",
          "Run ss -tulnp to list active listening sockets.",
          "Identify services bound to 127.0.0.1 vs 0.0.0.0."
        ],
        expectedOutcome: "Accurate inventory of your machine's network exposure.",
        safetyWarning: "Restrict socket and network inspection strictly to hosts you own or have permission to audit.",
        status: "published",
        createdAt: earlier,
        updatedAt: earlier,
      },
      {
        id: "assign-10",
        slug: "configure-and-inspect-ssh-client",
        title: "Generate Ed25519 Keys and Inspect SSH Client Config",
        objective: "Create a dedicated local SSH key pair with strict 700/600 permissions and configure a clean host alias.",
        category: "networking",
        difficulty: "beginner",
        lessonId: "linux-010",
        prerequisites: ["OpenSSH client installed"],
        instructions: [
          "Generate a test Ed25519 key pair in a practice folder using ssh-keygen -t ed25519.",
          "Ensure directory permissions are 700 and private key permissions are 600.",
          "Review ~/.ssh/config structure for specifying Host, HostName, User, and IdentityFile."
        ],
        expectedOutcome: "Properly permissioned SSH key pair and structured client configuration.",
        safetyWarning: "Never expose SSH publicly without key-based authentication and explicit firewall controls.",
        status: "published",
        createdAt: earlier,
        updatedAt: earlier,
      },
      {
        "id": "assign-net-01",
        "slug": "explore-local-network-basics",
        "title": "Explore Your Local Network Interfaces and Gateway",
        "objective": "Use ip link, ip addr, and ip route to identify your active network interfaces, MAC address, IPv4 address, and default gateway.",
        "category": "networking",
        "difficulty": "beginner",
        "lessonId": "net-001",
        "prerequisites": [
          "Linux terminal, WSL2, or authorized Ubuntu VM"
        ],
        "instructions": [
          "Run ip link to list your network interfaces and identify which interface is UP.",
          "Run ip addr to record your active IPv4 address and MAC (link/ether) address.",
          "Run ip route to identify your default gateway and outgoing interface."
        ],
        "expectedOutcome": "You can identify your active interface, local IPv4 address, MAC address, and default gateway from the Linux terminal.",
        "safetyWarning": "Only inspect network interfaces on machines and networks you own or are authorized to use.",
        "status": "published",
        "createdAt": earlier,
        "updatedAt": earlier
      },
      {
        "id": "assign-net-02",
        "slug": "explore-network-layers-linux",
        "title": "Explore Network Layers Using Linux Commands",
        "objective": "Map real Linux diagnostic outputs (ip link, ip addr, ip route, ping) to the Physical, Data Link, Network, and Transport/Application layers.",
        "category": "networking",
        "difficulty": "beginner",
        "lessonId": "net-002",
        "prerequisites": [
          "Completed Networking Module 02"
        ],
        "instructions": [
          "Run ip link to inspect Layer 1/2 interface state and MAC addresses.",
          "Run ip addr and ip route to inspect Layer 3 IP addressing and routing tables.",
          "Run ping -c 4 127.0.0.1 and ping -c 4 to your default gateway, then map each observation to its OSI and TCP/IP layer."
        ],
        "expectedOutcome": "Completed layer mapping connecting Linux CLI outputs to the OSI and TCP/IP models.",
        "safetyWarning": "Perform these commands only on your own computer or an authorized lab VM.",
        "status": "published",
        "createdAt": earlier,
        "updatedAt": earlier
      },
      {
        "id": "assign-net-03",
        "slug": "understand-your-ip-network",
        "title": "Understand Your IP Network and Subnet Calculations",
        "objective": "Inspect your host IPv4/IPv6 configuration, classify private vs. public addresses, and calculate subnet ranges for /24 and /26 prefixes.",
        "category": "networking",
        "difficulty": "beginner",
        "lessonId": "net-003",
        "prerequisites": [
          "Completed Networking Module 03"
        ],
        "instructions": [
          "Run ip addr and ip route to record your primary IPv4 address, CIDR prefix length, and default gateway.",
          "Determine whether your local IPv4 address belongs to an RFC 1918 private range.",
          "Calculate the network address, broadcast address, and usable host count for 192.168.10.0/24 and 192.168.1.0/26."
        ],
        "expectedOutcome": "Accurate IP configuration report and verified subnetting calculations.",
        "safetyWarning": "Only inspect network settings on devices you own or are permitted to administer.",
        "status": "published",
        "createdAt": earlier,
        "updatedAt": earlier
      },
      {
        "id": "assign-net-04",
        "slug": "investigate-local-network-arp",
        "title": "Investigate Your Local Network, MAC Table and ARP Cache",
        "objective": "Inspect local interface MAC addresses, generate traffic to your default gateway, and examine the Linux neighbor (ARP) cache.",
        "category": "networking",
        "difficulty": "beginner",
        "lessonId": "net-004",
        "prerequisites": [
          "Completed Networking Module 04"
        ],
        "instructions": [
          "Run ip link to record your active interface's 48-bit MAC address.",
          "Run ip route to identify your default gateway IP, then ping the gateway with ping -c 2 <gateway-ip>.",
          "Run ip neigh to inspect the ARP/neighbor cache and record the MAC address and reachability state of your gateway."
        ],
        "expectedOutcome": "Clear explanation of how IP, ARP, and MAC addresses work together for local and off-subnet delivery.",
        "safetyWarning": "Do not perform unauthorized network scanning; restrict testing to your own interface and default gateway.",
        "status": "published",
        "createdAt": earlier,
        "updatedAt": earlier
      },
      {
        "id": "assign-net-05",
        "slug": "tcp-udp-and-port-investigation",
        "title": "TCP, UDP and Listening Port Investigation",
        "objective": "Audit listening TCP/UDP sockets with ss, query the local service database, and trace an HTTPS connection.",
        "category": "networking",
        "difficulty": "beginner",
        "lessonId": "net-005",
        "prerequisites": [
          "Completed Networking Module 05"
        ],
        "instructions": [
          "Run ss -tuln and sudo ss -tulpn to list listening TCP and UDP ports on your system.",
          "Run getent services ssh, getent services http, and getent services https to verify standard port mappings.",
          "Run curl -I https://example.com and explain the five-tuple and TCP three-way handshake used for the connection."
        ],
        "expectedOutcome": "Completed socket inventory and transport-layer analysis report.",
        "safetyWarning": "Only inspect sockets on your own system; never scan external hosts without permission.",
        "status": "published",
        "createdAt": earlier,
        "updatedAt": earlier
      },
      {
        "id": "assign-net-06",
        "slug": "investigate-dns-dhcp-and-nat",
        "title": "Investigate DNS Resolution, DHCP Configuration and NAT",
        "objective": "Inspect configured DNS resolvers, query A/AAAA/MX/TXT records with dig, and compare private LAN addressing against NAT.",
        "category": "networking",
        "difficulty": "beginner",
        "lessonId": "net-006",
        "prerequisites": [
          "Completed Networking Module 06"
        ],
        "instructions": [
          "Inspect your DNS configuration with resolvectl status or cat /etc/resolv.conf.",
          "Run dig example.com A, AAAA, MX, and TXT and record the returned answers and TTL values.",
          "Run ip addr and ip route to identify your private IPv4 address and default gateway, and explain how NAT translates outbound traffic."
        ],
        "expectedOutcome": "Documented DNS record lookups and a clear explanation of DNS, DHCP (DORA), and NAT on your network.",
        "safetyWarning": "Do not publicly post sensitive internal or public IP configuration details.",
        "status": "published",
        "createdAt": earlier,
        "updatedAt": earlier
      },
      {
        "id": "assign-net-07",
        "slug": "linux-network-diagnostic-report",
        "title": "Linux Network Diagnostic Report",
        "objective": "Execute a complete 8-step Linux network troubleshooting workflow from link state and routing to DNS, sockets, and ICMP capture.",
        "category": "networking",
        "difficulty": "beginner",
        "lessonId": "net-007",
        "prerequisites": [
          "Completed Networking Module 07"
        ],
        "instructions": [
          "Verify interface and routing state using ip link, ip addr, and ip route.",
          "Test loopback, gateway, and external reachability with ping -c 4, then verify DNS resolution with getent hosts example.com and dig example.com.",
          "Inspect listening sockets with ss -tuln, test HTTP headers with curl -I https://example.com, and write a structured diagnostic report."
        ],
        "expectedOutcome": "Complete evidence-based Linux network diagnostic report covering interfaces, routes, DNS, and sockets.",
        "safetyWarning": "Run diagnostic commands only on systems and networks you own or have explicit permission to test.",
        "status": "published",
        "createdAt": earlier,
        "updatedAt": earlier
      },
      {
        "id": "assign-net-08",
        "slug": "network-traffic-analysis-lab",
        "title": "Network Traffic Analysis Lab with tcpdump and Wireshark",
        "objective": "Capture live ICMP, DNS, and HTTPS packets into a .pcap file using tcpdump and inspect protocol headers and TCP handshakes in Wireshark.",
        "category": "networking",
        "difficulty": "beginner",
        "lessonId": "net-008",
        "prerequisites": [
          "Completed Networking Module 08",
          "tcpdump and Wireshark installed"
        ],
        "instructions": [
          "List capture interfaces with sudo tcpdump -D and capture 100 packets with sudo tcpdump -ni any -c 100 -w lesson8.pcap while running ping, dig, and curl.",
          "Inspect the saved capture in the terminal with tcpdump -nn -r lesson8.pcap.",
          "Open lesson8.pcap in Wireshark, apply icmp, dns, tcp, and tcp.port == 443 display filters, and document the TCP three-way handshake and HTTPS encryption observations."
        ],
        "expectedOutcome": "Final packet-analysis diagnostic report identifying ICMP, DNS, TCP handshake stages, and TLS-encrypted HTTPS traffic.",
        "safetyWarning": "Capture packets exclusively on your own machine or an isolated lab network you are authorized to inspect.",
        "status": "published",
        "createdAt": earlier,
        "updatedAt": earlier
      },
    ],
    assignmentProgress: [
      {
        userId: "preview-student-01",
        assignmentId: "assign-01",
        status: "completed",
        notes: "Verified Ubuntu 24.04 kernel 6.8 and reviewed man ls flags.",
        completedAt: oneDayAgo,
        updatedAt: oneDayAgo,
      },
      {
        userId: "preview-student-01",
        assignmentId: "assign-02",
        status: "in_progress",
        notes: "Mapped /etc and /var/log; reviewing relative paths.",
        completedAt: null,
        updatedAt: now,
      },
    ],
    auditLogs: [
      {
        id: "log-1",
        actorId: "preview-admin-01",
        actorEmail: "admin@forgesec.academy",
        action: "role.updated",
        targetType: "user",
        targetId: "preview-instructor-01",
        details: { newRole: "instructor", canManageQuizzes: true, canManageAssignments: true },
        createdAt: earlier,
      },
      {
        id: "log-2",
        actorId: "preview-admin-01",
        actorEmail: "admin@forgesec.academy",
        action: "quiz.published",
        targetType: "quiz",
        targetId: "quiz-linux-fundamentals",
        details: { slug: "linux-fundamentals-check" },
        createdAt: oneDayAgo,
      },
    ],
  };
}

export function getCurriculumSeed(): PreviewDatabase {
  return createInitialSeed();
}

export function readPreviewDb(): PreviewDatabase {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      const seed = memoryFallbackDb ?? createInitialSeed();
      fs.writeFileSync(DB_FILE, JSON.stringify(seed, null, 2), "utf8");
      memoryFallbackDb = seed;
      return seed;
    }
    const raw = fs.readFileSync(DB_FILE, "utf8");
    const parsed = JSON.parse(raw) as PreviewDatabase;
    const seed = createInitialSeed();
    let dirty = false;
    const seedSlugs = new Set(seed.quizzes.map((q) => q.slug));
    // Remove deprecated shared quiz slug when replaced by dedicated per-module quizzes
    const filteredQuizzes = parsed.quizzes.filter((q) => {
      if (q.slug === "web-security-check" && !seedSlugs.has("web-security-check")) {
        dirty = true;
        return false;
      }
      return true;
    });
    parsed.quizzes = filteredQuizzes;

    for (const seedQuiz of seed.quizzes) {
      const existingIdx = parsed.quizzes.findIndex((q) => q.slug === seedQuiz.slug);
      if (existingIdx === -1) {
        parsed.quizzes.push(seedQuiz);
        dirty = true;
      } else if (
        parsed.quizzes[existingIdx].questions.length !== seedQuiz.questions.length ||
        parsed.quizzes[existingIdx].passPercentage !== seedQuiz.passPercentage ||
        parsed.quizzes[existingIdx].lessonId !== seedQuiz.lessonId ||
        parsed.quizzes[existingIdx].title !== seedQuiz.title
      ) {
        parsed.quizzes[existingIdx] = seedQuiz;
        dirty = true;
      }
    }

    for (const seedAssign of seed.assignments) {
      const existingIdx = parsed.assignments.findIndex((a) => a.slug === seedAssign.slug);
      if (existingIdx === -1) {
        parsed.assignments.push(seedAssign);
        dirty = true;
      } else if (parsed.assignments[existingIdx].lessonId !== seedAssign.lessonId) {
        parsed.assignments[existingIdx] = seedAssign;
        dirty = true;
      }
    }

    if (dirty) {
      fs.writeFileSync(DB_FILE, JSON.stringify(parsed, null, 2), "utf8");
    }
    memoryFallbackDb = parsed;
    return parsed;
  } catch {
    if (!memoryFallbackDb) {
      memoryFallbackDb = createInitialSeed();
    }
    return memoryFallbackDb;
  }
}

export function writePreviewDb(db: PreviewDatabase): void {
  memoryFallbackDb = db;
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf8");
  } catch {
    // Read-only filesystem fallback stays in memoryFallbackDb
  }
}
