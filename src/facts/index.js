import 'dotenv/config';

import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { TextLoader } from 'langchain/document_loaders/fs/text';
import { CharacterTextSplitter } from 'langchain/text_splitter';

// terminal run `ALLOW_RESET=TRUE chroma run`
import { Chroma } from 'langchain/vectorstores/chroma';

const embeddings = new OpenAIEmbeddings({
  openAIApiKey: process.env.OPENAI_API_KEY,
});

// convert text to embeddings (array of numbers (1536) from -1 to 1)
// const emb = await embeddings.embedQuery('hi there');

// console.log({ emb });
const loader = new TextLoader('src/facts/facts.txt');
// const docs = await loader.load(); // raw content

const docs = await loader.loadAndSplit(
  new CharacterTextSplitter({
    // NOT: split by separator then chunk
    // YES: find first 200 characters and then find the closest separator and split
    chunkSize: 200,
    separator: '\n',
    chunkOverlap: 0, // how many characters allowed to be overlapped between each chunk
  })
); // splited content

// console.log(docs);

// cost money - immediately reach out to OpenAIEmbeddings and calculate the passed in docs
const db = await Chroma.fromDocuments(docs, embeddings, {
  collectionName: 'emb',
});

const results = await db.similaritySearch(
  'What is an interesting fact about the English language?'
  // 1,  // number of result to return. in this case. return only 1 most relavent result
);

results.map((res) => {
  console.log(res);
});
// console.log({ results });
