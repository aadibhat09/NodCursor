/**
 * Utility to auto-generate issues from git commits
 * Enables automatic workflow and communication tracking
 */

export interface CommitIssue {
  id: string;
  issueNumber: number;
  title: string;
  description: string;
  hash: string;
  author: string;
  date: string;
  status: 'in-progress' | 'completed';
  category: 'feature' | 'bugfix' | 'refactor' | 'docs' | 'chore';
}

/**
 * Parse commit message to extract issue info
 * Supports conventional commits format: type(scope): message
 */
export function parseCommitMessage(message: string, hash: string, author: string, date: string, issueNumber: number): CommitIssue {
  const lines = message.split('\n');
  const firstLine = lines[0];

  // Parse conventional commit format
  const typeMatch = firstLine.match(/^(feat|fix|refactor|docs|chore|style|test|perf)(\(.+\))?\s*:\s*(.+)$/i);

  let category: CommitIssue['category'] = 'chore';
  let scope = '';
  let title = firstLine;

  if (typeMatch) {
    category = typeMatch[1].toLowerCase() as CommitIssue['category'];
    scope = typeMatch[2] ? typeMatch[2].slice(1, -1) : ''; // Remove parentheses
    title = typeMatch[3];
  }

  // Build full description from body
  const body = lines.slice(1).join('\n').trim();
  const description = body || `Auto-generated from commit ${hash.slice(0, 7)}`;

  return {
    id: `commit-${hash.slice(0, 7)}`,
    issueNumber,
    title: `${scope ? `[${scope}] ` : ''}${title}`,
    description,
    hash,
    author,
    date,
    status: 'completed',
    category
  };
}

/**
 * Generate a series of issues from commit messages
 * In production, this would read from git history
 */
export function generateCommitIssues(startNumber: number = 200): CommitIssue[] {
  // Mock commit data - in production, read from git
  const mockCommits = [
    {
      message: 'feat(docs): Add kanban board with topic-based columns',
      hash: 'a1b2c3d4e5f6g7h8',
      author: '@SanPranav',
      date: '2026-03-25'
    },
    {
      message: 'refactor(docs): Extract DocModal component following SRP',
      hash: 'b2c3d4e5f6g7h8i9',
      author: '@aadibhat09',
      date: '2026-03-24'
    },
    {
      message: 'fix(docs): Strip YAML frontmatter from markdown display',
      hash: 'c3d4e5f6g7h8i9j0',
      author: '@SanPranav',
      date: '2026-03-24'
    },
    {
      message: 'feat(icons): Add SVG icons for documentation categories',
      hash: 'd4e5f6g7h8i9j0k1',
      author: '@aadibhat09',
      date: '2026-03-23'
    },
    {
      message: 'refactor(components): Implement issue tracking system in docs',
      hash: 'e5f6g7h8i9j0k1l2',
      author: '@SanPranav',
      date: '2026-03-22'
    }
  ];

  return mockCommits.map((commit, index) =>
    parseCommitMessage(commit.message, commit.hash, commit.author, commit.date, startNumber + index)
  );
}
