import { Player } from "@minecraft/server";
import { parseSelector, getName } from "../utils";

export function name(player: Player, args: string[], prefix: string): void {
  if (args.length < 2) {
    player.sendMessage(`§cIncorrect arguments. Use '${prefix}help name' for more information`);
    return;
  }

  const entities = parseSelector(player, args[0]);
  if (entities.length === 0) return;

  const action = args[1].toLowerCase();

  if (action === "set") {
    if (args.length < 3) {
      player.sendMessage("§cNo name provided");
      return;
    }

    const name = args.slice(2).join(" ").replace(/"/g, "");
    entities.forEach((entity) => {
      player.sendMessage(`Name of ${getName(entity)} changed to "${name}"`);
      entity.nameTag = name;
    });
  } else if (action === "clear") {
    entities.forEach((entity) => {
      player.sendMessage(`Name of ${getName(entity)} has been cleared`);
      entity.nameTag = "";
    });
  } else {
    player.sendMessage("§cInvalid action, must be one of: set, clear");
  }
}
