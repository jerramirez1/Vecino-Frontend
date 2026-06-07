import { type ComponentPropsWithoutRef, type ReactNode, forwardRef } from "react";

type AuthInputProps = ComponentPropsWithoutRef<"input"> & {
  label: string;
  icon?: ReactNode;
  error?: string;
};

export const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(function AuthInput(
  { label, icon, error, className, id, ...props },
  ref,
) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, "-");

  return (
    <label htmlFor={inputId} className="block space-y-2">
      <span className="text-base font-semibold text-vecino-text-muted">{label}</span>
      <span
        className={`flex h-13 items-center gap-3 rounded-xl border bg-vecino-surface-soft px-4 transition focus-within:border-vecino-brand ${
          error ? "border-vecino-error" : "border-transparent"
        }`}
      >
        {icon ? <span className="text-vecino-text-muted">{icon}</span> : null}
        <input
          id={inputId}
          ref={ref}
          aria-label={label}
          className={`h-full w-full bg-transparent text-lg text-vecino-text placeholder:text-vecino-text-muted focus:outline-none ${className ?? ""}`}
          {...props}
        />
      </span>
      {error ? <span className="text-sm font-semibold text-vecino-error">{error}</span> : null}
    </label>
  );
});
