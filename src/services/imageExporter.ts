import { toPng, toSvg } from 'html-to-image';
import { jsPDF } from 'jspdf';
import LZString from 'lz-string';
import { DiagramState } from '../types/diagram';

export async function captureCanvasDataUrl(element: HTMLElement): Promise<string> {
  return await toPng(element, { 
    cacheBust: true, 
    backgroundColor: '#0a0a0c',
    skipFonts: true,
    filter: (node) => {
      if (node.tagName === 'LINK' && node.getAttribute('rel') === 'stylesheet') {
        const href = node.getAttribute('href') || '';
        if (href.includes('onlinewebfonts') || href.includes('fonts.googleapis.com')) return false;
      }
      return true;
    }
  });
}

export async function exportToPng(element: HTMLElement, filename = 'voicediagram.png') {
  try {
    const dataUrl = await captureCanvasDataUrl(element);
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    link.click();
  } catch (e) {
    console.error('PNG export failed', e);
    throw e;
  }
}

export async function exportToSvg(element: HTMLElement, filename = 'voicediagram.svg') {
  try {
    const dataUrl = await toSvg(element, { 
      cacheBust: true,
      skipFonts: true,
      filter: (node) => {
        if (node.tagName === 'LINK' && node.getAttribute('rel') === 'stylesheet') {
          const href = node.getAttribute('href') || '';
          if (href.includes('onlinewebfonts') || href.includes('fonts.googleapis.com')) return false;
        }
        return true;
      }
    });
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    link.click();
  } catch (e) {
    console.error('SVG export failed', e);
    throw e;
  }
}

export async function exportToPdf(element: HTMLElement, filename = 'voicediagram.pdf') {
  try {
    const dataUrl = await toPng(element, { 
      cacheBust: true, 
      backgroundColor: '#0a0a0c',
      skipFonts: true,
      filter: (node) => {
        if (node.tagName === 'LINK' && node.getAttribute('rel') === 'stylesheet') {
          const href = node.getAttribute('href') || '';
          if (href.includes('onlinewebfonts') || href.includes('fonts.googleapis.com')) return false;
        }
        return true;
      }
    });
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [1200, 800] });
    pdf.addImage(dataUrl, 'PNG', 0, 0, 1200, 800);
    pdf.save(filename);
  } catch (e) {
    console.error('PDF export failed', e);
    throw e;
  }
}

export function exportToJson(state: { projectName: string; diagramType: string; nodes: any[]; edges: any[] }) {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `${state.projectName.toLowerCase().replace(/\s+/g, '_')}_diagram.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function generateShareUrl(state: DiagramState & { projectName: string }): string {
  const json = JSON.stringify(state);
  const compressed = LZString.compressToEncodedURIComponent(json);
  const url = new URL(window.location.href);
  url.searchParams.set('d', compressed);
  return url.toString();
}

export function decodeShareUrl(): (DiagramState & { projectName?: string }) | null {
  const params = new URLSearchParams(window.location.search);
  const compressed = params.get('d');
  if (!compressed) return null;
  try {
    const json = LZString.decompressFromEncodedURIComponent(compressed);
    if (!json) return null;
    return JSON.parse(json);
  } catch (e) {
    console.error('Failed to decode share URL', e);
    return null;
  }
}
