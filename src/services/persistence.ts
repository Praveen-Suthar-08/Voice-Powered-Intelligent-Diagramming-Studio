import { openDB } from 'idb';
import { ProjectRecord, DiagramType, DiagramNode, DiagramEdge } from '../types/diagram';

const DB_NAME = 'voicediagram-db';
const STORE_NAME = 'projects';
const ACTIVE_KEY = 'last_active_project_id';

export interface SnapshotRecord {
  id: string;
  projectId: string;
  projectName: string;
  dataUrl: string;
  createdAt: number;
}

export interface VersionRecord {
  id: string;
  projectId: string;
  projectName: string;
  versionName: string;
  diagramType: DiagramType;
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  createdAt: number;
}

export async function initDB() {
  return openDB(DB_NAME, 3, {
    upgrade(db, oldVersion) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('snapshots')) {
        db.createObjectStore('snapshots', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('versions')) {
        db.createObjectStore('versions', { keyPath: 'id' });
      }
    },
  });
}

export async function saveProject(project: ProjectRecord): Promise<void> {
  const db = await initDB();
  await db.put(STORE_NAME, { ...project, updatedAt: Date.now() });
  localStorage.setItem(ACTIVE_KEY, project.id);
}

export async function loadProject(id: string): Promise<ProjectRecord | undefined> {
  const db = await initDB();
  return db.get(STORE_NAME, id);
}

export async function listProjects(): Promise<ProjectRecord[]> {
  const db = await initDB();
  return db.getAll(STORE_NAME);
}

export async function deleteProject(id: string): Promise<void> {
  const db = await initDB();
  await db.delete(STORE_NAME, id);
  const activeId = localStorage.getItem(ACTIVE_KEY);
  if (activeId === id) {
    localStorage.removeItem(ACTIVE_KEY);
  }
}

export async function getLastActiveProject(): Promise<ProjectRecord | undefined> {
  const activeId = localStorage.getItem(ACTIVE_KEY);
  if (!activeId) return undefined;
  return loadProject(activeId);
}

export async function saveSnapshot(snapshot: SnapshotRecord): Promise<void> {
  const db = await initDB();
  await db.put('snapshots', snapshot);
}

export async function listSnapshots(): Promise<SnapshotRecord[]> {
  const db = await initDB();
  return db.getAll('snapshots');
}

export async function deleteSnapshot(id: string): Promise<void> {
  const db = await initDB();
  await db.delete('snapshots', id);
}

export async function saveVersion(version: VersionRecord): Promise<void> {
  const db = await initDB();
  await db.put('versions', version);
}

export async function listVersions(projectId?: string): Promise<VersionRecord[]> {
  const db = await initDB();
  const all: VersionRecord[] = await db.getAll('versions');
  if (projectId) {
    return all.filter(v => v.projectId === projectId);
  }
  return all;
}

export async function deleteVersion(id: string): Promise<void> {
  const db = await initDB();
  await db.delete('versions', id);
}
