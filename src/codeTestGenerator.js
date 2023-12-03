import 'dotenv/config';

import { OpenAI } from 'langchain/llms/openai';
import { PromptTemplate } from 'langchain/prompts';
import { LLMChain, SequentialChain } from 'langchain/chains';

const llm = new OpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
});

const codePrompt = new PromptTemplate({
  template: 'Write a very short {language} function that will {task}',
  inputVariables: ['language', 'task'],
});

const testPrompt = new PromptTemplate({
  template: 'Write a test for the following {language} code: \n{code}',
  inputVariables: ['language', 'code'],
});

const codeChain = new LLMChain({
  llm,
  prompt: codePrompt,
  // by default the returned property is called "text", rename it to "code"
  outputKey: 'code',
});

const testChain = new LLMChain({
  llm,
  prompt: testPrompt,
  outputKey: 'test',
});

const chain = new SequentialChain({
  chains: [codeChain, testChain],
  inputVariables: ['language', 'task'],
  outputVariables: ['test', 'code'],
});

const [, , language, task] = process.argv;

const inputs = {
  language,
  task,
};
console.log(inputs);

const result = await chain.call(inputs);

console.log(result);

// const text = 'Write a very very short poem';

// const llmResult = await llm.predict(text);

// console.log('hi', llmResult);
