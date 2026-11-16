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
        title: "Linux Fundamentals Knowledge Check",
        description: "Verify your grasp of the Linux kernel, shell concepts, and foundational terminal commands.",
        category: "linux",
        difficulty: "beginner",
        lessonId: "linux-001",
        passPercentage: 70,
        status: "published",
        createdAt: earlier,
        updatedAt: earlier,
        questions: [
          {
            id: "q-lf-1",
            prompt: "Which command displays the full path of your current working directory?",
            questionType: "single_choice",
            sortOrder: 1,
            explanation: "pwd stands for 'print working directory' and outputs the absolute path of your shell location.",
            correctOptionIds: ["q-lf-1-b"],
            options: [
              { id: "q-lf-1-a", label: "A", optionText: "ls", sortOrder: 1 },
              { id: "q-lf-1-b", label: "B", optionText: "pwd", sortOrder: 2 },
              { id: "q-lf-1-c", label: "C", optionText: "whoami", sortOrder: 3 },
              { id: "q-lf-1-d", label: "D", optionText: "uname", sortOrder: 4 },
            ],
          },
          {
            id: "q-lf-2",
            prompt: "The Linux kernel directly manages CPU scheduling, memory, and hardware interactions.",
            questionType: "true_false",
            sortOrder: 2,
            explanation: "The kernel is the core operating system layer bridging user-space software and system hardware.",
            correctOptionIds: ["q-lf-2-a"],
            options: [
              { id: "q-lf-2-a", label: "A", optionText: "True", sortOrder: 1 },
              { id: "q-lf-2-b", label: "B", optionText: "False", sortOrder: 2 },
            ],
          },
          {
            id: "q-lf-3",
            prompt: "Which commands provide built-in documentation or brief command descriptions in Linux? (Select all that apply)",
            questionType: "multiple_select",
            sortOrder: 3,
            explanation: "Both man <command> and <command> --help display command usage and option documentation.",
            correctOptionIds: ["q-lf-3-a", "q-lf-3-c"],
            options: [
              { id: "q-lf-3-a", label: "A", optionText: "man ls", sortOrder: 1 },
              { id: "q-lf-3-b", label: "B", optionText: "clear", sortOrder: 2 },
              { id: "q-lf-3-c", label: "C", optionText: "ls --help", sortOrder: 3 },
              { id: "q-lf-3-d", label: "D", optionText: "touch", sortOrder: 4 },
            ],
          },
        ],
      },
      {
        id: "quiz-linux-filesystem",
        slug: "linux-filesystem-check",
        title: "Filesystem Navigation & File Management Quiz",
        description: "Test your understanding of root directories, absolute vs. relative paths, and CLI file operations.",
        category: "linux",
        difficulty: "beginner",
        lessonId: "linux-002",
        passPercentage: 70,
        status: "published",
        createdAt: earlier,
        updatedAt: earlier,
        questions: [
          {
            id: "q-fs-1",
            prompt: "Which top-level directory typically stores system-wide configuration files?",
            questionType: "single_choice",
            sortOrder: 1,
            explanation: "/etc stores host-specific system and service configuration files.",
            correctOptionIds: ["q-fs-1-b"],
            options: [
              { id: "q-fs-1-a", label: "A", optionText: "/bin", sortOrder: 1 },
              { id: "q-fs-1-b", label: "B", optionText: "/etc", sortOrder: 2 },
              { id: "q-fs-1-c", label: "C", optionText: "/tmp", sortOrder: 3 },
              { id: "q-fs-1-d", label: "D", optionText: "/home", sortOrder: 4 },
            ],
          },
          {
            id: "q-fs-2",
            prompt: "Which command copies a directory and all of its nested contents?",
            questionType: "single_choice",
            sortOrder: 2,
            explanation: "cp -r performs a recursive copy across subdirectories.",
            correctOptionIds: ["q-fs-2-c"],
            options: [
              { id: "q-fs-2-a", label: "A", optionText: "mv -f", sortOrder: 1 },
              { id: "q-fs-2-b", label: "B", optionText: "mkdir -p", sortOrder: 2 },
              { id: "q-fs-2-c", label: "C", optionText: "cp -r", sortOrder: 3 },
              { id: "q-fs-2-d", label: "D", optionText: "touch", sortOrder: 4 },
            ],
          },
        ],
      },
      {
        id: "quiz-linux-text",
        slug: "linux-text-processing-check",
        title: "Log Inspection & Text Processing Quiz",
        description: "Assess your command of grep, head, tail, sort, uniq, and pipeline redirection.",
        category: "linux",
        difficulty: "beginner",
        lessonId: "linux-004",
        passPercentage: 70,
        status: "published",
        createdAt: earlier,
        updatedAt: earlier,
        questions: [
          {
            id: "q-tx-1",
            prompt: "Which command searches files for lines matching a text pattern?",
            questionType: "single_choice",
            sortOrder: 1,
            explanation: "grep filters lines matching a given pattern and supports recursive and line-number flags.",
            correctOptionIds: ["q-tx-1-a"],
            options: [
              { id: "q-tx-1-a", label: "A", optionText: "grep", sortOrder: 1 },
              { id: "q-tx-1-b", label: "B", optionText: "wc", sortOrder: 2 },
              { id: "q-tx-1-c", label: "C", optionText: "chmod", sortOrder: 3 },
              { id: "q-tx-1-d", label: "D", optionText: "id", sortOrder: 4 },
            ],
          },
          {
            id: "q-tx-2",
            prompt: "uniq removes duplicate lines even if matching lines are not adjacent in an unsorted file.",
            questionType: "true_false",
            sortOrder: 2,
            explanation: "uniq only collapses adjacent duplicates, which is why sort | uniq is standard practice.",
            correctOptionIds: ["q-tx-2-b"],
            options: [
              { id: "q-tx-2-a", label: "A", optionText: "True", sortOrder: 1 },
              { id: "q-tx-2-b", label: "B", optionText: "False", sortOrder: 2 },
            ],
          },
        ],
      },
      {
        id: "quiz-linux-permissions",
        slug: "linux-permissions-check",
        title: "Users, Groups & File Permissions Quiz",
        description: "Test your fluency with octal permission modes, least privilege, and ownership.",
        category: "linux",
        difficulty: "beginner",
        lessonId: "linux-005",
        passPercentage: 70,
        status: "published",
        createdAt: earlier,
        updatedAt: earlier,
        questions: [
          {
            id: "q-pm-1",
            prompt: "What permissions does chmod 640 grant?",
            questionType: "single_choice",
            sortOrder: 1,
            explanation: "6 = rw- (owner), 4 = r-- (group), 0 = --- (others).",
            correctOptionIds: ["q-pm-1-a"],
            options: [
              { id: "q-pm-1-a", label: "A", optionText: "Owner read/write, group read, others none", sortOrder: 1 },
              { id: "q-pm-1-b", label: "B", optionText: "Owner read/execute, group write, others read", sortOrder: 2 },
              { id: "q-pm-1-c", label: "C", optionText: "Full permissions for everyone", sortOrder: 3 },
            ],
          },
          {
            id: "q-pm-2",
            prompt: "Which command changes the user or group owner of a file?",
            questionType: "single_choice",
            sortOrder: 2,
            explanation: "chown updates file user and group ownership.",
            correctOptionIds: ["q-pm-2-b"],
            options: [
              { id: "q-pm-2-a", label: "A", optionText: "chmod", sortOrder: 1 },
              { id: "q-pm-2-b", label: "B", optionText: "chown", sortOrder: 2 },
              { id: "q-pm-2-c", label: "C", optionText: "passwd", sortOrder: 3 },
            ],
          },
        ],
      },
      {
        id: "quiz-linux-sysadmin",
        slug: "linux-sysadmin-check",
        title: "Packages, Processes & Services Quiz",
        description: "Evaluate your command of APT package management, PID monitoring, and systemd services.",
        category: "linux",
        difficulty: "beginner",
        lessonId: "linux-007",
        passPercentage: 70,
        status: "published",
        createdAt: earlier,
        updatedAt: earlier,
        questions: [
          {
            id: "q-sa-1",
            prompt: "Which command refreshes the local APT package index before upgrades?",
            questionType: "single_choice",
            sortOrder: 1,
            explanation: "apt update downloads updated package metadata from configured repositories.",
            correctOptionIds: ["q-sa-1-a"],
            options: [
              { id: "q-sa-1-a", label: "A", optionText: "sudo apt update", sortOrder: 1 },
              { id: "q-sa-1-b", label: "B", optionText: "sudo apt remove", sortOrder: 2 },
              { id: "q-sa-1-c", label: "C", optionText: "systemctl restart", sortOrder: 3 },
            ],
          },
          {
            id: "q-sa-2",
            prompt: "Which command checks whether a systemd service such as ssh is currently active?",
            questionType: "single_choice",
            sortOrder: 2,
            explanation: "systemctl status <service> displays runtime state, PID, and recent journal lines.",
            correctOptionIds: ["q-sa-2-b"],
            options: [
              { id: "q-sa-2-a", label: "A", optionText: "ps -ef", sortOrder: 1 },
              { id: "q-sa-2-b", label: "B", optionText: "systemctl status ssh", sortOrder: 2 },
              { id: "q-sa-2-c", label: "C", optionText: "kill -9", sortOrder: 3 },
            ],
          },
        ],
      },
      {
        id: "quiz-networking",
        slug: "networking-basics-check",
        title: "Linux Networking & SSH Assessment",
        description: "Verify your knowledge of IP routes, listening sockets, DNS queries, and SSH security.",
        category: "networking",
        difficulty: "beginner",
        lessonId: "linux-009",
        passPercentage: 70,
        status: "published",
        createdAt: earlier,
        updatedAt: earlier,
        questions: [
          {
            id: "q-nt-1",
            prompt: "Which command lists listening TCP and UDP sockets along with numeric ports?",
            questionType: "single_choice",
            sortOrder: 1,
            explanation: "ss -tulnp displays TCP (-t), UDP (-u), listening (-l), numeric (-n), and process (-p) details.",
            correctOptionIds: ["q-nt-1-b"],
            options: [
              { id: "q-nt-1-a", label: "A", optionText: "ip link", sortOrder: 1 },
              { id: "q-nt-1-b", label: "B", optionText: "ss -tulnp", sortOrder: 2 },
              { id: "q-nt-1-c", label: "C", optionText: "dig +short", sortOrder: 3 },
            ],
          },
          {
            id: "q-nt-2",
            prompt: "SSH defaults to TCP port 22 and encrypts remote shell traffic.",
            questionType: "true_false",
            sortOrder: 2,
            explanation: "SSH operates over TCP port 22 by default with encrypted authentication and transport.",
            correctOptionIds: ["q-nt-2-a"],
            options: [
              { id: "q-nt-2-a", label: "A", optionText: "True", sortOrder: 1 },
              { id: "q-nt-2-b", label: "B", optionText: "False", sortOrder: 2 },
            ],
          },
        ],
      },
      {
        id: "quiz-web-security",
        slug: "web-security-check",
        title: "HTTP Trust Boundaries & Security Headers Quiz",
        description: "Test your understanding of cookies, Same-Origin Policy, CSP, and server-side validation.",
        category: "web-security",
        difficulty: "intermediate",
        lessonId: "web-001",
        passPercentage: 70,
        status: "published",
        createdAt: earlier,
        updatedAt: earlier,
        questions: [
          {
            id: "q-ws-1",
            prompt: "Which cookie flag prevents client-side JavaScript from reading a session cookie?",
            questionType: "single_choice",
            sortOrder: 1,
            explanation: "HttpOnly blocks access via document.cookie in browser scripts.",
            correctOptionIds: ["q-ws-1-b"],
            options: [
              { id: "q-ws-1-a", label: "A", optionText: "SameSite=None", sortOrder: 1 },
              { id: "q-ws-1-b", label: "B", optionText: "HttpOnly", sortOrder: 2 },
              { id: "q-ws-1-c", label: "C", optionText: "Max-Age", sortOrder: 3 },
            ],
          },
          {
            id: "q-ws-2",
            prompt: "Which HTTP headers help defend against clickjacking and MIME sniffing? (Select all that apply)",
            questionType: "multiple_select",
            sortOrder: 2,
            explanation: "CSP frame-ancestors restricts framing and X-Content-Type-Options: nosniff disables MIME sniffing.",
            correctOptionIds: ["q-ws-2-a", "q-ws-2-c"],
            options: [
              { id: "q-ws-2-a", label: "A", optionText: "Content-Security-Policy: frame-ancestors 'none'", sortOrder: 1 },
              { id: "q-ws-2-b", label: "B", optionText: "X-Powered-By: Express", sortOrder: 2 },
              { id: "q-ws-2-c", label: "C", optionText: "X-Content-Type-Options: nosniff", sortOrder: 3 },
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
