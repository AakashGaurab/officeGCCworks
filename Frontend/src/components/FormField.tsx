import type { ChangeEventHandler, FocusEventHandler } from 'react';
import { ENQUIRY_FIELD_ID_PREFIX, ERROR_ID_SUFFIX } from '../constants/AppConstants';
import './FormField.css';

type FormFieldProps = {
  name: string;
  label: string;
  value: string;
  error?: string;
  type?: string;
  autoComplete?: string;
  maxLength?: number;
  rows?: number;
  isRequired?: boolean;
  onChange: ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  onBlur: FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>;
};

// A labelled input (or textarea when `rows` is given) with its error message linked for screen readers.
const FormField = ({
  name,
  label,
  value,
  error,
  type,
  autoComplete,
  maxLength,
  rows,
  isRequired = false,
  onChange,
  onBlur,
}: FormFieldProps) => {
  const fieldId = `${ENQUIRY_FIELD_ID_PREFIX}${name}`;
  const errorId = `${fieldId}${ERROR_ID_SUFFIX}`;
  const sharedProps = {
    id: fieldId,
    name,
    value,
    maxLength,
    autoComplete,
    'aria-required': isRequired,
    className: 'form-field-control',
    'aria-invalid': Boolean(error),
    'aria-describedby': error ? errorId : undefined,
    onChange,
    onBlur,
  };

  return (
    <div className="form-field">
      <label htmlFor={fieldId}>{label}</label>
      {rows ? <textarea {...sharedProps} rows={rows} /> : <input {...sharedProps} type={type} />}
      {error && (
        <p id={errorId} className="form-field-error">
          {error}
        </p>
      )}
    </div>
  );
};

export default FormField;
