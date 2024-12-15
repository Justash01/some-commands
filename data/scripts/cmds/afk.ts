import { world, system, Player, PlayerSpawnAfterEvent } from "@minecraft/server";

export function afk(player: Player, args: string[], prefix: string): void {
  if (args.length < 1) {
    player.sendMessage(`§cIncorrect arguments. Use '${prefix}help afk' for more information`);
    return;
  }

  const action = args[0].toLowerCase();

  if (action === "set") {
    const duration = args.length > 1 ? parseInt(args[1], 10) : 0;
    if (isNaN(duration) || duration < 0) {
      player.sendMessage("§cInvalid duration, must be a number");
      return;
    }

    const value = duration > 0 ? duration * 20 : true;
    if (player.getDynamicProperty("player:is_afk")) {
      player.sendMessage("§cYou are already marked as AFK");
    } else {
      player.setDynamicProperty("player:is_afk", value);
      player.sendMessage(`You are now AFK${duration > 0 ? ` for ${duration} seconds` : ""}`);
    }
  } else if (action === "clear") {
    if (!player.getDynamicProperty("player:is_afk")) {
      player.sendMessage("§cYou are currently not AFK");
    } else {
      player.setDynamicProperty("player:is_afk", undefined);
      player.sendMessage("You are no longer AFK");
    }
  } else {
    player.sendMessage(`§cInvalid action, must be one of: set, clear`);
  }
}

export function onTick(): void {
  const players = world.getPlayers();

  players.forEach((player) => {
    const isAfk = player.getDynamicProperty("player:is_afk");
    if (isAfk) {
      const velocity = player.getVelocity();
      const isMoving = velocity.x !== 0 || velocity.y !== 0 || velocity.z !== 0;

      if (isMoving) {
        player.setDynamicProperty("player:is_afk", undefined);
        player.sendMessage("You are no longer AFK");
      } else if (typeof isAfk === "number") {
        const newTime = isAfk - 1;
        if (newTime <= 0) {
          player.setDynamicProperty("player:is_afk", undefined);
          player.sendMessage("Your AFK status has expired, welcome back!");
        } else {
          player.setDynamicProperty("player:is_afk", newTime);
        }
      }
    }
  });
}

world.afterEvents.playerSpawn.subscribe((eventData: PlayerSpawnAfterEvent) => {
  const { initialSpawn, player } = eventData;

  if (initialSpawn && player.getDynamicProperty("player:is_afk")) {
    player.setDynamicProperty("player:is_afk", undefined);
    player.sendMessage("You are no longer AFK");
  }
});

system.runInterval(onTick, 1);
