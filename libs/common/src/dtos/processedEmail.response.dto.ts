export class ProcessedEmailResponseDTO {
  output: {
    customer: string;
    partNumber: string;
    quantity: number | string;
    urgency: string;
    email?: string;
    subject?: string;
    threadId?: string;
  };
} 