import { PromptBody } from '../../../prompts/src';

export interface ClientStrategy {
  /**
   * Invokes the LLM with the given messages.
   * @param messages - The messages to send to the LLM.
   * @returns A promise that resolves to the response from the LLM.
   */
  invokeLLM(messages: PromptBody): Promise<any>;
}
