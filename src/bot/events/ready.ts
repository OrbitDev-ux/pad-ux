import { Client, ActivityType } from 'discord.js';
import { logger } from '../../utils/logger.js';

export default {
  name: 'ready',
  once: true,
  execute(client: Client) {
    logger.info(`✅ 봇 온라인: ${client.user?.tag}`);
    client.user?.setActivity(`${client.guilds.cache.size}개 서버`, { type: ActivityType.Watching });
  },
};
