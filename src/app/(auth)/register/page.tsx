"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import FormError from "@/components/FormError";

const RegisterSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, "Name is too short")
    .required("Full name is required"),
  email: Yup.string().email("Invalid email address").required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (values: any, { setSubmitting }: any) => {
    setError("");
 
    try {
      // 1. Register the user
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: values.name, 
          email: values.email, 
          password: values.password 
        }),
      });
 
      const data = await res.json();
 
      if (res.ok) {
        // 2. Auto-login after successful registration
        const result = await signIn("credentials", {
          redirect: false,
          email: values.email,
          password: values.password,
        });
 
        if (result?.error) {
          setError("Account created, but auto-login failed. Please sign in manually.");
          router.push("/login?registered=true");
        } else {
          router.push("/dashboard");
        }
      } else {
        setError(data.error || "Something went wrong");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const handleOAuthSignIn = (provider: string) => {
    setOauthLoading(provider);
    signIn(provider, { callbackUrl: "/dashboard" });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full"></div>
      </div>

      <div className="w-full max-w-md space-y-8 relative z-10">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Create Account
          </h1>
          <p className="mt-2 text-sm text-gray-400">
            Join the platform to streamline your workflow
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl">
          {/* OAuth Buttons */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              type="button"
              onClick={() => handleOAuthSignIn("google")}
              disabled={!!oauthLoading}
              className="flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl bg-white/[0.07] border border-white/10 text-white font-semibold text-sm hover:bg-white/[0.12] hover:border-white/20 transition-all active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {oauthLoading === "google" ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              <span className="group-hover:translate-x-0.5 transition-transform">Google</span>
            </button>
            <button
              type="button"
              onClick={() => handleOAuthSignIn("github")}
              disabled={!!oauthLoading}
              className="flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl bg-white/[0.07] border border-white/10 text-white font-semibold text-sm hover:bg-white/[0.12] hover:border-white/20 transition-all active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {oauthLoading === "github" ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              )}
              <span className="group-hover:translate-x-0.5 transition-transform">GitHub</span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#0f1117] px-3 text-gray-500 font-semibold tracking-widest">or</span>
            </div>
          </div>

          <Formik
            initialValues={{ name: "", email: "", password: "" }}
            validationSchema={RegisterSchema}
            onSubmit={handleSubmit}
          >
            {({ touched, errors, isSubmitting }) => (
              <Form className="space-y-6">
                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-3 rounded-lg text-center font-bold tracking-tight">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    Full Name
                  </label>
                  <Field
                    name="name"
                    type="text"
                    className={`w-full bg-[#0d0d0d] border rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none transition-all text-sm sm:text-base ${touched.name && errors.name ? 'border-red-500/50' : 'border-white/10 focus:ring-2 focus:ring-blue-500/50'}`}
                    placeholder="John Doe"
                  />
                  <FormError touched={touched.name} message={errors.name} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    Email Address
                  </label>
                  <Field
                    name="email"
                    type="email"
                    className={`w-full bg-[#0d0d0d] border rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none transition-all text-sm sm:text-base ${touched.email && errors.email ? 'border-red-500/50' : 'border-white/10 focus:ring-2 focus:ring-blue-500/50'}`}
                    placeholder="name@company.com"
                  />
                  <FormError touched={touched.email} message={errors.email} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    Password
                  </label>
                  <div className="relative group/pass">
                    <Field
                      name="password"
                      type={showPassword ? "text" : "password"}
                      className={`w-full bg-[#0d0d0d] border rounded-xl px-4 py-3 pr-12 text-white placeholder-gray-500 focus:outline-none transition-all group-hover/pass:border-white/20 text-sm sm:text-base ${touched.password && errors.password ? 'border-red-500/50' : 'border-white/10 focus:ring-2 focus:ring-blue-500/50'}`}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-500 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <FormError touched={touched.password} message={errors.password} />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl shadow-lg mt-4 transition-all active:scale-[0.98] disabled:opacity-50 group relative overflow-hidden"
                >
                  <span className={isSubmitting ? "opacity-0" : "opacity-100"}>Create Account</span>
                  {isSubmitting && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    </div>
                  )}
                </button>
              </Form>
            )}
          </Formik>

          <div className="mt-8 text-center text-sm">
            <span className="text-gray-400">Already have an account? </span>
            <Link
              href="/login"
              className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
            >
              Log in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
