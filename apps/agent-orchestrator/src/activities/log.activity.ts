export async function logInfoActivity(msg: string): Promise<void> {
  console.log(`[TemporalLog] ${new Date().toISOString()} — ${msg}`);
}

export async function logInfo(msg: string): Promise<void> {
  console.log(`[TemporalLog] ${new Date().toISOString()} — ${msg}`);
}
