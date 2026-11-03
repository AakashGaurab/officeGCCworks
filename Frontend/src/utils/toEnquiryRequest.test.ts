import { EnquiryField } from '../constants/Text';
import { toEnquiryRequest } from './toEnquiryRequest';

const values = {
  [EnquiryField.NAME]: ' Ada ',
  [EnquiryField.EMAIL]: ' ada@example.com ',
  [EnquiryField.PHONE]: '  ',
  [EnquiryField.MESSAGE]: ' Hello ',
  [EnquiryField.WEBSITE]: '',
};

describe('toEnquiryRequest', () => {
  it('trims text and leaves out an empty phone number', () => {
    expect(toEnquiryRequest(7, values)).toEqual({
      productId: 7,
      name: 'Ada',
      email: 'ada@example.com',
      message: 'Hello',
      website: '',
    });
  });

  it('keeps a given phone number', () => {
    expect(toEnquiryRequest(7, { ...values, phone: ' 0123456789 ' })).toMatchObject({ phone: '0123456789' });
  });
});
