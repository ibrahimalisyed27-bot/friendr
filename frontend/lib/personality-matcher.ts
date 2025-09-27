// AI Personality Matching Algorithm
export interface Profile {
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

export interface MatchScore {
  profile: Profile
  score: number
  reasons: string[]
}

export class PersonalityMatcher {
  // Calculate compatibility score between two profiles
  static calculateCompatibility(user1: Profile, user2: Profile): MatchScore {
    let score = 0
    const reasons: string[] = []

    // Interest matching (40% of score)
    const commonInterests = user1.interests.filter(interest => 
      user2.interests.includes(interest)
    )
    const interestScore = (commonInterests.length / Math.max(user1.interests.length, user2.interests.length)) * 40
    score += interestScore
    
    if (commonInterests.length > 0) {
      reasons.push(`Share ${commonInterests.length} common interest${commonInterests.length > 1 ? 's' : ''}: ${commonInterests.slice(0, 3).join(', ')}`)
    }

    // Major compatibility (20% of score)
    const majorCompatibility = this.getMajorCompatibility(user1.major, user2.major)
    score += majorCompatibility * 20
    
    if (majorCompatibility > 0.5) {
      reasons.push(`Both studying ${this.getMajorCategory(user1.major)}`)
    }

    // Graduation year proximity (15% of score)
    const yearDiff = Math.abs(user1.graduation_year - user2.graduation_year)
    const yearScore = yearDiff === 0 ? 1 : yearDiff <= 2 ? 0.8 : yearDiff <= 4 ? 0.5 : 0.2
    score += yearScore * 15
    
    if (yearDiff <= 1) {
      reasons.push(`Same graduation year`)
    } else if (yearDiff <= 2) {
      reasons.push(`Similar graduation timeline`)
    }

    // Bio compatibility (15% of score)
    const bioScore = this.calculateBioCompatibility(user1.bio, user2.bio)
    score += bioScore * 15
    
    if (bioScore > 0.6) {
      reasons.push(`Similar personality traits`)
    }

    // University context (10% of score)
    if (user1.university === user2.university) {
      score += 10
      reasons.push(`Same university`)
    }

    return {
      profile: user2,
      score: Math.round(score),
      reasons: reasons.slice(0, 3) // Limit to top 3 reasons
    }
  }

  // Get major compatibility score
  private static getMajorCompatibility(major1: string, major2: string): number {
    const majorCategories = {
      'STEM': ['Computer Science', 'Engineering', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Pre-Med'],
      'Business': ['Business', 'Marketing', 'Finance', 'Economics'],
      'Liberal Arts': ['English', 'History', 'Philosophy', 'Political Science', 'Sociology'],
      'Arts': ['Art', 'Music', 'Communications'],
      'Health': ['Pre-Med', 'Psychology', 'Biology']
    }

    const category1 = this.getMajorCategory(major1)
    const category2 = this.getMajorCategory(major2)

    if (category1 === category2) return 1.0
    if (this.areRelatedCategories(category1, category2)) return 0.7
    return 0.3
  }

  private static getMajorCategory(major: string): string {
    const majorCategories = {
      'STEM': ['Computer Science', 'Engineering', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Pre-Med'],
      'Business': ['Business', 'Marketing', 'Finance', 'Economics'],
      'Liberal Arts': ['English', 'History', 'Philosophy', 'Political Science', 'Sociology'],
      'Arts': ['Art', 'Music', 'Communications'],
      'Health': ['Pre-Med', 'Psychology', 'Biology']
    }

    for (const [category, majors] of Object.entries(majorCategories)) {
      if (majors.some(m => major.toLowerCase().includes(m.toLowerCase()))) {
        return category
      }
    }
    return 'Other'
  }

  private static areRelatedCategories(cat1: string, cat2: string): boolean {
    const relatedPairs = [
      ['STEM', 'Health'],
      ['Business', 'Liberal Arts'],
      ['Arts', 'Liberal Arts']
    ]
    
    return relatedPairs.some(pair => 
      (pair.includes(cat1) && pair.includes(cat2))
    )
  }

  // Calculate bio compatibility using keyword analysis
  private static calculateBioCompatibility(bio1: string, bio2: string): number {
    const keywords1 = this.extractKeywords(bio1.toLowerCase())
    const keywords2 = this.extractKeywords(bio2.toLowerCase())
    
    const commonKeywords = keywords1.filter(keyword => keywords2.includes(keyword))
    const totalKeywords = new Set([...keywords1, ...keywords2]).size
    
    return totalKeywords > 0 ? commonKeywords.length / totalKeywords : 0
  }

  private static extractKeywords(bio: string): string[] {
    const personalityKeywords = [
      'outgoing', 'introvert', 'extrovert', 'creative', 'analytical', 'adventurous',
      'calm', 'energetic', 'funny', 'serious', 'organized', 'spontaneous',
      'athletic', 'artistic', 'academic', 'social', 'independent', 'team player'
    ]
    
    const hobbyKeywords = [
      'music', 'sports', 'gaming', 'reading', 'travel', 'cooking', 'photography',
      'fitness', 'dancing', 'writing', 'volunteering', 'hiking', 'fashion'
    ]
    
    const allKeywords = [...personalityKeywords, ...hobbyKeywords]
    
    return allKeywords.filter(keyword => bio.includes(keyword))
  }

  // Get smart matches for a user
  static getSmartMatches(currentUser: Profile, allProfiles: Profile[]): MatchScore[] {
    const otherProfiles = allProfiles.filter(profile => profile.id !== currentUser.id)
    
    const matches = otherProfiles.map(profile => 
      this.calculateCompatibility(currentUser, profile)
    )
    
    // Sort by compatibility score (highest first)
    return matches.sort((a, b) => b.score - a.score)
  }

  // Filter matches based on minimum compatibility score
  static filterMatches(matches: MatchScore[], minScore: number = 60): MatchScore[] {
    return matches.filter(match => match.score >= minScore)
  }
}

