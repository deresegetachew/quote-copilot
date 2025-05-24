import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { AppContext } from '../appContext';
import { EmailThreadResponseDTO, fetchObservableResult } from '@common';

export async function getUnreadEmailsActivity(): Promise<void> {
  console.log('getUnreadEmailsActivity...');
  const app = await AppContext.get();
  const configService = app.get(ConfigService);
  const httpService = app.get(HttpService);
  const baseURL = 'http://' + configService.get('apps.emailWorker.baseUrl');

  const request = httpService.get(`${baseURL}/email-workers/unread-emails`);

  await fetchObservableResult<EmailThreadResponseDTO>(request);
}
