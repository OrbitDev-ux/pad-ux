import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Colors,
  ChannelType,
} from 'discord.js';
import { SlashCommand, BotClient } from '../../types/index.js';
import { getGuildSettings, updateGuildSettings } from '../../storage/guildSettings.js';

const command: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('티켓')
    .setDescription('티켓 시스템 관리')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand((s) =>
      s.setName('설정').setDescription('티켓 설정')
        .addChannelOption((o) => o.setName('카테고리').setDescription('티켓 카테고리').addChannelTypes(ChannelType.GuildCategory).setRequired(true))
        .addRoleOption((o) => o.setName('스태프').setDescription('스태프 역할').setRequired(true))
        .addChannelOption((o) => o.setName('로그').setDescription('로그 채널').addChannelTypes(ChannelType.GuildText))
    )
    .addSubcommand((s) => s.setName('패널').setDescription('티켓 패널 생성')),

  async execute(interaction: ChatInputCommandInteraction) {
    const sub = interaction.options.getSubcommand();
    await interaction.deferReply({ ephemeral: true });

    if (sub === '설정') {
      const cat = interaction.options.getChannel('카테고리', true);
      const staff = interaction.options.getRole('스태프', true);
      const log = interaction.options.getChannel('로그');

      updateGuildSettings(interaction.guildId!, {
        ticketCategoryId: cat.id,
        ticketStaffRoleId: staff.id,
        ticketLogChannelId: log?.id ?? null,
      });

      await interaction.editReply({
        embeds: [
          new EmbedBuilder().setColor(Colors.Green).setTitle('✅ 티켓 설정 완료')
            .addFields(
              { name: '카테고리', value: `<#${cat.id}>`, inline: true },
              { name: '스태프', value: `<@&${staff.id}>`, inline: true },
              { name: '로그', value: log ? `<#${log.id}>` : '미설정', inline: true },
            ),
        ],
      });
    }

    if (sub === '패널') {
      const embed = new EmbedBuilder()
        .setColor(Colors.Blue)
        .setTitle('📩 지원 티켓')
        .setDescription('버튼을 클릭하면 티켓이 생성됩니다.');

      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder().setCustomId('ticket_create').setLabel('📩 티켓 열기').setStyle(ButtonStyle.Primary),
      );

      await (interaction.channel as any)?.send({ embeds: [embed], components: [row] });
      await interaction.editReply({ content: '✅ 패널 생성 완료!' });
    }
  },
};

export default command;
