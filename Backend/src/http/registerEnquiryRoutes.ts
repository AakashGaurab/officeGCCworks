import type { FastifyInstance } from 'fastify';
import type { EnquiryService } from '../application/EnquiryService.js';
import {
  ENQUIRY_BODY_LIMIT_BYTES,
  ENQUIRY_RATE_LIMIT_MAX,
  ENQUIRY_RATE_LIMIT_WINDOW_MS,
  HTTP_STATUS,
} from '../config/constants.js';
import { enquiryBodySchema } from './requestSchemas.js';

export enum EnquiryRoutePath {
  ENQUIRIES = '/enquiries',
}

// The customer is told only that the enquiry was received, never the internal email status.
export enum EnquiryReceiptStatus {
  RECEIVED = 'received',
}

const ROUTE_OPTIONS = {
  bodyLimit: ENQUIRY_BODY_LIMIT_BYTES,
  config: { rateLimit: { max: ENQUIRY_RATE_LIMIT_MAX, timeWindow: ENQUIRY_RATE_LIMIT_WINDOW_MS } },
};

export const registerEnquiryRoutes = async (
  app: FastifyInstance,
  service: EnquiryService,
): Promise<void> => {
  app.post(EnquiryRoutePath.ENQUIRIES, ROUTE_OPTIONS, async (request, reply) => {
    const { id } = await service.submit(enquiryBodySchema.parse(request.body));
    return reply.status(HTTP_STATUS.CREATED).send({ id, status: EnquiryReceiptStatus.RECEIVED });
  });
};
