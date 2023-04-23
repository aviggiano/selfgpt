import * as dotenv from "dotenv";
dotenv.config();

const config = {
  apiKey: process.env.OPENAI_API_KEY!,
  chatName: process.env.CHAT_NAME!,
};

export default config;
