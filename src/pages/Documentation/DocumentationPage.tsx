import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Panel } from '../../components/common';
import { MarkdownRenderer } from '../../components/MarkdownRenderer';
import { GitHubProjectsView } from '../../components/GitHubProjectsView';
import { CalendarView } from '../../components/CalendarView';
import { useAppContext } from '../../context/AppContext';
import { useVoiceCommands } from '../../hooks/useVoiceCommands';
import { DocSection } from '../../hooks/useProjectView';
import {
  buildImportedDocSection,
  clearImportedDocs,
  loadImportedDocs,
  saveImportedDocs,
  uploadedDocsCategory,
  type ImportedDocSection
} from '../../utils/docxImport';

// Re-export for convenience
export type { DocSection };

const markdownFiles = {
  ...import.meta.glob('/docs/**/*.md', { eager: true, query: '?raw', import: 'default' }),
  ...import.meta.glob('/docs/**/**/*.md', { eager: true, query: '?raw', import: 'default' }),
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
  // Remove YAML frontmatter first
  const withoutFrontmatter = content.replace(/^---[\s\S]*?---\n/, '');
  
  const heading = withoutFrontmatter
    .split('\n')
    .map((line) => line.trim())
    .find((line) => line.startsWith('# '));

  if (!heading) return fallback;
  return heading.replace(/^#\s+/, '').trim();
}

function extractSummary(content: string): string {
  // Remove YAML frontmatter first
  const withoutFrontmatter = content.replace(/^---[\s\S]*?---\n/, '');
  
  const firstTextLine = withoutFrontmatter
    .split('\n')
    .map((line) => line.trim())
    .find((line) => line && !line.startsWith('#') && !line.startsWith('|') && !line.startsWith('```') && line !== '---');

  if (!firstTextLine) return 'Repository documentation file.';
  return firstTextLine.slice(0, 120);
}

function categorizeDoc(filePath: string): string {
  const path = filePath.toLowerCase();
  
  // Extract folder name from path (e.g., docs/CS113_CAPSTONE/file.md → CS113_CAPSTONE)
  const pathMatch = path.match(/^docs\/([^\/]+)\//);
  if (pathMatch) {
    const folder = pathMatch[1].toUpperCase();
    if (folder.includes('CS113_CAPSTONE')) return 'CS113 Capstone';
    if (folder.includes('ARCHITECTURE')) return 'Architecture';
    if (folder.includes('DATA_STRUCTURES')) return 'Data Structures';
    if (folder.includes('CODING_GUIDES')) return 'Coding Guides';
    if (folder.includes('PROJECT_MANAGEMENT')) return 'Project Management';
  }
  
  // All files not in docs/ subfolders are Root Files
  return 'Root Files';
}

function getDocIcon(fileName: string): string {
  const name = fileName.toLowerCase();
  
  // SVG icons for different doc types
  const icons: Record<string, string> = {
    accessibility: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="4" r="2"></circle><path d="M8 8v4a4 4 0 0 0 8 0V8"></path><path d="M5 20h14"></path><line x1="6" y1="14" x2="6" y2="20"></line><line x1="18" y1="14" x2="18" y2="20"></line></svg>`,
    api: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="16" y1="21" x2="16" y2="3"></line><line x1="8" y1="21" x2="8" y2="3"></line><line x1="3" y1="8" x2="21" y2="8"></line><line x1="3" y1="16" x2="21" y2="16"></line></svg>`,
    'auto-generated-issues': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20m-10-10h20"></path><circle cx="12" cy="12" r="1"></circle><circle cx="18" cy="6" r="1"></circle><circle cx="6" cy="18" r="1"></circle></svg>`,
    guides: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path><line x1="10" y1="6" x2="16" y2="6"></line><line x1="10" y1="10" x2="16" y2="10"></line><line x1="10" y1="14" x2="16" y2="14"></line></svg>`,
    architecture: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect><line x1="10" y1="6.5" x2="14" y2="6.5"></line><line x1="10" y1="17.5" x2="14" y2="17.5"></line></svg>`,
    'code-quality': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline><path d="M4 12l5-5m0 0l11-11"></path></svg>`,
    'project-management': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>`,
    'srp-master': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>`,
    reference: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"></circle><line x1="12" y1="7" x2="12" y2="17"></line><line x1="7" y1="12" x2="17" y2="12"></line></svg>`,
    project: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"></rect><line x1="9" y1="9" x2="9" y2="15"></line><line x1="15" y1="9" x2="15" y2="15"></line><line x1="3" y1="9" x2="21" y2="9"></line></svg>`,
  };

  for (const [key, icon] of Object.entries(icons)) {
    if (name.includes(key)) return icon;
  }

  return icons.guides;
}

const issueMetadata: Record<string, { issueNumber: number; assignees: string[]; status: 'draft' | 'review' | 'published' | 'archived'; date?: string }> = {
  // Root level docs
  'readme': { issueNumber: 100, assignees: ['@aadibhat09', '@SanPranav'], status: 'published', date: '2026-03-25' },
  'contributing': { issueNumber: 103, assignees: ['@aadibhat09', '@SanPranav'], status: 'published', date: '2026-03-18' },
  'srp-analysis': { issueNumber: 108, assignees: ['@SanPranav'], status: 'review', date: '2026-03-22' },
  // Docs folder
  'docs-accessibility-guide': { issueNumber: 101, assignees: ['@aadibhat09'], status: 'published', date: '2026-03-20' },
  'docs-api': { issueNumber: 102, assignees: ['@SanPranav'], status: 'published', date: '2026-03-19' },
  'docs-auto-generated-issues': { issueNumber: 115, assignees: ['@SanPranav', '@aadibhat09'], status: 'published', date: '2026-03-26' },
  'docs-data-structures-evidence': { issueNumber: 104, assignees: ['@SanPranav'], status: 'review', date: '2026-03-17' },
  'docs-design-principles': { issueNumber: 105, assignees: ['@aadibhat09'], status: 'published', date: '2026-03-21' },
  'docs-implementation-summary': { issueNumber: 116, assignees: ['@SanPranav', '@aadibhat09'], status: 'published', date: '2026-03-26' },
  'docs-index': { issueNumber: 106, assignees: ['@SanPranav'], status: 'published', date: '2026-03-15' },
  'docs-kanban-board': { issueNumber: 107, assignees: ['@aadibhat09', '@SanPranav'], status: 'published', date: '2026-03-24' },
  'docs-project-management': { issueNumber: 117, assignees: ['@aadibhat09', '@SanPranav'], status: 'published', date: '2026-03-26' },
  'docs-srp-analysis': { issueNumber: 112, assignees: ['@SanPranav'], status: 'review', date: '2026-03-22' },
  'docs-srp-master': { issueNumber: 114, assignees: ['@aadibhat09', '@SanPranav'], status: 'published', date: '2026-03-26' },
  'docs-srp-refactoring-guide': { issueNumber: 109, assignees: ['@aadibhat09'], status: 'draft', date: '2026-03-23' },
  'docs-typing-system': { issueNumber: 110, assignees: ['@SanPranav'], status: 'published', date: '2026-03-16' },
  'docs-why-we-started': { issueNumber: 111, assignees: ['@aadibhat09'], status: 'published', date: '2026-03-14' },
  // SRP Violations - Issue Assignments
  'srp-refactor-onscreen-keyboard': { issueNumber: 201, assignees: ['@aadibhat09'], status: 'draft', date: '2026-03-26' },
  'srp-refactor-settings-panel': { issueNumber: 202, assignees: ['@SanPranav'], status: 'draft', date: '2026-03-26' },
  'srp-refactor-face-tracking': { issueNumber: 203, assignees: ['@SanPranav'], status: 'draft', date: '2026-03-26' },
  'srp-refactor-gesture-controls': { issueNumber: 204, assignees: ['@aadibhat09'], status: 'draft', date: '2026-03-26' },
  'srp-refactor-app-context': { issueNumber: 205, assignees: ['@SanPranav'], status: 'draft', date: '2026-03-26' },
  'srp-refactor-voice-profile': { issueNumber: 206, assignees: ['@aadibhat09'], status: 'draft', date: '2026-03-26' },
  'srp-refactor-demo-page': { issueNumber: 207, assignees: ['@SanPranav'], status: 'draft', date: '2026-03-26' },
  'srp-refactor-settings-page': { issueNumber: 208, assignees: ['@aadibhat09'], status: 'draft', date: '2026-03-26' },
};

const repositoryDocSections: DocSection[] = Object.entries(markdownFiles)
  .map(([sourcePath, content]) => {
    const normalizedPath = sourcePath.replace(/^\//, '');
    const fileName = normalizedPath.split('/').pop() ?? normalizedPath;
    const fallbackTitle = prettifyName(fileName);
    const title = extractTitle(content, fallbackTitle);
    const id = normalizedPath.replace(/\.md$/i, '').replace(/[/.]/g, '-').toLowerCase();

    const metadata = issueMetadata[id] || { issueNumber: 0, assignees: [], status: 'draft' as const };

    return {
      id,
      title,
      summary: extractSummary(content),
      sourcePath: normalizedPath,
      content,
      category: categorizeDoc(normalizedPath),
      issueNumber: metadata.issueNumber,
      assignees: metadata.assignees,
      status: metadata.status,
      icon: getDocIcon(fileName),
      date: metadata.date
    };
  })
  .sort((a, b) => a.title.localeCompare(b.title));

function mergeDocSections(uploadedDocs: ImportedDocSection[]): DocSection[] {
  return [...repositoryDocSections, ...uploadedDocs];
}

const categoryOrder = ['Root Files', 'Architecture', 'Coding Guides', 'CS113 Capstone', 'Data Structures', 'Project Management', uploadedDocsCategory];

function getCategorizedDocs(sections: DocSection[]): Record<string, DocSection[]> {
  const categorized: Record<string, DocSection[]> = {};
  sections.forEach((section) => {
    if (!categorized[section.category]) {
      categorized[section.category] = [];
    }
    categorized[section.category].push(section);
  });

  Object.keys(categorized).forEach((cat) => {
    categorized[cat].sort((a, b) => a.title.localeCompare(b.title));
  });

  return categorized;
}

interface FolderStructure {
  folders: {
    [folderName: string]: {
      displayName: string;
      docs: DocSection[];
      isExpanded: boolean;
    };
  };
  rootFiles: DocSection[];
}

function getFolderStructure(sections: DocSection[]): FolderStructure {
  const folders: Record<string, { displayName: string; docs: DocSection[] }> = {};
  const rootFiles: DocSection[] = [];

  sections.forEach((section) => {
    const pathMatch = section.sourcePath.match(/^docs\/([^\/]+)\//);
    if (pathMatch) {
      const folderName = pathMatch[1];
      const displayName = folderName.replace(/_/g, '_').toUpperCase();
      
      if (!folders[folderName]) {
        folders[folderName] = { displayName, docs: [] };
      }
      folders[folderName].docs.push(section);
    } else {
      rootFiles.push(section);
    }
  });

  // Sort docs within each folder
  Object.keys(folders).forEach((key) => {
    folders[key].docs.sort((a, b) => a.title.localeCompare(b.title));
  });

  // Sort root files
  rootFiles.sort((a, b) => a.title.localeCompare(b.title));

  return {
    folders: Object.keys(folders)
      .sort()
      .reduce((acc, key) => {
        acc[key] = { ...folders[key], isExpanded: false };
        return acc;
      }, {} as Record<string, { displayName: string; docs: DocSection[]; isExpanded: boolean }>),
    rootFiles
  };
}

interface DocModalProps {
  doc: DocSection;
  onClose: () => void;
}

function getStatusColor(status?: string): string {
  switch (status) {
    case 'published': return 'bg-green-500/20 text-green-400 border-green-500/30';
    case 'review': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    case 'draft': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    case 'archived': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    default: return 'bg-app-accent/20 text-app-accent';
  }
}

function DocModal({ doc, onClose }: DocModalProps) {
  // Remove YAML frontmatter from content for display
  const cleanContent = doc.content.replace(/^---[\s\S]*?---\n/, '');

  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscapeKey);
    return () => window.removeEventListener('keydown', handleEscapeKey);
  }, [onClose]);
  
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in overflow-y-auto" onClick={handleBackdropClick}>
      <div className="relative w-full max-w-5xl my-8 rounded-xl border border-app-accent bg-app-panel shadow-2xl flex flex-col max-h-[95vh]" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-6 border-b border-app-accent/20 p-8">
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-lg border border-app-accent/30 bg-app-panelAlt p-3 flex items-center justify-center text-app-accent flex-shrink-0">
                {doc.icon ? (
                  <div dangerouslySetInnerHTML={{ __html: doc.icon }} className="w-full h-full" />
                ) : (
                  <span>Doc</span>
                )}
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-app-text">{doc.title}</h1>
                <div className="flex items-center gap-3 text-sm">
                  <span className="px-3 py-1 bg-app-accent/20 text-app-accent rounded-full text-xs font-semibold">
                    {doc.category}
                  </span>
                  {doc.sourceType === 'uploaded' ? (
                    <span className="px-3 py-1 bg-cyan-500/20 text-cyan-300 rounded-full text-xs font-semibold border border-cyan-500/30">
                      Uploaded DOCX
                    </span>
                  ) : null}
                  {doc.status && (
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(doc.status)}`}>
                      {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                    </span>
                  )}
                  {doc.issueNumber ? (
                    <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs font-semibold border border-purple-500/30">
                      #{doc.issueNumber}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-app-subtle">{doc.sourcePath}</p>
              {doc.sourceType === 'uploaded' && doc.uploadedAt ? (
                <p className="text-xs text-app-subtle">Imported {new Date(doc.uploadedAt).toLocaleString()}</p>
              ) : null}
              {doc.assignees && doc.assignees.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-app-text">Assignees:</span>
                  <div className="flex gap-2">
                    {doc.assignees.map((assignee) => (
                      <span key={assignee} className="px-2 py-1 bg-app-accent/30 text-app-accent text-xs rounded-full">
                        {assignee}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
            className="flex-shrink-0 rounded-lg border border-app-accent/30 bg-app-accent/10 px-4 py-3 text-app-text transition hover:border-app-accent hover:bg-app-accent/20 font-bold text-lg"
          >
            ✕
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-auto p-8">
          <div className="prose prose-invert max-w-none">
            <MarkdownRenderer content={cleanContent} />
          </div>
        </div>
      </div>
    </div>
  );
}

export function DocumentationPage() {
  const { settings } = useAppContext();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [query, setQuery] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<DocSection | null>(null);
  const [viewMode, setViewMode] = useState<'kanban' | 'projects' | 'calendar' | 'tree'>('kanban');
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [uploadedDocs, setUploadedDocs] = useState<ImportedDocSection[]>(() => loadImportedDocs());
  const [uploading, setUploading] = useState(false);
  const [uploadFeedback, setUploadFeedback] = useState<string | null>(null);

  useEffect(() => {
    saveImportedDocs(uploadedDocs);
  }, [uploadedDocs]);

  const allDocSections = useMemo(() => mergeDocSections(uploadedDocs), [uploadedDocs]);

  const normalizedQuery = query.trim().toLowerCase();

  const filteredSections = useMemo(() => {
    if (!normalizedQuery) return allDocSections;

    return allDocSections.filter((item) => {
      return item.title.toLowerCase().includes(normalizedQuery)
        || item.summary.toLowerCase().includes(normalizedQuery)
        || item.sourcePath.toLowerCase().includes(normalizedQuery)
        || item.category.toLowerCase().includes(normalizedQuery);
    });
  }, [normalizedQuery, allDocSections]);

  const categorizedDocs = useMemo(() => getCategorizedDocs(filteredSections), [filteredSections]);

  const openDoc = useCallback((doc: DocSection) => {
    setSelectedDoc(doc);

    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('issue', doc.id);
    setSearchParams(nextParams);
  }, [searchParams, setSearchParams]);

  const closeDoc = useCallback(() => {
    setSelectedDoc(null);

    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('issue');
    setSearchParams(nextParams);
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    const issueFromUrl = searchParams.get('issue');
    if (!issueFromUrl) {
      if (selectedDoc) {
        setSelectedDoc(null);
      }
      return;
    }

    const match = allDocSections.find((doc) => {
      if (doc.id === issueFromUrl) return true;
      if (doc.issueNumber && String(doc.issueNumber) === issueFromUrl) return true;
      return false;
    });

    if (!match) {
      return;
    }

    if (!selectedDoc || selectedDoc.id !== match.id) {
      setSelectedDoc(match);
    }
  }, [allDocSections, searchParams, selectedDoc]);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleDocxSelection = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = '';

    if (!files.length) return;

    const docxFiles = files.filter((file) => file.name.toLowerCase().endsWith('.docx'));
    if (!docxFiles.length) {
      setUploadFeedback('Please choose one or more .docx files.');
      return;
    }

    setUploading(true);
    setUploadFeedback(null);

    try {
      const importedDocs = await Promise.all(docxFiles.map((file) => buildImportedDocSection(file)));
      setUploadedDocs((prev) => [...importedDocs, ...prev]);
      setViewMode('kanban');
      setUploadFeedback(`Imported ${importedDocs.length} DOCX file${importedDocs.length === 1 ? '' : 's'} into the kanban.`);
    } catch {
      setUploadFeedback('DOCX import failed. Check that the file is a valid Word document.');
    } finally {
      setUploading(false);
    }
  };

  const handleClearUploads = () => {
    clearImportedDocs();
    setUploadedDocs([]);
    closeDoc();
    setUploadFeedback('Cleared imported DOCX documents.');
  };

  useVoiceCommands(settings.voiceEnabled, {
    navigate: (path) => navigate(path)
  });

  return (
    <div className="space-y-4">
      <Panel title="Project Management" className="animate-float-in">
        <div className="space-y-3">
          <div className="rounded-xl border border-app-accent/20 bg-app-panelAlt/70 p-4 shadow-inner">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-app-text">Import DOCX documents</h3>
                <p className="text-xs text-app-subtle">
                  Upload a Word document and it will be converted to markdown, saved locally, and added to the kanban under {uploadedDocsCategory}.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleUploadClick}
                  disabled={uploading}
                  className="rounded-md bg-app-accentStrong px-4 py-2 text-xs font-semibold text-app-bg transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {uploading ? 'Importing...' : 'Choose DOCX'}
                </button>
                {uploadedDocs.length > 0 ? (
                  <button
                    type="button"
                    onClick={handleClearUploads}
                    className="rounded-md border border-app-accent/30 px-4 py-2 text-xs font-semibold text-app-text transition hover:border-app-accent hover:bg-app-accent/10"
                  >
                    Clear Imports
                  </button>
                ) : null}
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              multiple
              onChange={handleDocxSelection}
              className="hidden"
            />

            <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-app-subtle">
              <span>{uploadedDocs.length} imported doc{uploadedDocs.length === 1 ? '' : 's'}</span>
              <span>{allDocSections.length} total docs</span>
              {uploadFeedback ? <span className="text-app-accent">{uploadFeedback}</span> : null}
            </div>
          </div>

          {/* Search Bar */}
          <div className="rounded-lg border border-app-accent/20 bg-app-panelAlt p-3">
            <label htmlFor="documentation-search" className="mb-1 block text-xs font-semibold text-app-text">
              Filter issues
            </label>
            <input
              id="documentation-search"
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search title, category, summary, or path"
              className="w-full rounded-md border border-app-accent/30 bg-app-bg/70 px-2 py-1.5 text-xs text-app-text"
            />
            <p className="mt-2 text-[11px] text-app-subtle">
              {filteredSections.length} of {allDocSections.length} issues
            </p>
          </div>

          {/* View Mode Switcher */}
          <div className="flex gap-2 rounded-lg border border-app-accent/20 bg-app-panelAlt p-3">
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex-1 rounded-md px-3 py-2 text-xs font-semibold transition ${
                viewMode === 'kanban'
                  ? 'bg-app-accent text-app-bg'
                  : 'border border-app-accent/30 text-app-text hover:border-app-accent'
              }`}
            >
              Kanban
            </button>
            <button
              onClick={() => setViewMode('projects')}
              className={`flex-1 rounded-md px-3 py-2 text-xs font-semibold transition ${
                viewMode === 'projects'
                  ? 'bg-app-accent text-app-bg'
                  : 'border border-app-accent/30 text-app-text hover:border-app-accent'
              }`}
            >
              Projects
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex-1 rounded-md px-3 py-2 text-xs font-semibold transition ${
                viewMode === 'calendar'
                  ? 'bg-app-accent text-app-bg'
                  : 'border border-app-accent/30 text-app-text hover:border-app-accent'
              }`}
            >
              Calendar
            </button>
            <button
              onClick={() => setViewMode('tree')}
              className={`flex-1 rounded-md px-3 py-2 text-xs font-semibold transition ${
                viewMode === 'tree'
                  ? 'bg-app-accent text-app-bg'
                  : 'border border-app-accent/30 text-app-text hover:border-app-accent'
              }`}
            >
              Tree
            </button>
          </div>
        </div>
      </Panel>

      {/* View Content */}
      {viewMode === 'kanban' && (
        <div className="kanban-container flex gap-4 overflow-x-auto pb-4">
          {categoryOrder.map((category) => {
            const docs = categorizedDocs[category];
            if (!docs) return null;

            return (
              <div
                key={category}
                className="flex-shrink-0 w-80 rounded-lg border border-app-accent/20 bg-app-panelAlt/50 p-4"
              >
                <h2 className="mb-4 text-lg font-semibold text-app-accent flex items-center gap-2">
                  <span>{category}</span>
                  <span className="text-xs font-normal bg-app-accent/20 text-app-accent px-2 py-1 rounded">
                    {docs.length}
                  </span>
                </h2>

                <div className="max-h-[70vh] space-y-2 overflow-y-auto pr-2">
                  {docs.map((doc) => (
                    <button
                      key={doc.id}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      openDoc(doc);
                    }}
                      className="w-full text-left rounded-lg border border-app-accent/20 bg-app-bg/70 text-app-subtle px-3 py-3 transition hover:border-app-accent/40 hover:text-app-text hover:bg-app-accent/5 cursor-pointer group"
                    >
                      {/* Icon and Title */}
                      <div className="flex items-start gap-3 mb-2">
                        <div className="w-10 h-10 rounded-md border border-app-accent/30 bg-app-panelAlt p-1.5 flex items-center justify-center text-app-accent flex-shrink-0 group-hover:border-app-accent/50">
                          {doc.icon ? (
                            <div dangerouslySetInnerHTML={{ __html: doc.icon }} className="w-full h-full" />
                          ) : (
                            <span>Doc</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate">{doc.title}</p>
                          {doc.issueNumber ? (
                            <p className="text-xs text-app-accent font-mono">#{doc.issueNumber}</p>
                          ) : null}
                        </div>
                      </div>

                      {/* Summary */}
                      <p className="text-xs opacity-75 mb-2 line-clamp-2">{doc.summary}</p>

                      {/* Status and Assignees */}
                      <div className="flex flex-wrap items-center gap-2">
                        {doc.status && (
                          <span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(doc.status)}`}>
                            {doc.status}
                          </span>
                        )}
                        {doc.assignees && doc.assignees.length > 0 && (
                          <div className="flex -space-x-2">
                            {doc.assignees.map((assignee) => (
                              <span
                                key={assignee}
                                title={assignee}
                                className="w-6 h-6 rounded-full bg-app-accent/30 text-app-accent text-xs font-bold flex items-center justify-center border border-app-accent/50"
                              >
                                {assignee.charAt(1).toUpperCase()}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </button>
                  ))}

                  {docs.length === 0 ? (
                    <div className="rounded-lg border border-app-accent/20 bg-app-panelAlt p-3 text-xs text-app-subtle">
                      No issues in this category
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {viewMode === 'projects' && (
        <GitHubProjectsView issues={filteredSections} onIssueSelect={openDoc} />
      )}

      {viewMode === 'calendar' && (
        <CalendarView issues={filteredSections} onIssueSelect={openDoc} />
      )}

      {viewMode === 'tree' && (
        <Panel title="Documentation Structure" className="animate-float-in">
          <div className="space-y-1 max-h-[70vh] overflow-y-auto pr-2">
            {(() => {
              const folderStructure = getFolderStructure(filteredSections);
              
              return (
                <>
                  {/* Folders */}
                  {Object.entries(folderStructure.folders).map(([folderKey, folder]) => (
                    <div key={folderKey}>
                      <button
                        onClick={() => {
                          const newExpanded = new Set(expandedFolders);
                          if (newExpanded.has(folderKey)) {
                            newExpanded.delete(folderKey);
                          } else {
                            newExpanded.add(folderKey);
                          }
                          setExpandedFolders(newExpanded);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-app-text hover:text-app-accent transition rounded-md hover:bg-app-accent/5"
                      >
                        <span className={`transition ${expandedFolders.has(folderKey) ? 'rotate-90' : ''}`}>
                          ▶
                        </span>
                        <span className="uppercase text-xs tracking-wide">{folder.displayName}</span>
                      </button>
                      
                      {/* Files in folder */}
                      {expandedFolders.has(folderKey) && (
                        <div className="pl-6 space-y-1">
                          {folder.docs.map((doc) => (
                            <button
                              key={doc.id}
                              onClick={() => openDoc(doc)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-app-subtle hover:text-app-text rounded-md hover:bg-app-accent/5 transition text-left line-clamp-1"
                              title={doc.title}
                            >
                              <span>📄</span>
                              <span className="truncate">{doc.title}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {/* Root level files */}
                  {folderStructure.rootFiles.length > 0 && (
                    <div>
                      <div className="px-3 py-2 text-xs font-medium text-app-accent/60 uppercase tracking-wider mt-4">
                        Root
                      </div>
                      <div className="space-y-1">
                        {folderStructure.rootFiles.map((doc) => (
                          <button
                            key={doc.id}
                            onClick={() => openDoc(doc)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-app-subtle hover:text-app-text rounded-md hover:bg-app-accent/5 transition text-left line-clamp-1"
                            title={doc.title}
                          >
                            <span>📄</span>
                            <span className="truncate">{doc.title}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        </Panel>
      )}

      {selectedDoc && <DocModal doc={selectedDoc} onClose={closeDoc} />}
    </div>
  );
}
