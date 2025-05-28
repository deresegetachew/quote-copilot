import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { EmailThreadResponseDTO } from '../../dtos';
import { fetchObservableResult } from '../../utils';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailWorkersClient {
  private baseURL: string;

  constructor(
    private readonly httpClient: HttpService,
    private configService: ConfigService,
  ) {
    this.baseURL = this.configService.get<string>('apps.emailWorker.baseUrl');
  }

  async getEmailThreadMessages(
    threadId: string,
  ): Promise<EmailThreadResponseDTO> {
    const request = await this.httpClient.get<EmailThreadResponseDTO>(
      `${this.baseURL}/email-workers/email-threads/${threadId}/messages`,
    );
    return await fetchObservableResult<EmailThreadResponseDTO>(request);
  }

  async getUnreadEmails(): Promise<EmailThreadResponseDTO[]> {
    const request = await this.httpClient.get<EmailThreadResponseDTO[]>(
      `${this.baseURL}/email-workers/unread-emails`,
    );

    return await fetchObservableResult<EmailThreadResponseDTO[]>(request);
  }
}
