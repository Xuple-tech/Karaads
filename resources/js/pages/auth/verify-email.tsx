"use client"

import { Head, useForm } from "@inertiajs/react"
import { LoaderCircle, Mail, CheckCircle, RefreshCw, LogOut } from "lucide-react"
import type { FormEventHandler } from "react"

import TextLink from "@/components/text-link"
import { Button } from "@/components/ui/button"
import verification from "@/routes/verification"
import { logout } from "@/routes"
import AuthLayout from "@/layouts/auth-layout"

export default function VerifyEmail({ status }: { status?: string }) {
  const { post, processing } = useForm({})

  const submit: FormEventHandler = (e) => {
    e.preventDefault()
    post(verification.send.url())
  }

  return (
    <AuthLayout 
      title="Verify your email" 
      description="Check your inbox for the verification link"
    >
      <Head title="Email verification" />

      <div className="text-center space-y-6">
        {/* Main Icon */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Mail className="w-10 h-10 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center">
              <span className="text-xs font-medium text-white">!</span>
            </div>
          </div>
        </div>

        {/* Main Message */}
        <div className="space-y-3">
          <h3 className="text-lg font-medium text-white -900">Check your email</h3>
          <p className="text-sm text-white -600 leading-relaxed max-w-md mx-auto">
            We've sent a verification link to your email address. 
            Click the link to activate your Kwati AI account.
          </p>
        </div>

        {/* Success Message */}
        {status === "verification-link-sent" && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
            <div className="flex items-center justify-center gap-2">
              <CheckCircle className="h-5 w-5 text-emerald-600" />
              <p className="text-sm font-medium text-emerald-700">
                A new verification link has been sent to your email
              </p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-4">
          <form onSubmit={submit} className="space-y-3">
            <Button
              type="submit"
              disabled={processing}
              variant="outline"
              className="h-11 w-full rounded-lg border-white -200 text-white -700 hover:bg-primary/50 -50 hover:border-white -300 hover:text-white -900"
            >
              {processing ? (
                <>
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Resend verification email
                </>
              )}
            </Button>

            {/* Help Text */}
            <p className="text-xs text-white -500">
              Didn't receive the email? Check your spam folder.
            </p>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white -200"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-3 text-white -500">or</span>
            </div>
          </div>

          {/* Sign Out */}
          <TextLink
            href={logout.url()}
            method="get"
            className="flex items-center justify-center gap-2 text-sm text-white -600 hover:text-white -900 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </TextLink>
        </div>

        {/* Support Info */}
        <div className="pt-4 border-t border-white -100">
          <p className="text-xs text-white -500">
            Need help?{" "}
            <a 
              href="mailto:support@kwatiai.com" 
              className="font-medium text-blue-600 hover:text-blue-700"
            >
              Contact support
            </a>
          </p>
        </div>
      </div>
    </AuthLayout>
  )
}