import { useState, type ChangeEvent, type FocusEvent } from 'react';
import { EnquiryField } from '../constants/Text';
import type { EnquiryErrors, EnquiryValues } from '../types/Enquiry';
import { findFirstInvalidField, validateEnquiry } from '../utils/validateEnquiry';

type FieldElement = HTMLInputElement | HTMLTextAreaElement;
type TouchedFields = Partial<Record<EnquiryField, boolean>>;

const INITIAL_VALUES: EnquiryValues = {
  [EnquiryField.NAME]: '',
  [EnquiryField.EMAIL]: '',
  [EnquiryField.PHONE]: '',
  [EnquiryField.MESSAGE]: '',
  [EnquiryField.WEBSITE]: '',
};

// Holds the field values and decides which errors to show: a field's error appears after it was
// left (blur), and every error appears after a submit attempt.
export const useEnquiryForm = () => {
  const [values, setValues] = useState<EnquiryValues>(INITIAL_VALUES);
  const [touchedFields, setTouchedFields] = useState<TouchedFields>({});
  const [hasSubmitAttempt, setHasSubmitAttempt] = useState(false);

  const handleFieldChange = (event: ChangeEvent<FieldElement>) => {
    const { name, value } = event.target;
    setValues((previous) => ({ ...previous, [name]: value }));
  };

  const handleFieldBlur = (event: FocusEvent<FieldElement>) => {
    const { name } = event.target;
    setTouchedFields((previous) => ({ ...previous, [name]: true }));
  };

  const errors = validateEnquiry(values);

  const getVisibleErrors = (): EnquiryErrors => {
    if (hasSubmitAttempt) return errors;
    const visibleErrors: EnquiryErrors = {};
    (Object.keys(errors) as EnquiryField[]).forEach((field) => {
      if (touchedFields[field]) visibleErrors[field] = errors[field];
    });
    return visibleErrors;
  };

  // Returns the first invalid field (to focus it), or undefined when the form can be sent.
  const validateForSubmit = (): EnquiryField | undefined => {
    setHasSubmitAttempt(true);
    return findFirstInvalidField(errors);
  };

  const resetForm = () => {
    setValues(INITIAL_VALUES);
    setTouchedFields({});
    setHasSubmitAttempt(false);
  };

  return {
    values,
    visibleErrors: getVisibleErrors(),
    handleFieldChange,
    handleFieldBlur,
    validateForSubmit,
    resetForm,
  };
};
