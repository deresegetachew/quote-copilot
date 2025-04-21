import { Injectable } from '@nestjs/common';
import * as fs from 'fs';

@Injectable()
export class PromptsService {
  getPromptsForKey<T>(promptFilePath: string): T {
    if (!fs.existsSync(promptFilePath)) {
      throw new Error(`Prompt file not found: ${promptFilePath}`);
    }
    const fileContent = fs.readFileSync(promptFilePath, 'utf-8');
    return JSON.parse(fileContent) as T;
  }
}
