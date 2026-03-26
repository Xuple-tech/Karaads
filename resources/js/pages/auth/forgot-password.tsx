"use client"

// Components
import { Head, useForm } from "@inertiajs/react"
import { LoaderCircle, Mail, ArrowLeft } from "lucide-react"
import type { FormEventHandler } from "react"

import InputError from "@/components/input-error"
import TextLink from "@/components/text-link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import password from "@/routes/password"
import { login } from "@/routes"
import AuthLayout from "@/layouts/auth-layout"

export default function ForgotPassword({ status }: { status?: string }) {
  const { data, setData, post, processing, errors } = useForm<Required<{ email: string }>>({
    email: "",
  })

  const submit: FormEventHandler = (e) => {
    e.preventDefault()
    post(password.email.url())
  }

  return (
    <AuthLayout 
      title="Reset your password" 
      description="Enter your email and we'll send you a reset link"
    >
      <Head title="Forgot password" />

      <div className="space-y-6">
        {/* Status Message */}
        {status && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500" />
              <p className="text-sm font-medium text-emerald-700">{status}</p>
            </div>
          </div>
        )}

        <div className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow">
              <Mail className="w-8 h-8 text-white" />
            </div>
          </div>
          
          <p className="text-sm text-white -600 text-center">
            We'll email you a secure link to reset your password.
          </p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-white -700">
              Email Address
            </Label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Mail className="h-5 w-5 text-white -400" />
              </div>
              <Input
                id="email"
                type="email"
                name="email"
                autoComplete="email"
                value={data.email}
                autoFocus
                onChange={(e) => setData("email", e.target.value)}
                placeholder="you@example.com"
                className="h-11 rounded-lg border-white -200 pl-10 text-sm focus:border-blue-500 focus:ring-blue-500/20"
                disabled={processing}
              />
            </div>
            <InputError message={errors.email} className="text-sm" />
          </div>

          <Button
            type="submit"
            className="h-11 w-full rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-sm font-medium shadow-sm transition-all hover:from-blue-700 hover:to-blue-800 hover:shadow"
            disabled={processing}
          >
            {processing ? (
              <>
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                Sending link...
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Send reset link
              </>
            )}
          </Button>
        </form>

        <div className="pt-4 border-t border-white -100">
          <TextLink
            href={login.url()}
            className="flex items-center justify-center gap-2 text-sm text-white -600 hover:text-white -900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to sign in
          </TextLink>
        </div>

        <div className="text-center">
          <p className="text-xs text-white -500">
            Make sure to check your spam folder if you don't see the email.
          </p>
        </div>
      </div>
    </AuthLayout>
  )
}