import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { fetchObservableResult } from '../../utils';
import { MessageIntentResponseDTO } from '../../dtos';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CoreServiceClient {
  private baseURL: string;

  constructor(
    private readonly httpClient: HttpService,
    private configService: ConfigService,
  ) {
    this.baseURL = this.configService.get<string>('apps.coreService.baseUrl');
  }

  async parseMessageIntent(
    threadId: string,
    messageId: string,
  ): Promise<MessageIntentResponseDTO> {
    const request = await this.httpClient.post(
      `${this.baseURL}/core-service/parse-message-intent`,
      {
        threadId,
        messageId,
      },
    );
    return await fetchObservableResult<MessageIntentResponseDTO>(request);
  }
}
