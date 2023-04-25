import { Configuration, OpenAIApi } from "openai";
import config from "./config";
import { Client, Message } from "@open-wa/wa-automate";

const openai = new OpenAIApi(new Configuration({ apiKey: config.apiKey }));

const processedMessages: string[] = [];

let model = "gpt-3.5-turbo";
const commands = ["/gpt3", "/gpt4", "/clear"];

export async function handle(message: Message, client: Client) {
  const chatName = message.chat?.formattedTitle!;
  const prefix = `${chatName}: `;
  if (
    processedMessages.includes(message.id) ||
    message.text.startsWith(chatName)
  )
    return message;
  processedMessages.push(message.id);
  let text = message.text;
  let sessionId = client.getSessionId();

  console.log("Processing...", text);

  if (commands.includes(text)) {
    switch (text) {
      case "/gpt3": {
        console.log("Changing model...");
        model = "gpt-3.5-turbo";
      }
      case "/gpt4": {
        console.log("Changing model...");
        model = "gpt-4";
      }
      case "/clear": {
        console.log("Clearing chat...");
        await client.clearChat(message.chatId);
      }
    }
    return message;
  }

  const messages = (await client.getGptArray(message.chatId, 10)).map(
    (message) => ({
      ...message,
      content: message.content.replace(prefix, ""),
    })
  );

  console.log(messages);
  const completion = await openai.createChatCompletion({
    model,
    messages: [
      { role: "system", content: "You are a helpful assistant." },
      ...messages,
      { role: "user", content: text },
    ],
  });
  const response = completion.data.choices[0].message?.content;
  const reply = await client.reply(
    message.chatId,
    `${prefix}${response}`,
    message.id
  );
  console.table({
    sessionId,
    text,
    chat: message.chatId,
    id: reply,
  });
  return message;
}
