"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SwipeInterface } from "@/components/swipe-interface"
import { MatchesList } from "@/components/matches-list"
import { SettingsInterface } from "@/components/settings-interface"
import { Heart, MessageCircle, Settings, Users } from "lucide-react"

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

interface Match {
  id: string
  target_user_id: string
  created_at: string
  target_profile: Profile
}

interface MainAppProps {
  currentUser: Profile
  potentialMatches: Profile[]
  mutualMatches: Match[]
}

export function MainApp({ currentUser, potentialMatches, mutualMatches }: MainAppProps) {
  const [activeTab, setActiveTab] = useState("swipe")

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="max-w-md mx-auto bg-background min-h-screen">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          {/* Main Content */}
          <div className="flex-1 overflow-hidden">
            <TabsContent value="swipe" className="h-full m-0">
              <SwipeInterface currentUser={currentUser} potentialMatches={potentialMatches} />
            </TabsContent>
            
            <TabsContent value="matches" className="h-full m-0">
              <MatchesList matches={mutualMatches} currentUserId={currentUser.id} currentUser={currentUser} />
            </TabsContent>
            
            <TabsContent value="settings" className="h-full m-0">
              <SettingsInterface currentUser={currentUser} />
            </TabsContent>
          </div>

          {/* Bottom Navigation */}
          <div className="border-t bg-card/80 backdrop-blur-sm">
            <TabsList className="grid w-full grid-cols-3 h-16 bg-transparent p-0">
              <TabsTrigger 
                value="swipe" 
                className="flex flex-col items-center gap-1 h-full data-[state=active]:bg-primary/10"
              >
                <Heart className="w-5 h-5" />
                <span className="text-xs">Discover</span>
              </TabsTrigger>
              
              <TabsTrigger 
                value="matches" 
                className="flex flex-col items-center gap-1 h-full data-[state=active]:bg-primary/10"
              >
                <MessageCircle className="w-5 h-5" />
                <span className="text-xs">Messages</span>
              </TabsTrigger>
              
              <TabsTrigger 
                value="settings" 
                className="flex flex-col items-center gap-1 h-full data-[state=active]:bg-primary/10"
              >
                <Settings className="w-5 h-5" />
                <span className="text-xs">Settings</span>
              </TabsTrigger>
            </TabsList>
          </div>
        </Tabs>
      </div>
    </div>
  )
}

