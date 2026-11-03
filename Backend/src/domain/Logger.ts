// The small part of a logger the enquiry code needs. Fastify's logger satisfies it.
export interface Logger {
  info(context: object, message: string): void;
  warn(context: object, message: string): void;
  error(context: object, message: string): void;
}
