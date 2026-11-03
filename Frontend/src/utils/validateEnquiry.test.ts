import { EnquiryErrorText, EnquiryField } from '../constants/Text';
import type { EnquiryValues } from '../types/Enquiry';
import { EnquiryLimitMessage } from './enquiryLimitMessages';
import { findFirstInvalidField, validateEnquiry } from './validateEnquiry';

const validValues: EnquiryValues = {
  [EnquiryField.NAME]: 'Ada Lovelace',
  [EnquiryField.EMAIL]: 'ada@example.com',
  [EnquiryField.PHONE]: '',
  [EnquiryField.MESSAGE]: 'Is this in stock?',
  [EnquiryField.WEBSITE]: '',
};

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

const withValue = (field: EnquiryField, value: string): EnquiryValues => ({ ...validValues, [field]: value });

describe('validateEnquiry', () => {
  it('accepts valid values, with the phone number left out', () => {
    expect(validateEnquiry(validValues)).toEqual({});
  });

  it('requires name, email and message, ignoring surrounding spaces', () => {
    const errors = validateEnquiry({ ...validValues, name: '   ', email: '', message: ' ' });
    expect(errors).toEqual({
      name: EnquiryErrorText.NAME_REQUIRED,
      email: EnquiryErrorText.EMAIL_REQUIRED,
      message: EnquiryErrorText.MESSAGE_REQUIRED,
    });
  });

  // Same table as the backend test (enquiryEmailParity.test.ts); results were checked against zod's z.email().
  it.each(EMAIL_PARITY_TABLE)('email %s -> accepted: %s', (email, isAccepted) => {
    const error = validateEnquiry(withValue(EnquiryField.EMAIL, email)).email;
    expect(error).toBe(isAccepted ? undefined : EnquiryErrorText.EMAIL_INVALID);
  });

  it('rejects too long values', () => {
    expect(validateEnquiry(withValue(EnquiryField.NAME, 'a'.repeat(101))).name).toBe(EnquiryLimitMessage.NAME_TOO_LONG);
    expect(validateEnquiry(withValue(EnquiryField.EMAIL, `${'a'.repeat(250)}@b.com`)).email).toBe(
      EnquiryLimitMessage.EMAIL_TOO_LONG,
    );
    expect(validateEnquiry(withValue(EnquiryField.MESSAGE, 'a'.repeat(1001))).message).toBe(
      EnquiryLimitMessage.MESSAGE_TOO_LONG,
    );
  });

  it('accepts a phone number with digits, spaces, + - and brackets', () => {
    expect(validateEnquiry(withValue(EnquiryField.PHONE, '+44 (20) 7946-0000'))).toEqual({});
  });

  it('rejects phone numbers with the wrong characters or length', () => {
    expect(validateEnquiry(withValue(EnquiryField.PHONE, '0123456abc')).phone).toBe(EnquiryErrorText.PHONE_INVALID);
    expect(validateEnquiry(withValue(EnquiryField.PHONE, '12345')).phone).toBe(EnquiryLimitMessage.PHONE_LENGTH);
    expect(validateEnquiry(withValue(EnquiryField.PHONE, '1'.repeat(21))).phone).toBe(EnquiryLimitMessage.PHONE_LENGTH);
  });
});

describe('findFirstInvalidField', () => {
  it('returns the first invalid field in screen order', () => {
    expect(findFirstInvalidField({ message: 'x', email: 'y' })).toBe(EnquiryField.EMAIL);
  });

  it('returns undefined when there are no errors', () => {
    expect(findFirstInvalidField({})).toBeUndefined();
  });
});
