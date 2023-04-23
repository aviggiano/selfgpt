import { Configuration, OpenAIApi } from "openai";
import config from "./config";
import { Client, Message } from "@open-wa/wa-automate";

const openai = new OpenAIApi(new Configuration({ apiKey: config.apiKey }));
const prefix = `${config.chatName}: `;

const processedMessages: string[] = [];

export async function handle(message: Message, client: Client) {
  if (
    processedMessages.includes(message.id) ||
    message.text.startsWith(config.chatName)
  )
    return message;
  processedMessages.push(message.id);
  let text = message.text;
  let sessionId = client.getSessionId();
  console.log("Processing...", text);
  const messages = (await client.getGptArray(message.chatId, 10)).map(
    (message) => ({
      ...message,
      content: message.content.replace(prefix, ""),
    })
  );

  console.log(messages);
  const completion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: "You are a helpful assistant." }, // You can change the system prompt
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
