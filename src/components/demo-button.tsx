"use client";

import { useRouter } from "next/navigation";

export function DemoButton({ className }: { className?: string }) {
  const router = useRouter();

  const handleDemo = () => {
    localStorage.setItem("fv-demo-mode", "true");
    router.push("/dashboard");
  };

  return (
    <button
      onClick={handleDemo}
      className={className}
    >
      Try Demo Mode — No Account Needed
    </button>
  );
}
