"use client";

import { useState, useTransition } from "react";
import { submitPaymentRequest } from "./actions";

interface UpgradeFormProps {
  expectedAmount: number;
}

export function UpgradeForm({ expectedAmount }: UpgradeFormProps) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function onSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await submitPaymentRequest({
        ibanLast4: String(formData.get("ibanLast4") || ""),
        amountTry: Number(formData.get("amount") || 0),
        note: String(formData.get("note") || "") || null,
      });
      if (!result.ok) {
        setError(result.error);
      } else {
        setSuccess(true);
      }
    });
  }

  if (success) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6">
        <div className="flex items-start gap-3">
          <div className="shrink-0 w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-2xl">
            ✓
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-emerald-900 mb-1">
              Talebiniz iletildi!
            </h3>
            <p className="text-sm text-emerald-700 leading-relaxed">
              Ödeme bildiriminiz admin'e iletildi. IBAN'a gönderdiğiniz tutar
              doğrulandıktan sonra Pro üyeliğiniz otomatik olarak aktif edilecek.
              Onay genellikle birkaç saat içinde gelir.
            </p>
            <a
              href="/dashboard"
              className="inline-block mt-3 text-sm font-semibold text-emerald-700 hover:text-emerald-800 underline"
            >
              Dashboard'a dön →
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form action={onSubmit} className="space-y-5">
      <div>
        <label
          htmlFor="ibanLast4"
          className="block text-sm font-medium text-foreground mb-1.5"
        >
          IBAN Son 4 Hane
        </label>
        <input
          type="text"
          id="ibanLast4"
          name="ibanLast4"
          inputMode="numeric"
          pattern="\d{4}"
          maxLength={4}
          minLength={4}
          required
          placeholder="örn. 5678"
          disabled={pending}
          className="w-full px-4 py-2.5 border border-border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all disabled:opacity-50 font-mono"
        />
        <p className="text-xs text-muted-foreground mt-1.5">
          Gönderdiğiniz IBAN'ın son 4 rakamını girin.
        </p>
      </div>

      <div>
        <label
          htmlFor="amount"
          className="block text-sm font-medium text-foreground mb-1.5"
        >
          Gönderdiğiniz Tutar (TL)
        </label>
        <input
          type="number"
          id="amount"
          name="amount"
          min={expectedAmount}
          max={expectedAmount * 2}
          defaultValue={expectedAmount}
          required
          disabled={pending}
          className="w-full px-4 py-2.5 border border-border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all disabled:opacity-50"
        />
        <p className="text-xs text-muted-foreground mt-1.5">
          Pro üyelik ücreti {expectedAmount} TL'dir. Aynı tutarı gönderdiğinizden
          emin olun.
        </p>
      </div>

      <div>
        <label
          htmlFor="note"
          className="block text-sm font-medium text-foreground mb-1.5"
        >
          Not (opsiyonel)
        </label>
        <textarea
          id="note"
          name="note"
          rows={3}
          maxLength={500}
          disabled={pending}
          placeholder="Varsa eklemek istediğiniz bilgi (dekont, transfer saati vb.)"
          className="w-full px-4 py-2.5 border border-border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all disabled:opacity-50 resize-none"
        />
        <p className="text-xs text-muted-foreground mt-1.5">
          En fazla 500 karakter.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-gradient-start to-gradient-end text-white hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        {pending ? "Gönderiliyor..." : "Ödeme Yaptım, Talebi Gönder"}
      </button>
    </form>
  );
}
