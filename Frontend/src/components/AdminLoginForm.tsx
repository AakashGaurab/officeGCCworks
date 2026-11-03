import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { ADMIN_TOKEN_INPUT_ID, AutoComplete, HEADING_TAB_INDEX, InputType } from '../constants/AppConstants';
import { AdminText } from '../constants/Text';
import './AdminLoginForm.css';
import './FormField.css';

type AdminLoginFormProps = {
  error: string | null;
  notice: string | null;
  isSigningIn: boolean;
  onSignIn: (token: string) => void;
};

const ERROR_ID = `${ADMIN_TOKEN_INPUT_ID}-error`;

const AdminLoginForm = ({ error, notice, isSigningIn, onSignIn }: AdminLoginFormProps) => {
  const [tokenValue, setTokenValue] = useState('');
  const errorRef = useRef<HTMLParagraphElement>(null);

  // Move focus to the message so screen reader and keyboard users notice a failed sign-in.
  useEffect(() => {
    if (error) errorRef.current?.focus();
  }, [error]);

  const handleTokenChange = (event: ChangeEvent<HTMLInputElement>) => setTokenValue(event.target.value);

  const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSignIn(tokenValue);
  };

  return (
    <form className="admin-login-form" noValidate onSubmit={handleFormSubmit}>
      {notice && (
        <p className="admin-login-notice" role="status">
          {notice}
        </p>
      )}
      <div className="form-field">
        <label htmlFor={ADMIN_TOKEN_INPUT_ID}>{AdminText.TOKEN_LABEL}</label>
        <input
          id={ADMIN_TOKEN_INPUT_ID}
          className="form-field-control"
          type={InputType.PASSWORD}
          autoComplete={AutoComplete.CURRENT_PASSWORD}
          value={tokenValue}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? ERROR_ID : undefined}
          onChange={handleTokenChange}
        />
      </div>
      {/* Always rendered, so a screen reader announces the text when it appears. */}
      <div aria-live="assertive">
        {error && (
          <p id={ERROR_ID} ref={errorRef} className="form-field-error" tabIndex={HEADING_TAB_INDEX}>
            {error}
          </p>
        )}
      </div>
      <button className="button" type="submit" disabled={isSigningIn}>
        {isSigningIn ? AdminText.SIGNING_IN : AdminText.SIGN_IN}
      </button>
    </form>
  );
};

export default AdminLoginForm;
