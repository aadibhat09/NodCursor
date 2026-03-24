import { NavLink, useNavigate, useParams } from 'react-router-dom';
import { Panel } from '../../components/common';
import { MarkdownRenderer } from '../../components/MarkdownRenderer';
import { useAppContext } from '../../context/AppContext';
import { useVoiceCommands } from '../../hooks/useVoiceCommands';

interface DocSection {
  id: string;
  title: string;
  summary: string;
  sourcePath: string;
  content: string;
}

const markdownFiles = {
  ...import.meta.glob('/docs/*.md', { eager: true, query: '?raw', import: 'default' }),
  ...import.meta.glob('/README.md', { eager: true, query: '?raw', import: 'default' }),
  ...import.meta.glob('/CONTRIBUTING.md', { eager: true, query: '?raw', import: 'default' }),
  ...import.meta.glob('/SRP_ANALYSIS.md', { eager: true, query: '?raw', import: 'default' }),
  ...import.meta.glob('/.github/ISSUE_TEMPLATE/*.md', { eager: true, query: '?raw', import: 'default' })
} as Record<string, string>;

function prettifyName(raw: string): string {
  return raw
    .replace(/\.md$/i, '')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function extractTitle(content: string, fallback: string): string {
  const heading = content
    .split('\n')
    .map((line) => line.trim())
    .find((line) => line.startsWith('# '));

  if (!heading) return fallback;
  return heading.replace(/^#\s+/, '').trim();
}

function extractSummary(content: string): string {
  const firstTextLine = content
    .split('\n')
    .map((line) => line.trim())
    .find((line) => line && !line.startsWith('#') && !line.startsWith('|') && line !== '---');

  if (!firstTextLine) return 'Repository documentation file.';
  return firstTextLine.slice(0, 120);
}

const docSections: DocSection[] = Object.entries(markdownFiles)
  .map(([sourcePath, content]) => {
    const normalizedPath = sourcePath.replace(/^\//, '');
    const fileName = normalizedPath.split('/').pop() ?? normalizedPath;
    const fallbackTitle = prettifyName(fileName);
    const title = extractTitle(content, fallbackTitle);
    const id = normalizedPath.replace(/\.md$/i, '').replace(/[/.]/g, '-').toLowerCase();

    return {
      id,
      title,
      summary: extractSummary(content),
      sourcePath: normalizedPath,
      content
    };
  })
  .sort((a, b) => a.title.localeCompare(b.title));

export function DocumentationPage() {
  const { settings } = useAppContext();
  const navigate = useNavigate();
  const { section } = useParams();

  const activeSection = docSections.find((item) => item.id === section) ?? docSections[0];

  useVoiceCommands(settings.voiceEnabled, {
    scrollUp:   () => window.scrollBy({ top: -200, behavior: 'smooth' }),
    scrollDown: () => window.scrollBy({ top:  200, behavior: 'smooth' }),
    navigate:   (path) => navigate(path)
  });

  return (
    <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
      <Panel title="Documentation Blog" className="animate-float-in h-fit">
        <div className="space-y-2">
          {docSections.map((item) => (
            <NavLink
              key={item.id}
              to={`/documentation/${item.id}`}
              className={({ isActive }) => [
                'block rounded-lg border px-3 py-2 text-sm transition',
                isActive
                  ? 'border-app-accent bg-app-accent/15 text-app-text shadow-glow'
                  : 'border-app-accent/20 bg-app-panelAlt text-app-subtle hover:border-app-accent/40 hover:text-app-text'
              ].join(' ')}
            >
              <p className="font-semibold">{item.title}</p>
              <p className="text-xs opacity-90">{item.summary}</p>
              <p className="mt-1 text-[11px] opacity-75">{item.sourcePath}</p>
            </NavLink>
          ))}
        </div>
      </Panel>

      <Panel title={activeSection.title} className="animate-float-in">
        <div className="space-y-4 text-sm text-app-subtle">
          <div className="rounded-lg border border-app-accent/20 bg-app-panelAlt p-3 text-xs">
            <p className="font-semibold text-app-text">Source</p>
            <p>{activeSection.sourcePath}</p>
          </div>

          <div className="max-h-[60vh] overflow-auto rounded-lg border border-app-accent/20 bg-app-panelAlt p-4">
            <MarkdownRenderer content={activeSection.content} />
          </div>
        </div>
      </Panel>
    </div>
  );
}
