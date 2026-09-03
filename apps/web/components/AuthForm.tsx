'use client'

import {
  useImperativeHandle,
  useRef,
  useState,
  forwardRef,
} from "react";
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

export interface AuthFormHandle {
  fill: (fields: Record<string, string>) => void;
  submit: () => void;
}

interface AuthFormProps {
  fields: AuthField[];
  submitLabel: string;
  loading: boolean;
  onSubmit: (values: Record<string, string>) => void;
}

const AuthForm = forwardRef<AuthFormHandle, AuthFormProps>(
  function AuthForm({ fields, submitLabel, loading, onSubmit }, ref) {
    const [values, setValues] = useState<Record<string, string>>(() =>
      Object.fromEntries(fields.map((f) => [f.key, ""]))
    )
    const valuesRef = useRef(values)
    valuesRef.current = values
    const onSubmitRef = useRef(onSubmit)
    onSubmitRef.current = onSubmit

    useImperativeHandle(ref, () => ({
      fill: (fieldsUpdate) => {
        setValues((prev) => {
          const next = { ...prev }
          for (const [k, v] of Object.entries(fieldsUpdate)) {
            if (v != null && v !== "" && k in next) next[k] = v
          }
          valuesRef.current = next
          return next
        })
      },
      submit: () => {
        onSubmitRef.current(valuesRef.current)
      },
    }))

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      onSubmit(values);
    };

    return (
      <form id="showhunt-auth-form" className="space-y-4" onSubmit={handleSubmit}>
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
)

export default AuthForm
