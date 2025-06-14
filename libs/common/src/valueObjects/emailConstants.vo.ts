export enum EMAIL_ENUMS {
  REQUEST_RECEIVED = 'REQUEST_RECEIVED',
  RFQ_NEW_CONFIRMATION = 'RFQ_NEW_CONFIRMATION',
  RFQ_FOLLOWUP_CONFIRMATION = 'RFQ_FOLLOWUP_CONFIRMATION',
}

export const EmailConstants = {
  [EMAIL_ENUMS.REQUEST_RECEIVED]: {
    subject: 'Request Received',
    templatePath: './dummy.mjml.hbs',
  },
  [EMAIL_ENUMS.RFQ_NEW_CONFIRMATION]: {
    subject: 'RFQ Request Received - We\'re Processing Your Inquiry',
    templatePath: './rfq-new-confirmation.mjml.hbs',
  },
  [EMAIL_ENUMS.RFQ_FOLLOWUP_CONFIRMATION]: {
    subject: 'Re: Your RFQ Request - Update Received',
    templatePath: './rfq-followup-confirmation.mjml.hbs',
  },
};
