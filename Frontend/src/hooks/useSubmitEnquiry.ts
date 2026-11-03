import { useCallback, useEffect, useRef, useState } from 'react';
import { submitEnquiry } from '../api/enquiryApi';
import type { EnquiryValues } from '../types/Enquiry';
import { toError } from '../utils/toError';
import { toSubmitErrorMessage } from '../utils/toSubmitErrorMessage';

export enum SubmitStatus {
  IDLE = 'idle',
  SUBMITTING = 'submitting',
  SUCCESS = 'success',
  ERROR = 'error',
}

type SubmitState = {
  status: SubmitStatus;
  errorMessage: string | null;
};

const IDLE_STATE: SubmitState = { status: SubmitStatus.IDLE, errorMessage: null };
const SUBMITTING_STATE: SubmitState = { status: SubmitStatus.SUBMITTING, errorMessage: null };
const SUCCESS_STATE: SubmitState = { status: SubmitStatus.SUCCESS, errorMessage: null };

// Small state machine: idle -> submitting -> success | error. From error the user can submit again.
export const useSubmitEnquiry = (productId: number) => {
  const [state, setState] = useState<SubmitState>(IDLE_STATE);
  const controllerRef = useRef<AbortController | null>(null);

  // Leaving the page cancels a request that is still running.
  useEffect(() => () => controllerRef.current?.abort(), []);

  const submit = useCallback(
    async (values: EnquiryValues) => {
      const controller = new AbortController();
      controllerRef.current = controller;
      setState(SUBMITTING_STATE);
      try {
        await submitEnquiry(productId, values, controller.signal);
        if (!controller.signal.aborted) setState(SUCCESS_STATE);
      } catch (error) {
        if (controller.signal.aborted) return;
        setState({ status: SubmitStatus.ERROR, errorMessage: toSubmitErrorMessage(toError(error)) });
      }
    },
    [productId],
  );

  const reset = useCallback(() => setState(IDLE_STATE), []);

  return { ...state, submit, reset };
};
