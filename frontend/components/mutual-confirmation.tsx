"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { createClient } from "@/lib/supabase/client"
import { Handshake, CheckCircle, Clock, User } from "lucide-react"
import { AnimalAvatarGenerator } from "@/lib/animal-avatar"

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

interface MutualConfirmationProps {
  currentUser: Profile
  targetUser: Profile
  onConfirmationChange?: () => void
}

export function MutualConfirmation({ currentUser, targetUser, onConfirmationChange }: MutualConfirmationProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showFullProfile, setShowFullProfile] = useState(false)
  const [confirmationStatus, setConfirmationStatus] = useState<"none" | "pending" | "mutual">("none")

  const handleMeetInPerson = async () => {
    setIsLoading(true)
    const supabase = createClient()
    
    try {
      // Check if target user has already confirmed
      const { data: existingConfirmation } = await supabase
        .from("mutual_confirmations")
        .select("*")
        .eq("user_id", targetUser.id)
        .eq("target_user_id", currentUser.id)
        .single()

      if (existingConfirmation) {
        // Both users have confirmed - mutual match!
        setConfirmationStatus("mutual")
        setShowFullProfile(true)
      } else {
        // Create confirmation from current user
        const { error } = await supabase
          .from("mutual_confirmations")
          .insert({
            user_id: currentUser.id,
            target_user_id: targetUser.id
          })

        if (error) {
          console.error("Error creating confirmation:", error)
        } else {
          setConfirmationStatus("pending")
        }
      }
      
      onConfirmationChange?.()
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getConfirmationButton = () => {
    switch (confirmationStatus) {
      case "pending":
        return (
          <Button disabled className="w-full">
            <Clock className="w-4 h-4 mr-2" />
            Waiting for {targetUser.first_name} to confirm
          </Button>
        )
      case "mutual":
        return (
          <Button 
            onClick={() => setShowFullProfile(!showFullProfile)}
            className="w-full"
            variant="default"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            {showFullProfile ? "Hide Full Profile" : "View Full Profile"}
          </Button>
        )
      default:
        return (
          <Button 
            onClick={handleMeetInPerson}
            disabled={isLoading}
            className="w-full"
          >
            <Handshake className="w-4 h-4 mr-2" />
            {isLoading ? "Confirming..." : "Meet in Person"}
          </Button>
        )
    }
  }

  return (
    <div className="space-y-4">
      {getConfirmationButton()}
      
      {showFullProfile && confirmationStatus === "mutual" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              {targetUser.first_name}'s Full Profile
            </CardTitle>
            <CardDescription>You both confirmed to meet in person!</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center">
                <div className="text-2xl">
                  {AnimalAvatarGenerator.generateAvatar(targetUser.id)}
                </div>
              </div>
              <div>
                <h3 className="font-semibold">{targetUser.first_name} {targetUser.last_name}</h3>
                <p className="text-sm text-muted-foreground">{targetUser.major} • Class of {targetUser.graduation_year}</p>
                <p className="text-sm text-muted-foreground">{targetUser.university}</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Bio</h4>
              <p className="text-sm bg-muted p-3 rounded-md">{targetUser.bio}</p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Interests</h4>
              <div className="flex flex-wrap gap-2">
                {targetUser.interests.map((interest) => (
                  <Badge key={interest} variant="secondary">{interest}</Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
