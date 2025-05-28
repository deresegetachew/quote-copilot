import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { AppContext } from '../appContext';
import { EmailThreadResponseDTO, fetchObservableResult } from '@common';
import { EmailWorkersClient } from '@common/clients/http';
import { ApplicationFailure } from '@temporalio/common';

// use GRPC in the future
export async function getUnreadEmailsActivity(): Promise<void> {
  try {
    console.log('getUnreadEmailsActivity...');
    const app = await AppContext.get();
    const emailWorkerClient = app.get(EmailWorkersClient);

    await emailWorkerClient.getUnreadEmails();
  } catch (error) {
    console.error('Error in getUnreadEmailsActivity:', error);
    throw ApplicationFailure.nonRetryable('Invalid configuration');
  }
}
