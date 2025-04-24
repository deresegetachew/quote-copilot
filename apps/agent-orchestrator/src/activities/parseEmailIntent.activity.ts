export async function parseEmailIntentActivity(
  threadId: string,
  messageId: string,
): Promise<{ threadId: string; partNumber: string; quantity: number }> {
  console.log('Parsing email intent with threadId:', threadId, messageId);
  // in the future we will fire langgraph to parse the email
  return { threadId, partNumber: 'ABC123', quantity: 1 };
}
