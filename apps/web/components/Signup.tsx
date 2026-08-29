'use client'

import { Input } from "./ui/input";
import Component from "./comp-51";
import { toast } from "sonner";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner"
import AuthShell from "./AuthShell";
import AuthCard, { AuthCardLink } from "./AuthCard";
import GoogleSignInButton from "./GoogleSignInButton";
import { authFieldClass } from "@/lib/auth-field";
import { api } from "@/lib/api";

export default function SignUp() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: ""
  });

  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.fullName || !formData.email || !formData.password) {
      toast.error("All fields are required")
      return;
    }

    if (formData.password.length < 8) {
      toast.error("Password must 8 characters long")
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/api/v1/auth/signup", formData);
      toast.success("Signup successful 🎉");
      if (response.status === 201) {
        router.push("/listings");
      }
    } catch (err) {
      toast.error((err as { response?: { data?: { error?: string } } })?.response?.data?.error || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell>
      <AuthCard
        title="Create your account"
        subtitle={
          <>
            Already have an account?
            <AuthCardLink href="/signin">Log in</AuthCardLink>
          </>
        }
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[#0F0F0F]">Full name</label>
            <Input
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="Ashish Jha"
              className={authFieldClass}
            />
          </div>
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
            {loading ? <Spinner className="h-4 w-4" /> : "Create account"}
          </button>
        </form>
        <GoogleSignInButton />
      </AuthCard>
    </AuthShell>
  )
}
