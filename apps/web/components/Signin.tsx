'use client'

import { Input } from "./ui/input";
import Component from "./comp-23";
import { toast } from "sonner";
import { useState } from "react";
import { Spinner } from "@/components/ui/spinner"
import AuthShell from "./AuthShell";
import AuthCard, { AuthCardLink } from "./AuthCard";
import GoogleSignInButton from "./GoogleSignInButton";
import { authFieldClass } from "@/lib/auth-field";
import { api } from "@/lib/api";

export default function SignIn() {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error("Enter full details");
      return;
    }

    setLoading(true);
    try {
      await api.post("/api/v1/auth/signin", formData);
      toast.success("Welcome to Showhunt 🎉");
      window.location.assign("/listings");
    } catch (err) {
      toast.error((err as { response?: { data?: { error?: string } } })?.response?.data?.error || "Signin failed");
      setLoading(false);
    }
  };

  return (
    <AuthShell>
      <AuthCard
        title="Welcome back"
        subtitle={
          <>
            Don&apos;t have an account?
            <AuthCardLink href="/signup">Sign up</AuthCardLink>
          </>
        }
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[#0F0F0F]">Email</label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="you@example.com"
              className={authFieldClass}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[#0F0F0F]">Password</label>
            <Component value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="paper-btn-primary flex h-10 w-full items-center justify-center text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF8162]/40 disabled:opacity-60"
          >
            {loading ? <Spinner className="h-4 w-4" /> : "Log in"}
          </button>
        </form>
        <GoogleSignInButton />
      </AuthCard>
    </AuthShell>
  )
}
