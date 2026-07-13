import { Interaction, EmbedBuilder, Colors } from 'discord.js';
import { BotClient } from '../../types/index.js';
import { logger } from '../../utils/logger.js';

export default {
  name: 'interactionCreate',
  once: false,

  async execute(interaction: Interaction, client: BotClient) {
    // ── 슬래시 커맨드 ──────────────────────────────────────────
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;
      try {
        await command.execute(interaction, client);
      } catch (err) {
        logger.error(`커맨드 오류: ${interaction.commandName}`, err);
        const msg = { embeds: [new EmbedBuilder().setColor(Colors.Red).setDescription('❌ 오류가 발생했습니다.')], ephemeral: true };
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp(msg);
        } else {
          await interaction.reply(msg);
        }
      }
      return;
    }

    // ── 버튼 ───────────────────────────────────────────────────
    if (interaction.isButton()) {
      const handler = [...client.buttons.values()].find((b) =>
        interaction.customId.startsWith(b.customId),
      );
      if (!handler) return;
      try {
        await handler.execute(interaction, client);
      } catch (err) {
        logger.error(`버튼 오류: ${interaction.customId}`, err);
      }
      return;
    }

    // ── 모달 ───────────────────────────────────────────────────
    if (interaction.isModalSubmit()) {
      const handler = [...client.modals.values()].find((m) =>
        interaction.customId.startsWith(m.customId),
      );
      if (!handler) return;
      try {
        await handler.execute(interaction, client);
      } catch (err) {
        logger.error(`모달 오류: ${interaction.customId}`, err);
      }
    }
  },
};
