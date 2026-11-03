import { useEffect, useRef, useState, type FormEvent } from 'react';
import { EnquiryField, EnquiryText } from '../constants/Text';
import { SubmitStatus, useSubmitEnquiry } from '../hooks/useSubmitEnquiry';
import { useEnquiryForm } from '../hooks/useEnquiryForm';
import type { Product } from '../types/Product';
import { focusFormField, focusPanelHeading } from '../utils/focusFormField';
import EnquiryForm from './EnquiryForm';
import EnquiryThanks from './EnquiryThanks';
import Modal from './Modal';

type EnquirySectionProps = {
  product: Product;
};

// Container: connects the form state and the submit state to the presentational components.
const EnquirySection = ({ product }: EnquirySectionProps) => {
  const form = useEnquiryForm();
  const { status, errorMessage, submit, reset } = useSubmitEnquiry(product.id);
  const [isOpen, setIsOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const isSuccess = status === SubmitStatus.SUCCESS;

  // When the pop-up opens, put the cursor in the first field so the visitor can start typing straight away.
  // When the thank-you replaces the form, focus its heading so screen readers read it out.
  useEffect(() => {
    if (!isOpen) return;
    if (isSuccess) focusPanelHeading(panelRef.current);
    else focusFormField(formRef.current, EnquiryField.NAME);
  }, [isOpen, isSuccess]);

  const handleEnquireClick = () => setIsOpen(true);

  const handleEnquirySubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === SubmitStatus.SUBMITTING) return;
    const firstInvalidField = form.validateForSubmit();
    if (firstInvalidField) {
      focusFormField(formRef.current, firstInvalidField);
      return;
    }
    void submit(form.values);
  };

  const handleSendAnotherClick = () => {
    form.resetForm();
    reset();
  };

  // A half-written form is kept when the pop-up is closed, so closing by accident loses nothing.
  // After a successful send there is nothing to keep, so the next opening starts fresh.
  const handleModalClose = () => {
    setIsOpen(false);
    if (isSuccess) handleSendAnotherClick();
  };

  const renderPanel = () => {
    if (isSuccess) return <EnquiryThanks onSendAnother={handleSendAnotherClick} />;
    return (
      <EnquiryForm
        productTitle={product.title}
        values={form.values}
        errors={form.visibleErrors}
        isSubmitting={status === SubmitStatus.SUBMITTING}
        submitError={errorMessage}
        formRef={formRef}
        onFieldChange={form.handleFieldChange}
        onFieldBlur={form.handleFieldBlur}
        onSubmit={handleEnquirySubmit}
      />
    );
  };

  return (
    <section>
      <button className="button" type="button" aria-haspopup="dialog" onClick={handleEnquireClick}>
        {EnquiryText.ENQUIRE_BUTTON}
      </button>
      {/* Always rendered: screen readers only announce changes inside a region that already exists. */}
      <p className="visually-hidden" role="status">
        {isSuccess ? EnquiryText.THANKS_ANNOUNCEMENT : ''}
      </p>
      <Modal isOpen={isOpen} label={`${EnquiryText.HEADING_PREFIX} ${product.title}`} onClose={handleModalClose}>
        <div ref={panelRef}>{isOpen && renderPanel()}</div>
      </Modal>
    </section>
  );
};

export default EnquirySection;
