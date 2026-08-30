'use client'

import { toast } from "sonner";
import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthShell from "./AuthShell";
import AuthCard, { AuthCardLink } from "./AuthCard";
import AuthForm, { type AuthField } from "./AuthForm";
import GoogleSignInButton from "./GoogleSignInButton";
import { api, apiErrorMessage } from "@/lib/api";

const fields: AuthField[] = [
  { key: "fullName", label: "Full name", type: "text", placeholder: "Ashish Jha" },
  { key: "email", label: "Email", type: "email", placeholder: "you@example.com" },
  { key: "password", label: "Password", type: "password" },
];

export default function SignUp() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

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
      toast.success("Signup successful 🎉");
      if (response.status === 201) {
        router.push("/listings");
      }
    } catch (err) {
      toast.error(apiErrorMessage(err, "Signup failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell>
      <AuthCard title="Create your account">
        <GoogleSignInButton />
        <AuthForm fields={fields} submitLabel="Create account" loading={loading} onSubmit={handleSubmit} />
        <p className="mt-5 text-center text-sm text-[#6B6879]">
          Already have an account?
          <AuthCardLink href="/signin">Log in</AuthCardLink>
        </p>
      </AuthCard>
    </AuthShell>
  )
}
