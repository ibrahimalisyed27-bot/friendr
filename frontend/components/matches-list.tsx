"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { PersonalitySummaryGenerator } from "@/lib/personality-summary"
import { AnimalAvatarGenerator } from "@/lib/animal-avatar"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { ArrowLeft, MessageCircle, Heart, MoreVertical, Flag } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ReportModal } from "@/components/report-modal"
import { MutualConfirmation } from "@/components/mutual-confirmation"

interface Match {
  id: string
  target_user_id: string
  created_at: string
  target_profile: {
    id: string
    first_name: string
    last_name: string
    bio: string
    major: string
    graduation_year: number
    interests: string[]
    profile_photo_url?: string
    university: string
  }
}

interface MatchesListProps {
  matches: Match[]
  currentUserId: string
  currentUser: {
    id: string
    first_name: string
    last_name: string
    bio: string
    major: string
    graduation_year: number
    interests: string[]
    profile_photo_url?: string
    university: string
  }
}

export function MatchesList({ matches, currentUserId, currentUser }: MatchesListProps) {
  const router = useRouter()

  if (matches.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <header className="flex items-center gap-4 p-4 bg-card/80 backdrop-blur-sm border-b">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/swipe">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <h1 className="text-xl font-bold">Your Matches</h1>
        </header>

        <div className="flex-1 flex items-center justify-center p-6">
          <Card className="w-full max-w-md text-center shadow-xl">
            <CardContent className="p-8 space-y-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Heart className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2">No Matches Yet</h2>
                <p className="text-muted-foreground">Start swiping to find your perfect study buddies and friends!</p>
              </div>
              <Button onClick={() => router.push("/swipe")} className="w-full">
                Start Swiping
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center gap-4 p-4 bg-card/80 backdrop-blur-sm border-b">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/swipe">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <h1 className="text-xl font-bold">Your Matches</h1>
        <div className="ml-auto">
          <Badge variant="secondary">{matches.length} matches</Badge>
        </div>
      </header>

      <div className="flex-1 p-4">
        <div className="grid gap-4 max-w-2xl mx-auto">
          {matches.map((match) => (
            <Card key={match.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex">
                {/* Animal Avatar */}
                <div className="w-24 h-24 flex-shrink-0 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                  <div className="text-3xl">
                    {AnimalAvatarGenerator.generateAvatar(match.target_profile.id)}
                  </div>
                </div>

                {/* Profile Info */}
                <div className="flex-1 p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">
                        {match.target_profile.first_name} {match.target_profile.last_name}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {match.target_profile.major} • Class of {match.target_profile.graduation_year}
                      </p>
                      <p className="text-sm text-foreground line-clamp-2 mb-2">
                        {PersonalitySummaryGenerator.generateSummary(match.target_profile)}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {match.target_profile.interests.slice(0, 3).map((interest) => (
                          <Badge key={interest} variant="outline" className="text-xs">
                            {interest}
                          </Badge>
                        ))}
                        {match.target_profile.interests.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{match.target_profile.interests.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 ml-4">
                      <MutualConfirmation 
                        currentUser={currentUser} 
                        targetUser={match.target_profile}
                      />
                      <div className="flex gap-2">
                        <Button size="sm" asChild>
                          <Link href={`/chat/${match.id}`}>
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Message
                          </Link>
                        </Button>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <ReportModal reportedUserId={match.target_profile.id} />
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
