'use client'

import { toast } from "sonner";
import { useState } from "react";
import AuthShell from "./AuthShell";
import AuthCard, { AuthCardLink } from "./AuthCard";
import AuthForm, { type AuthField } from "./AuthForm";
import GoogleSignInButton from "./GoogleSignInButton";
import { api, apiErrorMessage } from "@/lib/api";

const fields: AuthField[] = [
  { key: "email", label: "Email", type: "email", placeholder: "you@example.com" },
  { key: "password", label: "Password", type: "password" },
];

export default function SignIn() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: Record<string, string>) => {
    if (!values.email || !values.password) {
      toast.error("Enter full details");
      return;
    }

    setLoading(true);
    try {
      await api.post("/api/v1/auth/signin", values);
      toast.success("Welcome to Showhunt 🎉");
      // Hard reload so cached logged-out state is fully reset
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.assign("/listings");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Signin failed"));
      setLoading(false);
    }
  };

  return (
    <AuthShell>
      <AuthCard title="Welcome back">
        <GoogleSignInButton />
        <AuthForm fields={fields} submitLabel="Log in" loading={loading} onSubmit={handleSubmit} />
        <p className="mt-5 text-center text-sm text-[#6B6879]">
          Don&apos;t have an account?
          <AuthCardLink href="/signup">Sign up</AuthCardLink>
        </p>
      </AuthCard>
    </AuthShell>
  )
}
