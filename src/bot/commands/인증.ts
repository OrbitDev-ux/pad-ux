import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Colors,
} from 'discord.js';
import { SlashCommand } from '../../types/index.js';
import { updateGuildSettings } from '../../storage/guildSettings.js';

const command: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('인증')
    .setDescription('인증 시스템 관리')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand((s) =>
      s.setName('설정').setDescription('인증 설정')
        .addRoleOption((o) => o.setName('인증역할').setDescription('인증 완료 역할').setRequired(true))
        .addRoleOption((o) => o.setName('미인증역할').setDescription('미인증 역할'))
    )
    .addSubcommand((s) => s.setName('패널').setDescription('인증 패널 생성')),

  async execute(interaction: ChatInputCommandInteraction) {
    const sub = interaction.options.getSubcommand();
    await interaction.deferReply({ ephemeral: true });

    if (sub === '설정') {
      const verified = interaction.options.getRole('인증역할', true);
      const unverified = interaction.options.getRole('미인증역할');

      updateGuildSettings(interaction.guildId!, {
        verifiedRoleId: verified.id,
        unverifiedRoleId: unverified?.id ?? null,
      });

      await interaction.editReply({ content: `✅ 인증 역할: <@&${verified.id}> 설정 완료!` });
    }

    if (sub === '패널') {
      const embed = new EmbedBuilder()
        .setColor(Colors.Green)
        .setTitle('✅ 멤버 인증')
        .setDescription('아래 버튼을 클릭하여 인증을 완료하세요.');

      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder().setCustomId('verify_start').setLabel('✅ 인증하기').setStyle(ButtonStyle.Success),
      );

      await (interaction.channel as any)?.send({ embeds: [embed], components: [row] });
      await interaction.editReply({ content: '✅ 인증 패널 생성 완료!' });
    }
  },
};

export default command;
