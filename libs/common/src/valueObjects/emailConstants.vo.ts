export enum EMAIL_ENUMS {
  REQUEST_RECEIVED = 'REQUEST_RECEIVED',
}

export const EmailConstants = {
  [EMAIL_ENUMS.REQUEST_RECEIVED]: {
    subject: 'Request Received',
    templatePath: './dummy.mjml.hbs',
  },
};
