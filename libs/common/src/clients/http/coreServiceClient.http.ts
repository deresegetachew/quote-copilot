import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { fetchObservableResult } from '../../utils';
import { TMessageIntentResponseDTO } from '../../dtos';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CoreServiceClient {
  private baseURL: string;

  constructor(
    private readonly httpClient: HttpService,
    private configService: ConfigService,
  ) {
    this.baseURL = this.configService.getOrThrow<string>(
      'apps.coreService.baseUrl',
    );
  }

  async parseMessageIntent(
    threadId: string,
    messageId: string,
  ): Promise<TMessageIntentResponseDTO> {
    const request = await this.httpClient.post(
      `${this.baseURL}/core-service/parse-message-intent`,
      {
        threadId,
        messageId,
      },
    );
    return await fetchObservableResult<TMessageIntentResponseDTO>(request);
  }
}
