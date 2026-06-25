import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  label?: string;
  className?: string;
}

export default function LoadingSpinner({
  label,
  className = "",
}: LoadingSpinnerProps) {
  return (
    <div
      className={`flex items-center justify-center gap-2 text-zinc-500 ${className}`}
      role="status"
      aria-live="polite"
    >
      <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
      {label && <span className="text-sm">{label}</span>}
    </div>
  );
}
