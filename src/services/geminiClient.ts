import { GoogleGenAI } from '@google/genai';
import { DiagramState } from '../types/diagram';
import { validateDiagramResponse } from '../utils/schemaValidate';

const SYSTEM_INSTRUCTION = `You are a diagram-generation engine embedded in a voice-to-diagram app. Given a spoken transcript describing a process, system, or set of ideas, and the CURRENT diagram state as JSON context, output ONLY valid JSON (no markdown fences, no prose) matching exactly this schema:
{ "diagramType": "flowchart"|"mindmap"|"sequence"|"erd"|"orgchart"|"network"|"gantt", "nodes": [{"id": string, "label": string, "type": "start"|"process"|"decision"|"end"|"default", "description": string, "x": number, "y": number}], "edges": [{"id": string, "source": string, "target": string, "label": string}] }
Rules: (1) MERGE with the existing diagram provided as context — reuse existing node IDs for concepts already mentioned, only add genuinely new nodes/edges — UNLESS the user's transcript explicitly says 'start over' or 'clear diagram', in which case return a fresh diagram containing only what's newly described. (2) Never fabricate nodes not implied by the transcript. (3) If the transcript is too short or ambiguous to extract any diagram structure, return exactly {"clarify": "<a short clarifying question to ask the user>"} instead of the normal schema. (4) Keep node labels concise (2-6 words). (5) Respect the diagramType hint if one is provided in the request context, otherwise infer the most fitting type.`;

export async function generateDiagramUpdate(
  transcriptChunk: string,
  currentDiagram: DiagramState,
  apiKey: string,
  modelName: 'flash' | 'pro' = 'flash',
  diagramTypeHint?: string
): Promise<DiagramState | { clarify: string }> {
  if (!apiKey) {
    throw new Error('Gemini API key is missing. Please enter your API key in settings.');
  }

  const ai = new GoogleGenAI({ apiKey });
  const model = modelName === 'pro' ? 'gemini-2.5-pro' : 'gemini-3.8-flash';

  const prompt = `Current Diagram State JSON: ${JSON.stringify(currentDiagram)}
${diagramTypeHint ? `Diagram Type Hint: ${diagramTypeHint}` : ''}
New Spoken Transcript Chunk: "${transcriptChunk}"`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        temperature: 0.2,
      }
    });

    const text = response.text;
    if (!text) throw new Error('Empty response from Gemini');

    let parsed: any;
    try {
      parsed = JSON.parse(text);
    } catch (e) {
      // Try stripping markdown fences if any
      const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
      parsed = JSON.parse(cleaned);
    }

    const validated = validateDiagramResponse(parsed);
    if (!validated) {
      throw new Error('AI response did not match expected diagram schema.');
    }

    return validated;
  } catch (error: any) {
    console.error('Gemini API generation error:', error);
    throw error;
  }
}

export async function expandNodeAI(
  nodeId: string,
  currentDiagram: DiagramState,
  apiKey: string,
  modelName: 'flash' | 'pro' = 'flash'
): Promise<DiagramState> {
  if (!apiKey) throw new Error('API key missing');

  const targetNode = currentDiagram.nodes.find(n => n.id === nodeId);
  if (!targetNode) throw new Error('Node not found');

  const ai = new GoogleGenAI({ apiKey });
  const model = modelName === 'pro' ? 'gemini-2.5-pro' : 'gemini-3.8-flash';

  const prompt = `Current Diagram: ${JSON.stringify(currentDiagram)}
Expand the specific node with ID "${targetNode.id}" (Label: "${targetNode.label}"). Generate 2-4 sub-nodes and connecting edges expanding on this node's concept, merging into the existing diagram JSON schema. Output ONLY valid JSON.`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: 'application/json',
      temperature: 0.3,
    }
  });

  const text = response.text || '';
  const parsed = JSON.parse(text.replace(/```json/g, '').replace(/```/g, '').trim());
  const validated = validateDiagramResponse(parsed);
  if (!validated || 'clarify' in validated) {
    throw new Error('Failed to expand node');
  }
  return validated;
}

export interface DiagramInsightResult {
  missingConnections: { title: string; description: string; suggestedSource?: string; suggestedTarget?: string }[];
  logicErrors: { title: string; description: string; nodeId?: string }[];
  redundantNodes: { title: string; description: string; nodeId?: string }[];
  recommendations: string[];
}

export async function analyzeDiagramInsights(
  currentDiagram: DiagramState,
  apiKey: string,
  modelName: 'flash' | 'pro' = 'flash'
): Promise<DiagramInsightResult> {
  if (!apiKey) throw new Error('Gemini API key is missing. Please enter your API key in settings.');

  const ai = new GoogleGenAI({ apiKey });
  const model = modelName === 'pro' ? 'gemini-2.5-pro' : 'gemini-3.8-flash';

  const systemInstruction = `You are an expert systems architect and diagram analyst. Analyze the provided diagram JSON and return ONLY valid JSON matching this exact schema:
{
  "missingConnections": [{"title": string, "description": string, "suggestedSource": string, "suggestedTarget": string}],
  "logicErrors": [{"title": string, "description": string, "nodeId": string}],
  "redundantNodes": [{"title": string, "description": string, "nodeId": string}],
  "recommendations": [string]
}`;

  const prompt = `Diagram State: ${JSON.stringify(currentDiagram)}`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      systemInstruction,
      responseMimeType: 'application/json',
      temperature: 0.3,
    }
  });

  const text = response.text || '';
  try {
    return JSON.parse(text);
  } catch (e) {
    const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned);
  }
}

export function getSampleDiagram(): DiagramState {
  return {
    diagramType: 'flowchart',
    nodes: [
      { id: 'n1', label: 'User Opens App', type: 'start', description: 'Landing page or login screen', x: 100, y: 150 },
      { id: 'n2', label: 'Enter Credentials', type: 'process', description: 'User inputs email and password', x: 350, y: 150 },
      { id: 'n3', label: 'Valid Credentials?', type: 'decision', description: 'Check against database', x: 600, y: 150 },
      { id: 'n4', label: 'Show Error Message', type: 'end', description: 'Access denied, try again', x: 600, y: 350 },
      { id: 'n5', label: 'Dashboard Load', type: 'end', description: 'Welcome user to main workspace', x: 850, y: 150 },
    ],
    edges: [
      { id: 'e1', source: 'n1', target: 'n2', label: 'Navigates' },
      { id: 'e2', source: 'n2', target: 'n3', label: 'Submits' },
      { id: 'e3', source: 'n3', target: 'n4', label: 'No' },
      { id: 'e4', source: 'n3', target: 'n5', label: 'Yes' },
    ],
  };
}
