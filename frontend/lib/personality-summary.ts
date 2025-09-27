// AI Personality Summary Generator
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

export class PersonalitySummaryGenerator {
  // Generate AI personality summary from profile data
  static generateSummary(profile: Profile): string {
    const traits = this.extractPersonalityTraits(profile)
    const lifestyle = this.extractLifestyleTraits(profile)
    const social = this.extractSocialTraits(profile)
    
    return this.combineTraits(traits, lifestyle, social)
  }

  private static extractPersonalityTraits(profile: Profile): string[] {
    const traits: string[] = []
    const bio = profile.bio.toLowerCase()
    const interests = profile.interests.map(i => i.toLowerCase())

    // Academic traits
    if (this.isAcademicMajor(profile.major)) {
      traits.push("academically driven")
    }
    if (interests.some(i => ["reading", "writing", "research"].includes(i))) {
      traits.push("intellectually curious")
    }

    // Creative traits
    if (interests.some(i => ["art", "music", "photography", "writing", "design"].includes(i))) {
      traits.push("creative")
    }

    // Social traits
    if (interests.some(i => ["volunteering", "community service", "leadership"].includes(i))) {
      traits.push("community-minded")
    }
    if (interests.some(i => ["sports", "fitness", "team sports"].includes(i))) {
      traits.push("team-oriented")
    }

    // Adventure traits
    if (interests.some(i => ["travel", "hiking", "adventure", "exploring"].includes(i))) {
      traits.push("adventurous")
    }

    // Analytical traits
    if (this.isSTEMMajor(profile.major) || interests.some(i => ["technology", "gaming", "programming"].includes(i))) {
      traits.push("analytical")
    }

    // Bio analysis
    if (bio.includes("outgoing") || bio.includes("social")) {
      traits.push("outgoing")
    }
    if (bio.includes("calm") || bio.includes("peaceful")) {
      traits.push("calm")
    }
    if (bio.includes("funny") || bio.includes("humor")) {
      traits.push("humorous")
    }
    if (bio.includes("organized") || bio.includes("structured")) {
      traits.push("organized")
    }

    return traits.slice(0, 3) // Limit to top 3 traits
  }

  private static extractLifestyleTraits(profile: Profile): string[] {
    const traits: string[] = []
    const interests = profile.interests.map(i => i.toLowerCase())

    // Health & fitness
    if (interests.some(i => ["fitness", "sports", "gym", "running", "yoga"].includes(i))) {
      traits.push("health-conscious")
    }

    // Food & cooking
    if (interests.some(i => ["cooking", "food", "baking"].includes(i))) {
      traits.push("culinary enthusiast")
    }

    // Entertainment
    if (interests.some(i => ["movies", "music", "gaming", "reading"].includes(i))) {
      traits.push("entertainment lover")
    }

    // Nature
    if (interests.some(i => ["hiking", "nature", "outdoors", "camping"].includes(i))) {
      traits.push("nature enthusiast")
    }

    return traits.slice(0, 2)
  }

  private static extractSocialTraits(profile: Profile): string[] {
    const traits: string[] = []
    const interests = profile.interests.map(i => i.toLowerCase())

    // Social activities
    if (interests.some(i => ["dancing", "parties", "social events"].includes(i))) {
      traits.push("social butterfly")
    }

    // Quiet activities
    if (interests.some(i => ["reading", "writing", "meditation", "art"].includes(i))) {
      traits.push("introspective")
    }

    // Leadership
    if (interests.some(i => ["leadership", "mentoring", "volunteering"].includes(i))) {
      traits.push("natural leader")
    }

    return traits.slice(0, 1)
  }

  private static combineTraits(personality: string[], lifestyle: string[], social: string[]): string {
    const allTraits = [...personality, ...lifestyle, ...social]
    
    if (allTraits.length === 0) {
      return "A thoughtful individual with diverse interests and a passion for learning."
    }

    const traitString = allTraits.join(", ")
    const summaries = [
      `A ${traitString} person who brings positive energy to any situation.`,
      `Someone who is ${traitString} and always up for new experiences.`,
      `A ${traitString} individual with a great sense of humor and adventure.`,
      `An ${traitString} person who values meaningful connections and personal growth.`,
      `Someone who is ${traitString} and loves to explore new ideas and places.`
    ]

    return summaries[Math.floor(Math.random() * summaries.length)]
  }

  private static isAcademicMajor(major: string): boolean {
    const academicMajors = ["english", "history", "philosophy", "political science", "sociology", "psychology"]
    return academicMajors.some(am => major.toLowerCase().includes(am))
  }

  private static isSTEMMajor(major: string): boolean {
    const stemMajors = ["computer science", "engineering", "mathematics", "physics", "chemistry", "biology", "pre-med"]
    return stemMajors.some(sm => major.toLowerCase().includes(sm))
  }
}
