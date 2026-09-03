'use client'

import { toast } from "sonner";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import AuthShell from "./AuthShell";
import AuthCard, { AuthCardLink } from "./AuthCard";
import AuthForm, { type AuthField, type AuthFormHandle } from "./AuthForm";
import GoogleSignInButton from "./GoogleSignInButton";
import { api, apiErrorMessage } from "@/lib/api";
import { queryKeys } from "@/lib/queries/keys";
import { useVoiceSite } from "@/components/voice/VoiceSiteContext";

const fields: AuthField[] = [
  { key: "email", label: "Email", type: "email", placeholder: "you@example.com" },
  { key: "password", label: "Password", type: "password" },
];

export default function SignIn() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();
  const formRef = useRef<AuthFormHandle>(null)
  const { registerHandlers } = useVoiceSite()

  const handleSubmit = async (values: Record<string, string>) => {
    if (!values.email || !values.password) {
      toast.error("Enter full details");
      return;
    }

    setLoading(true);
    try {
      await api.post("/api/v1/auth/signin", values);
      await queryClient.invalidateQueries({ queryKey: queryKeys.me });
      await queryClient.invalidateQueries({ queryKey: queryKeys.listings });
      router.push("/listings");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Signin failed"));
      setLoading(false);
    }
  };

  useEffect(() => {
    return registerHandlers({
      fillAuth: (fieldsUpdate) => {
        formRef.current?.fill({
          email: fieldsUpdate.email ?? "",
          password: fieldsUpdate.password ?? "",
        })
        return "Filled sign-in fields"
      },
      submitAuth: () => {
        formRef.current?.submit()
        return "Submitted sign-in"
      },
    })
  }, [registerHandlers])

  return (
    <AuthShell>
      <AuthCard title="Welcome back">
        <GoogleSignInButton />
        <AuthForm
          ref={formRef}
          fields={fields}
          submitLabel="Log in"
          loading={loading}
          onSubmit={handleSubmit}
        />
        <p className="mt-5 text-center text-sm text-[#6B6879]">
          Don&apos;t have an account?
          <AuthCardLink href="/signup">Sign up</AuthCardLink>
        </p>
      </AuthCard>
    </AuthShell>
  )
}
