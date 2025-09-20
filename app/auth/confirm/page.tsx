"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { createClient } from "@/lib/supabase-client"

function ConfirmContent() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        const token_hash = searchParams.get('token_hash')
        const type = searchParams.get('type')
        const next = searchParams.get('next') ?? '/'

        if (token_hash && type) {
          const { error } = await supabase.auth.verifyOtp({
            token_hash,
            type: type as any,
          })

          if (error) {
            setStatus('error')
            setMessage(error.message)
            toast({
              title: "Verification failed",
              description: error.message,
              variant: "destructive",
            })
          } else {
            setStatus('success')
            setMessage('Your email has been successfully verified!')
            toast({
              title: "Email verified!",
              description: "Your account is now active. You can sign in.",
            })
            
            // Redirect to login page after 3 seconds
            setTimeout(() => {
              router.push('/auth/login')
            }, 3000)
          }
        } else {
          setStatus('error')
          setMessage('Invalid confirmation link.')
        }
      } catch (error) {
        setStatus('error')
        setMessage('An unexpected error occurred.')
        toast({
          title: "Verification failed",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
        })
      }
    }

    confirmEmail()
  }, [searchParams, router, toast, supabase.auth])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-8">
            <div className="flex justify-center mb-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-xl">U</span>
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Email Verification</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Verifying your email address
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              {status === 'loading' && (
                <>
                  <Loader2 className="h-16 w-16 text-blue-600 animate-spin mx-auto" />
                  <p className="text-gray-600 dark:text-gray-400">
                    Verifying your email address...
                  </p>
                </>
              )}

              {status === 'success' && (
                <>
                  <CheckCircle className="h-16 w-16 text-green-600 mx-auto" />
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-green-600">Success!</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {message}
                    </p>
                    <p className="text-sm text-gray-500">
                      Redirecting to login page...
                    </p>
                  </div>
                </>
              )}

              {status === 'error' && (
                <>
                  <XCircle className="h-16 w-16 text-red-600 mx-auto" />
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-red-600">Verification Failed</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {message}
                    </p>
                  </div>
                </>
              )}
            </div>

            {status === 'error' && (
              <div className="space-y-4">
                <Button
                  onClick={() => router.push('/auth/register')}
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium"
                >
                  Try Again
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push('/auth/login')}
                  className="w-full h-12"
                >
                  Go to Login
                </Button>
              </div>
            )}

            {status === 'success' && (
              <Button
                onClick={() => router.push('/auth/login')}
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium"
              >
                Continue to Login
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function ConfirmPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    }>
      <ConfirmContent />
    </Suspense>
  )
}
