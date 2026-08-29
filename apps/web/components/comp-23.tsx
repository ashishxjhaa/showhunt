"use client";

import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useId, useState } from "react";

import { Input } from "@/components/ui/input";
import { authFieldClass } from "@/lib/auth-field";
import { cn } from "@/lib/utils";

export default function Component({
  value,
  onChange
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}) {
  const id = useId();
  const [isVisible, setIsVisible] = useState<boolean>(false);

  const toggleVisibility = () => setIsVisible((prevState) => !prevState);

  return (
    <div className="*:not-first:mt-2">
      <div className="relative">
        <Input
          className={cn(authFieldClass, "pe-9")}
          id={id}
          placeholder="Password"
          type={isVisible ? "text" : "password"}
          onChange={onChange}
          value={value}
        />
        <button
          aria-controls="password"
          aria-label={isVisible ? "Hide password" : "Show password"}
          aria-pressed={isVisible}
          className="absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md text-[var(--paper-muted)] outline-none focus:z-10 focus-visible:ring-2 focus-visible:ring-[#7C3AED]/30 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
          onClick={toggleVisibility}
          type="button"
        >
          {isVisible ? (
            <EyeOffIcon aria-hidden="true" size={16} />
          ) : (
            <EyeIcon aria-hidden="true" size={16} />
          )}
        </button>
      </div>
    </div>
  );
}
