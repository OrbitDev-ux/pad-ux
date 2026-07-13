import { getOne, setOne } from './fileDb.js';

const FILE = 'guild_settings';

export interface GuildSettings {
  guildId: string;
  // 환영
  welcomeChannelId: string | null;
  welcomeMessage: string;
  autoRoleId: string | null;
  // 인증
  verifiedRoleId: string | null;
  unverifiedRoleId: string | null;
  verificationCaptcha: boolean;
  // 티켓
  ticketCategoryId: string | null;
  ticketStaffRoleId: string | null;
  ticketLogChannelId: string | null;
  ticketWelcomeMessage: string;
  ticketMaxPerUser: number;
  // 신고
  reportLogChannelId: string | null;
  // AutoMod
  autoMod: {
    enabled: boolean;
    badWords: string[];
    blockInvites: boolean;
  };
  // 로깅
  logging: {
    enabled: boolean;
    messageDeleteChannelId: string | null;
    memberJoinChannelId: string | null;
    memberLeaveChannelId: string | null;
    moderationLogChannelId: string | null;
  };
}

const DEFAULT: Omit<GuildSettings, 'guildId'> = {
  welcomeChannelId: null,
  welcomeMessage: '{user} 님이 {server} 에 입장하셨습니다! 🎉',
  autoRoleId: null,
  verifiedRoleId: null,
  unverifiedRoleId: null,
  verificationCaptcha: false,
  ticketCategoryId: null,
  ticketStaffRoleId: null,
  ticketLogChannelId: null,
  ticketWelcomeMessage: '티켓이 생성되었습니다. 스태프가 곧 도움을 드리겠습니다.',
  ticketMaxPerUser: 1,
  reportLogChannelId: null,
  autoMod: { enabled: false, badWords: [], blockInvites: false },
  logging: {
    enabled: false,
    messageDeleteChannelId: null,
    memberJoinChannelId: null,
    memberLeaveChannelId: null,
    moderationLogChannelId: null,
  },
};

export function getGuildSettings(guildId: string): GuildSettings {
  const existing = getOne<GuildSettings>(FILE, guildId);
  if (existing) return existing;
  const fresh = { guildId, ...DEFAULT };
  setOne(FILE, guildId, fresh);
  return fresh;
}

export function updateGuildSettings(guildId: string, patch: Partial<GuildSettings>): GuildSettings {
  const current = getGuildSettings(guildId);
  const updated = { ...current, ...patch, guildId };
  setOne(FILE, guildId, updated);
  return updated;
}
