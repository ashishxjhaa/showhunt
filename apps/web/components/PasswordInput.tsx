"use client";

import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useId, useState } from "react";

import { Input } from "@/components/ui/input";
import { authFieldClass } from "@/lib/auth-field";
import { cn } from "@/lib/utils";

export default function PasswordInput({
  value,
  onChange
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}) {
  const id = useId();
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative">
      <Input
        className={cn(authFieldClass, "pe-9")}
        id={id}
        placeholder="Password"
        type={isVisible ? "text" : "password"}
        value={value}
        onChange={onChange}
      />
      <button
        aria-controls={id}
        aria-label={isVisible ? "Hide password" : "Show password"}
        aria-pressed={isVisible}
        className="absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md text-[var(--paper-muted)] outline-none focus:z-10 focus-visible:ring-2 focus-visible:ring-[#DA5CC7]/30 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
        onClick={() => setIsVisible((v) => !v)}
        type="button"
      >
        {isVisible ? (
          <EyeOffIcon aria-hidden="true" size={16} />
        ) : (
          <EyeIcon aria-hidden="true" size={16} />
        )}
      </button>
    </div>
  );
}
