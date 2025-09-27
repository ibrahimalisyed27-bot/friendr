"use client"

import type React from "react"

import { useState, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { RotateCcw, MessageCircle, User, MoreVertical, Flag } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ReportModal } from "@/components/report-modal"

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
  const [matches, setMatches] = useState<Profile[]>(potentialMatches)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [newMatch, setNewMatch] = useState<Profile | null>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const currentMatch = matches[currentIndex]

  const handleSwipe = async (action: "like" | "pass") => {
    if (!currentMatch || isAnimating) return

    setIsAnimating(true)
    const supabase = createClient()

    try {
      // Record the swipe in the database
      const { error } = await supabase.from("matches").insert({
        user_id: currentUser.id,
        target_user_id: currentMatch.id,
        action: action,
      })

      if (error) throw error

      // Check if this creates a mutual match
      if (action === "like") {
        const { data: mutualMatch } = await supabase
          .from("matches")
          .select("*")
          .eq("user_id", currentMatch.id)
          .eq("target_user_id", currentUser.id)
          .eq("action", "like")
          .single()

        if (mutualMatch) {
          setNewMatch(currentMatch)
        }
      }

      // Move to next card
      setTimeout(() => {
        setCurrentIndex((prev) => prev + 1)
        setIsAnimating(false)
        setDragOffset({ x: 0, y: 0 })
      }, 300)
    } catch (error) {
      console.error("Error recording swipe:", error)
      setIsAnimating(false)
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isAnimating) return
    setIsDragging(true)
    const startX = e.clientX
    const startY = e.clientY

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX
      const deltaY = e.clientY - startY
      setDragOffset({ x: deltaX, y: deltaY })
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)

      // Determine swipe action based on drag distance
      if (Math.abs(dragOffset.x) > 100) {
        if (dragOffset.x > 0) {
          handleSwipe("like")
        } else {
          handleSwipe("pass")
        }
      } else {
        setDragOffset({ x: 0, y: 0 })
      }
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isAnimating) return
    setIsDragging(true)
    const startX = e.touches[0].clientX
    const startY = e.touches[0].clientY

    const handleTouchMove = (e: TouchEvent) => {
      const deltaX = e.touches[0].clientX - startX
      const deltaY = e.touches[0].clientY - startY
      setDragOffset({ x: deltaX, y: deltaY })
    }

    const handleTouchEnd = () => {
      setIsDragging(false)
      document.removeEventListener("touchmove", handleTouchMove)
      document.removeEventListener("touchend", handleTouchEnd)

      // Determine swipe action based on drag distance
      if (Math.abs(dragOffset.x) > 100) {
        if (dragOffset.x > 0) {
          handleSwipe("like")
        } else {
          handleSwipe("pass")
        }
      } else {
        setDragOffset({ x: 0, y: 0 })
      }
    }

    document.addEventListener("touchmove", handleTouchMove)
    document.addEventListener("touchend", handleTouchEnd)
  }

  const getCardStyle = () => {
    const rotation = dragOffset.x * 0.1
    const opacity = Math.max(0.7, 1 - Math.abs(dragOffset.x) * 0.002)

    return {
      transform: `translate(${dragOffset.x}px, ${dragOffset.y}px) rotate(${rotation}deg)`,
      opacity: opacity,
      transition: isDragging ? "none" : "all 0.3s ease-out",
    }
  }

  const getSwipeIndicator = () => {
    if (Math.abs(dragOffset.x) < 50) return null

    return dragOffset.x > 0 ? (
      <div className="absolute top-8 right-8 bg-primary/90 text-primary-foreground px-4 py-2 rounded-full font-bold text-lg rotate-12">
        LIKE
      </div>
    ) : (
      <div className="absolute top-8 left-8 bg-destructive/90 text-destructive-foreground px-4 py-2 rounded-full font-bold text-lg -rotate-12">
        PASS
      </div>
    )
  }

  if (currentIndex >= matches.length) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="w-full max-w-md text-center shadow-xl">
          <CardContent className="p-8 space-y-6">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <RotateCcw className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">No More Profiles</h2>
              <p className="text-muted-foreground">
                You've seen all available profiles! Check back later for new students.
              </p>
            </div>
            <Button onClick={() => router.push("/matches")} className="w-full">
              View Your Matches
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <>
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between p-4 bg-card/80 backdrop-blur-sm border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">CC</span>
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Campus Connect
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/matches">
                <MessageCircle className="w-5 h-5" />
              </Link>
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <Link href="/profile/edit">
                <User className="w-5 h-5" />
              </Link>
            </Button>
          </div>
        </header>

        {/* Main Swipe Area */}
        <div className="flex-1 flex items-center justify-center p-4 relative">
          <div className="relative w-full max-w-sm">
            {/* Background Cards */}
            {matches.slice(currentIndex + 1, currentIndex + 3).map((match, index) => (
              <Card
                key={match.id}
                className="absolute inset-0 shadow-lg"
                style={{
                  transform: `scale(${0.95 - index * 0.05}) translateY(${index * 8}px)`,
                  zIndex: -index - 1,
                  opacity: 0.8 - index * 0.2,
                }}
              >
                <div className="aspect-[3/4] relative overflow-hidden rounded-lg">
                  {match.profile_photo_url ? (
                    <img
                      src={match.profile_photo_url || "/placeholder.svg"}
                      alt={`${match.first_name} ${match.last_name}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                      <div className="text-6xl font-bold text-primary/60">
                        {match.first_name[0]}
                        {match.last_name[0]}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            ))}

            {/* Current Card */}
            {currentMatch && (
              <Card
                ref={cardRef}
                className="relative shadow-xl cursor-grab active:cursor-grabbing select-none"
                style={getCardStyle()}
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
              >
                {getSwipeIndicator()}

                {/* Added report option to profile card */}
                <div className="absolute top-4 right-4 z-10">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="bg-black/20 hover:bg-black/40 text-white">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <ReportModal
                        reportedUserId={currentMatch.id}
                        reportedUserName={`${currentMatch.first_name} ${currentMatch.last_name}`}
                        trigger={
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <Flag className="w-4 h-4 mr-2" />
                            Report User
                          </DropdownMenuItem>
                        }
                      />
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="aspect-[3/4] relative overflow-hidden rounded-lg">
                  {currentMatch.profile_photo_url ? (
                    <img
                      src={currentMatch.profile_photo_url || "/placeholder.svg"}
                      alt={`${currentMatch.first_name} ${currentMatch.last_name}`}
                      className="w-full h-full object-cover"
                      draggable={false}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                      <div className="text-6xl font-bold text-primary/60">
                        {currentMatch.first_name[0]}
                        {currentMatch.last_name[0]}
                      </div>
                    </div>
                  )}

                  {/* Profile Info Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-white">
                    <h3 className="text-2xl font-bold mb-1">
                      {currentMatch.first_name} {currentMatch.last_name}
                    </h3>
                    <p className="text-sm opacity-90 mb-2">
                      {currentMatch.major} • Class of {currentMatch.graduation_year}
                    </p>
                    <p className="text-sm opacity-80 mb-3 line-clamp-2">{currentMatch.bio}</p>
                    <div className="flex flex-wrap gap-1">
                      {currentMatch.interests.slice(0, 3).map((interest) => (
                        <span key={interest} className="px-2 py-1 bg-white/20 rounded-full text-xs">
                          {interest}
                        </span>
                      ))}
                      {currentMatch.interests.length > 3 && (
                        <span className="px-2 py-1 bg-white/20 rounded-full text-xs">
                          +{currentMatch.interests.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-6 p-6 bg-card/80 backdrop-blur-sm border-t">
          <Button
            variant="outline"
            size="lg"
            className="w-16 h-16 rounded-full border-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground bg-transparent"
            onClick={() => handleSwipe("pass")}
            disabled={isAnimating}
          >
            ✕
          </Button>
          <Button
            size="lg"
            className="w-16 h-16 rounded-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
            onClick={() => handleSwipe("like")}
            disabled={isAnimating}
          >
            ♥
          </Button>
        </div>
      </div>

      {/* Match Modal */}
      {newMatch && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-sm text-center shadow-2xl">
            <CardContent className="p-8 space-y-6">
              <div className="text-6xl">🎉</div>
              <div>
                <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  It's a Match!
                </h2>
                <p className="text-muted-foreground">You and {newMatch.first_name} both liked each other!</p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setNewMatch(null)}>
                  Keep Swiping
                </Button>
                <Button className="flex-1" onClick={() => router.push(`/chat/${newMatch.id}`)}>
                  Send Message
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}
