import type { ChangeEventHandler, FocusEventHandler, FormEventHandler, RefObject } from 'react';
import {
  AutoComplete,
  ENQUIRY_EMAIL_MAX_LENGTH,
  ENQUIRY_FORM_ID,
  ENQUIRY_MESSAGE_MAX_LENGTH,
  ENQUIRY_MESSAGE_ROWS,
  ENQUIRY_NAME_MAX_LENGTH,
  ENQUIRY_PHONE_MAX_LENGTH,
  ENQUIRY_FIELD_ID_PREFIX,
  HEADING_TAB_INDEX,
  HONEYPOT_TAB_INDEX,
  InputType,
} from '../constants/AppConstants';
import { EnquiryField, EnquiryText } from '../constants/Text';
import type { EnquiryErrors, EnquiryValues } from '../types/Enquiry';
import FormField from './FormField';
import './EnquiryForm.css';

type FieldElement = HTMLInputElement | HTMLTextAreaElement;

type EnquiryFormProps = {
  productTitle: string;
  values: EnquiryValues;
  errors: EnquiryErrors;
  isSubmitting: boolean;
  submitError: string | null;
  formRef: RefObject<HTMLFormElement>;
  onFieldChange: ChangeEventHandler<FieldElement>;
  onFieldBlur: FocusEventHandler<FieldElement>;
  onSubmit: FormEventHandler<HTMLFormElement>;
};

const HONEYPOT_FIELD_ID = `${ENQUIRY_FIELD_ID_PREFIX}${EnquiryField.WEBSITE}`;

// Describes the visible fields once, so the markup below is just a loop.
const VISIBLE_FIELDS = [
  {
    name: EnquiryField.NAME,
    label: EnquiryText.NAME_LABEL,
    autoComplete: AutoComplete.NAME,
    maxLength: ENQUIRY_NAME_MAX_LENGTH,
    isRequired: true,
  },
  {
    name: EnquiryField.EMAIL,
    label: EnquiryText.EMAIL_LABEL,
    type: InputType.EMAIL,
    autoComplete: AutoComplete.EMAIL,
    maxLength: ENQUIRY_EMAIL_MAX_LENGTH,
    isRequired: true,
  },
  {
    name: EnquiryField.PHONE,
    label: EnquiryText.PHONE_LABEL,
    type: InputType.TEL,
    autoComplete: AutoComplete.TEL,
    maxLength: ENQUIRY_PHONE_MAX_LENGTH,
  },
  {
    name: EnquiryField.MESSAGE,
    label: EnquiryText.MESSAGE_LABEL,
    rows: ENQUIRY_MESSAGE_ROWS,
    maxLength: ENQUIRY_MESSAGE_MAX_LENGTH,
    isRequired: true,
  },
];

const EnquiryForm = ({
  productTitle,
  values,
  errors,
  isSubmitting,
  submitError,
  formRef,
  onFieldChange,
  onFieldBlur,
  onSubmit,
}: EnquiryFormProps) => {
  const renderField = (field: (typeof VISIBLE_FIELDS)[number]) => (
    <FormField
      key={field.name}
      {...field}
      value={values[field.name]}
      error={errors[field.name]}
      onChange={onFieldChange}
      onBlur={onFieldBlur}
    />
  );

  return (
    <form id={ENQUIRY_FORM_ID} ref={formRef} className="enquiry-form" noValidate onSubmit={onSubmit}>
      <h2 tabIndex={HEADING_TAB_INDEX}>
        {EnquiryText.HEADING_PREFIX} {productTitle}
      </h2>
      {VISIBLE_FIELDS.map(renderField)}
      {/* Honeypot: invisible to people and assistive technology, but bots fill it in. */}
      <div className="visually-hidden" aria-hidden="true">
        <label htmlFor={HONEYPOT_FIELD_ID}>{EnquiryText.HONEYPOT_LABEL}</label>
        <input
          id={HONEYPOT_FIELD_ID}
          name={EnquiryField.WEBSITE}
          type={InputType.TEXT}
          tabIndex={HONEYPOT_TAB_INDEX}
          autoComplete={AutoComplete.OFF}
          value={values[EnquiryField.WEBSITE]}
          onChange={onFieldChange}
        />
      </div>
      {submitError && (
        <p className="enquiry-form-error" role="alert">
          {submitError}
        </p>
      )}
      <button className="button" type="submit" disabled={isSubmitting}>
        {isSubmitting ? EnquiryText.SUBMITTING : EnquiryText.SUBMIT}
      </button>
    </form>
  );
};

export default EnquiryForm;
