import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { getAppContext } from '../getAppContext';
import { EmailThreadResponseDTO, fetchObservableResult } from '@common';

export async function getUnreadEmailsActivity(): Promise<void> {
  console.log('getUnreadEmailsActivity...');
  const app = await getAppContext();
  const configService = app.get(ConfigService);
  const httpService = app.get(HttpService);
  const baseURL = 'http://' + configService.get('apps.emailWorker.baseUrl');

  const request = httpService.get(`${baseURL}/email-workers/unread-emails`);

  await fetchObservableResult<EmailThreadResponseDTO>(request);
}
