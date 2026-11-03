import type { ReactNode } from 'react';
import './StateMessage.css';

type EmptyStateProps = {
  title: string;
  message: string;
  children?: ReactNode;
};

// children lets a page add an action (e.g. a link home) without this component knowing about routing.
const EmptyState = ({ title, message, children }: EmptyStateProps) => (
  <section className="state-message">
    <h2 className="state-message-title">{title}</h2>
    <p>{message}</p>
    {children}
  </section>
);

export default EmptyState;
