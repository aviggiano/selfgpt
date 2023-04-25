import * as dotenv from "dotenv";
dotenv.config();

const config = {
  apiKey: process.env.OPENAI_API_KEY!,
  chatNames: process.env.CHAT_NAME!.split(","),
};

export default config;
