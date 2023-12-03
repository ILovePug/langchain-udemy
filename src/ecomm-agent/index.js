import 'dotenv/config';

import { ChatOpenAI } from 'langchain/chat_models/openai';
import { formatToOpenAITool } from 'langchain/tools';
import { SystemMessage } from 'langchain/schema';
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  MessagesPlaceholder,
} from 'langchain/prompts';
import { AgentExecutor } from 'langchain/agents';
import { RunnableSequence } from 'langchain/schema/runnable';
import { formatToOpenAIToolMessages } from 'langchain/agents/format_scratchpad/openai_tools';
import { OpenAIToolsAgentOutputParser } from 'langchain/agents/openai/output_parser';
import { ConversationSummaryBufferMemory } from 'langchain/memory';
import { runQueryTool, describeTablesTool, listTables } from './tools/sql.js';
import { writeReportTool } from './tools/report.js';
import { ChatModelStartHandler } from './handlers/chat-model-start-handler.js';
import { ConsoleCallbackHandler } from 'langchain/callbacks';

const handler = new ChatModelStartHandler();
const chat = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
  // verbose: true,
  callbacks: [handler],
});

const tableList = await listTables();
const TABLENAMES = tableList.join('\n');

const prompt = ChatPromptTemplate.fromMessages([
  new SystemMessage(
    `You are an AI that has access to a SQLite database.
    The database has the following tables:
    ${TABLENAMES}

    Do not make any assumptions about what tables exist or what columns exist. Instead, use the 'describeTables' function with the table names.

    `
  ),
  new MessagesPlaceholder('chat_history'),
  HumanMessagePromptTemplate.fromTemplate('{input}'),
  // internal memory to keep track of the function execution chat
  // all function history will get removed after the function execution and AIMessage
  // is returned.
  // `memory` will be used to keep track of the returned AIMessage
  new MessagesPlaceholder('agent_scratchpad'),
]);

// memory needs to be passed into agentExecutor to keep track of the chat history
const memory = new ConversationSummaryBufferMemory({
  // the custom field name to store all the message history
  memoryKey: 'chat_history',
  // instead of storing each message as string, wrap each message in specific classes (extend BaseMessages) such as HumanMessage and SystemMessage
  returnMessages: true,
  llm: chat,
});

const tools = [runQueryTool, describeTablesTool, writeReportTool];

// Convert to OpenAI tool format
const modelWithTools = chat.bind({ tools: tools.map(formatToOpenAITool) });

const agent = RunnableSequence.from([
  {
    input: (i) => i.input,
    chat_history: (i) => i.chat_history,
    agent_scratchpad: (i) => formatToOpenAIToolMessages(i.steps),
  },
  prompt,
  modelWithTools,
  new OpenAIToolsAgentOutputParser(),
]); //.withConfig({ runName: 'OpenAIToolsAgent' });

const agentExecutor = new AgentExecutor({
  agent,
  // verbose: true,
  tools,
  memory,
});

// const QUESTION =
//   'how many users are in the database?';

// const QUESTION =
//   'how many users are in the database that has provided shipping address?';

// const QUESTION =
//   'Summarize the top 5 most popular products. Write the results to a report file.';

const QUESTION =
  'How many orders are there? Write the result to an html report.';

const res = await agentExecutor.invoke(
  {
    input: QUESTION,
  }
  // { callbacks: [handler] }
);

console.log(res);

// const res1 = await agentExecutor.invoke({
//   input: 'Repeat the exact same process for users.',
// });
// console.log(res1);
