import { GetUnreadEmailsUseCase } from '../application/useCases/emailUsecases/getUnreadEmails.useCase';

export class GmailPoller {
  constructor(
    private readonly getUnreadEmailsUseCase: GetUnreadEmailsUseCase,
  ) {}

  async poll(): Promise<void> {
    const unreadMessages = await this.getUnreadEmailsUseCase.execute();
    console.log('Fetched unread messages:', unreadMessages);
    // Further processing logic can be added here
  }
}
