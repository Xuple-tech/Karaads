"use client"

import { Head, useForm } from "@inertiajs/react"
import { LoaderCircle, Lock, RefreshCw } from "lucide-react"
import type { FormEventHandler } from "react"

import InputError from "@/components/input-error"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import password from "@/routes/password"
import AuthLayout from "@/layouts/auth-layout"

interface ResetPasswordProps {
  token: string
  email: string
}

type ResetPasswordForm = {
  token: string
  email: string
  password: string
  password_confirmation: string
}

export default function ResetPassword({ token, email }: ResetPasswordProps) {
  const { data, setData, post, processing, errors, reset } = useForm<Required<ResetPasswordForm>>({
    token: token,
    email: email,
    password: "",
    password_confirmation: "",
  })

  const submit: FormEventHandler = (e) => {
    e.preventDefault()
    post(password.store.url(), {
      onFinish: () => reset("password", "password_confirmation"),
    })
  }

  return (
    <AuthLayout
      title="Create new password" 
      description="Choose a strong, secure password for your account"
    >
      <Head title="Reset password" />

      <div className="space-y-6">
        <div className="space-y-4">
          <div className="flex justify-center mb-2">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow">
              <RefreshCw className="w-8 h-8 text-white" />
            </div>
          </div>

          <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4">
            <p className="text-sm text-blue-700 text-center">
              Creating a new password for: <span className="font-medium">{email}</span>
            </p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-accent-700">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                name="email"
                autoComplete="email"
                value={data.email}
                readOnly
                className="h-11 rounded-lg border-accent-200 bg-accent-50 text-accent-600 cursor-not-allowed"
                disabled={processing}
              />
              <InputError message={errors.email} className="text-sm" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-accent-700">
                New Password
              </Label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-5 w-5 text-accent-400" />
                </div>
                <Input
                  id="password"
                  type="password"
                  name="password"
                  autoComplete="new-password"
                  value={data.password}
                  autoFocus
                  onChange={(e) => setData("password", e.target.value)}
                  placeholder="••••••••"
                  className="h-11 rounded-lg border-accent-200 pl-10 text-sm focus:border-blue-500 focus:ring-blue-500/20"
                  disabled={processing}
                />
              </div>
              <InputError message={errors.password} className="text-sm" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password_confirmation" className="text-sm font-medium text-accent-700">
                Confirm Password
              </Label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-5 w-5 text-accent-400" />
                </div>
                <Input
                  id="password_confirmation"
                  type="password"
                  name="password_confirmation"
                  autoComplete="new-password"
                  value={data.password_confirmation}
                  onChange={(e) => setData("password_confirmation", e.target.value)}
                  placeholder="••••••••"
                  className="h-11 rounded-lg border-accent-200 pl-10 text-sm focus:border-blue-500 focus:ring-blue-500/20"
                  disabled={processing}
                />
              </div>
              <InputError message={errors.password_confirmation} className="text-sm" />
            </div>

            <Button
              type="submit"
              className="h-11 w-full rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-sm font-medium shadow-sm transition-all hover:from-blue-700 hover:to-blue-800 hover:shadow"
              disabled={processing}
            >
              {processing ? (
                <>
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                  Updating password...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Update password
                </>
              )}
            </Button>
          </form>

          <div className="text-center">
            <p className="text-xs text-accent-500">
              Choose a password that's at least 8 characters long with a mix of letters, numbers, and symbols.
            </p>
          </div>
        </div>
      </div>
    </AuthLayout>
  )
}