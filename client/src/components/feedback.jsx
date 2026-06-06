import React, { useEffect } from "react";
import { AlertCircle, CheckCircle, Info, Loader2, X } from "lucide-react";

const toastStyles = {
  success: { icon: CheckCircle, className: "border-sage/30 bg-white text-ink" },
  error: { icon: AlertCircle, className: "border-coral/35 bg-white text-ink" },
  info: { icon: Info, className: "border-aqua/30 bg-white text-ink" }
};

export function Loader({ label = "Loading" }) {
  return (
    <span className="inline-flex items-center justify-center gap-2">
      <Loader2 className="h-4 w-4 animate-spin" />
      <span>{label}</span>
    </span>
  );
}

export function ToastViewport({ toasts, onDismiss }) {
  return (
    <div className="fixed right-4 top-4 z-50 flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-3">
      {toasts.map((toast) => {
        const config = toastStyles[toast.type] || toastStyles.info;
        const Icon = config.icon;
        return <Toast key={toast.id} toast={toast} config={config} Icon={Icon} onDismiss={onDismiss} />;
      })}
    </div>
  );
}

function Toast({ toast, config, Icon, onDismiss }) {
  useEffect(() => {
    const timer = window.setTimeout(() => onDismiss(toast.id), toast.duration || 4200);
    return () => window.clearTimeout(timer);
  }, [onDismiss, toast.duration, toast.id]);

  return (
    <div className={`flex items-start gap-3 rounded-md border p-4 shadow-soft ${config.className}`}>
      <Icon className="mt-0.5 h-5 w-5 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="font-black">{toast.title}</p>
        {toast.message && <p className="mt-1 text-sm leading-5 text-ink/65">{toast.message}</p>}
      </div>
      <button className="rounded p-1 text-ink/55 hover:bg-paper" type="button" onClick={() => onDismiss(toast.id)}>
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
