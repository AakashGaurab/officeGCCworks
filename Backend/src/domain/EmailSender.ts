export type EmailMessage = {
  // Reference only (used for logging); it is never sent in the email.
  enquiryId: string;
  to: string;
  subject: string;
  text: string;
  replyTo: string;
};

// Port: how an email leaves the system (log, SMTP, a cloud service such as SES, ...).
// Implementations throw when the email could not be sent.
export interface EmailSender {
  send(message: EmailMessage): Promise<void>;
}
