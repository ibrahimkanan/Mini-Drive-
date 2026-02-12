"use client";

import { useState } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { Lock, Mail, Loader2, LogIn } from "lucide-react";
import { AxiosError } from "axios";

export default function Login() {
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
      await api.post("/login", formData);
      toast.success("Welcome back!", {
        icon: "👋",
        style: {
          background: "#1e293b",
          color: "#fff",
          border: "1px solid #334155",
        },
      });
      router.push("/dashboard");
    } catch (err: unknown) {
      console.error(err);

      let errorMessage = "Invalid email or password";
      if (err instanceof AxiosError && err.response?.data?.message) {
        errorMessage = err.response.data.message;
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
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />

      <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-800 relative z-10 p-10 sm:p-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="mx-auto w-16 h-16 bg-linear-to-tr from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-purple-500/20 transform -rotate-3">
            <LogIn className="text-white" size={32} />
          </div>
          <h2 className="text-3xl font-bold text-white tracking-tight mb-2">
            Welcome Back
          </h2>
          <p className="text-slate-400 text-sm">
            Sign in to access your Mini Drive
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
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-purple-500 transition-colors"
                size={20}
              />
              <input
                type="email"
                required
                className="w-full pl-12 pr-4 py-4 bg-slate-950/50 border border-slate-700/50 rounded-xl focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none transition-all text-slate-100 placeholder-slate-600 text-base"
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
            </div>
            <div className="relative group">
              <Lock
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-purple-500 transition-colors"
                size={20}
              />
              <input
                type="password"
                required
                className="w-full pl-12 pr-4 py-4 bg-slate-950/50 border border-slate-700/50 rounded-xl focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none transition-all text-slate-100 placeholder-slate-600 text-base"
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
            className="w-full py-4 bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold rounded-xl shadow-lg shadow-purple-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 mt-4 text-base"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <LogIn size={20} className="opacity-80" />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-10 text-center border-t border-slate-800/50 pt-8">
          <p className="text-slate-400 text-sm">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="text-white hover:text-purple-400 font-medium transition-colors inline-flex items-center gap-1 group"
            >
              Create account
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
