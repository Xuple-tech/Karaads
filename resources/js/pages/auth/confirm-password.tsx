"use client"

// Components
import { Head, useForm } from "@inertiajs/react"
import { LoaderCircle, Shield, Lock } from "lucide-react"
import type { FormEventHandler } from "react"

import InputError from "@/components/input-error"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import AuthLayout from "@/layouts/auth-layout"
import password from "@/routes/password"

export default function ConfirmPassword() {
  const { data, setData, post, processing, errors, reset } = useForm<Required<{ password: string }>>({
    password: "",
  })

  const submit: FormEventHandler = (e) => {
    e.preventDefault()
    post(password.confirm.url(), {
      onFinish: () => reset("password"),
    })
  }

  return (
    <AuthLayout title="Security checkpoint" description="Please confirm your password to access this secure area">
      <Head title="Confirm password" />

      <div className="relative">
        {/* Decorative elements */}
        <div className="absolute -top-6 -left-6 w-32 h-32 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-full blur-xl" />
        <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-gradient-to-br from-orange-500/20 to-yellow-500/20 rounded-full blur-xl" />

        <div className="relative bg-/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-8 shadow-xl">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md">
                <Lock className="w-3 h-3 text-red-500" />
              </div>
            </div>
          </div>

          {/* Security notice */}
          <div className="mb-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-semibold text-amber-800">Secure Area Access</h4>
                <p className="text-xs text-amber-700 mt-1">
                  This action requires password confirmation for your security
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={submit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
                Current password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type="password"
                  name="password"
                  placeholder="Enter your current password"
                  autoComplete="current-password"
                  value={data.password}
                  autoFocus
                  onChange={(e) => setData("password", e.target.value)}
                  className="pl-12 h-12 border-gray-200 focus:border-red-500 focus:ring-red-500/20 rounded-xl transition-all duration-200"
                />
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
              <InputError message={errors.password} />
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
              disabled={processing}
            >
              {processing ? (
                <LoaderCircle className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <Shield className="w-5 h-5 mr-2" />
                  Confirm password
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </AuthLayout>
  )
}
