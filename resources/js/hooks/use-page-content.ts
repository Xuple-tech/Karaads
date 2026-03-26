import { useEffect, useState } from 'react';

export interface PageContent {
    title: string;
    subtitle: string;
    sections: Section[];
    headings: Heading[];
    paragraphs: string[];
    links: LinkInfo[];
    codeBlocks: CodeBlock[];
    images: ImageInfo[];
    lists: ListItem[];
    tables: TableInfo[];
    rawText: string;
}

export interface Section {
    id: string;
    level: number; // 1-6 for h1-h6
    title: string;
    content: string;
    children: Section[];
}

export interface Heading {
    level: number;
    text: string;
    id?: string;
}

export interface LinkInfo {
    url: string;
    text: string;
    title?: string;
}

export interface CodeBlock {
    language: string;
    code: string;
    filename?: string;
}

export interface ImageInfo {
    src: string;
    alt: string;
    title?: string;
}

export interface ListItem {
    type: 'ordered' | 'unordered';
    items: string[];
}

export interface TableInfo {
    headers: string[];
    rows: string[][];
}

/**
 * Hook to extract and parse page content from DOM
 * @param containerId Optional: specific element ID to extract from (default: main content area)
 * @returns PageContent object with extracted information
 */
export function usePageContent(containerId: string = 'main-content'): PageContent {
    const [pageContent, setPageContent] = useState<PageContent>({
        title: '',
        subtitle: '',
        sections: [],
        headings: [],
        paragraphs: [],
        links: [],
        codeBlocks: [],
        images: [],
        lists: [],
        tables: [],
        rawText: '',
    });

    useEffect(() => {
        const extractPageContent = () => {
            try {
                // Find container - try custom ID first, then fallback to main or article
                let container = document.getElementById(containerId);
                if (!container) {
                    container = document.querySelector('main') || document.querySelector('article');
                }

                if (!container) {
                    console.warn('Could not find content container');
                    return;
                }

                const content: PageContent = {
                    title: extractTitle(),
                    subtitle: extractSubtitle(),
                    sections: extractSections(container),
                    headings: extractHeadings(container),
                    paragraphs: extractParagraphs(container),
                    links: extractLinks(container),
                    codeBlocks: extractCodeBlocks(container),
                    images: extractImages(container),
                    lists: extractLists(container),
                    tables: extractTables(container),
                    rawText: extractRawText(container),
                };

                setPageContent(content);
            } catch (error) {
                console.error('Error extracting page content:', error);
            }
        };

        // Extract on mount
        extractPageContent();

        // Re-extract on DOM changes
        const observer = new MutationObserver(() => {
            extractPageContent();
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            characterData: false,
        });

        return () => observer.disconnect();
    }, [containerId]);

    return pageContent;
}

/**
 * Extract main title from page
 */
function extractTitle(): string {
    // Try h1 first
    const h1 = document.querySelector('h1');
    if (h1) return h1.textContent || '';

    // Try document title
    if (document.title) return document.title;

    return 'Untitled Page';
}

/**
 * Extract subtitle/description from page
 */
function extractSubtitle(): string {
    // Try meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) return metaDescription.getAttribute('content') || '';

    // Try first p tag after h1
    const h1 = document.querySelector('h1');
    if (h1) {
        let element = h1.nextElementSibling;
        while (element) {
            if (element.tagName === 'P') {
                return element.textContent || '';
            }
            if (['H2', 'H3', 'SECTION'].includes(element.tagName)) {
                break;
            }
            element = element.nextElementSibling;
        }
    }

    return '';
}

/**
 * Extract structured sections from page
 */
function extractSections(container: Element): Section[] {
    const sections: Section[] = [];
    const headings = Array.from(container.querySelectorAll('h1, h2, h3, h4, h5, h6'));

    headings.forEach((heading, index) => {
        const level = parseInt(heading.tagName[1]);
        const nextHeading = headings[index + 1] as HTMLElement;

        // Get content between this heading and next
        let content = '';
        let element = heading.nextElementSibling;

        while (element && (!nextHeading || !element.isEqualNode(nextHeading))) {
            if (element.tagName.match(/^H[1-6]$/)) break;
            content += (element as HTMLElement).innerText || '';
            element = element.nextElementSibling;
        }

        sections.push({
            id: heading.id || `section-${index}`,
            level,
            title: heading.textContent || '',
            content: content.trim(),
            children: [],
        });
    });

    return sections;
}

/**
 * Extract all headings from page
 */
function extractHeadings(container: Element): Heading[] {
    return Array.from(container.querySelectorAll('h1, h2, h3, h4, h5, h6')).map((h) => ({
        level: parseInt(h.tagName[1]),
        text: h.textContent || '',
        id: h.id,
    }));
}

/**
 * Extract all paragraphs from page
 */
function extractParagraphs(container: Element): string[] {
    return Array.from(container.querySelectorAll('p'))
        .map((p) => p.textContent || '')
        .filter((text) => text.trim().length > 0);
}

/**
 * Extract all links from page
 */
function extractLinks(container: Element): LinkInfo[] {
    return Array.from(container.querySelectorAll('a')).map((a) => ({
        url: a.getAttribute('href') || '',
        text: a.textContent || '',
        title: a.getAttribute('title') || undefined,
    }));
}

/**
 * Extract code blocks from page
 */
function extractCodeBlocks(container: Element): CodeBlock[] {
    const blocks: CodeBlock[] = [];

    // Look for code blocks with language class
    container.querySelectorAll('pre code').forEach((code) => {
        const classList = Array.from(code.classList);
        const languageClass = classList.find((c) => c.startsWith('language-'));
        const language = languageClass ? languageClass.replace('language-', '') : 'plaintext';

        blocks.push({
            language,
            code: code.textContent || '',
            filename: undefined,
        });
    });

    return blocks;
}

/**
 * Extract images from page
 */
function extractImages(container: Element): ImageInfo[] {
    return Array.from(container.querySelectorAll('img')).map((img) => ({
        src: img.getAttribute('src') || '',
        alt: img.getAttribute('alt') || '',
        title: img.getAttribute('title') || undefined,
    }));
}

/**
 * Extract lists from page
 */
function extractLists(container: Element): ListItem[] {
    const lists: ListItem[] = [];

    // Unordered lists
    container.querySelectorAll('ul').forEach((ul) => {
        const items = Array.from(ul.querySelectorAll('li')).map((li) => li.textContent || '');
        if (items.length > 0) {
            lists.push({
                type: 'unordered',
                items,
            });
        }
    });

    // Ordered lists
    container.querySelectorAll('ol').forEach((ol) => {
        const items = Array.from(ol.querySelectorAll('li')).map((li) => li.textContent || '');
        if (items.length > 0) {
            lists.push({
                type: 'ordered',
                items,
            });
        }
    });

    return lists;
}

/**
 * Extract tables from page
 */
function extractTables(container: Element): TableInfo[] {
    return Array.from(container.querySelectorAll('table')).map((table) => {
        const headers = Array.from(table.querySelectorAll('thead th')).map((th) => th.textContent || '');

        const rows = Array.from(table.querySelectorAll('tbody tr')).map((tr) =>
            Array.from(tr.querySelectorAll('td')).map((td) => td.textContent || '')
        );

        return { headers, rows };
    });
}

/**
 * Extract all raw text from page
 */
function extractRawText(container: Element): string {
    return container.innerText || '';
}
