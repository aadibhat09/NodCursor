import type { DocSection } from '../hooks/useProjectView';

export const uploadedDocsCategory = 'Uploaded Docs';
const uploadedDocsStorageKey = 'nodcursor-uploaded-docs-v1';

export interface ImportedDocSection extends DocSection {
  sourceType: 'uploaded';
  uploadedAt: string;
  originalFileName: string;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'document';
}

function stripFrontmatter(content: string): string {
  return content.replace(/^---[\s\S]*?---\n/, '').trim();
}

function extractTitle(content: string, fallback: string): string {
  const normalized = stripFrontmatter(content);
  const heading = normalized
    .split('\n')
    .map((line) => line.trim())
    .find((line) => line.startsWith('# '));

  return heading ? heading.replace(/^#\s+/, '').trim() : fallback;
}

function extractSummary(content: string): string {
  const normalized = stripFrontmatter(content);
  const firstTextLine = normalized
    .split('\n')
    .map((line) => line.trim())
    .find((line) => line && !line.startsWith('#') && !line.startsWith('|') && !line.startsWith('```') && line !== '---');

  return firstTextLine ? firstTextLine.slice(0, 140) : 'Uploaded DOCX document.';
}

function getPrettyTitleFromFile(fileName: string): string {
  return fileName
    .replace(/\.docx$/i, '')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim() || 'Uploaded Document';
}

function getIconMarkup(): string {
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><path d="M14 2v6h6"></path><path d="M8 13h8"></path><path d="M8 17h8"></path></svg>';
}

async function convertDocxToMarkdown(file: File): Promise<string> {
  const [mammothModule, turndownModule, gfmModule] = await Promise.all([
    import(/* @vite-ignore */ 'https://esm.sh/mammoth@1.6.0'),
    import(/* @vite-ignore */ 'https://esm.sh/turndown@7.2.0'),
    import(/* @vite-ignore */ 'https://esm.sh/turndown-plugin-gfm@1.0.2')
  ]);

  const mammoth = (mammothModule as { default?: typeof mammothModule }).default ?? mammothModule;
  const TurndownService = (turndownModule as { default?: typeof turndownModule }).default ?? turndownModule;
  const gfm = (gfmModule as { gfm?: unknown; default?: unknown }).gfm ?? (gfmModule as { default?: unknown }).default;

  const arrayBuffer = await file.arrayBuffer();
  const htmlResult = await mammoth.convertToHtml(
    { arrayBuffer },
    {
      convertImage: mammoth.images.inline(async (image) => {
        const imageBuffer = await image.read('base64');
        return {
          src: `data:${image.contentType};base64,${imageBuffer}`
        };
      })
    }
  );

  const turndown = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
    bulletListMarker: '-'
  });

  if (gfm) {
    turndown.use(gfm);
  }

  return turndown.turndown(htmlResult.value).trim();
}

export function loadImportedDocs(): ImportedDocSection[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = window.localStorage.getItem(uploadedDocsStorageKey);
    if (!raw) return [];

    const parsed = JSON.parse(raw) as ImportedDocSection[];
    return parsed.filter((item) => item?.id && item?.title && item?.content && item?.originalFileName);
  } catch {
    return [];
  }
}

export function saveImportedDocs(docs: ImportedDocSection[]): void {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(uploadedDocsStorageKey, JSON.stringify(docs));
  } catch {
    // Ignore storage failures so upload still works for the current session.
  }
}

export function clearImportedDocs(): void {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.removeItem(uploadedDocsStorageKey);
  } catch {
    // Ignore storage failures.
  }
}

export async function buildImportedDocSection(file: File): Promise<ImportedDocSection> {
  const markdownContent = await convertDocxToMarkdown(file);
  const prettyTitle = getPrettyTitleFromFile(file.name);
  const title = extractTitle(markdownContent, prettyTitle);
  const summary = extractSummary(markdownContent);
  const uploadedAt = new Date().toISOString();
  const id = `upload-${slugify(file.name)}-${Date.now().toString(36)}`;

  return {
    id,
    title,
    summary,
    sourcePath: file.name,
    originalFileName: file.name,
    uploadedAt,
    content: markdownContent,
    category: uploadedDocsCategory,
    sourceType: 'uploaded',
    status: 'draft',
    icon: getIconMarkup(),
    date: uploadedAt.slice(0, 10)
  };
}