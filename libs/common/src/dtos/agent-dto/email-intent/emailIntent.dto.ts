import { EmailIntentSchema } from '@tools-langchain';
import z from 'zod';

export type TEmailIntentResponseDTO = z.infer<typeof EmailIntentSchema>;
