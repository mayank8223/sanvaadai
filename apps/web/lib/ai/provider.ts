/**
 * T27 – Vercel AI SDK + OpenAI provider configuration.
 * Use this module for LLM calls (generateText, generateObject, etc.) and transcription.
 */

/* ----------------- Globals --------------- */
import { openai } from '@ai-sdk/openai';

import { DEFAULT_CHAT_MODEL, DEFAULT_TRANSCRIPTION_MODEL } from './constants';

/* ----------------- Exports --------------- */

/** OpenAI chat model for text generation (form creation, answer drafting, etc.). */
export const chatModel = () => openai(DEFAULT_CHAT_MODEL);

/** OpenAI transcription model for speech-to-text. */
export const transcriptionModel = () => openai.transcription(DEFAULT_TRANSCRIPTION_MODEL);

/** Raw OpenAI provider instance for custom model selection. */
export { openai };
