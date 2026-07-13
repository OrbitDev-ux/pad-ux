import 'dotenv/config';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';
import { createClient } from './client.js';
import { readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { SlashCommand, ButtonHandler, ModalHandler } from '../types/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function bootstrap() {
  logger.info('봇 시작 중...');

  const client = createClient();

  // ── 커맨드 로드 ─────────────────────────────────────────────
  const commandsPath = join(__dirname, 'commands');
  const commandFiles = readdirSync(commandsPath).filter((f) => f.endsWith('.ts') || f.endsWith('.js'));
  for (const file of commandFiles) {
    const mod = await import(join(commandsPath, file));
    const cmd: SlashCommand = mod.default;
    client.commands.set(cmd.data.name, cmd);
  }
  logger.info(`커맨드 ${client.commands.size}개 로드 완료`);

  // ── 버튼 핸들러 로드 ─────────────────────────────────────────
  const buttonsPath = join(__dirname, 'handlers', 'buttons');
  const buttonFiles = readdirSync(buttonsPath).filter((f) => f.endsWith('.ts') || f.endsWith('.js'));
  for (const file of buttonFiles) {
    const mod = await import(join(buttonsPath, file));
    const handler: ButtonHandler = mod.default;
    client.buttons.set(handler.customId, handler);
  }

  // ── 모달 핸들러 로드 ─────────────────────────────────────────
  const modalsPath = join(__dirname, 'handlers', 'modals');
  const modalFiles = readdirSync(modalsPath).filter((f) => f.endsWith('.ts') || f.endsWith('.js'));
  for (const file of modalFiles) {
    const mod = await import(join(modalsPath, file));
    const handler: ModalHandler = mod.default;
    client.modals.set(handler.customId, handler);
  }

  // ── 이벤트 로드 ─────────────────────────────────────────────
  const eventsPath = join(__dirname, 'events');
  const eventFiles = readdirSync(eventsPath).filter((f) => f.endsWith('.ts') || f.endsWith('.js'));
  for (const file of eventFiles) {
    const mod = await import(join(eventsPath, file));
    const event = mod.default;
    if (event.once) {
      client.once(event.name, (...args: unknown[]) => event.execute(...args, client));
    } else {
      client.on(event.name, (...args: unknown[]) => event.execute(...args, client));
    }
  }
  logger.info(`이벤트 ${eventFiles.length}개 로드 완료`);

  // ── 로그인 ──────────────────────────────────────────────────
  await client.login(config.discord.token);

  process.on('SIGINT', () => { client.destroy(); process.exit(0); });
  process.on('SIGTERM', () => { client.destroy(); process.exit(0); });
}

bootstrap().catch((err) => {
  logger.error('부트스트랩 실패', err);
  process.exit(1);
});
