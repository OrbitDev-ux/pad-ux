import {
  ButtonInteraction,
  ModalBuilder,
  ActionRowBuilder,
  TextInputBuilder,
  TextInputStyle,
} from 'discord.js';
import { ButtonHandler, BotClient } from '../../../types/index.js';

const handler: ButtonHandler = {
  customId: 'ticket_create',

  async execute(interaction: ButtonInteraction) {
    const modal = new ModalBuilder().setCustomId('ticket_modal').setTitle('📩 티켓 생성');
    const input = new TextInputBuilder()
      .setCustomId('subject')
      .setLabel('문의 내용을 간략히 작성해주세요')
      .setStyle(TextInputStyle.Short)
      .setMaxLength(100)
      .setRequired(false)
      .setPlaceholder('예: 결제 문의, 버그 신고 등');
    modal.addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(input));
    await interaction.showModal(modal);
  },
};

export default handler;
