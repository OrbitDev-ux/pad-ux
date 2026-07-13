import {
  ModalSubmitInteraction,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Colors,
  PermissionFlagsBits,
  TextChannel,
  CategoryChannel,
} from 'discord.js';
import { ModalHandler, BotClient } from '../../../types/index.js';
import { getGuildSettings } from '../../../storage/guildSettings.js';
import { createTicket, countOpenTickets } from '../../../storage/tickets.js';

const handler: ModalHandler = {
  customId: 'ticket_modal',

  async execute(interaction: ModalSubmitInteraction) {
    await interaction.deferReply({ ephemeral: true });

    const s = getGuildSettings(interaction.guildId!);
    if (!s.ticketCategoryId) {
      return void interaction.editReply({ content: '❌ 티켓 카테고리가 설정되지 않았습니다.' });
    }

    const openCount = countOpenTickets(interaction.guildId!, interaction.user.id);
    if (openCount >= s.ticketMaxPerUser) {
      return void interaction.editReply({ content: `❌ 이미 열린 티켓이 있습니다.` });
    }

    const subject = interaction.fields.getTextInputValue('subject') || null;
    const guild = interaction.guild!;

    const overwrites: any[] = [
      { id: guild.id, deny: [PermissionFlagsBits.ViewChannel] },
      { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
    ];
    if (s.ticketStaffRoleId) {
      overwrites.push({ id: s.ticketStaffRoleId, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] });
    }

    const channel = await guild.channels.create({
      name: `🎫-${interaction.user.username}`,
      parent: s.ticketCategoryId,
      permissionOverwrites: overwrites,
    }) as TextChannel;

    const ticket = createTicket({
      guildId: guild.id,
      channelId: channel.id,
      creatorId: interaction.user.id,
      subject,
    });

    const embed = new EmbedBuilder()
      .setColor(Colors.Blue)
      .setTitle('🎫 티켓이 생성되었습니다')
      .setDescription(s.ticketWelcomeMessage)
      .addFields({ name: '생성자', value: `<@${interaction.user.id}>`, inline: true });

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId(`ticket_claim_${ticket.id}`).setLabel('📋 담당하기').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId(`ticket_close_${ticket.id}`).setLabel('🔒 닫기').setStyle(ButtonStyle.Danger),
    );

    await channel.send({
      content: s.ticketStaffRoleId ? `<@&${s.ticketStaffRoleId}>` : undefined,
      embeds: [embed],
      components: [row],
    });

    await interaction.editReply({ content: `✅ 티켓이 생성되었습니다! <#${channel.id}>` });
  },
};

export default handler;
