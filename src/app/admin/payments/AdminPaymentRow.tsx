"use client";

import { useState, useTransition } from "react";
import { approvePayment, rejectPayment } from "./actions";
import { Check, X, Loader2 } from "lucide-react";

interface AdminPaymentRowProps {
  request: {
    id: string;
    user: {
      email: string;
      name: string | null;
    };
    amountTry: number;
    ibanLast4: string;
    note: string | null;
    createdAt: string;
  };
}

export function AdminPaymentRow({ request }: AdminPaymentRowProps) {
  const [pending, startTransition] = useTransition();
  const [showReject, setShowReject] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [actionDone, setActionDone] = useState<"APPROVED" | "REJECTED" | null>(
    null
  );

  function onApprove() {
    if (actionDone) return;
    if (
      !confirm(
        `${request.user.name || request.user.email} için ${request.amountTry} TL tutarındaki ödemeyi onayla?`
      )
    ) {
      return;
    }
    setError(null);
    startTransition(async () => {
      const r = await approvePayment(request.id);
      if (!r.ok) {
        setError(r.error);
      } else {
        setActionDone("APPROVED");
      }
    });
  }

  function onReject() {
    if (actionDone) return;
    if (reason.trim().length < 5) {
      setError("Red nedeni en az 5 karakter olmalıdır.");
      return;
    }
    if (!confirm("Bu ödeme talebini reddet?")) return;

    setError(null);
    startTransition(async () => {
      const r = await rejectPayment(request.id, reason);
      if (!r.ok) {
        setError(r.error);
      } else {
        setActionDone("REJECTED");
      }
    });
  }

  if (actionDone) {
    return (
      <tr className="border-b border-border opacity-60">
        <td colSpan={6} className="py-4 px-4 text-center text-sm">
          <span
            className={
              actionDone === "APPROVED"
                ? "text-emerald-600 font-semibold"
                : "text-red-600 font-semibold"
            }
          >
            {actionDone === "APPROVED" ? "✓ Onaylandı" : "✕ Reddedildi"}
          </span>
        </td>
      </tr>
    );
  }

  return (
    <>
      <tr className="border-b border-border align-top">
        <td className="py-4 px-4">
          <p className="text-sm font-semibold text-foreground">
            {request.user.name || "—"}
          </p>
          <p className="text-xs text-muted-foreground">{request.user.email}</p>
        </td>
        <td className="py-4 px-4">
          <p className="text-sm font-bold text-emerald-600">
            {request.amountTry} TL
          </p>
        </td>
        <td className="py-4 px-4">
          <p className="text-sm font-mono">**** {request.ibanLast4}</p>
        </td>
        <td className="py-4 px-4 text-xs text-muted-foreground">
          {new Date(request.createdAt).toLocaleString("tr-TR", {
            dateStyle: "short",
            timeStyle: "short",
          })}
        </td>
        <td className="py-4 px-4 text-xs text-muted-foreground max-w-xs">
          {request.note || <em>—</em>}
        </td>
        <td className="py-4 px-4 text-right">
          {!showReject ? (
            <div className="flex justify-end gap-2">
              <button
                onClick={onApprove}
                disabled={pending}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {pending ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Check className="h-3 w-3" />
                )}
                Onayla
              </button>
              <button
                onClick={() => setShowReject(true)}
                disabled={pending}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <X className="h-3 w-3" />
                Reddet
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2 items-end">
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Red nedeni (en az 5 karakter)"
                disabled={pending}
                className="w-48 px-2 py-1 text-xs border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-red-300"
                maxLength={500}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowReject(false);
                    setReason("");
                    setError(null);
                  }}
                  disabled={pending}
                  className="px-2 py-1 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  İptal
                </button>
                <button
                  onClick={onReject}
                  disabled={pending || reason.trim().length < 5}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {pending ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <X className="h-3 w-3" />
                  )}
                  Onayla
                </button>
              </div>
            </div>
          )}
        </td>
      </tr>
      {error && (
        <tr className="border-b border-border">
          <td colSpan={6} className="px-4 py-2">
            <p className="text-xs text-red-600">{error}</p>
          </td>
        </tr>
      )}
    </>
  );
}
