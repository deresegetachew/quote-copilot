import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import {
  TGetEmailThreadMessagesResponse,
  TGetUnreadEmailsResponse,
} from '../../dtos';
import { fetchObservableResult } from '../../utils';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailWorkersClient {
  private baseURL: string;

  constructor(
    private readonly httpClient: HttpService,
    private configService: ConfigService,
  ) {
    this.baseURL =
      this.configService.get<string>('apps.emailWorker.baseUrl') ?? '';
  }

  async getEmailThreadMessages(
    storageThreadID: string,
  ): Promise<TGetEmailThreadMessagesResponse> {
    const request = await this.httpClient.get<TGetEmailThreadMessagesResponse>(
      `${this.baseURL}/email-workers/email-threads/${storageThreadID}/messages`,
    );
    return await fetchObservableResult<TGetEmailThreadMessagesResponse>(
      request,
    );
  }

  async getUnreadEmails(): Promise<TGetUnreadEmailsResponse[]> {
    const request = await this.httpClient.get<TGetUnreadEmailsResponse[]>(
      `${this.baseURL}/email-workers/unread-emails`,
    );

    return await fetchObservableResult<TGetUnreadEmailsResponse[]>(request);
  }
}
