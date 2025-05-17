import { AIMessageChunk, BaseMessage } from '@langchain/core/messages';
import { Runnable } from '@langchain/core/runnables';
import { PromptBody } from '../../../prompts/src';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { ZodSchema } from 'zod';

// Runnable that takes a list of messages and returns a ChatResult
export type LLMRunnable = Runnable<BaseMessage[], AIMessageChunk>;
export interface ClientStrategy {
  getModel(): Promise<BaseChatModel>;
}
