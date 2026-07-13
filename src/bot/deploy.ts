import 'dotenv/config';
import { REST, Routes } from 'discord.js';
import { readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function deploy() {
  const token = process.env.DISCORD_TOKEN!;
  const clientId = process.env.DISCORD_CLIENT_ID!;

  const commands: object[] = [];
  const commandsPath = join(__dirname, 'commands');
  const files = readdirSync(commandsPath).filter((f) => f.endsWith('.ts') || f.endsWith('.js'));

  for (const file of files) {
    const mod = await import(join(commandsPath, file));
    commands.push(mod.default.data.toJSON());
  }

  const rest = new REST({ version: '10' }).setToken(token);
  await rest.put(Routes.applicationCommands(clientId), { body: commands });
  console.log('✅ 슬래시 커맨드 등록 완료!');
}

deploy().catch(console.error);
