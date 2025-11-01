"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useLocale } from "@/components/LocaleProvider"
import { authClient } from "@/lib/auth-client"

export default function LoginForm() {
  const { t } = useLocale();
  const router = useRouter();
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    
    try {
      const result = await authClient.signIn.email({
        email,
        password,
      })

      if (result.error) {
        setError(result.error.message || "Invalid email or password")
        setIsLoading(false)
        return
      }

      // Clear the dev sign-out flag when logging in
      document.cookie = "neiom-dev-signed-out=; path=/; max-age=0"

      // Small delay to ensure cookies are set before redirect
      await new Promise(resolve => setTimeout(resolve, 200))
      
      // Use window.location for full page reload to ensure cookies are sent
      window.location.href = "/"
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="email" className="block text-sm font-normal text-black mb-2">
          {t.email}
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-colors"
          placeholder={t.email}
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-normal text-black mb-2">
          {t.password}
        </label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-colors"
          placeholder={t.password}
        />
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <label className="flex items-center">
          <input
            type="checkbox"
            className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
          />
          <span className="ml-2 text-sm text-gray-600">
            {t.rememberMe}
          </span>
        </label>
        
        <a href="#" className="text-sm text-black underline hover:no-underline transition-all">
          {t.forgotPassword}
        </a>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 bg-black text-white border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.3)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-150 text-base font-normal disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? `${t.login}...` : t.login}
      </button>

      <div className="text-center text-sm text-gray-600">
        {t.dontHaveAccount}{" "}
        <a href="/contact" className="text-black underline hover:no-underline transition-all">
          {t.contactUs}
        </a>
      </div>
    </form>
  )
}
