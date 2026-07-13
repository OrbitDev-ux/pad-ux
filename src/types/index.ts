import {
  ChatInputCommandInteraction,
  ButtonInteraction,
  ModalSubmitInteraction,
  SlashCommandBuilder,
  SlashCommandSubcommandsOnlyBuilder,
  PermissionResolvable,
  Client,
  Collection,
} from 'discord.js';

export interface BotClient extends Client {
  commands: Collection<string, SlashCommand>;
  buttons: Collection<string, ButtonHandler>;
  modals: Collection<string, ModalHandler>;
}

export interface SlashCommand {
  data:
    | SlashCommandBuilder
    | SlashCommandSubcommandsOnlyBuilder
    | Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>;
  permissions?: PermissionResolvable[];
  execute: (interaction: ChatInputCommandInteraction, client: BotClient) => Promise<void>;
}

export interface ButtonHandler {
  customId: string;
  execute: (interaction: ButtonInteraction, client: BotClient) => Promise<void>;
}

export interface ModalHandler {
  customId: string;
  execute: (interaction: ModalSubmitInteraction, client: BotClient) => Promise<void>;
}
