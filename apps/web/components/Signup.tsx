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
  { key: "fullName", label: "Full name", type: "text", placeholder: "Ashish Jha" },
  { key: "email", label: "Email", type: "email", placeholder: "you@example.com" },
  { key: "password", label: "Password", type: "password" },
];

export default function SignUp() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();
  const formRef = useRef<AuthFormHandle>(null)
  const { registerHandlers } = useVoiceSite()

  const handleSubmit = async (values: Record<string, string>) => {
    if (!values.fullName || !values.email || !values.password) {
      toast.error("All fields are required")
      return;
    }

    if (values.password.length < 8) {
      toast.error("Password must 8 characters long")
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/api/v1/auth/signup", values);
      if (response.status === 201) {
        await queryClient.invalidateQueries({ queryKey: queryKeys.me });
        await queryClient.invalidateQueries({ queryKey: queryKeys.listings });
        router.push("/listings");
      }
    } catch (err) {
      toast.error(apiErrorMessage(err, "Signup failed"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    return registerHandlers({
      fillAuth: (fieldsUpdate) => {
        formRef.current?.fill({
          fullName: fieldsUpdate.fullName ?? "",
          email: fieldsUpdate.email ?? "",
          password: fieldsUpdate.password ?? "",
        })
        return "Filled signup fields"
      },
      submitAuth: () => {
        formRef.current?.submit()
        return "Submitted signup"
      },
    })
  }, [registerHandlers])

  return (
    <AuthShell>
      <AuthCard title="Create your account">
        <GoogleSignInButton />
        <AuthForm
          ref={formRef}
          fields={fields}
          submitLabel="Create account"
          loading={loading}
          onSubmit={handleSubmit}
        />
        <p className="mt-5 text-center text-sm text-[#6B6879]">
          Already have an account?
          <AuthCardLink href="/signin">Log in</AuthCardLink>
        </p>
      </AuthCard>
    </AuthShell>
  )
}
