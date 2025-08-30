import React from "react";
import "../styles/tokens.css";

/**
 * PUBLIC_INTERFACE
 * Card
 * A generic layout card with header, title and actions area.
 * Props:
 * - title?: string | ReactNode
 * - actions?: ReactNode
 * - className?: string
 * - children: ReactNode
 */
export default function Card({ title, actions, className = "", children, ...rest }) {
  return (
    <article className={`card ${className}`} {...rest}>
      {(title || actions) && (
        <div className="card-header">
          <div className="card-title">{title}</div>
          {actions ? <div className="card-actions">{actions}</div> : null}
        </div>
      )}
      <div className="card-body">{children}</div>
    </article>
  );
}
