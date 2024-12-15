import { system, Player } from "@minecraft/server";

interface Reminder {
  id: string;
  message: string;
  originalDuration: string;
  durationInTicks: number;
}

export function remindMe(player: Player, args: string[], prefix: string): void {
  if (args.length < 1) {
    player.sendMessage(`§cIncorrect arguments. Use '${prefix}help remindme' for more information`);
    return;
  }

  const action = args[0].toLowerCase();

  switch (action) {
    case "add":
      if (args.length < 4) {
        player.sendMessage(`§cIncorrect arguments. Use '${prefix}help remindme' for more information`);
        return;
      }
      addReminder(player, args[1], args.slice(2, -1).join(" "), args[args.length - 1]);
      break;
    case "remove":
      if (args.length < 2) {
        player.sendMessage(`§cIncorrect arguments. Use '${prefix}help remindme' for more information`);
        return;
      }
      removeReminder(player, args[1]);
      break;
    case "list":
      listReminders(player);
      break;
    default:
      player.sendMessage(`§cInvalid action, must be one of: 'add', 'remove', 'list'`);
  }
}

function addReminder(player: Player, id: string, message: string, durationStr: string): void {
  const durationInSeconds = parseDuration(durationStr);
  if (durationInSeconds === null || durationInSeconds < 1) {
    player.sendMessage("§cInvalid duration, must be a number");
    return;
  }

  const reminders = getReminders(player);
  if (reminders.some((reminder) => reminder.id === id)) {
    player.sendMessage(`§cA reminder with the id '${id}' already exists`);
    return;
  }

  const reminder: Reminder = { id, message, originalDuration: convertDurationToText(durationInSeconds), durationInTicks: durationInSeconds * 20 };
  reminders.push(reminder);
  setReminders(player, reminders);
  player.sendMessage(`Reminder '${id}' set for ${convertDurationToText(durationInSeconds)}`);

  system.runTimeout(() => {
    player.sendMessage(`Reminder: §7${message}§r`);
    player.playSound("random.toast");
    removeReminderWithoutNotification(player, id);
  }, reminder.durationInTicks);
}

function parseDuration(durationStr: string): number | null {
  const matches = durationStr.match(/^(\d+)([smhd]?)$/);
  if (!matches) return null;

  const value = parseInt(matches[1], 10);
  const unit = matches[2];

  switch (unit) {
    case "s":
      return value;
    case "m":
      return value * 60;
    case "h":
      return value * 3600;
    case "d":
      return value * 86400;
    default:
      return value; 
  }
}

function removeReminder(player: Player, id: string): void {
  if (id === "*") {
    setReminders(player, []);
    player.sendMessage(`All reminders removed`);
    return;
  }

  let reminders = getReminders(player);
  const initialLength = reminders.length;
  reminders = reminders.filter((reminder) => reminder.id !== id);
  
  if (reminders.length === initialLength) {
    player.sendMessage(`§cNo reminder found with the id '${id}'`);
  } else {
    setReminders(player, reminders);
    player.sendMessage(`Reminder '${id}' removed`);
  }
}

function removeReminderWithoutNotification(player: Player, id: string): void {
  let reminders = getReminders(player);
  reminders = reminders.filter((reminder) => reminder.id !== id);
  setReminders(player, reminders);
}

function listReminders(player: Player): void {
  const reminders = getReminders(player);
  if (reminders.length === 0) {
    player.sendMessage("§cYou have no active reminders");
    return;
  }

  let message = "Active Reminders:\n";
  reminders.forEach((reminder) => {
    message += `- ${reminder.id}: reminder in §7${reminder.originalDuration}§r - ${reminder.message}\n`;
  });
  player.sendMessage(message);
}

function getReminders(player: Player): Reminder[] {
  const remindersJson = player.getDynamicProperty("player:reminders") as string;
  return remindersJson ? JSON.parse(remindersJson) : [];
}

function setReminders(player: Player, reminders: Reminder[]): void {
  player.setDynamicProperty("player:reminders", JSON.stringify(reminders));
}

function convertDurationToText(seconds: number): string {
  if (seconds < 60) return `${seconds} Seconds`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)} Minutes`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} Hours`;
  return `${Math.floor(seconds / 86400)} Days`;
}
