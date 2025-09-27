"use client"

import type React from "react"
import { useState, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { PersonalityMatcher, type MatchScore } from "@/lib/personality-matcher"
import { PersonalitySummaryGenerator } from "@/lib/personality-summary"
import { AnimalAvatarGenerator } from "@/lib/animal-avatar"
import { Heart, X, Star, Eye, MessageCircle, MoreVertical, Flag } from "lucide-react"
import { useRouter } from "next/navigation"
import { ReportModal } from "@/components/report-modal"
import { MutualConfirmation } from "@/components/mutual-confirmation"

interface Profile {
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

interface SwipeInterfaceProps {
  currentUser: Profile
  potentialMatches: Profile[]
}

export function SwipeInterface({ currentUser, potentialMatches }: SwipeInterfaceProps) {
  const [matches, setMatches] = useState<MatchScore[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [newMatch, setNewMatch] = useState<Profile | null>(null)
  const [showFullProfile, setShowFullProfile] = useState(false)
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Initialize AI-matched profiles
  React.useEffect(() => {
    const smartMatches = PersonalityMatcher.getSmartMatches(currentUser, potentialMatches)
    const filteredMatches = PersonalityMatcher.filterMatches(smartMatches, 50) // Minimum 50% compatibility
    setMatches(filteredMatches)
  }, [currentUser, potentialMatches])

  const currentMatch = matches[currentIndex]

  const handleSwipe = async (action: "like" | "pass") => {
    if (!currentMatch || isAnimating) return

    setIsAnimating(true)
    const supabase = createClient()

    try {
      const { error } = await supabase.from("matches").insert({
        user_id: currentUser.id,
        target_user_id: currentMatch.profile.id,
        action: action,
      })

      if (error) throw error

      // Check for mutual match
      if (action === "like") {
        const { data: existingMatch } = await supabase
          .from("matches")
          .select("*")
          .eq("user_id", currentMatch.profile.id)
          .eq("target_user_id", currentUser.id)
          .eq("action", "like")
          .single()

        if (existingMatch) {
          setNewMatch(currentMatch.profile)
        }
      }

      // Move to next profile
      setTimeout(() => {
        setCurrentIndex(prev => prev + 1)
        setIsAnimating(false)
        setDragOffset({ x: 0, y: 0 })
      }, 300)
    } catch (error) {
      console.error("Error saving match:", error)
      setIsAnimating(false)
    }
  }

  const handleDragStart = (e: React.MouseEvent) => {
    setIsDragging(true)
    const startX = e.clientX
    const startY = e.clientY

    const handleDrag = (e: MouseEvent) => {
      const deltaX = e.clientX - startX
      const deltaY = e.clientY - startY
      setDragOffset({ x: deltaX, y: deltaY })
    }

    const handleDragEnd = () => {
      setIsDragging(false)
      const threshold = 100

      if (Math.abs(dragOffset.x) > threshold) {
        handleSwipe(dragOffset.x > 0 ? "like" : "pass")
      } else {
        setDragOffset({ x: 0, y: 0 })
      }

      document.removeEventListener("mousemove", handleDrag)
      document.removeEventListener("mouseup", handleDragEnd)
    }

    document.addEventListener("mousemove", handleDrag)
    document.addEventListener("mouseup", handleDragEnd)
  }

  const handleRevealProfile = () => {
    setSelectedProfile(currentMatch.profile)
    setShowFullProfile(true)
  }

  if (matches.length === 0 || currentIndex >= matches.length) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6">
        <div className="text-center space-y-4">
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <Heart className="w-12 h-12 text-primary" />
          </div>
          <h2 className="text-2xl font-bold">No more profiles!</h2>
          <p className="text-muted-foreground">
            You've seen all available profiles. Check back later for new matches!
          </p>
          <Button onClick={() => router.push("/matches")} className="mt-4">
            View Your Matches
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b bg-card/80 backdrop-blur-sm">
        <h1 className="text-xl font-bold text-center">Discover</h1>
        <p className="text-sm text-muted-foreground text-center">
          AI-matched profiles • {matches.length - currentIndex} remaining
        </p>
      </div>

      {/* Profile Card */}
      <div className="flex-1 flex items-center justify-center p-4">
        <Card 
          ref={cardRef}
          className="w-full max-w-sm cursor-grab active:cursor-grabbing"
          style={{
            transform: `translate(${dragOffset.x}px, ${dragOffset.y}px) rotate(${dragOffset.x * 0.1}deg)`,
            transition: isAnimating ? "transform 0.3s ease-out" : "none",
            opacity: isAnimating ? 0.7 : 1,
          }}
          onMouseDown={handleDragStart}
        >
          <CardContent className="p-0">
            {/* Animal Avatar */}
            <div className="relative h-80 bg-gradient-to-br from-primary/20 to-secondary/20">
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-8xl">
                  {AnimalAvatarGenerator.generateAvatar(currentMatch.profile.id)}
                </div>
              </div>
              
              {/* Compatibility Score */}
              <div className="absolute top-4 right-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                <Star className="w-4 h-4" />
                {currentMatch.score}% Match
              </div>

              {/* Action Buttons */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-4">
                <Button
                  size="icon"
                  variant="destructive"
                  className="w-12 h-12 rounded-full"
                  onClick={() => handleSwipe("pass")}
                >
                  <X className="w-6 h-6" />
                </Button>
                <Button
                  size="icon"
                  className="w-12 h-12 rounded-full bg-primary"
                  onClick={() => handleSwipe("like")}
                >
                  <Heart className="w-6 h-6" />
                </Button>
              </div>
            </div>

            {/* Profile Info */}
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">
                  {currentMatch.profile.first_name} {currentMatch.profile.last_name}
                </h3>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="w-5 h-5" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <ReportModal reportedUserId={currentMatch.profile.id} />
                  </DialogContent>
                </Dialog>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  {currentMatch.profile.major} • Class of {currentMatch.profile.graduation_year}
                </p>
                
                {/* AI Personality Summary */}
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    {PersonalitySummaryGenerator.generateSummary(currentMatch.profile)}
                  </p>
                  
                  <MutualConfirmation 
                    currentUser={currentUser} 
                    targetUser={currentMatch.profile}
                    onConfirmationChange={() => {
                      // Refresh the current match or handle confirmation change
                      console.log("Confirmation status changed")
                    }}
                  />
                </div>

                {/* Compatibility Reasons */}
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-primary">Why you might connect:</p>
                  {currentMatch.reasons.map((reason, index) => (
                    <p key={index} className="text-xs text-muted-foreground">• {reason}</p>
                  ))}
                </div>

                {/* Limited Interests */}
                <div className="flex flex-wrap gap-1">
                  {currentMatch.profile.interests.slice(0, 3).map((interest) => (
                    <Badge key={interest} variant="secondary" className="text-xs">
                      {interest}
                    </Badge>
                  ))}
                  {currentMatch.profile.interests.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{currentMatch.profile.interests.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Full Profile Modal */}
      <Dialog open={showFullProfile} onOpenChange={setShowFullProfile}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Complete Profile</DialogTitle>
            <DialogDescription>
              Full profile information for {selectedProfile?.first_name} {selectedProfile?.last_name}
            </DialogDescription>
          </DialogHeader>
          
          {selectedProfile && (
            <div className="space-y-4">
              <div className="text-center">
                <Avatar className="w-20 h-20 mx-auto mb-4">
                  <AvatarImage src={selectedProfile.profile_photo_url} />
                  <AvatarFallback className="text-lg">
                    {selectedProfile.first_name[0]}{selectedProfile.last_name[0]}
                  </AvatarFallback>
                </Avatar>
                <h3 className="text-xl font-bold">{selectedProfile.first_name} {selectedProfile.last_name}</h3>
                <p className="text-muted-foreground">{selectedProfile.major} • Class of {selectedProfile.graduation_year}</p>
              </div>

              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold mb-2">Bio</h4>
                  <p className="text-sm">{selectedProfile.bio}</p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Interests</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProfile.interests.map((interest) => (
                      <Badge key={interest} variant="secondary">{interest}</Badge>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => setShowFullProfile(false)}
                  >
                    Close
                  </Button>
                  <Button 
                    className="flex-1"
                    onClick={() => {
                      setShowFullProfile(false)
                      handleSwipe("like")
                    }}
                  >
                    <Heart className="w-4 h-4 mr-2" />
                    Like
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* New Match Modal */}
      {newMatch && (
        <Dialog open={!!newMatch} onOpenChange={() => setNewMatch(null)}>
          <DialogContent>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Heart className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold">It's a Match!</h2>
              <p className="text-muted-foreground">
                You and {newMatch.first_name} liked each other!
              </p>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setNewMatch(null)}
                >
                  Keep Swiping
                </Button>
                <Button 
                  className="flex-1"
                  onClick={() => router.push("/matches")}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Start Chatting
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

