import { Player } from "@minecraft/server";

type CommandSyntax = {
  syntax: string;
  description: string;
};

type Command = {
  command: string;
  syntaxes: CommandSyntax[];
};

const commandsList: Command[] = [
  {
    command: "help",
    syntaxes: [
      {
        syntax: "help <page: int>",
        description: "Shows help for a specific page"
      },
      {
        syntax: "help [command: CommandName]",
        description: "Shows detailed help for a specific command"
      }
    ]
  },
  {
    command: "name",
    syntaxes: [
      {
        syntax: "name <entity: target> <set> <name: string>",
        description: "Set the name of an entity"
      },
      {
        syntax: "name <entity: target> <clear>",
        description: "Clear the name of an entity"
      }
    ]
  },
  {
    command: "afk",
    syntaxes: [
      {
        syntax: "afk set [duration: int]",
        description: "Set your AFK status with an optional duration (in seconds)"
      },
      {
        syntax: "afk clear",
        description: "Clear your AFK status"
      }
    ]
  },
  {
    command: "knockback",
    syntaxes: [
      {
        syntax: "knockback <entity: target> <x: value> <z: value> <horizontalStrength: int> <verticalStrength: int>",
        description: "Knockback an entity"
      }
    ]
  },
  {
    command: "remindme",
    syntaxes: [
      {
        syntax: "remindme add <id: string> <message: string> <duration: int>",
        description: "Adds a new reminder"
      },
      {
        syntax: "remindme remove <id: string>",
        description: "Removes a reminder by ID"
      },
      {
        syntax: "remindme list",
        description: "Lists all active reminders"
      }
    ]
  },
  {
    command: "tpa",
    syntaxes: [
      {
        syntax: "tpa <player: target>",
        description: "Send a teleport request to a player"
      },
      {
        syntax: "tpaccept",
        description: "Accept the pending teleport request"
      },
      {
        syntax: "tpdeny",
        description: "Deny the pending teleport request"
      }
    ]
  },
  {
    command: "config",
    syntaxes: [
      {
        syntax: "config prefix set <prefix: string>",
        description: "Sets the command prefix to the specified string"
      },
      {
        syntax: "config prefix reset",
        description: "Resets the command prefix to the default value"
      }
    ]
  },
  {
    command: "changedimension",
    syntaxes: [
      {
        syntax: "changedimension <target: entity> <destination: Dimension> <destinationPosition: x y z>",
        description: "Switches the specified entity to a different dimension at the given coordinates"
      }
    ]
  }
];

const maxCmds = 7;

export function help(player: Player, args: string[], prefix: string): void {
  if (args.length === 0) {
    displayGeneralHelp(player, prefix, 1);
    return;
  }

  const command = args[0]?.toLowerCase();

  const page = parseInt(command, 10);
  if (!isNaN(page)) {
    displayGeneralHelp(player, prefix, page);
    return;
  }
  
  const isTpaCommand = ["tpa", "tpaccept", "tpdeny"].indexOf(command) !== -1;
  const cmd = commandsList.find((c) => c.command === command || (isTpaCommand && c.command === "tpa"));
  
  if (cmd) {
    let commandHelpText = `${command}:\n§7Usage§r:\n`;
    cmd.syntaxes.forEach(({ syntax, description }) => {
      commandHelpText += `- ${prefix}${syntax} - §7${description}§r\n`;
    });
    player.sendMessage({ rawtext: [{ text: commandHelpText }] });
  } else {
    player.sendMessage("No detailed help available for this command");
  }
}

function displayGeneralHelp(player: Player, prefix: string, page: number): void {
  const allSyntaxes = commandsList.reduce<{ command: string; syntax: string; description: string }[]>(
    (acc, cmd) => acc.concat(cmd.syntaxes.map((syntax) => ({ command: cmd.command, ...syntax }))),
    []
  );

  const totalPages = Math.ceil(allSyntaxes.length / maxCmds);

  if (page < 1 || page > totalPages) {
    player.sendMessage(`Invalid page number, please enter a page number between 1 and ${totalPages}`);
    return;
  }

  const startIndex = (page - 1) * maxCmds;
  const endIndex = Math.min(startIndex + maxCmds, allSyntaxes.length);

  let helpText = `§2--- Showing help page ${page} of ${totalPages} (${prefix}help <page>) ---§r\n`;

  for (let i = startIndex; i < endIndex; i++) {
    const { syntax } = allSyntaxes[i];
    helpText += `${prefix}${syntax}\n`;
  }

  player.sendMessage({ rawtext: [{ text: helpText }] });
}
