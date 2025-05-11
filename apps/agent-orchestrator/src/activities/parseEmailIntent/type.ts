export type TParseEmailActivityResponse = {
  summary: string | null;
  isRFQ: boolean | null;
  reason: string | null;
  rfqData: any | null;
  error: { message: string; obj: any } | null;
  messages: string[];
};
