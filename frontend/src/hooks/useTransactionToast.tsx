import { useEffect } from "react";
import { toast } from "@/components/ui/sonner";
import { ExternalLink, CheckCircle2, XCircle, Loader2 } from "lucide-react";

const SEPOLIA_EXPLORER = "https://sepolia.etherscan.io";

interface TransactionToastOptions {
  hash: `0x${string}` | undefined;
  isPending: boolean;
  isConfirming: boolean;
  isSuccess: boolean;
  error: Error | null;
  pendingMessage?: string;
  successMessage?: string;
  errorMessage?: string;
}

// Helper to create explorer link
export function getExplorerLink(hash: string): string {
  return `${SEPOLIA_EXPLORER}/tx/${hash}`;
}

// Toast content with explorer link
function ToastWithLink({
  message,
  hash,
  type,
}: {
  message: string;
  hash?: string;
  type: "success" | "error" | "loading";
}) {
  const Icon = type === "success" ? CheckCircle2 : type === "error" ? XCircle : Loader2;
  const iconClass =
    type === "success"
      ? "text-green-500"
      : type === "error"
      ? "text-red-500"
      : "text-blue-500 animate-spin";

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Icon className={`h-4 w-4 ${iconClass}`} />
        <span className="font-medium">{message}</span>
      </div>
      {hash && (
        <a
          href={getExplorerLink(hash)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 transition-colors"
        >
          <ExternalLink className="h-3 w-3" />
          View on Etherscan
        </a>
      )}
    </div>
  );
}

// Hook to manage transaction toasts
export function useTransactionToast({
  hash,
  isPending,
  isConfirming,
  isSuccess,
  error,
  pendingMessage = "Transaction pending...",
  successMessage = "Transaction confirmed!",
  errorMessage = "Transaction failed",
}: TransactionToastOptions) {
  // Show pending toast when transaction is submitted
  useEffect(() => {
    if (isPending) {
      toast.loading(
        <ToastWithLink message="Waiting for wallet approval..." type="loading" />,
        { id: "tx-pending", duration: Infinity }
      );
    } else {
      toast.dismiss("tx-pending");
    }
  }, [isPending]);

  // Show confirming toast when transaction is submitted to chain
  useEffect(() => {
    if (isConfirming && hash) {
      toast.loading(
        <ToastWithLink message={pendingMessage} hash={hash} type="loading" />,
        { id: "tx-confirming", duration: Infinity }
      );
    } else {
      toast.dismiss("tx-confirming");
    }
  }, [isConfirming, hash, pendingMessage]);

  // Show success toast when transaction is confirmed
  useEffect(() => {
    if (isSuccess && hash) {
      toast.dismiss("tx-confirming");
      toast.success(
        <ToastWithLink message={successMessage} hash={hash} type="success" />,
        { duration: 8000 }
      );
    }
  }, [isSuccess, hash, successMessage]);

  // Show error toast when transaction fails
  useEffect(() => {
    if (error) {
      toast.dismiss("tx-pending");
      toast.dismiss("tx-confirming");

      // Extract user-friendly error message
      let userMessage = errorMessage;
      const errMsg = error.message.toLowerCase();

      if (errMsg.includes("user rejected") || errMsg.includes("user denied")) {
        userMessage = "Transaction rejected by user";
      } else if (errMsg.includes("insufficient funds")) {
        userMessage = "Insufficient funds for transaction";
      } else if (errMsg.includes("nonce")) {
        userMessage = "Transaction nonce error. Please try again.";
      }

      toast.error(
        <ToastWithLink message={userMessage} type="error" />,
        { duration: 6000 }
      );
    }
  }, [error, errorMessage]);
}

// Standalone function for manual toast notifications
export function showTransactionToast(
  type: "pending" | "success" | "error",
  message: string,
  hash?: string
) {
  switch (type) {
    case "pending":
      return toast.loading(
        <ToastWithLink message={message} hash={hash} type="loading" />,
        { duration: Infinity }
      );
    case "success":
      return toast.success(
        <ToastWithLink message={message} hash={hash} type="success" />,
        { duration: 8000 }
      );
    case "error":
      return toast.error(
        <ToastWithLink message={message} hash={hash} type="error" />,
        { duration: 6000 }
      );
  }
}

// Export toast for direct usage
export { toast };
