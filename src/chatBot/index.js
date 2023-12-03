import 'dotenv/config';

import readline from 'readline';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
  MessagesPlaceholder,
} from 'langchain/prompts';
import { LLMChain, SequentialChain } from 'langchain/chains';
import {
  BufferMemory,
  ChatMessageHistory,
  ConversationSummaryMemory,
} from 'langchain/memory';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.on('close', function () {
  console.log('\nBYE BYE !!!');
  process.exit(0);
});

const ask = (query) => new Promise((resolve) => rl.question(query, resolve));

const chat = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
  verbose: true,
});

// const memory = new BufferMemory({
//   // export/import the chat history into file
//   // chatHistory: new ChatMessageHistory('messages.json'),
//   // the custom field name to store all the message history
//   memoryKey: 'my-messages',
//   // instead of storing each message as string, wrap each message in specific classes (extend BaseMessages) such as HumanMessage and SystemMessage
//   returnMessages: true,
// });

// internally call another prompt to summary all histories
const memory = new ConversationSummaryMemory({
  // the custom field name to store all the message history
  memoryKey: 'my-messages',
  // instead of storing each message as string, wrap each message in specific classes (extend BaseMessages) such as HumanMessage and SystemMessage
  returnMessages: true,
  // llm for the internal prompt
  llm: chat,
});

const prompt = new ChatPromptTemplate({
  inputVariables: ['content', 'my-messages'],
  promptMessages: [
    new MessagesPlaceholder('my-messages'),
    HumanMessagePromptTemplate.fromTemplate('{content}'),
  ],
});

const chain = new LLMChain({
  llm: chat,
  prompt,
  memory,
  verbose: true,
});

while (true) {
  const content = await ask('>> ');

  const result = await chain.invoke({ content });

  console.log(result.text);
}
