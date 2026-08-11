import "../../styles/common.css";

export default function Section({ title, subtitle, actions, children, className = "" }) {
  return (
    <section className={`section ${className}`}>
      {(title || actions) && (
        <div className="section-head">
          <div>
            {title && <h3>{title}</h3>}
            {subtitle && <p className="section-subtitle">{subtitle}</p>}
          </div>
          {actions && <div className="section-actions">{actions}</div>}
        </div>
      )}
      {children}
    </section>
  );
}
