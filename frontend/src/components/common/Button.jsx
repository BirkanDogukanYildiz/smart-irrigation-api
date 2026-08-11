import "../../styles/common.css";

/**
 * variant: "primary" (önemli aksiyon, belirgin) | "secondary" (ikincil, sade)
 *          | "danger" (yıkıcı işlem) | "ghost" (en sade, metin gibi)
 */
export default function Button({
  variant = "secondary",
  size = "md",
  type = "button",
  disabled = false,
  onClick,
  children,
  className = "",
  ...rest
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`btn btn-${variant} btn-${size} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
