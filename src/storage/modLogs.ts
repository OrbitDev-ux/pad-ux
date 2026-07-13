import { readFile, writeFile, getAll } from './fileDb.js';
import { randomUUID } from 'crypto';

// ── 제재 로그 ─────────────────────────────────────────────────────
const MOD_FILE = 'mod_logs';

export type ModAction = 'WARN' | 'TIMEOUT' | 'KICK' | 'BAN' | 'UNBAN';

export interface ModLog {
  id: string;
  guildId: string;
  targetId: string;
  moderatorId: string;
  action: ModAction;
  reason: string;
  createdAt: string;
}

export function addModLog(data: Omit<ModLog, 'id' | 'createdAt'>): ModLog {
  const log: ModLog = { ...data, id: randomUUID(), createdAt: new Date().toISOString() };
  const all = readFile<Record<string, ModLog>>(MOD_FILE);
  all[log.id] = log;
  writeFile(MOD_FILE, all);
  return log;
}

export function getModLogs(guildId: string, targetId?: string): ModLog[] {
  return getAll<ModLog>(MOD_FILE)
    .filter((l) => l.guildId === guildId && (!targetId || l.targetId === targetId))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

// ── 경고 ─────────────────────────────────────────────────────────
const WARN_FILE = 'warnings';

export interface Warning {
  id: string;
  guildId: string;
  targetId: string;
  moderatorId: string;
  reason: string;
  active: boolean;
  createdAt: string;
}

export function addWarning(data: Omit<Warning, 'id' | 'active' | 'createdAt'>): Warning {
  const warning: Warning = { ...data, id: randomUUID(), active: true, createdAt: new Date().toISOString() };
  const all = readFile<Record<string, Warning>>(WARN_FILE);
  all[warning.id] = warning;
  writeFile(WARN_FILE, all);
  return warning;
}

export function countWarnings(guildId: string, targetId: string): number {
  return getAll<Warning>(WARN_FILE).filter(
    (w) => w.guildId === guildId && w.targetId === targetId && w.active,
  ).length;
}

export function getWarnings(guildId: string, targetId: string): Warning[] {
  return getAll<Warning>(WARN_FILE).filter(
    (w) => w.guildId === guildId && w.targetId === targetId && w.active,
  );
}
