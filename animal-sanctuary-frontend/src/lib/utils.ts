import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Utility function to merge Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format currency values for display
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

/**
 * Format dates for display
 */
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date))
}

/**
 * Format relative time (e.g., "2 days ago")
 */
export function formatRelativeTime(date: string | Date): string {
  const now = new Date()
  const targetDate = new Date(date)
  const diffInMs = now.getTime() - targetDate.getTime()
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
  
  if (diffInDays === 0) return 'Today'
  if (diffInDays === 1) return 'Yesterday'
  if (diffInDays < 7) return `${diffInDays} days ago`
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`
  return `${Math.floor(diffInDays / 365)} years ago`
}

/**
 * Calculate age from date of birth or arrival date
 */
export function calculateAge(birthDate: string | Date): number {
  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  
  return Math.max(0, age)
}

/**
 * Generate adoption status color and text
 */
export function getAdoptionStatus(status: string) {
  const statusMap = {
    available: {
      label: 'Available',
      color: 'sanctuary-nature-500',
      bgColor: 'sanctuary-nature-100',
      textColor: 'sanctuary-nature-700',
      icon: '✅'
    },
    pending: {
      label: 'Adoption Pending',
      color: 'sanctuary-accent-amber',
      bgColor: 'amber-100',
      textColor: 'amber-700',
      icon: '⏳'
    },
    adopted: {
      label: 'Adopted',
      color: 'sanctuary-care-500',
      bgColor: 'sanctuary-care-100',
      textColor: 'sanctuary-care-700',
      icon: '🏠'
    },
    'not available': {
      label: 'Not Available',
      color: 'sanctuary-neutral-500',
      bgColor: 'sanctuary-neutral-100',
      textColor: 'sanctuary-neutral-700',
      icon: '⛔'
    },
    'medical hold': {
      label: 'Medical Care',
      color: 'sanctuary-accent-rose',
      bgColor: 'rose-100',
      textColor: 'rose-700',
      icon: '🏥'
    }
  }
  
  return statusMap[status.toLowerCase() as keyof typeof statusMap] || statusMap['not available']
}

/**
 * Format weight with units
 */
export function formatWeight(weightKg: number, unit: 'kg' | 'lbs' = 'lbs'): string {
  if (unit === 'lbs') {
    const weightLbs = Math.round(weightKg * 2.20462)
    return `${weightLbs} lbs`
  }
  return `${weightKg} kg`
}

/**
 * Generate animal card image with fallback
 */
export function getAnimalImage(photos: string[] | null, species: string, name: string): string {
  if (photos && photos.length > 0) {
    return photos[0]
  }
  
  // Fallback to Unsplash images based on species
  const speciesImageMap: Record<string, string> = {
    dog: 'photo-1601758228041-f3b2795255f1', // Happy dog
    cat: 'photo-1514888286974-6c03e2ca1dba', // Cute cat
    rabbit: 'photo-1585110396000-c9ffd4e4b308', // Rabbit
    bird: 'photo-1444464666168-49d633b86797', // Colorful bird
    pig: 'photo-1516467508483-a7212febe31a', // Pig
  }
  
  const imageId = speciesImageMap[species.toLowerCase()] || speciesImageMap.dog
  return `https://images.unsplash.com/${imageId}?auto=format&fit=crop&w=400&h=300&q=80`
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate phone number format
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[\+]?[1-9]?[\d\s\-\(\)\.]{10,}$/
  return phoneRegex.test(phone)
}

/**
 * Format phone number for display
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
  }
  
  if (cleaned.length === 11 && cleaned[0] === '1') {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`
  }
  
  return phone
}

/**
 * Generate SEO-friendly slugs
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + '...'
}

/**
 * Get initials from name
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

/**
 * Debounce function for search inputs
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

/**
 * Local storage helpers with error handling
 */
export const storage = {
  get: (key: string) => {
    try {
      if (typeof window === 'undefined') return null
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : null
    } catch {
      return null
    }
  },
  
  set: (key: string, value: any) => {
    try {
      if (typeof window === 'undefined') return
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Silent fail
    }
  },
  
  remove: (key: string) => {
    try {
      if (typeof window === 'undefined') return
      window.localStorage.removeItem(key)
    } catch {
      // Silent fail
    }
  }
}

/**
 * API error handler
 */
export function handleApiError(error: any): string {
  if (error?.response?.data?.message) {
    return error.response.data.message
  }
  
  if (error?.message) {
    return error.message
  }
  
  return 'An unexpected error occurred. Please try again.'
}