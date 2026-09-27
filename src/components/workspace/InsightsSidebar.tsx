import React, { useState } from 'react';
import { Sparkles, AlertTriangle, Link2, Trash2, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';
import { useDiagramStore } from '../../store/diagramStore';
import { useSettingsStore } from '../../store/settingsStore';
import { analyzeDiagramInsights, DiagramInsightResult } from '../../services/geminiClient';

interface InsightsSidebarProps {
  onShowToast: (msg: string, type?: 'info' | 'success' | 'error') => void;
}

export const InsightsSidebar: React.FC<InsightsSidebarProps> = ({ onShowToast }) => {
  const { diagramType, nodes, edges, selectNode, addEdge } = useDiagramStore();
  const { apiKey, model } = useSettingsStore();

  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<DiagramInsightResult | null>(null);

  const handleRunAnalysis = async () => {
    if (!apiKey) {
      onShowToast('Please enter your Gemini API key in settings.', 'error');
      return;
    }

    setLoading(true);
    try {
      const result = await analyzeDiagramInsights({ diagramType, nodes, edges }, apiKey, model);
      setInsights(result);
      onShowToast('Diagram insights generated successfully!', 'success');
    } catch (e: any) {
      console.error(e);
      onShowToast(e.message || 'Failed to analyze diagram', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMissingConnection = (source?: string, target?: string) => {
    if (!source || !target) {
      onShowToast('Source or target node not specified', 'info');
      return;
    }
    const newEdge = {
      id: 'e_' + Math.random().toString(36).substring(2, 9),
      source,
      target,
      label: 'Connected',
    };
    addEdge(newEdge);
    onShowToast('Missing connection added to diagram!', 'success');
  };

  const handleSelectNode = (nodeId?: string) => {
    if (!nodeId) return;
    selectNode(nodeId);
    onShowToast(`Selected node ID: ${nodeId}`, 'info');
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto p-4 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div>
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Sparkles size={16} className="text-purple-400" /> Diagram Insights
          </h3>
          <p className="text-[11px] text-white/60">Gemini-powered graph & logic audit</p>
        </div>
        <button
          onClick={handleRunAnalysis}
          disabled={loading}
          className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-medium flex items-center gap-1.5 transition-all shadow-md"
        >
          {loading ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
          {loading ? 'Analyzing...' : 'Run Audit'}
        </button>
      </div>

      {!insights && !loading && (
        <div className="flex flex-col items-center justify-center flex-1 text-center p-6 space-y-3 bg-white/5 rounded-2xl border border-white/10">
          <div className="w-12 h-12 rounded-2xl bg-purple-600/20 text-purple-400 flex items-center justify-center">
            <Sparkles size={24} />
          </div>
          <p className="text-xs text-white/80 font-medium">Ready to inspect your architecture</p>
          <p className="text-[11px] text-white/50">Run an AI audit to detect missing links, logical inconsistencies, and optimization opportunities.</p>
          <button
            onClick={handleRunAnalysis}
            className="mt-2 px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-semibold hover:bg-purple-500 transition-all shadow-lg"
          >
            Run AI Analysis Now
          </button>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center flex-1 py-12 space-y-3">
          <Loader2 size={28} className="text-purple-400 animate-spin" />
          <span className="text-xs text-white/70 animate-pulse">Analyzing graph topology & logic...</span>
        </div>
      )}

      {insights && !loading && (
        <div className="space-y-4 text-xs">
          {/* Missing Connections */}
          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
              <Link2 size={13} /> Missing Connections ({insights.missingConnections?.length || 0})
            </span>
            {insights.missingConnections?.length === 0 ? (
              <p className="text-[11px] text-white/50 p-2.5 rounded-xl bg-white/5">No missing connections detected.</p>
            ) : (
              insights.missingConnections?.map((item, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-2">
                  <div className="font-semibold text-white/90">{item.title}</div>
                  <div className="text-[11px] text-white/60">{item.description}</div>
                  {item.suggestedSource && item.suggestedTarget && (
                    <button
                      onClick={() => handleAddMissingConnection(item.suggestedSource, item.suggestedTarget)}
                      className="px-2.5 py-1 rounded-lg bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-200 text-[10px] font-medium flex items-center gap-1 transition-colors"
                    >
                      <ArrowRight size={11} /> Connect Nodes
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Logic Errors */}
          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle size={13} /> Potential Logic Errors ({insights.logicErrors?.length || 0})
            </span>
            {insights.logicErrors?.length === 0 ? (
              <p className="text-[11px] text-white/50 p-2.5 rounded-xl bg-white/5">No logic errors detected.</p>
            ) : (
              insights.logicErrors?.map((item, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 space-y-2">
                  <div className="font-semibold text-rose-200">{item.title}</div>
                  <div className="text-[11px] text-white/70">{item.description}</div>
                  {item.nodeId && (
                    <button
                      onClick={() => handleSelectNode(item.nodeId)}
                      className="px-2.5 py-1 rounded-lg bg-rose-600/30 hover:bg-rose-600/50 text-rose-200 text-[10px] font-medium transition-colors"
                    >
                      Inspect Node
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Redundant Nodes */}
          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Trash2 size={13} /> Redundant Nodes ({insights.redundantNodes?.length || 0})
            </span>
            {insights.redundantNodes?.length === 0 ? (
              <p className="text-[11px] text-white/50 p-2.5 rounded-xl bg-white/5">No redundant nodes detected.</p>
            ) : (
              insights.redundantNodes?.map((item, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-2">
                  <div className="font-semibold text-amber-200">{item.title}</div>
                  <div className="text-[11px] text-white/70">{item.description}</div>
                  {item.nodeId && (
                    <button
                      onClick={() => handleSelectNode(item.nodeId)}
                      className="px-2.5 py-1 rounded-lg bg-amber-600/30 hover:bg-amber-600/50 text-amber-200 text-[10px] font-medium transition-colors"
                    >
                      Inspect Node
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Recommendations */}
          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 size={13} /> AI Recommendations
            </span>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-2">
              {insights.recommendations?.map((rec, idx) => (
                <div key={idx} className="flex items-start gap-2 text-white/80">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
