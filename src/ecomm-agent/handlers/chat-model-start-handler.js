import { BaseCallbackHandler } from 'langchain/callbacks';

export class ChatModelStartHandler extends BaseCallbackHandler {
  name = 'custom_handler';

  handleLLMNewToken(token) {
    console.log('handleLLMNewToken', { token });
  }

  handleLLMStart(llm, prompts) {
    console.log('handleLLMStart', { llm, prompts });
  }

  handleLLMEnd(output) {
    console.log('handleLLMEnd');
    console.dir({ output }, { depth: null });
  }

  handleChainStart(chain) {
    console.log('handleChainStart', { chain });
  }

  handleAgentAction(action) {
    console.log('handleAgentAction', action);
  }

  handleToolStart(tool) {
    console.log('handleToolStart', { tool });
  }
}
