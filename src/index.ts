import { Client, create } from "@open-wa/wa-automate";
import config from "./config";
import { handle } from "./messageHandler";

// Configs
const launchConfig = {
  headless: true,
  useChrome: true,
  ezqr: true,
};

function start(client: Client) {
  client.onAnyMessage(async (message) => {
    const isApprovedChat = message.chat?.formattedTitle &&
      config.chatNames.includes(message.chat?.formattedTitle)
    const isApprovedMessage = message.text.startsWith('/selfgpt') && message.fromMe
    if (isApprovedChat || isApprovedMessage) {
      try {
        await handle(message, client);
      } catch (err) {
        console.error(err);
      }
    }
  });
}

create(launchConfig).then(start);
