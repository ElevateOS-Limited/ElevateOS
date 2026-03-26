'use client'

import Link from 'next/link'
import { Brain, AlertCircle } from 'lucide-react'

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-gray-950 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold gradient-text">ElevateOS</span>
        </Link>
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-800 max-w-sm">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold mb-2">Authentication Error</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Something went wrong. Please try signing in again.</p>
          <Link href="/auth/login" className="block bg-gradient-to-r from-violet-600 to-indigo-600 text-white py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  )
}
