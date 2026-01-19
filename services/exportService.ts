
import { ResearchResult } from "../types";

declare const docx: any;
declare const saveAs: any;

/**
 * Basic HTML to DOCX converter for common styles
 * Supports: p, h1, h2, strong, em, u, ul, li
 */
const htmlToDocxChildren = (html: string, docxElements: any) => {
  const { Paragraph, TextRun, HeadingLevel, AlignmentType } = docx;
  
  const container = document.createElement('div');
  container.innerHTML = html;
  
  const children: any[] = [];

  container.childNodes.forEach((node: any) => {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement;
      const tag = el.tagName.toLowerCase();

      if (['p', 'h1', 'h2', 'h3'].includes(tag)) {
        const textRuns: any[] = [];
        
        // Parse inline styles within paragraph
        el.childNodes.forEach((child: any) => {
          if (child.nodeType === Node.TEXT_NODE) {
            textRuns.push(new TextRun(child.textContent || ""));
          } else if (child.nodeType === Node.ELEMENT_NODE) {
            const innerEl = child as HTMLElement;
            const innerTag = innerEl.tagName.toLowerCase();
            textRuns.push(new TextRun({
              text: innerEl.textContent || "",
              bold: innerTag === 'strong' || innerTag === 'b',
              italics: innerTag === 'em' || innerTag === 'i',
              underline: innerTag === 'u' ? {} : undefined,
            }));
          }
        });

        children.push(new Paragraph({
          children: textRuns,
          heading: tag === 'h1' ? HeadingLevel.HEADING_1 : tag === 'h2' ? HeadingLevel.HEADING_2 : undefined,
          spacing: { before: 120, after: 120 },
          alignment: tag.startsWith('h') ? AlignmentType.CENTER : AlignmentType.JUSTIFIED,
        }));
      } else if (tag === 'ul' || tag === 'ol') {
        el.querySelectorAll('li').forEach(li => {
          children.push(new Paragraph({
            text: li.textContent || "",
            bullet: { level: 0 },
            spacing: { after: 120 },
          }));
        });
      }
    }
  });

  return children;
};

export const exportToWord = async (result: ResearchResult) => {
  const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, SectionType } = docx;

  const contentChildren = htmlToDocxChildren(result.content, docx);

  const doc = new Document({
    sections: [{
      properties: { type: SectionType.NEXT_PAGE },
      children: [
        // Title Page
        new Paragraph({
          text: result.request.topic.toUpperCase(),
          heading: HeadingLevel.TITLE,
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
        }),
        new Paragraph({
          text: `Tipo: ${result.request.type} | Nível: ${result.request.level}`,
          alignment: AlignmentType.CENTER,
          spacing: { after: 1000 },
        }),
        
        ...contentChildren,

        // Sources Section
        new Paragraph({
          text: "FONTES VISITADAS (LINKS ORIGINAIS)",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 400, after: 200 },
        }),
        ...result.sources.map(s => new Paragraph({
          children: [
            new TextRun({ text: `${s.title}: `, bold: true }),
            new TextRun({ text: s.uri, color: "0000FF" })
          ],
          spacing: { after: 120 }
        }))
      ],
    }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${result.request.topic.replace(/\s+/g, '_')}.docx`);
};
