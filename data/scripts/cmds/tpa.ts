import { Player } from "@minecraft/server";
import { parseSelector } from "../utils";

interface TeleportRequest {
  sender: Player;
  target: Player;
}

const teleportRequests: TeleportRequest[] = [];

export function tpa(player: Player, args: string[], prefix: string): void {
  if (args.length < 1) {
    player.sendMessage(`Incorrect arguments. Use '${prefix}help tpa' for more information`);
    return;
  }

  const targetEntities = parseSelector(player, args[0]);

  if (targetEntities.length === 0) return;
  if (targetEntities.length > 1) {
    player.sendMessage({ rawtext: [ { text: "§c" }, { translate: "commands.generic.tooManyTargets" } ] });
    return;
  }

  const targetPlayer = targetEntities[0];
  if (!(targetPlayer instanceof Player)) {
    player.sendMessage({ rawtext: [ { text: "§c" }, { translate: "commands.generic.targetNotPlayer" } ] });
    return;
  }

  if (targetPlayer.id === player.id) {
    player.sendMessage("§cYou cannot send a teleport request to yourself");
    return;
  }

  teleportRequests.push({ sender: player, target: targetPlayer });
  player.sendMessage(`Teleport request sent to §7${targetPlayer.name}§r`);
  targetPlayer.sendMessage(`You have received a teleport request from ${player.name}, type '§7${prefix}tpaccept§r' to accept or '§7${prefix}tpdeny§r' to deny`);
}

export function tpaccept(player: Player): void {
  const requestIndex = teleportRequests.findIndex((request) => request.target === player);

  if (requestIndex === -1) {
    player.sendMessage("§cYou have no pending teleport requests");
    return;
  }

  const request = teleportRequests[requestIndex];
  request.sender.teleport(player.location);
  player.sendMessage(`You accepted the teleport request from §7${request.sender.name}§r`);
  request.sender.sendMessage(`Your teleport request to §7${player.name}§r was accepted`);

  teleportRequests.splice(requestIndex, 1);
}

export function tpdeny(player: Player): void {
  const requestIndex = teleportRequests.findIndex((request) => request.target === player);

  if (requestIndex === -1) {
    player.sendMessage("§cYou have no pending teleport requests");
    return;
  }

  const request = teleportRequests[requestIndex];
  player.sendMessage(`You denied the teleport request from §7${request.sender.name}§r`);
  request.sender.sendMessage(`§cYour teleport request to §7${player.name}§r was denied`);

  teleportRequests.splice(requestIndex, 1);
}
