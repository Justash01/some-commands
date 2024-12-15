import { Player, world } from "@minecraft/server";
import { parseSelector, parseCoordinate } from "../utils";

export function changedimension(player: Player, args: string[], prefix: string): void {
  if (args.length < 4) {
    player.sendMessage(`§cIncorrect arguments. Use '${prefix}help changedimension' for more information`);
    return;
  }

  const targetEntities = parseSelector(player, args[0]);
  if  (targetEntities.length === 0) return;
  if (targetEntities.length > 1) {
    player.sendMessage({ rawtext: [{ text: "§c" }, { translate: "commands.generic.tooManyTargets" }] });
    return;
  }

  const targetPlayer = targetEntities[0];
  if (!(targetPlayer instanceof Player)) {
    player.sendMessage({ rawtext: [{ text: "§c" }, { translate: "commands.generic.targetNotPlayer" }] });
    return;
  }

  const destinationDimension = args[1].toLowerCase();
  if (!["overworld", "nether", "the_end"].includes(destinationDimension)) {
    player.sendMessage("§cInvalid dimension, must be one of: overworld, nether, the_end");
    return;
  }

  const currentDimension = targetPlayer.dimension.id.replace("minecraft:", "");
  if (currentDimension === destinationDimension) {
    player.sendMessage(`§cPlayer already in the destination dimension`);
    return;
  }

  const [xArg, yArg, zArg] = args.slice(2);
  const x = parseCoordinate(targetPlayer.location.x, xArg);
  const y = parseCoordinate(targetPlayer.location.y, yArg);
  const z = parseCoordinate(targetPlayer.location.z, zArg);

  if ([x, y, z].some(coord => coord === null)) {
    player.sendMessage("§cInvalid coordinates, must be a number");
    return;
  }

  world.getDimension(destinationDimension).runCommand(`tp ${targetPlayer.name} ${x} ${y} ${z}`);
  player.sendMessage(`Changed dimension of §7${targetPlayer.name}§r to §7${destinationDimension}§r`);
}