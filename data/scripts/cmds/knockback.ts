import { Player } from "@minecraft/server";
import { parseSelector, parseDirection, getName } from "../utils";

export function knockback(player: Player, args: string[], prefix: string): void {
  if (args.length < 5) {
    player.sendMessage(`§cIncorrect arguments. Use '${prefix}help knockback' for more information`);
    return;
  }

  const entities = parseSelector(player, args[0]);
  if (entities.length === 0) return;

  const directionX = parseDirection(player, args[1]);
  const directionZ = parseDirection(player, args[2]);
  const horizontalStrength = parseFloat(args[3]);
  const verticalStrength = parseFloat(args[4]);

  if (isNaN(directionX) || isNaN(directionZ)) {
    player.sendMessage("§cInvalid direction, must be a number");
    return;
  }

  if (isNaN(horizontalStrength) || isNaN(verticalStrength)) {
    player.sendMessage("§cInvalid knockback strength, must be a number");
    return;
  }

  entities.forEach((entity) => {
    entity.applyKnockback(directionX, directionZ, horizontalStrength, verticalStrength);
    player.sendMessage(`Applied knockback on ${getName(entity)}`);
  });
}
