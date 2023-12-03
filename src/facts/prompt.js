import 'dotenv/config';

import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { RetrievalQAChain } from 'langchain/chains';
import { ChatOpenAI } from 'langchain/chat_models/openai';

// terminal run `ALLOW_RESET=TRUE chroma run`
import { Chroma } from 'langchain/vectorstores/chroma';

import { RedundantFilterRetriever } from './redundant-filter-retriever.js';

const embeddings = new OpenAIEmbeddings({
  openAIApiKey: process.env.OPENAI_API_KEY,
});

const chat = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
  verbose: true,
});

// cost money - immediately reach out to OpenAIEmbeddings and calculate the passed in docs
const db = new Chroma(embeddings, { collectionName: 'emb' });

// original retriever without dedup
// const retriever = db.asRetriever();

// custom retriever with dedup
const retriever = new RedundantFilterRetriever(embeddings, db);

const chain = RetrievalQAChain.fromLLM(chat, retriever);

const question = 'What is an interesting fact about the English language?';
const results = await chain.run(question);

// results.map((res) => {
//   console.log(res);
// });
console.log({ results });
