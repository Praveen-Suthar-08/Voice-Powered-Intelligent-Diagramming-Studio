import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { 
  Play, CheckCircle, HelpCircle, Square, Circle, 
  Database, User, Users, Server, Cloud, Cpu, Shield, Lock, 
  Settings, Globe, Key, Terminal, HardDrive, Layers, Workflow, 
  FileText, Mail, ShoppingBag, CreditCard, Zap,
  CloudLightning, CloudCog, ShieldAlert, ShieldCheck, UserCheck, 
  UserPlus, UserCog, Fingerprint, Activity, Network, Boxes, FileCode
} from 'lucide-react';
import { NodeType, DiagramTheme } from '../../types/diagram';
import { useDiagramStore } from '../../store/diagramStore';

interface CustomNodeData {
  label: string;
  type: NodeType;
  description?: string;
  color?: string;
}

export const CustomNode = memo(({ id, data }: { id: string; data: CustomNodeData }) => {
  const theme = useDiagramStore((s) => s.theme);

  const getBorderColor = () => {
    if (data.color) return data.color;
    switch (data.type) {
      case 'start': return '#10b981';
      case 'process': return '#3b82f6';
      case 'decision': return '#f59e0b';
      case 'end': return '#ef4444';
      default: return theme === 'corporate-light' ? '#64748b' : 'rgba(255,255,255,0.4)';
    }
  };

  const getIcon = () => {
    const labelLower = (data.label || '').toLowerCase();
    const descLower = (data.description || '').toLowerCase();
    const text = `${labelLower} ${descLower}`;

    // Security & Firewalls
    if (text.includes('firewall') || text.includes('security') || text.includes('guard') || text.includes('protect')) {
      return <ShieldAlert size={15} className="text-amber-400" />;
    }
    if (text.includes('auth') || text.includes('login') || text.includes('credential') || text.includes('token') || text.includes('oauth')) {
      return <Lock size={15} className="text-amber-300" />;
    }
    if (text.includes('key') || text.includes('secret') || text.includes('cert') || text.includes('ssl')) {
      return <Key size={15} className="text-yellow-400" />;
    }
    if (text.includes('fingerprint') || text.includes('biometric') || text.includes('identity')) {
      return <Fingerprint size={15} className="text-orange-400" />;
    }

    // Cloud Services & Infrastructure
    if (text.includes('aws') || text.includes('gcp') || text.includes('azure') || text.includes('cloud') || text.includes('lambda') || text.includes('serverless')) {
      return <CloudCog size={15} className="text-sky-400" />;
    }
    if (text.includes('cluster') || text.includes('kubernetes') || text.includes('k8s') || text.includes('docker') || text.includes('container') || text.includes('box')) {
      return <Boxes size={15} className="text-blue-400" />;
    }
    if (text.includes('compute') || text.includes('cpu') || text.includes('processor') || text.includes('worker')) {
      return <Cpu size={15} className="text-purple-400" />;
    }
    if (text.includes('storage') || text.includes('s3') || text.includes('bucket') || text.includes('disk') || text.includes('drive')) {
      return <HardDrive size={15} className="text-indigo-400" />;
    }

    // User Personas & Avatars
    if (text.includes('users') || text.includes('team') || text.includes('group') || text.includes('audience') || text.includes('people')) {
      return <Users size={15} className="text-blue-400" />;
    }
    if (text.includes('admin') || text.includes('manager') || text.includes('moderator') || text.includes('supervisor')) {
      return <UserCog size={15} className="text-cyan-400" />;
    }
    if (text.includes('customer') || text.includes('client') || text.includes('user') || text.includes('person') || text.includes('profile')) {
      return <UserCheck size={15} className="text-emerald-400" />;
    }

    // Databases & Data
    if (text.includes('database') || text.includes('db') || text.includes('sql') || text.includes('mongo') || text.includes('redis') || text.includes('postgres')) {
      return <Database size={15} className="text-emerald-400" />;
    }

    // Servers & APIs
    if (text.includes('server') || text.includes('backend') || text.includes('api') || text.includes('service') || text.includes('gateway')) {
      return <Server size={15} className="text-cyan-400" />;
    }

    // Network & Web
    if (text.includes('network') || text.includes('web') || text.includes('internet') || text.includes('http') || text.includes('url') || text.includes('router')) {
      return <Network size={15} className="text-indigo-400" />;
    }

    // Code & Terminal
    if (text.includes('terminal') || text.includes('code') || text.includes('script') || text.includes('command') || text.includes('dev')) {
      return <Terminal size={15} className="text-emerald-300" />;
    }

    // Payments
    if (text.includes('payment') || text.includes('card') || text.includes('billing') || text.includes('money') || text.includes('stripe')) {
      return <CreditCard size={15} className="text-emerald-400" />;
    }

    if (text.includes('settings') || text.includes('config') || text.includes('setup')) {
      return <Settings size={15} className="text-purple-400" />;
    }

    // Fallback to type-based icons
    switch (data.type) {
      case 'start': return <Play size={14} className="text-emerald-400" />;
      case 'end': return <CheckCircle size={14} className="text-rose-400" />;
      case 'decision': return <HelpCircle size={14} className="text-amber-400" />;
      case 'process': return <Square size={14} className="text-blue-400" />;
      default: return <Circle size={14} className="opacity-60" />;
    }
  };

  const getThemeStyles = () => {
    switch (theme) {
      case 'corporate-light':
        return {
          card: 'bg-white border-slate-200 text-slate-800 shadow-lg',
          textMain: 'text-slate-900',
          textDesc: 'text-slate-500',
          iconBg: 'bg-slate-100',
          handle: '!bg-blue-600 !border-2 !border-white',
        };
      case 'blueprint':
        return {
          card: 'bg-[#153e6b] border-blue-400/40 text-cyan-100 shadow-md',
          textMain: 'text-cyan-100',
          textDesc: 'text-cyan-300/70',
          iconBg: 'bg-blue-900/40',
          handle: '!bg-cyan-400 !border-2 !border-[#0e2a47]',
        };
      case 'cyberpunk':
        return {
          card: 'bg-[#1e103f] border-pink-500/40 text-pink-100 shadow-md',
          textMain: 'text-pink-100',
          textDesc: 'text-pink-300/70',
          iconBg: 'bg-purple-900/40',
          handle: '!bg-pink-500 !border-2 !border-[#120826]',
        };
      case 'neon-glow':
        return {
          card: 'bg-[#0f0f17] border-emerald-500/50 text-emerald-100 shadow-[0_0_15px_rgba(16,185,129,0.2)]',
          textMain: 'text-emerald-100',
          textDesc: 'text-emerald-300/70',
          iconBg: 'bg-emerald-950/50',
          handle: '!bg-emerald-400 !border-2 !border-[#050508]',
        };
      case 'minimalist-dark':
      default:
        return {
          card: 'liquid-glass bg-white/5 border-white/10 text-white shadow-xl',
          textMain: 'text-white',
          textDesc: 'text-white/60',
          iconBg: 'bg-white/5',
          handle: '!bg-blue-500 !border-2 !border-[#0a0a0c]',
        };
    }
  };

  const styles = getThemeStyles();

  return (
    <div
      style={{ borderLeftColor: getBorderColor(), borderLeftWidth: '4px' }}
      className={`rounded-xl p-3.5 min-w-[180px] max-w-[240px] border transition-transform hover:scale-105 ${styles.card} relative`}
    >
      <Handle type="target" position={Position.Top} className={`!w-3 !h-3 ${styles.handle}`} />
      <Handle type="target" position={Position.Top} id="top-target" className={`!w-3 !h-3 ${styles.handle}`} />
      <Handle type="source" position={Position.Top} id="top-source" className={`!w-3 !h-3 ${styles.handle}`} />

      <div className="flex items-start justify-between gap-2 mb-1">
        <span className={`text-xs font-medium leading-tight ${styles.textMain}`}>{data.label}</span>
        <div className={`p-1.5 rounded-lg ${styles.iconBg} flex items-center justify-center shrink-0`}>{getIcon()}</div>
      </div>

      {data.description && (
        <p className={`text-[10px] line-clamp-2 mt-1 ${styles.textDesc}`}>{data.description}</p>
      )}

      <Handle type="source" position={Position.Bottom} className={`!w-3 !h-3 ${styles.handle}`} />
      <Handle type="target" position={Position.Bottom} id="bottom-target" className={`!w-3 !h-3 ${styles.handle}`} />
      <Handle type="source" position={Position.Bottom} id="bottom-source" className={`!w-3 !h-3 ${styles.handle}`} />
      <Handle type="target" position={Position.Left} id="left-target" className={`!w-3 !h-3 ${styles.handle}`} />
      <Handle type="source" position={Position.Left} id="left-source" className={`!w-3 !h-3 ${styles.handle}`} />
      <Handle type="target" position={Position.Right} id="right-target" className={`!w-3 !h-3 ${styles.handle}`} />
      <Handle type="source" position={Position.Right} id="right-source" className={`!w-3 !h-3 ${styles.handle}`} />
    </div>
  );
});
