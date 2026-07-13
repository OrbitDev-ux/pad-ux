import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { SlashCommand, BotClient } from '../../types/index.js';

const command: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('핑')
    .setDescription('봇 응답 속도를 확인합니다'),

  async execute(interaction: ChatInputCommandInteraction, client: BotClient) {
    const ping = client.ws.ping;
    await interaction.reply(`🏓 퐁! 응답속도: **${ping}ms**`);
  },
};

export default command;
