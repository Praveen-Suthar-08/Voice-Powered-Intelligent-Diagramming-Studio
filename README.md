# Voice-Powered Intelligent Diagramming Studio

**Made by Praveen Suthar**

An enterprise-grade, real-time AI-powered diagramming and visual architecture application that transforms voice commands, speech notes, and text prompts into interactive diagrams, flowcharts, system architectures, mind maps, and sequence diagrams instantly.

---

## 🚀 Key Features

1. **Voice-Powered Diagram Generation**:
   - Speak your architecture or diagram requirements using Web Speech API integration.
   - Powered by Google Gemini AI models to intelligently parse voice inputs, generate structured nodes/edges, and build layouts automatically.

2. **Interactive Diagramming Canvas**:
   - Built with React Flow and customized with glassmorphic nodes, glowing connection edges, minimap, controls, and snap-to-grid capabilities.
   - Multi-diagram support: Flowcharts, System Architecture, Sequence Diagrams, Mind Maps, Entity-Relationship (ER) Diagrams, and Org Charts.

3. **Advanced Export & Share Center**:
   - Dedicated modal supporting **High-Res PNG** raster export, **Vector SVG** graphics export, and **Document PDF** exports.
   - Export Mermaid.js markup, structured JSON project backups, shareable URL states with compression, and WCAG-compliant accessibility alt-text / ARIA descriptions.

4. **Keyboard Shortcuts & Quick Start Guide**:
   - Comprehensive interactive quick-start walkthrough modal for onboarding new users.
   - Global keyboard shortcuts modal (`?` key or top nav button) listing all shortcuts (`Ctrl+Z` Undo, `Ctrl+Y` Redo, `Ctrl+S` Snapshot, `Ctrl+E` Export, etc.).

5. **Local Persistence & Timeline History**:
   - Save, load, and manage multiple projects and snapshots locally with robust persistence.
   - Timeline snapshot manager to review and revert workspace states across editing sessions.

---

## 🏗️ Architecture

- **Frontend Framework**: React 18 + TypeScript + Vite for lightning-fast bundling and execution.
- **Styling**: Tailwind CSS with custom glassmorphism, glowing gradients, and responsive animations.
- **Diagram Engine**: React Flow for node-based graph rendering and interactive manipulation.
- **AI Integration**: `@google/genai` TypeScript SDK for Gemini model inference and structured JSON response parsing.
- **Export Engines**: `html-to-image` for PNG/SVG and `jspdf` for document PDF generation.
- **State Management**: Zustand stores for diagram state, voice recognition, and user settings.

---

## 🛠️ Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Run development server:
   ```bash
   npm run dev
   ```
3. Build for production:
   ```bash
   npm run build
   ```

---

## 👤 Author

**Praveen Suthar**
