"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { KeyRound, Eye, EyeOff, ShieldAlert, CheckCircle2 } from "lucide-react";
import { resetPasswordWithToken } from "@/lib/actions/user";
import FormError from "@/components/FormError";

const ResetSchema = Yup.object().shape({
  newPassword: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .required("New password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("newPassword")], "Passwords must match")
    .required("Please confirm your password"),
});

function ResetPasswordForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  if (!token) {
    return (
      <div className="text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-500 border border-red-500/20 flex items-center justify-center mx-auto">
          <ShieldAlert size={32} />
        </div>
        <h2 className="text-xl font-bold text-white tracking-tight">Invalid Link</h2>
        <p className="text-sm text-gray-400">The recovery link is missing or invalid.</p>
        <Link
          href="/forgot-password"
          className="block w-full bg-white/10 hover:bg-white/15 text-white font-semibold py-3 rounded-xl transition-all mt-4"
        >
          Request New Link
        </Link>
      </div>
    );
  }

  if (status?.type === 'success') {
    return (
      <div className="text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-green-500/10 text-green-500 border border-green-500/20 flex items-center justify-center mx-auto scale-110 shadow-lg shadow-green-500/20">
          <CheckCircle2 size={32} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-green-500 tracking-tight">Password Reset Achieved</h2>
          <p className="text-sm text-gray-400 mt-2">Your system password has been synchronized successfully.</p>
        </div>
        <Link
          href="/login"
          className="block w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl shadow-lg mt-4 transition-all"
        >
          Return to Login
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          Secure Reset
        </h1>
        <p className="mt-2 text-sm text-gray-400 font-medium">
          Create a new password for your account
        </p>
      </div>

      <Formik
        initialValues={{ newPassword: "", confirmPassword: "" }}
        validationSchema={ResetSchema}
        onSubmit={async (values, { setSubmitting }) => {
          setStatus(null);
          const result = await resetPasswordWithToken(token, values.newPassword);
          if (result.success) {
            setStatus({ type: 'success', message: 'Password reset successfully' });
          } else {
            setStatus({ type: 'error', message: result.error || 'Failed to update password' });
          }
          setSubmitting(false);
        }}
      >
        {({ touched, errors, isSubmitting }) => (
          <Form className="space-y-6">
            {status?.type === 'error' && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-3 rounded-lg text-center">
                {status.message}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                New System Password
              </label>
              <div className="relative group/pass">
                <Field
                  name="newPassword"
                  type={showPassword ? "text" : "password"}
                  className={`w-full bg-[#0d0d0d] border rounded-xl px-12 py-3 text-white placeholder-gray-500 focus:outline-none transition-all group-hover/pass:border-white/20 ${touched.newPassword && errors.newPassword ? 'border-red-500/50' : 'border-white/10 focus:ring-2 focus:ring-blue-500/50'}`}
                  placeholder="Min 8 characters"
                />
                <KeyRound size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <FormError touched={touched.newPassword} message={errors.newPassword as string} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Verify New Password
              </label>
              <div className="relative group/pass2">
                <Field
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  className={`w-full bg-[#0d0d0d] border rounded-xl px-12 py-3 text-white placeholder-gray-500 focus:outline-none transition-all group-hover/pass2:border-white/20 ${touched.confirmPassword && errors.confirmPassword ? 'border-red-500/50' : 'border-white/10 focus:ring-2 focus:ring-blue-500/50'}`}
                  placeholder="Verify password"
                />
                <KeyRound size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
              </div>
              <FormError touched={touched.confirmPassword} message={errors.confirmPassword as string} />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl shadow-lg mt-4 transition-all active:scale-[0.98] disabled:opacity-50 group relative overflow-hidden"
            >
              <span className={isSubmitting ? "opacity-0" : "opacity-100"}>Authorize Update</span>
              {isSubmitting && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                </div>
              )}
            </button>
          </Form>
        )}
      </Formik>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full"></div>
      </div>

      <div className="w-full max-w-md space-y-8 relative z-10">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl">
          <Suspense fallback={<div className="flex justify-center p-8"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
