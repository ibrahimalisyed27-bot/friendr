"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X, Plus, Upload, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import Link from "next/link"

const commonInterests = [
  "Sports",
  "Music",
  "Art",
  "Technology",
  "Gaming",
  "Reading",
  "Movies",
  "Travel",
  "Cooking",
  "Photography",
  "Fitness",
  "Dancing",
  "Writing",
  "Volunteering",
  "Hiking",
  "Fashion",
  "Science",
  "Politics",
  "Business",
]

const majors = [
  "Computer Science",
  "Business",
  "Psychology",
  "Biology",
  "Engineering",
  "English",
  "History",
  "Mathematics",
  "Economics",
  "Political Science",
  "Art",
  "Music",
  "Chemistry",
  "Physics",
  "Philosophy",
  "Sociology",
  "Communications",
  "Marketing",
  "Finance",
  "Pre-Med",
  "Pre-Law",
  "Other",
]

export default function EditProfilePage() {
  const [formData, setFormData] = useState({
    bio: "",
    major: "",
    graduationYear: "",
    interests: [] as string[],
    customInterest: "",
  })
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        // Load existing profile data
        const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

        if (profile) {
          setFormData({
            bio: profile.bio || "",
            major: profile.major || "",
            graduationYear: profile.graduation_year?.toString() || "",
            interests: profile.interests || [],
            customInterest: "",
          })
          setCurrentPhotoUrl(profile.profile_photo_url)
        }
      }
    }
    getUser()
  }, [])

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setProfilePhoto(file)
      const reader = new FileReader()
      reader.onload = (e) => setPhotoPreview(e.target?.result as string)
      reader.readAsDataURL(file)
    }
  }

  const addInterest = (interest: string) => {
    if (!formData.interests.includes(interest) && formData.interests.length < 10) {
      setFormData((prev) => ({
        ...prev,
        interests: [...prev.interests, interest],
      }))
    }
  }

  const removeInterest = (interest: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.filter((i) => i !== interest),
    }))
  }

  const addCustomInterest = () => {
    if (formData.customInterest.trim() && !formData.interests.includes(formData.customInterest.trim())) {
      addInterest(formData.customInterest.trim())
      setFormData((prev) => ({ ...prev, customInterest: "" }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsLoading(true)
    setError(null)
    setSuccess(null)

    const supabase = createClient()

    try {
      let profilePhotoUrl = currentPhotoUrl

      // Upload new profile photo if provided
      if (profilePhoto) {
        const fileExt = profilePhoto.name.split(".").pop()
        const fileName = `${user.id}-${Date.now()}.${fileExt}`

        const { error: uploadError } = await supabase.storage.from("profile-photos").upload(fileName, profilePhoto)

        if (uploadError) throw uploadError

        const {
          data: { publicUrl },
        } = supabase.storage.from("profile-photos").getPublicUrl(fileName)

        profilePhotoUrl = publicUrl
      }

      // Update profile
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          bio: formData.bio,
          major: formData.major,
          graduation_year: Number.parseInt(formData.graduationYear),
          interests: formData.interests,
          profile_photo_url: profilePhotoUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)

      if (updateError) throw updateError

      setSuccess("Profile updated successfully!")
      setCurrentPhotoUrl(profilePhotoUrl)
      setProfilePhoto(null)
      setPhotoPreview(null)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Button variant="ghost" asChild className="gap-2">
            <Link href="/dashboard">
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>

        <Card className="shadow-xl border-0 bg-card/80 backdrop-blur-sm">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Edit Your Profile
            </CardTitle>
            <CardDescription className="text-base">
              Update your information to better connect with fellow students
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Profile Photo */}
              <div className="space-y-2">
                <Label>Profile Photo</Label>
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                    {photoPreview ? (
                      <img
                        src={photoPreview || "/placeholder.svg"}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : currentPhotoUrl ? (
                      <img
                        src={currentPhotoUrl || "/placeholder.svg"}
                        alt="Current"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Upload className="w-8 h-8 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                      id="photo-upload"
                    />
                    <Label htmlFor="photo-upload" className="cursor-pointer">
                      <Button type="button" variant="outline" asChild>
                        <span>Change Photo</span>
                      </Button>
                    </Label>
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell us about yourself, your hobbies, what you're studying..."
                  value={formData.bio}
                  onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
                  className="min-h-24"
                  maxLength={500}
                  required
                />
                <p className="text-xs text-muted-foreground">{formData.bio.length}/500 characters</p>
              </div>

              {/* Major */}
              <div className="space-y-2">
                <Label htmlFor="major">Major</Label>
                <Select
                  value={formData.major}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, major: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your major" />
                  </SelectTrigger>
                  <SelectContent>
                    {majors.map((major) => (
                      <SelectItem key={major} value={major}>
                        {major}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Graduation Year */}
              <div className="space-y-2">
                <Label htmlFor="graduationYear">Graduation Year</Label>
                <Select
                  value={formData.graduationYear}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, graduationYear: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select graduation year" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 8 }, (_, i) => new Date().getFullYear() + i).map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Interests */}
              <div className="space-y-4">
                <Label>Interests (Select up to 10)</Label>

                {/* Selected Interests */}
                {formData.interests.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.interests.map((interest) => (
                      <Badge key={interest} variant="secondary" className="gap-1">
                        {interest}
                        <X className="w-3 h-3 cursor-pointer" onClick={() => removeInterest(interest)} />
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Common Interests */}
                <div className="space-y-2">
                  <p className="text-sm font-medium">Popular interests:</p>
                  <div className="flex flex-wrap gap-2">
                    {commonInterests.map((interest) => (
                      <Badge
                        key={interest}
                        variant={formData.interests.includes(interest) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() =>
                          formData.interests.includes(interest) ? removeInterest(interest) : addInterest(interest)
                        }
                      >
                        {interest}
                        {formData.interests.includes(interest) ? (
                          <X className="w-3 h-3 ml-1" />
                        ) : (
                          <Plus className="w-3 h-3 ml-1" />
                        )}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Custom Interest */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Add custom interest"
                    value={formData.customInterest}
                    onChange={(e) => setFormData((prev) => ({ ...prev, customInterest: e.target.value }))}
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addCustomInterest())}
                  />
                  <Button type="button" onClick={addCustomInterest} variant="outline">
                    Add
                  </Button>
                </div>
              </div>

              {error && <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg">{error}</div>}

              {success && <div className="p-3 text-sm text-primary bg-primary/10 rounded-lg">{success}</div>}

              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold"
                disabled={isLoading || formData.interests.length === 0}
              >
                {isLoading ? "Saving changes..." : "Save Changes"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
