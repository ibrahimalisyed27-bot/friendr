// Random Animal Avatar Generator
export class AnimalAvatarGenerator {
  private static animals = [
    "🐱", "🐶", "🐰", "🐻", "🐼", "🐨", "🐯", "🦁", "🐮", "🐷",
    "🐸", "🐵", "🐔", "🐧", "🐦", "🐤", "🦆", "🦅", "🦉", "🦇",
    "🐺", "🐗", "🐴", "🦄", "🐝", "🐛", "🦋", "🐌", "🐞", "🐜",
    "🦟", "🦗", "🕷️", "🦂", "🐢", "🐍", "🦎", "🦖", "🦕", "🐙",
    "🦑", "🦐", "🦞", "🦀", "🐡", "🐠", "🐟", "🐬", "🐳", "🐋",
    "🦈", "🐊", "🐅", "🐆", "🦓", "🦍", "🦧", "🐘", "🦛", "🦏",
    "🐪", "🐫", "🦒", "🦘", "🐃", "🐂", "🐄", "🐎", "🐖", "🐏",
    "🐑", "🦙", "🐐", "🦌", "🐕", "🐩", "🦮", "🐕‍🦺", "🐈", "🐓",
    "🦃", "🦚", "🦜", "🦢", "🦩", "🕊️", "🐇", "🦝", "🦨", "🦡",
    "🦦", "🦥", "🐁", "🐀", "🐿️", "🦔", "🐾", "🐉", "🐲", "🌵",
    "🐚", "🌺", "🌻", "🌷", "🌹", "🥀", "🌿", "🍀", "🌱", "🌾"
  ]

  // Generate a consistent animal avatar for a user based on their ID
  static generateAvatar(userId: string): string {
    // Use the user ID to generate a consistent avatar
    const hash = this.simpleHash(userId)
    const index = hash % this.animals.length
    return this.animals[index]
  }

  // Generate a random animal avatar (for new users)
  static generateRandomAvatar(): string {
    const index = Math.floor(Math.random() * this.animals.length)
    return this.animals[index]
  }

  // Simple hash function to convert string to number
  private static simpleHash(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash)
  }

  // Get all available animals (for selection)
  static getAllAnimals(): string[] {
    return [...this.animals]
  }

  // Get animal by index
  static getAnimalByIndex(index: number): string {
    return this.animals[index % this.animals.length]
  }
}
