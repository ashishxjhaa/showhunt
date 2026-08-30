'use client'

import { useState } from "react";
import { Input } from "./ui/input";
import PasswordInput from "./PasswordInput";
import { Spinner } from "@/components/ui/spinner"
import { authFieldClass } from "@/lib/auth-field";

export interface AuthField {
  key: string;
  label: string;
  type: "text" | "email" | "password";
  placeholder?: string;
}

interface AuthFormProps {
  fields: AuthField[];
  submitLabel: string;
  loading: boolean;
  onSubmit: (values: Record<string, string>) => void;
}

export default function AuthForm({ fields, submitLabel, loading, onSubmit }: AuthFormProps) {
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(fields.map((f) => [f.key, ""]))
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(values);
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {fields.map((field) => (
        <div key={field.key} className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[#0F0F0F]">{field.label}</label>
          {field.type === "password" ? (
            <PasswordInput
              value={values[field.key]}
              onChange={(e) => setValues({ ...values, [field.key]: e.target.value })}
            />
          ) : (
            <Input
              type={field.type}
              value={values[field.key]}
              onChange={(e) => setValues({ ...values, [field.key]: e.target.value })}
              placeholder={field.placeholder}
              className={authFieldClass}
            />
          )}
        </div>
      ))}

      <button
        type="submit"
        disabled={loading}
        className="paper-btn-primary flex h-10 w-full items-center justify-center text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DA5CC7]/40 disabled:opacity-60"
      >
        {loading ? <Spinner className="h-4 w-4" /> : submitLabel}
      </button>
    </form>
  );
}
