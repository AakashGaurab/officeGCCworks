import { FOCUS_HEADING_SELECTOR } from '../constants/AppConstants';

// Moves keyboard focus to a field of the form by its name, so users land on the first mistake.
export const focusFormField = (form: HTMLFormElement | null, fieldName: string): void => {
  const field = form?.elements.namedItem(fieldName);
  if (field instanceof HTMLElement) field.focus();
};

// Moves focus to the heading inside a panel (the heading has tabIndex -1), so screen reader and
// keyboard users start reading at the new content instead of staying on the button.
export const focusPanelHeading = (panel: HTMLElement | null): void => {
  panel?.querySelector<HTMLElement>(FOCUS_HEADING_SELECTOR)?.focus();
};
