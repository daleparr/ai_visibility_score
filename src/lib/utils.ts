import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date))
}

export function formatDateTime(date: string | Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date))
}

export function formatScore(score: number): string {
  return Math.round(score).toString()
}

export function getGradeFromScore(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
  if (score >= 90) return 'A'
  if (score >= 80) return 'B'
  if (score >= 70) return 'C'
  if (score >= 60) return 'D'
  return 'F'
}

export function getGradeColor(grade: string): string {
  switch (grade) {
    case 'A':
      return 'text-success-600 bg-success-50 border-success-200'
    case 'B':
      return 'text-brand-600 bg-brand-50 border-brand-200'
    case 'C':
      return 'text-warning-600 bg-warning-50 border-warning-200'
    case 'D':
      return 'text-warning-700 bg-warning-100 border-warning-300'
    case 'F':
      return 'text-danger-600 bg-danger-50 border-danger-200'
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200'
  }
}

export function getScoreColor(score: number): string {
  if (score >= 90) return 'text-success-600'
  if (score >= 80) return 'text-brand-600'
  if (score >= 70) return 'text-warning-600'
  if (score >= 60) return 'text-warning-700'
  return 'text-danger-600'
}

export function getPriorityColor(priority: '1' | '2' | '3'): string {
  switch (priority) {
    case '1':
      return 'border-l-danger-500 bg-danger-50'
    case '2':
      return 'border-l-warning-500 bg-warning-50'
    case '3':
      return 'border-l-brand-500 bg-brand-50'
    default:
      return 'border-l-gray-500 bg-gray-50'
  }
}

export function getPriorityLabel(priority: '1' | '2' | '3'): string {
  switch (priority) {
    case '1':
      return '2 weeks'
    case '2':
      return '30 days'
    case '3':
      return '90 days'
    default:
      return 'Unknown'
  }
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function validateUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export function extractDomain(url: string): string {
  try {
    return new URL(url).hostname
  } catch {
    return url
  }
}

export function calculateOverallScore(dimensionScores: { score: number; weight: number }[]): number {
  const totalWeight = dimensionScores.reduce((sum, dim) => sum + dim.weight, 0)
  const weightedSum = dimensionScores.reduce((sum, dim) => sum + (dim.score * dim.weight), 0)
  return totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0
}

export function generateVerdict(score: number, brand: string): string {
  if (score >= 90) {
    return `${brand} has excellent AI visibility with competitive advantage`
  } else if (score >= 80) {
    return `${brand} has good AI visibility with minor optimization opportunities`
  } else if (score >= 70) {
    return `${brand} has average AI visibility with significant improvement potential`
  } else if (score >= 60) {
    return `${brand} has poor AI visibility with major gaps in discoverability`
  } else {
    return `${brand} has critical AI visibility issues requiring immediate attention`
  }
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

export function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text)
  } else {
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.style.position = 'absolute'
    textArea.style.left = '-999999px'
    document.body.prepend(textArea)
    textArea.select()
    
    try {
      document.execCommand('copy')
    } catch (error) {
      console.error('Failed to copy text: ', error)
    } finally {
      textArea.remove()
    }
    
    return Promise.resolve()
  }
}