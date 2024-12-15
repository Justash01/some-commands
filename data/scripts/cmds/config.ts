import { world, Player } from "@minecraft/server";

const DEFAULT_PREFIX = "!";

export function config(player: Player, args: string[], prefix: string): void {
  if (args.length < 2) {
    player.sendMessage(`§cIncorrect arguments. Use '${prefix}help config' for more information`);
    return;
  }

  const option = args[0].toLowerCase();
  const action = args[1].toLowerCase();

  if (option === "prefix") {
    if (action === "set") {
      if (args.length < 3) {
        player.sendMessage("§cNo prefix provided");
        return;
      }

      const newPrefix = args[2];
      if (newPrefix === "/") {
        player.sendMessage("§cInvalid prefix, prefix '/' is not allowed");
        return;
      }

      world.setDynamicProperty("somecommands:command_prefix", newPrefix);
      player.sendMessage(`Command prefix set to '${newPrefix}'`);

    } else if (action === "reset") {
      world.setDynamicProperty("somecommands:command_prefix", DEFAULT_PREFIX);
      player.sendMessage(`Command prefix reset to default '${DEFAULT_PREFIX}'`);

    } else {
      player.sendMessage(`§cInvalid action, must be one of: set, reset`);
    }
  } else {
    player.sendMessage(`§cInvalid option, must be: prefix`);
  }
}
