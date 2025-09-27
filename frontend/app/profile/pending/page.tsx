import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, CheckCircle } from "lucide-react"
import Link from "next/link"

export default function ProfilePendingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-6">
      <div className="w-full max-w-md">
        <Card className="shadow-xl border-0 bg-card/80 backdrop-blur-sm">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center">
              <Clock className="w-8 h-8 text-accent" />
            </div>
            <CardTitle className="text-2xl font-bold">Profile Under Review</CardTitle>
            <CardDescription className="text-base">
              We're verifying your profile to ensure a safe community
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-primary" />
                <span className="text-sm">University email verified</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-primary" />
                <span className="text-sm">Profile information submitted</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-accent/10 rounded-lg">
                <Clock className="w-5 h-5 text-accent" />
                <span className="text-sm">Manual review in progress</span>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Our team reviews all profiles to maintain a safe and authentic community. This usually takes 24-48
                hours.
              </p>
              <p className="text-xs text-muted-foreground">
                You'll receive an email notification once your profile is approved.
              </p>
            </div>

            <div className="pt-4">
              <Button asChild variant="outline" className="w-full bg-transparent">
                <Link href="/profile/edit">Edit Profile</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
