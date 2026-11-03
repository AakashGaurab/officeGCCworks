import { describe, expect, it } from 'vitest';
import { enquiryBodySchema } from '../src/http/requestSchemas.js';

// The same table lives in the Frontend (validateEnquiry.test.ts), so the form and the API agree.
// Expected results were produced by running the real zod email schema.
const EMAIL_PARITY_TABLE: ReadonlyArray<readonly [string, boolean]> = [
  ['ada@example.com', true],
  ['a.b+c@sub.example.co.uk', true],
  ['a@b.co', true],
  ['a@b.c', false],
  ['a@b..com', false],
  ['a.@b.com', false],
  ['a@-b.com', false],
  ['a@b.com.', false],
  ['a@b_c.com', false],
  ['é@b.com', false],
  ['"a"@b.com', false],
  ['a@[1.2.3.4]', false],
  ['a@b', false],
  ['a b@c.com', false],
  ['@c.com', false],
];

const body = { productId: 1, name: 'Ada', message: 'Hello' };

describe('enquiry email validation parity table', () => {
  it.each(EMAIL_PARITY_TABLE)('%s -> accepted: %s', (email, expected) => {
    expect(enquiryBodySchema.safeParse({ ...body, email }).success).toBe(expected);
  });
});
