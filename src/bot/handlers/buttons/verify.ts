import { ButtonInteraction, EmbedBuilder, Colors } from 'discord.js';
import { ButtonHandler, BotClient } from '../../../types/index.js';
import { getGuildSettings } from '../../../storage/guildSettings.js';

const handler: ButtonHandler = {
  customId: 'verify_start',

  async execute(interaction: ButtonInteraction) {
    await interaction.deferReply({ ephemeral: true });
    const s = getGuildSettings(interaction.guildId!);
    const member = interaction.guild!.members.cache.get(interaction.user.id);
    if (!member) return;

    try {
      if (s.verifiedRoleId) await member.roles.add(s.verifiedRoleId);
      if (s.unverifiedRoleId) await member.roles.remove(s.unverifiedRoleId);

      await interaction.editReply({
        embeds: [
          new EmbedBuilder().setColor(Colors.Green)
            .setTitle('✅ 인증 완료!')
            .setDescription('서버를 자유롭게 이용하세요!'),
        ],
      });
    } catch {
      await interaction.editReply({ content: '❌ 오류가 발생했습니다. 관리자에게 문의하세요.' });
    }
  },
};

export default handler;
