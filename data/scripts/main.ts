import { system, world, Player, ChatSendBeforeEvent } from "@minecraft/server";
import { afk } from "./cmds/afk";
import { name } from "./cmds/name";
import { help } from "./cmds/help";
import { knockback } from "./cmds/knockback";
import { remindMe } from "./cmds/remindme";
import { tpa, tpaccept, tpdeny } from "./cmds/tpa";
import { config } from "./cmds/config";
import { changedimension } from "./cmds/changedimension";

type CommandHandler = (player: Player, args: string[], prefix: string) => void;

const commandRegistry: Record<string, CommandHandler> = {
  help,
  name,
  afk,
  knockback,
  remindme: remindMe,
  tpa,
  tpaccept,
  tpdeny,
  config,
  changedimension
};

const DEFAULT_PREFIX = "!";

function getPrefix(): string {
  const storedPrefix = world.getDynamicProperty("world:command_prefix") as string;
  return storedPrefix || DEFAULT_PREFIX;
}

world.beforeEvents.chatSend.subscribe((eventData: ChatSendBeforeEvent) => {
  const player = eventData.sender as Player;
  const message = eventData.message;

  const prefix = getPrefix();
  if (message.startsWith(prefix)) {
    eventData.cancel = true;
    const rawArgs = message.substring(prefix.length).trim();
    const args = rawArgs.split(" ");
    const cmd = args.shift()?.toLowerCase();

    if (!cmd) return;

    if (!player.isOp()) {
      player.sendMessage({
        rawtext: [
          { text: "§c" },
          { translate: "commands.generic.unknown", with: [cmd] },
        ],
      });
      return;
    }

    system.run(() => {
      const handler = commandRegistry[cmd];
      if (handler) {
        handler(player, args, prefix);
      } else {
        player.sendMessage(`§cUnknown command. Use '${prefix}help' for a list of available commands`);
      }
    });
  }
});
