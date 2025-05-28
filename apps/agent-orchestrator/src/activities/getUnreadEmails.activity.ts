import { AppContext } from '../appContext';
import { EmailWorkersClient } from '@common/clients/http';

// use GRPC in the future
export async function getUnreadEmailsActivity(): Promise<void> {
  try {
    console.log('getUnreadEmailsActivity...');
    const app = await AppContext.get();
    const emailWorkerClient = app.get(EmailWorkersClient);

    await emailWorkerClient.getUnreadEmails();
  } catch (error) {
    console.error('Error in getUnreadEmailsActivity:', error);
  }
}
