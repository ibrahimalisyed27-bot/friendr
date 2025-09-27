"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { LogOut, User, Bell, Shield, Trash2, Edit, Palette, Moon, Sun, Lock } from "lucide-react"
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

interface SettingsInterfaceProps {
  currentUser: Profile
}

export function SettingsInterface({ currentUser }: SettingsInterfaceProps) {
  const [notifications, setNotifications] = useState(true)
  const [profileVisibility, setProfileVisibility] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [showPasswordChange, setShowPasswordChange] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      alert("New passwords don't match")
      return
    }
    
    if (newPassword.length < 6) {
      alert("Password must be at least 6 characters long")
      return
    }
    
    setIsLoading(true)
    const supabase = createClient()
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })
      
      if (error) {
        alert("Error changing password: " + error.message)
      } else {
        alert("Password changed successfully!")
        setShowPasswordChange(false)
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
      }
    } catch (error) {
      console.error("Error changing password:", error)
      alert("Error changing password")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      return
    }
    
    setIsLoading(true)
    const supabase = createClient()
    
    try {
      // Delete user profile
      await supabase.from("profiles").delete().eq("id", currentUser.id)
      
      // Sign out user
      await supabase.auth.signOut()
      
      router.push("/auth/login")
    } catch (error) {
      console.error("Error deleting account:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 space-y-6">
        {/* Profile Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Profile
            </CardTitle>
            <CardDescription>Manage your profile information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center">
                <div className="text-2xl">
                  {AnimalAvatarGenerator.generateAvatar(currentUser.id)}
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{currentUser.first_name} {currentUser.last_name}</h3>
                <p className="text-sm text-muted-foreground">{currentUser.major} • Class of {currentUser.graduation_year}</p>
                <p className="text-sm text-muted-foreground">{currentUser.university}</p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <a href="/profile/edit">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </a>
              </Button>
            </div>
            
            <div className="space-y-2">
              <Label>Bio</Label>
              <p className="text-sm bg-muted p-3 rounded-md">{currentUser.bio}</p>
            </div>
            
            <div className="space-y-2">
              <Label>Interests</Label>
              <div className="flex flex-wrap gap-2">
                {currentUser.interests.map((interest) => (
                  <Badge key={interest} variant="secondary">{interest}</Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Privacy & Safety
            </CardTitle>
            <CardDescription>Control your privacy and safety settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Profile Visibility</Label>
                <p className="text-sm text-muted-foreground">Allow others to see your profile</p>
              </div>
              <Switch 
                checked={profileVisibility} 
                onCheckedChange={setProfileVisibility}
              />
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <Label>Reported Users</Label>
              <p className="text-sm text-muted-foreground">You haven't reported any users</p>
            </div>
            
            <div className="space-y-2">
              <Label>Blocked Users</Label>
              <p className="text-sm text-muted-foreground">You haven't blocked any users</p>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notifications
            </CardTitle>
            <CardDescription>Manage your notification preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Push Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive notifications for matches and messages</p>
              </div>
              <Switch 
                checked={notifications} 
                onCheckedChange={setNotifications}
              />
            </div>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Appearance
            </CardTitle>
            <CardDescription>Customize your app appearance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Dark Mode</Label>
                <p className="text-sm text-muted-foreground">Switch between light and dark themes</p>
              </div>
              <Switch 
                checked={darkMode} 
                onCheckedChange={setDarkMode}
              />
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Security
            </CardTitle>
            <CardDescription>Manage your account security</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              variant="outline" 
              className="w-full justify-start" 
              onClick={() => setShowPasswordChange(!showPasswordChange)}
            >
              <Lock className="w-4 h-4 mr-2" />
              Change Password
            </Button>
            
            {showPasswordChange && (
              <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={handlePasswordChange} 
                    disabled={isLoading || !newPassword || !confirmPassword}
                    className="flex-1"
                  >
                    {isLoading ? "Changing..." : "Change Password"}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowPasswordChange(false)
                      setNewPassword("")
                      setConfirmPassword("")
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Account Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>Manage your account settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full justify-start" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
            
            <Button 
              variant="destructive" 
              className="w-full justify-start" 
              onClick={handleDeleteAccount}
              disabled={isLoading}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {isLoading ? "Deleting..." : "Delete Account"}
            </Button>
          </CardContent>
        </Card>

        {/* App Info */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <h3 className="font-semibold">Friendr</h3>
              <p className="text-sm text-muted-foreground">Version 1.0.0</p>
              <p className="text-xs text-muted-foreground">Find your college friends at Arizona State University</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

