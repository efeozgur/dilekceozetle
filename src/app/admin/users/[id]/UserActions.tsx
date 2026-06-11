"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateUserSubscription, banUser, unbanUser, deleteUser } from "../actions";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Shield, ShieldOff, Trash2, Crown, UserMinus } from "lucide-react";

interface UserActionsProps {
  userId: string;
  currentSubscription: string;
  isBanned: boolean;
}

export function UserActions({ userId, currentSubscription, isBanned }: UserActionsProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<string | null>(null);
  const [banReason, setBanReason] = useState("");

  function handleSubscriptionToggle() {
    const newSub = currentSubscription === "pro" ? "free" : "pro";
    startTransition(async () => {
      const result = await updateUserSubscription(userId, newSub);
      if (!result.ok) setError(result.error);
      else router.refresh();
    });
  }

  function handleBan() {
    if (banReason.trim().length < 5) {
      setError("Yasaklama nedeni en az 5 karakter olmalı");
      return;
    }
    startTransition(async () => {
      const result = await banUser(userId, banReason);
      if (!result.ok) setError(result.error);
      else {
        setConfirmAction(null);
        setBanReason("");
        router.refresh();
      }
    });
  }

  function handleUnban() {
    startTransition(async () => {
      const result = await unbanUser(userId);
      if (!result.ok) setError(result.error);
      else router.refresh();
    });
  }

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteUser(userId);
      if (!result.ok) setError(result.error);
      else router.push("/admin/users");
    });
  }

  return (
    <>
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline">
            Kapat
          </button>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleSubscriptionToggle}
          disabled={pending}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-xl hover:bg-primary-dark transition-all disabled:opacity-50"
        >
          <Crown className="h-4 w-4" />
          {currentSubscription === "pro" ? "Free Yap" : "Pro Yap"}
        </button>

        {!isBanned ? (
          <button
            onClick={() => setConfirmAction("ban")}
            disabled={pending}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-xl hover:bg-amber-100 transition-all disabled:opacity-50"
          >
            <Shield className="h-4 w-4" />
            Yasakla
          </button>
        ) : (
          <button
            onClick={handleUnban}
            disabled={pending}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl hover:bg-emerald-100 transition-all disabled:opacity-50"
          >
            <ShieldOff className="h-4 w-4" />
            Yasağı Kaldır
          </button>
        )}

        <button
          onClick={() => setConfirmAction("delete")}
          disabled={pending}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 transition-all disabled:opacity-50"
        >
          <Trash2 className="h-4 w-4" />
          Kullanıcıyı Sil
        </button>
      </div>

      {confirmAction === "ban" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white border border-border rounded-2xl p-6 shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 bg-amber-50 rounded-full">
                <UserMinus className="h-5 w-5 text-amber-600" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Kullanıcıyı Yasakla</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Bu kullanıcıyı yasaklamak istediğinize emin misiniz?
            </p>
            <textarea
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              placeholder="Yasaklama nedeni (en az 5 karakter)..."
              className="w-full px-3 py-2 border border-border rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
              rows={3}
            />
            <div className="flex items-center justify-end gap-3 mt-4">
              <button
                onClick={() => { setConfirmAction(null); setBanReason(""); }}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-all"
              >
                İptal
              </button>
              <button
                onClick={handleBan}
                disabled={pending || banReason.trim().length < 5}
                className="px-4 py-2 text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition-all disabled:opacity-50"
              >
                {pending ? "İşleniyor..." : "Yasakla"}
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmAction === "delete" && (
        <ConfirmDialog
          title="Kullanıcıyı Sil"
          message="Bu kullanıcıyı ve tüm verilerini silmek istediğinize emin misiniz? Bu işlem geri alınamaz."
          onConfirm={handleDelete}
          onCancel={() => setConfirmAction(null)}
        />
      )}
    </>
  );
}
