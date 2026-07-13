import { GuildMember, TextChannel } from 'discord.js';
import { getGuildSettings } from '../../storage/guildSettings.js';

export default {
  name: 'guildMemberAdd',
  once: false,

  async execute(member: GuildMember) {
    const s = getGuildSettings(member.guild.id);

    if (s.autoRoleId) {
      await member.roles.add(s.autoRoleId).catch(() => {});
    }

    if (s.unverifiedRoleId) {
      await member.roles.add(s.unverifiedRoleId).catch(() => {});
    }

    if (s.welcomeChannelId) {
      const ch = member.guild.channels.cache.get(s.welcomeChannelId) as TextChannel | undefined;
      if (ch) {
        const msg = s.welcomeMessage
          .replace('{user}', member.toString())
          .replace('{server}', member.guild.name)
          .replace('{count}', String(member.guild.memberCount));
        await ch.send(msg).catch(() => {});
      }
    }
  },
};
