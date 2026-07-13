import { Client, GatewayIntentBits, Partials, Collection } from 'discord.js';
import { BotClient } from '../types/index.js';

export function createClient(): BotClient {
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.GuildModeration,
      GatewayIntentBits.MessageContent,
    ],
    partials: [Partials.Message, Partials.Channel, Partials.GuildMember],
  }) as BotClient;

  client.commands = new Collection();
  client.buttons = new Collection();
  client.modals = new Collection();

  return client;
}
