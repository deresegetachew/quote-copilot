export interface TConfirmationTemplateBody {
  tenantName: string;
  orderDetails: any;
}

export interface TGenerateQuoteTemplateBody {
  tenantName: string;
  quoteDetails: any;
}

export interface TProcurementPromptsTemplate {
  confirmation: {
    file: string;
    payload: TConfirmationTemplateBody;
  };
  generateQuote: {
    file: string;
    payload: TGenerateQuoteTemplateBody;
  };
  parseEmail: {
    file: string;
    payload: any;
  };
  resendEmail: {
    file: string;
    payload: any;
  };
  statusUpdate: {
    file: string;
    payload: any;
  };
}
