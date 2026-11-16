-- supabase/seed.sql
-- Seed sample quizzes and practical assignments aligned with FORGESEC ACADEMY Version 1.0 MVP

INSERT INTO public.quizzes (id, slug, title, description, category, difficulty, lesson_id, pass_percentage, status)
VALUES
  ('11111111-1111-4111-8111-111111111101', 'linux-fundamentals-check', 'Linux Fundamentals Knowledge Check', 'Verify your understanding of the Linux kernel, shell basics, and foundational navigation commands.', 'linux', 'beginner', 'linux-001', 70, 'published'),
  ('11111111-1111-4111-8111-111111111102', 'linux-permissions-check', 'Users, Groups & File Permissions Quiz', 'Test your mastery of ownership, chmod octal notation, and least-privilege file modes.', 'linux', 'beginner', 'linux-005', 70, 'published'),
  ('11111111-1111-4111-8111-111111111103', 'networking-basics-check', 'Linux Networking & SSH Assessment', 'Check your grasp of IP routing, listening sockets, DNS queries, and SSH remote access.', 'networking', 'beginner', 'linux-009', 70, 'published')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.assignments (id, slug, title, objective, category, difficulty, lesson_id, prerequisites, instructions, expected_outcome, safety_warning, status)
VALUES
  (
    '22222222-2222-4222-8222-222222222201',
    'explore-linux-filesystem',
    'Explore the Linux Filesystem Hierarchy',
    'Inspect core Linux directories, distinguish relative vs. absolute paths, and locate system configuration directories safely on your local machine.',
    'linux',
    'beginner',
    'linux-002',
    ARRAY['Linux terminal, WSL2, or authorized Ubuntu VM'],
    ARRAY[
      'Open a local terminal and verify your starting location with pwd.',
      'List root-level directories using ls -la / and note /etc, /var, /home, and /tmp.',
      'Navigate to /etc using an absolute path, inspect readable files without modifying anything, then return home with cd ~.'
    ],
    'You can clearly explain the purpose of /etc, /var/log, /home, and /tmp and switch smoothly between absolute and relative paths.',
    'Run these commands only on your own machine or an authorized lab environment. Never modify files inside /etc while exploring.',
    'published'
  ),
  (
    '22222222-2222-4222-8222-222222222202',
    'analyze-sample-auth-logs',
    'Analyze Sample Authentication Logs',
    'Use grep, sort, uniq, and wc to filter failed authentication events from a local sample log file.',
    'linux',
    'beginner',
    'linux-004',
    ARRAY['Completed Module 04', 'Local temporary workspace directory'],
    ARRAY[
      'Create a scratch directory ~/forgesec-lab and write a sample text log containing accepted and failed login lines.',
      'Run grep -n "Failed" sample-auth.log to isolate failed entries with line numbers.',
      'Pipe the results through sort | uniq -c | wc -l to count distinct events.'
    ],
    'You can isolate targeted patterns in multi-line logs without manually reading every line.',
    'Practice exclusively on synthetic or self-owned local log files.',
    'published'
  ),
  (
    '22222222-2222-4222-8222-222222222203',
    'audit-local-file-permissions',
    'Audit and Harden Local Workspace Permissions',
    'Practice applying least-privilege chmod octal modes and verifying ownership changes inside a local test folder.',
    'linux',
    'beginner',
    'linux-005',
    ARRAY['Completed Module 05'],
    ARRAY[
      'Create a test file secret-notes.txt and dummy script check.sh inside ~/forgesec-lab.',
      'Inspect initial permissions with ls -l.',
      'Restrict secret-notes.txt to owner read/write only (chmod 600) and make check.sh executable only for the owner (chmod 700).'
    ],
    'ls -l confirms -rw------- for secret-notes.txt and -rwx------ for check.sh.',
    'Apply chmod only to files inside your own practice workspace; never run recursive chmod across system directories.',
    'published'
  ),
  (
    '22222222-2222-4222-8222-222222222204',
    'inspect-local-network-interfaces',
    'Inspect Local Interfaces and Listening Sockets',
    'Enumerate local IPv4/IPv6 interfaces, inspect your default route, and audit open TCP/UDP ports on your own machine.',
    'networking',
    'beginner',
    'linux-009',
    ARRAY['Completed Module 09', 'iproute2 tools installed'],
    ARRAY[
      'Run ip addr show to identify your active interface and subnet prefix.',
      'Run ip route show to inspect your default gateway.',
      'Run ss -tulnp to list active listening sockets and identify which services bind to 127.0.0.1 vs 0.0.0.0.'
    ],
    'You can identify your host IP, gateway, and every locally listening TCP/UDP socket.',
    'Restrict socket and route inspection strictly to devices you own or are explicitly authorized to audit.',
    'published'
  )
ON CONFLICT (slug) DO NOTHING;
