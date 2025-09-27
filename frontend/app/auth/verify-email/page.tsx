import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail } from "lucide-react"

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-6">
      <div className="w-full max-w-md">
        <Card className="shadow-xl border-0 bg-card/80 backdrop-blur-sm">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">Check Your Email</CardTitle>
            <CardDescription className="text-base">
              We've sent you a verification link to confirm your ASU email
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              Click the link in your email to verify your account. You'll be automatically logged in and redirected to complete your profile setup.
            </p>
            <p className="text-xs text-muted-foreground">
              Didn't receive the email? Check your spam folder or contact support.
            </p>
            
            {/* Development Testing Link */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm font-semibold text-blue-800 mb-2">🧪 Development Testing:</p>
              <p className="text-xs text-blue-700 mb-2">
                Since email verification is enabled but no SMTP is configured, use this test link:
              </p>
              <div className="bg-white p-2 rounded border text-xs font-mono text-blue-800 break-all">
                {typeof window !== 'undefined' ? `${window.location.origin}/auth/callback?next=/dashboard&code=test-code` : 'Loading...'}
              </div>
              <p className="text-xs text-blue-600 mt-2">
                Click this link to simulate email verification and continue to profile setup.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
