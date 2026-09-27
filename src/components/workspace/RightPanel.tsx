import React from 'react';
import { X, Sparkles, Trash2, Palette } from 'lucide-react';
import { useDiagramStore } from '../../store/diagramStore';
import { useSettingsStore } from '../../store/settingsStore';
import { expandNodeAI } from '../../services/geminiClient';
import { NodeType } from '../../types/diagram';

const COLOR_SWATCHES = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export const RightPanel: React.FC<{ onShowToast: (msg: string, type?: 'info' | 'success' | 'error') => void }> = ({ onShowToast }) => {
  const { nodes, selectedNodeId, selectNode, updateNode, deleteNode, mergeFromAI, diagramType, edges } = useDiagramStore();
  const { apiKey, model } = useSettingsStore();

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  if (!selectedNode) return null;

  const handleExpandAI = async () => {
    if (!apiKey) {
      onShowToast('Please enter your Gemini API key in settings.', 'error');
      return;
    }
    onShowToast('AI is expanding this node...', 'info');
    try {
      const result = await expandNodeAI(selectedNode.id, { diagramType, nodes, edges }, apiKey, model);
      if (!('clarify' in result)) {
        mergeFromAI(result);
        onShowToast('Node expanded successfully!', 'success');
      }
    } catch (e: any) {
      onShowToast(e.message || 'Failed to expand node', 'error');
    }
  };

  return (
    <div className="absolute right-0 top-14 bottom-8 w-80 liquid-glass border-l border-white/10 z-20 p-5 flex flex-col gap-5 shadow-2xl animate-fade-up">
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <h3 className="text-sm font-medium text-white">Edit Node</h3>
        <button
          onClick={() => selectNode(null)}
          className="text-white/60 hover:text-white transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      <div className="space-y-4 flex-1 overflow-y-auto">
        {/* Title Input */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-white/70">Node Title</label>
          <input
            type="text"
            value={selectedNode.label}
            onChange={(e) => updateNode(selectedNode.id, { label: e.target.value })}
            className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Description Textarea */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-white/70">Description</label>
          <textarea
            value={selectedNode.description || ''}
            onChange={(e) => updateNode(selectedNode.id, { description: e.target.value })}
            rows={3}
            placeholder="Add node details..."
            className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-blue-500 resize-none"
          />
        </div>

        {/* Node Type Selector */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-white/70">Node Type</label>
          <div className="grid grid-cols-3 gap-1.5 bg-white/5 p-1 rounded-xl border border-white/10">
            {(['start', 'process', 'decision', 'end', 'default'] as NodeType[]).map((t) => (
              <button
                key={t}
                onClick={() => updateNode(selectedNode.id, { type: t })}
                className={`py-1.5 rounded-lg text-[10px] font-medium capitalize transition-all ${
                  selectedNode.type === t ? 'bg-blue-700 text-white shadow' : 'text-white/70 hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Color Swatches */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-medium text-white/70">
            <Palette size={14} className="text-blue-400" /> Accent Color
          </label>
          <div className="flex gap-2">
            {COLOR_SWATCHES.map((color) => (
              <button
                key={color}
                onClick={() => updateNode(selectedNode.id, { color })}
                style={{ backgroundColor: color }}
                className={`w-6 h-6 rounded-full transition-transform hover:scale-110 ${
                  selectedNode.color === color ? 'ring-2 ring-white' : ''
                }`}
              />
            ))}
          </div>
        </div>

        {/* Ask AI to Expand */}
        <button
          onClick={handleExpandAI}
          className="w-full py-2.5 rounded-xl bg-blue-700 text-white text-xs font-medium flex items-center justify-center gap-2 hover:bg-blue-600 transition-transform duration-200 hover:scale-105 active:scale-95 shadow-lg shadow-blue-700/30"
        >
          <Sparkles size={14} /> Ask AI to Expand Node
        </button>
      </div>

      {/* Delete Node */}
      <div className="pt-3 border-t border-white/10">
        <button
          onClick={() => deleteNode(selectedNode.id)}
          className="w-full py-2 rounded-xl bg-rose-500/10 text-rose-400 text-xs font-medium flex items-center justify-center gap-2 hover:bg-rose-500/20 transition-colors"
        >
          <Trash2 size={14} /> Delete Node
        </button>
      </div>
    </div>
  );
};
