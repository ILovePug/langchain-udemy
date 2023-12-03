import { Embeddings } from 'langchain/embeddings/base';
import { Chroma } from 'langchain/vectorstores/chroma';
import { BaseRetriever } from 'langchain/schema/retriever';

export class RedundantFilterRetriever extends BaseRetriever {
  constructor(embedding, chromaInstance) {
    super();
    /** @type {Embeddings} */
    this.embedding = embedding;

    /** @type {Chroma} */
    this.chroma = chromaInstance;
  }
  async getRelevantDocuments(query) {
    // caculate embeedings for the 'query' string
    // const emb = await this.embedding.embedQuery(query);
    return this.chroma.similaritySearch(query);
    // return this.chroma.maxMarginalRelevanceSearch(query, {
    //   lambda: 0.8,
    // });
  }
}
