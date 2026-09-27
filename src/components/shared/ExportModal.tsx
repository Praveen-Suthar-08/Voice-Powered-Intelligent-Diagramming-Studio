import React, { useState } from 'react';
import { X, Copy, Download, Check, Code, FileJson, Share2, Volume2, FileImage, FileCode, FileText, Sparkles } from 'lucide-react';
import { useDiagramStore } from '../../store/diagramStore';
import { generateMermaid } from '../../services/mermaidExporter';
import { exportToJson, generateShareUrl, exportToPng, exportToSvg, exportToPdf } from '../../services/imageExporter';
import { generateDiagramAltText } from '../../services/altTextGenerator';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (msg: string, type?: 'info' | 'success' | 'error') => void;
  canvasRef: React.RefObject<HTMLDivElement | null>;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, onShowToast, canvasRef }) => {
  const { diagramType, nodes, edges, projectName } = useDiagramStore();
  const [activeTab, setActiveTab] = useState<'visual' | 'mermaid' | 'json' | 'share' | 'alttext'>('visual');
  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const mermaidCode = generateMermaid(diagramType, nodes, edges);
  const shareUrl = generateShareUrl({ diagramType, nodes, edges, projectName });
  const altTextData = generateDiagramAltText(diagramType, projectName, nodes, edges);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    onShowToast('Copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVisualExport = async (type: 'png' | 'svg' | 'pdf') => {
    if (!canvasRef.current) {
      onShowToast('Canvas element not found', 'error');
      return;
    }
    setIsExporting(true);
    const sanitizedName = projectName.toLowerCase().replace(/\s+/g, '_') || 'voicediagram';
    try {
      if (type === 'png') {
        await exportToPng(canvasRef.current, `${sanitizedName}.png`);
        onShowToast('High-Res PNG exported successfully!', 'success');
      } else if (type === 'svg') {
        await exportToSvg(canvasRef.current, `${sanitizedName}.svg`);
        onShowToast('Vector SVG exported successfully!', 'success');
      } else if (type === 'pdf') {
        await exportToPdf(canvasRef.current, `${sanitizedName}.pdf`);
        onShowToast('Document PDF exported successfully!', 'success');
      }
      onClose();
    } catch (e: any) {
      onShowToast(`Export failed: ${e.message || 'Unknown error'}`, 'error');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-up">
      <div className="liquid-glass w-full max-w-xl rounded-3xl p-6 border border-white/20 shadow-2xl relative flex flex-col max-h-[85vh] bg-[#0e1017]/95 text-white">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-white/60 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="p-3 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
            <Sparkles size={22} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Export & Share Center</h2>
            <p className="text-xs text-white/60">Choose your format for {projectName || 'Diagram'}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-5 gap-1 bg-white/5 p-1 rounded-2xl border border-white/10 mb-5">
          <button
            onClick={() => setActiveTab('visual')}
            className={`py-2 px-1 rounded-xl text-[11px] font-semibold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'visual' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-white/70 hover:text-white'
            }`}
          >
            <Download size={13} /> Visual
          </button>
          <button
            onClick={() => setActiveTab('mermaid')}
            className={`py-2 px-1 rounded-xl text-[11px] font-semibold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'mermaid' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-white/70 hover:text-white'
            }`}
          >
            <Code size={13} /> Mermaid
          </button>
          <button
            onClick={() => setActiveTab('json')}
            className={`py-2 px-1 rounded-xl text-[11px] font-semibold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'json' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-white/70 hover:text-white'
            }`}
          >
            <FileJson size={13} /> JSON
          </button>
          <button
            onClick={() => setActiveTab('share')}
            className={`py-2 px-1 rounded-xl text-[11px] font-semibold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'share' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-white/70 hover:text-white'
            }`}
          >
            <Share2 size={13} /> Share
          </button>
          <button
            onClick={() => setActiveTab('alttext')}
            className={`py-2 px-1 rounded-xl text-[11px] font-semibold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'alttext' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-white/70 hover:text-white'
            }`}
          >
            <Volume2 size={13} /> Alt Text
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto mb-4 space-y-3 pr-1">
          {activeTab === 'visual' && (
            <div className="space-y-3">
              <p className="text-xs text-white/60 mb-2">Download high-definition image, vector graphics, or document exports directly from your current canvas view.</p>
              
              <div className="grid grid-cols-1 gap-3">
                <button
                  disabled={isExporting}
                  onClick={() => handleVisualExport('png')}
                  className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-between group transition-all hover:border-blue-500/50"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="p-3 rounded-xl bg-blue-600/20 text-blue-400 group-hover:scale-110 transition-transform">
                      <FileImage size={22} />
                    </div>
                    <div className="text-left">
                      <h4 className="text-sm font-semibold text-white">High-Res PNG Image</h4>
                      <p className="text-xs text-white/50">Lossless raster image for presentations and reports</p>
                    </div>
                  </div>
                  <Download size={18} className="text-white/40 group-hover:text-white transition-colors" />
                </button>

                <button
                  disabled={isExporting}
                  onClick={() => handleVisualExport('svg')}
                  className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-between group transition-all hover:border-cyan-500/50"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="p-3 rounded-xl bg-cyan-600/20 text-cyan-400 group-hover:scale-110 transition-transform">
                      <FileCode size={22} />
                    </div>
                    <div className="text-left">
                      <h4 className="text-sm font-semibold text-white">Vector SVG File</h4>
                      <p className="text-xs text-white/50">Infinite resolution vector graphics for editing</p>
                    </div>
                  </div>
                  <Download size={18} className="text-white/40 group-hover:text-white transition-colors" />
                </button>

                <button
                  disabled={isExporting}
                  onClick={() => handleVisualExport('pdf')}
                  className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-between group transition-all hover:border-rose-500/50"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="p-3 rounded-xl bg-rose-600/20 text-rose-400 group-hover:scale-110 transition-transform">
                      <FileText size={22} />
                    </div>
                    <div className="text-left">
                      <h4 className="text-sm font-semibold text-white">Document PDF</h4>
                      <p className="text-xs text-white/50">Landscape document export ready for printing & sharing</p>
                    </div>
                  </div>
                  <Download size={18} className="text-white/40 group-hover:text-white transition-colors" />
                </button>
              </div>
            </div>
          )}

          {activeTab === 'mermaid' && (
            <div className="space-y-3">
              <p className="text-xs text-white/60">Use this Mermaid markup in documentation, Notion, or Markdown viewers.</p>
              <pre className="p-4 rounded-2xl bg-black/50 border border-white/10 font-mono text-xs text-blue-300 overflow-x-auto whitespace-pre-wrap max-h-64">
                {mermaidCode}
              </pre>
              <button
                onClick={() => handleCopy(mermaidCode)}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                <span>{copied ? 'Copied to Clipboard' : 'Copy Mermaid Code'}</span>
              </button>
            </div>
          )}

          {activeTab === 'json' && (
            <div className="space-y-4">
              <p className="text-xs text-white/60">Download or backup your diagram as structured JSON data.</p>
              <button
                onClick={() => exportToJson({ projectName, diagramType, nodes, edges })}
                className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20"
              >
                <Download size={16} /> Download JSON Project File
              </button>
            </div>
          )}

          {activeTab === 'share' && (
            <div className="space-y-3">
              <p className="text-xs text-white/60">Anyone with this link can view and load your diagram instantly.</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="flex-1 px-3.5 py-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white/90 font-mono focus:outline-none"
                />
                <button
                  onClick={() => handleCopy(shareUrl)}
                  className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-lg shadow-blue-600/20 shrink-0"
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'alttext' && (
            <div className="space-y-4 text-xs">
              <div>
                <label className="text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5 block">Short Alt Text (Screen Readers)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={altTextData.shortAlt}
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white/90 font-mono focus:outline-none"
                  />
                  <button
                    onClick={() => handleCopy(altTextData.shortAlt)}
                    className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all text-xs font-medium flex items-center gap-1 shrink-0"
                  >
                    <Copy size={14} /> Copy
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5 block">ARIA Description (Accessibility)</label>
                <div className="flex gap-2">
                  <textarea
                    readOnly
                    rows={3}
                    value={altTextData.ariaDescription}
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white/90 font-mono focus:outline-none resize-none"
                  />
                  <button
                    onClick={() => handleCopy(altTextData.ariaDescription)}
                    className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all text-xs font-medium flex items-center gap-1 shrink-0 self-start"
                  >
                    <Copy size={14} /> Copy
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
