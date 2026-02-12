"use client";

import { useState } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { Lock, Mail, Loader2, UserPlus } from "lucide-react";
import { AxiosError } from "axios";

export default function Signup() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post("/signup", formData);
      toast.success("Account created successfully", {
        icon: "🎉",
        style: {
          background: "#1e293b",
          color: "#fff",
          border: "1px solid #334155",
        },
      });
      router.push("/login"); // Redirect to login page
    } catch (err: unknown) {
      console.error(err);

      let errorMessage = "Something went wrong. Please try again.";
      if (err instanceof AxiosError && err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      toast.error(errorMessage, {
        style: {
          background: "#1e293b",
          color: "#fff",
          border: "1px solid #ef4444",
        },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-6 relative overflow-hidden font-sans">
      {/* Subtle Background Gradient */}
      <div className="absolute inset-0 bg-linear-to-br from-slate-900 via-slate-950 to-black z-0" />

      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />

      <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-800 relative z-10 p-10 sm:p-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="mx-auto w-16 h-16 bg-linear-to-tr from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/20 transform rotate-3">
            <UserPlus className="text-white" size={32} />
          </div>
          <h2 className="text-3xl font-bold text-white tracking-tight mb-2">
            Create Account
          </h2>
          <p className="text-slate-400 text-sm">
            Start your journey with Mini Drive
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-300 ml-1 block">
              Email Address
            </label>
            <div className="relative group">
              <Mail
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors"
                size={20}
              />
              <input
                type="email"
                required
                className="w-full pl-12 pr-4 py-4 bg-slate-950/50 border border-slate-700/50 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all text-slate-100 placeholder-slate-600 text-base"
                placeholder="name@example.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center ml-1">
              <label className="text-sm font-medium text-slate-300 block">
                Password
              </label>
              <span className="text-xs text-slate-500">Min. 6 characters</span>
            </div>
            <div className="relative group">
              <Lock
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors"
                size={20}
              />
              <input
                type="password"
                required
                minLength={6}
                className="w-full pl-12 pr-4 py-4 bg-slate-950/50 border border-slate-700/50 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all text-slate-100 placeholder-slate-600 text-base"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 mt-4 text-base"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <span>Sign Up</span>
                <UserPlus size={20} className="opacity-80" />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-10 text-center border-t border-slate-800/50 pt-8">
          <p className="text-slate-400 text-sm">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-white hover:text-blue-400 font-medium transition-colors inline-flex items-center gap-1 group"
            >
              Sign in
              <span className="group-hover:translate-x-0.5 transition-transform">
                →
              </span>
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
