const CROP_EMOJI: Record<string, string> = {
  Tomato: '🍅',
  Onion: '🧅',
  Brinjal: '🍆',
  Cabbage: '🥬',
  Cauliflower: '🥦',
  "Lady's Finger": '🌿',
  'Green Chilli': '🌶️',
  Potato: '🥔',
  Banana: '🍌',
  Mango: '🥭',
  Coconut: '🥥',
  Turmeric: '🫚',
  Groundnut: '🥜',
  Paddy: '🌾',
  Sugarcane: '🎋',
}

export function getCropEmoji(cropName: string): string {
  return CROP_EMOJI[cropName] ?? '🌾'
}

export function formatDate(dateStr: string | null | undefined, locale = 'en-IN'): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
