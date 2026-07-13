import { readFile, writeFile, getAll } from './fileDb.js';
import { randomUUID } from 'crypto';

const FILE = 'tickets';

export type TicketStatus = 'OPEN' | 'CLAIMED' | 'CLOSED';

export interface Ticket {
  id: string;
  guildId: string;
  channelId: string;
  creatorId: string;
  claimedBy: string | null;
  status: TicketStatus;
  subject: string | null;
  closedAt: string | null;
  closedBy: string | null;
  createdAt: string;
}

export function createTicket(data: Pick<Ticket, 'guildId' | 'channelId' | 'creatorId' | 'subject'>): Ticket {
  const ticket: Ticket = {
    ...data,
    id: randomUUID(),
    status: 'OPEN',
    claimedBy: null,
    closedAt: null,
    closedBy: null,
    createdAt: new Date().toISOString(),
  };
  const all = readFile<Record<string, Ticket>>(FILE);
  all[ticket.id] = ticket;
  writeFile(FILE, all);
  return ticket;
}

export function getTicket(id: string): Ticket | null {
  const all = readFile<Record<string, Ticket>>(FILE);
  return all[id] ?? null;
}

export function getTicketByChannel(channelId: string): Ticket | null {
  return getAll<Ticket>(FILE).find((t) => t.channelId === channelId) ?? null;
}

export function updateTicket(id: string, patch: Partial<Ticket>): Ticket | null {
  const all = readFile<Record<string, Ticket>>(FILE);
  if (!all[id]) return null;
  all[id] = { ...all[id], ...patch };
  writeFile(FILE, all);
  return all[id];
}

export function countOpenTickets(guildId: string, userId: string): number {
  return getAll<Ticket>(FILE).filter(
    (t) => t.guildId === guildId && t.creatorId === userId && t.status !== 'CLOSED',
  ).length;
}
