"use client";

type ConfirmSubmitButtonProps = {
  label: string;
  className?: string;
  confirmMessage: string;
};

export function ConfirmSubmitButton({
  label,
  className,
  confirmMessage
}: ConfirmSubmitButtonProps) {
  return (
    <button
      className={className}
      type="submit"
      onClick={(event) => {
        if (!window.confirm(confirmMessage)) {
          event.preventDefault();
        }
      }}
    >
      {label}
    </button>
  );
}
