import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, GraduationCap, Calendar } from "lucide-react"

interface ProfileCardProps {
  profile: {
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
  showFullProfile?: boolean
}

export function ProfileCard({ profile, showFullProfile = false }: ProfileCardProps) {
  return (
    <Card className="w-full max-w-sm mx-auto overflow-hidden shadow-lg">
      {/* Profile Photo */}
      <div className="aspect-square relative overflow-hidden">
        {profile.profile_photo_url ? (
          <img
            src={profile.profile_photo_url || "/placeholder.svg"}
            alt={`${profile.first_name} ${profile.last_name}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
            <div className="text-6xl font-bold text-primary/60">
              {profile.first_name[0]}
              {profile.last_name[0]}
            </div>
          </div>
        )}

        {/* Overlay with basic info */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-white">
          <h3 className="text-xl font-bold">
            {profile.first_name} {profile.last_name}
          </h3>
          <div className="flex items-center gap-1 text-sm opacity-90">
            <GraduationCap className="w-4 h-4" />
            <span>{profile.major}</span>
          </div>
        </div>
      </div>

      {showFullProfile && (
        <CardContent className="p-4 space-y-4">
          {/* University and Graduation Year */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>{profile.university}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>Class of {profile.graduation_year}</span>
            </div>
          </div>

          {/* Bio */}
          <div>
            <p className="text-sm text-foreground leading-relaxed">{profile.bio}</p>
          </div>

          {/* Interests */}
          <div>
            <p className="text-sm font-medium mb-2">Interests</p>
            <div className="flex flex-wrap gap-1">
              {profile.interests.slice(0, 6).map((interest) => (
                <Badge key={interest} variant="secondary" className="text-xs">
                  {interest}
                </Badge>
              ))}
              {profile.interests.length > 6 && (
                <Badge variant="outline" className="text-xs">
                  +{profile.interests.length - 6} more
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
