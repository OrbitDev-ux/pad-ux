import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  EmbedBuilder,
  Colors,
} from 'discord.js';
import { SlashCommand } from '../../types/index.js';
import { addModLog, addWarning, countWarnings, getWarnings } from '../../storage/modLogs.js';

const command: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('제재')
    .setDescription('유저 제재 명령어')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addSubcommand((s) =>
      s.setName('경고').setDescription('경고 부여')
        .addUserOption((o) => o.setName('대상').setDescription('유저').setRequired(true))
        .addStringOption((o) => o.setName('사유').setDescription('사유'))
    )
    .addSubcommand((s) =>
      s.setName('경고목록').setDescription('경고 목록 조회')
        .addUserOption((o) => o.setName('대상').setDescription('유저').setRequired(true))
    )
    .addSubcommand((s) =>
      s.setName('타임아웃').setDescription('타임아웃 적용')
        .addUserOption((o) => o.setName('대상').setDescription('유저').setRequired(true))
        .addIntegerOption((o) => o.setName('시간').setDescription('분').setRequired(true).setMinValue(1).setMaxValue(40320))
        .addStringOption((o) => o.setName('사유').setDescription('사유'))
    )
    .addSubcommand((s) =>
      s.setName('추방').setDescription('서버 추방')
        .addUserOption((o) => o.setName('대상').setDescription('유저').setRequired(true))
        .addStringOption((o) => o.setName('사유').setDescription('사유'))
    )
    .addSubcommand((s) =>
      s.setName('차단').setDescription('서버 차단(밴)')
        .addUserOption((o) => o.setName('대상').setDescription('유저').setRequired(true))
        .addStringOption((o) => o.setName('사유').setDescription('사유'))
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const sub = interaction.options.getSubcommand();
    await interaction.deferReply({ ephemeral: true });

    const targetUser = interaction.options.getUser('대상', sub !== '경고목록');
    const reason = interaction.options.getString('사유') ?? '사유 없음';
    const guildId = interaction.guildId!;
    const modId = interaction.user.id;

    if (sub === '경고') {
      addWarning({ guildId, targetId: targetUser!.id, moderatorId: modId, reason });
      addModLog({ guildId, targetId: targetUser!.id, moderatorId: modId, action: 'WARN', reason });
      const count = countWarnings(guildId, targetUser!.id);
      await interaction.editReply({ content: `⚠️ <@${targetUser!.id}> 에게 경고를 부여했습니다. (누적 ${count}회)` });
    }

    else if (sub === '경고목록') {
      const u = interaction.options.getUser('대상', true);
      const warns = getWarnings(guildId, u.id);
      if (!warns.length) return void interaction.editReply({ content: '경고 기록이 없습니다.' });
      const embed = new EmbedBuilder().setColor(Colors.Yellow).setTitle(`⚠️ ${u.username} 경고 목록`)
        .setDescription(warns.map((w, i) => `**${i + 1}.** ${w.reason}`).join('\n'))
        .setFooter({ text: `총 ${warns.length}회` });
      await interaction.editReply({ embeds: [embed] });
    }

    else if (sub === '타임아웃') {
      const member = interaction.guild!.members.cache.get(targetUser!.id);
      if (!member) return void interaction.editReply({ content: '❌ 유저를 찾을 수 없습니다.' });
      const minutes = interaction.options.getInteger('시간', true);
      await member.timeout(minutes * 60 * 1000, reason);
      addModLog({ guildId, targetId: targetUser!.id, moderatorId: modId, action: 'TIMEOUT', reason });
      await interaction.editReply({ content: `⏰ <@${targetUser!.id}> 에게 ${minutes}분 타임아웃 적용 완료` });
    }

    else if (sub === '추방') {
      const member = interaction.guild!.members.cache.get(targetUser!.id);
      if (!member) return void interaction.editReply({ content: '❌ 유저를 찾을 수 없습니다.' });
      await member.kick(reason);
      addModLog({ guildId, targetId: targetUser!.id, moderatorId: modId, action: 'KICK', reason });
      await interaction.editReply({ content: `👢 <@${targetUser!.id}> 추방 완료` });
    }

    else if (sub === '차단') {
      await interaction.guild!.bans.create(targetUser!.id, { reason });
      addModLog({ guildId, targetId: targetUser!.id, moderatorId: modId, action: 'BAN', reason });
      await interaction.editReply({ content: `🔨 <@${targetUser!.id}> 차단 완료` });
    }
  },
};

export default command;
