"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";
import { toast } from "react-hot-toast";

export default function SignUpPage() {
  const router = useRouter();
  const { signUp, signInWithGoogle, signInWithGithub } = useSupabaseAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await signUp(email, password, name);
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Account created! Please check your email to verify.");
        router.push("/sign-in");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        toast.error(error.message);
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleGithubSignIn = async () => {
    try {
      const { error } = await signInWithGithub();
      if (error) {
        toast.error(error.message);
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-10 shadow-2xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Join Mezzo Aid</h2>
          <p className="mt-2 text-sm text-gray-600">
            Start your entrepreneurship journey today
          </p>
        </div>

        <form onSubmit={handleEmailSignUp} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="mt-1"
                placeholder="John Doe"
              />
            </div>
            <div>
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1"
                placeholder="john@example.com"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="mt-1"
                placeholder="••••••••"
              />
              <p className="mt-1 text-xs text-gray-500">
                At least 6 characters
              </p>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating account..." : "Sign up"}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-500">
              Or continue with
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Button
            variant="outline"
            onClick={handleGoogleSignIn}
            disabled={loading}
            type="button"
          >
            Google
          </Button>
          <Button
            variant="outline"
            onClick={handleGithubSignIn}
            disabled={loading}
            type="button"
          >
            GitHub
          </Button>
        </div>

        <p className="text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            href="/sign-in"
            className="font-medium text-blue-600 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
