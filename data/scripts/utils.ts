import { world, Player, Entity } from "@minecraft/server";

function generateRandomTag(): string {
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let tag = '';
  for (let i = 0; i < 8; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    tag += characters[randomIndex];
  }
  if (!/[a-z]/.test(tag)) {
    const randomIndex = Math.floor(Math.random() * 8);
    tag = tag.substring(0, randomIndex) + 'a' + tag.substring(randomIndex + 1);
  }
  return tag;
}

export function parseSelector(source: Player, selector: string): Entity[] {
  const tag = generateRandomTag();
  try {
    source.runCommand(`tag ${selector} add ${tag}`);
  } catch (e) {
    const error = (e as Error).toString().replace("CommandError: ", "").trim();

    if (error.includes("Syntax error:")) {
      source.sendMessage("§cSyntax error in the selector, check your command");
    } else {
      source.sendMessage(`${error}`);
    }

    return [];
  }

  const entities = world
    .getDimension(source.dimension.id)
    .getEntities()
    .filter((entity) => entity.hasTag(tag));

  if (entities.length > 0) {
    entities.forEach((entity) => {
      entity.removeTag(tag);
    });
    return entities;
  } else {
    source.sendMessage({ rawtext: [{ text: "§c" }, { translate: "commands.generic.noTargetMatch" }] });
    return [];
  }
}

function degreesToRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

export function parseDirection(player: Player, arg: string, base: number = 0): number {
  if (arg.startsWith("~")) {
    return base + (parseFloat(arg.slice(1)) || 0);
  }
  if (arg.startsWith("^")) {
    const localValue = parseFloat(arg.slice(1)) || 0;
    const yawRadians = degreesToRadians(player.getRotation().y);
    const forwardX = Math.cos(yawRadians) * localValue;
    const forwardZ = Math.sin(yawRadians) * localValue;
    return base + (arg.includes("^x") ? forwardX : forwardZ);
  }
  return parseFloat(arg) || 0;
}

function isPlayer(entity: Entity): entity is Player {
  return entity instanceof Player;
}

export function getName(entity: Entity): string {
  if (isPlayer(entity)) {
    return entity.name;
  }

  if (entity.nameTag) {
    return entity.nameTag;
  }

  const parts = entity.typeId.split(":");
  if (parts.length < 2) {
    return entity.typeId;
  }

  const namePart = parts[1].replace(/_/g, " ");
  const name = namePart
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return name;
}

export function parseCoordinate(base: number, input: string): number | null {
  if (input.startsWith("~")) {
    const relativeValue = parseFloat(input.slice(1));
    return isNaN(relativeValue) ? base : base + relativeValue;
  }
  const absoluteValue = parseFloat(input);
  return isNaN(absoluteValue) ? null : absoluteValue;
}