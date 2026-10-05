export interface ProductItem {
  id: number
  name: string
  shortName: string
  stage: string
  category: 'puree' | 'finger-food' | 'breakfast'
  color: string
  accentColor: string
  price: number
  img: string
  emoji: string
  tagline: string
  benefits: string[]
  ingredients: string
  texture: string
  fatContent: string
  dhaContent: string
}

export const BUILD_PRODUCTS: ProductItem[] = [
  {
    id: 1,
    name: 'Banana & Hass Avocado Greek Yogurt',
    shortName: 'Banana & Avocado',
    stage: '6+',
    category: 'puree',
    color: '#86efac',
    accentColor: '#16a34a',
    price: 4.8,
    img: '/images/banana-pouch.png',
    emoji: '🥑',
    tagline: 'Velvety smooth whole milk fat for developing brains',
    benefits: ['5g Healthy Fats', 'A2 Digestion', '6 Probiotic Strains'],
    ingredients: 'Cultured Organic Grass-Fed A2 Whole Milk, Organic Banana Puree, Hass Avocado, Probiotics',
    texture: 'Ultra-creamy & lump-free',
    fatContent: '5.2g per pouch',
    dhaContent: 'Naturally rich in CLA'
  },
  {
    id: 2,
    name: 'Blueberry & Purple Carrot Probiotic Pouch',
    shortName: 'Wild Blueberry',
    stage: '6+',
    category: 'puree',
    color: '#c084fc',
    accentColor: '#7e22ce',
    price: 4.8,
    img: '/images/blueberry-pouch.png',
    emoji: '🫐',
    tagline: 'Deep anthocyanin antioxidants & tummy-calming cultures',
    benefits: ['Antioxidant Packed', 'Zero Added Sugar', 'Gentle on Gut'],
    ingredients: 'Cultured Organic Grass-Fed A2 Whole Milk, Organic Wild Blueberries, Purple Carrot, Probiotics',
    texture: 'Smooth berry silk',
    fatContent: '4.8g per pouch',
    dhaContent: 'Bifidobacterium infantis'
  },
  {
    id: 3,
    name: 'Golden Mango & Sweet Potato Sunshine',
    shortName: 'Golden Mango',
    stage: '6+',
    category: 'puree',
    color: '#fde047',
    accentColor: '#ca8a04',
    price: 4.8,
    img: '/images/mango-pouch.png',
    emoji: '🥭',
    tagline: 'Naturally sun-kissed sweetness with Beta-Carotene for bright eyes',
    benefits: ['High Vitamin A', 'No Concentrates', '100% Grass-Fed'],
    ingredients: 'Cultured Organic Grass-Fed A2 Whole Milk, Organic Alphonso Mango, Sweet Potato, Probiotics',
    texture: 'Velvety puree',
    fatContent: '4.9g per pouch',
    dhaContent: 'Eye & vision nutrients'
  },
  {
    id: 4,
    name: 'Melty Mozzarella & Garden Herb Bites',
    shortName: 'Mozzarella Bites',
    stage: '10+',
    category: 'finger-food',
    color: '#fed7aa',
    accentColor: '#ea580c',
    price: 5.2,
    img: '/images/cheese-bites.png',
    emoji: '🧀',
    tagline: 'Soft, melt-in-the-mouth bites that build pincer grasp confidence',
    benefits: ['Calcium Rich', 'Finger-Food Ready', 'Low Sodium'],
    ingredients: 'Organic Cultured Pasteurized A2 Whole Milk, Organic Basil & Oregano Flecks, Microbial Enzymes',
    texture: 'Soft & dissolvable in saliva',
    fatContent: '6.0g per serving',
    dhaContent: 'Bone-building calcium'
  },
  {
    id: 5,
    name: 'Mild Aged Cheddar Snack Nibbles',
    shortName: 'Mild Cheddar',
    stage: '12+',
    category: 'finger-food',
    color: '#fef08a',
    accentColor: '#d97706',
    price: 5.2,
    img: '/images/cheese-bites.png',
    emoji: '🧀',
    tagline: 'Nutritious grass-fed protein cubes for active, walking toddlers',
    benefits: ['7g Clean Protein', 'Zero Additives', 'Naturally Lactose-Free'],
    ingredients: 'Cultured Organic Grass-Fed A2 Whole Milk, Sea Salt (<0.1g), Microbial Enzymes',
    texture: 'Chewy soft cube',
    fatContent: '7.0g per serving',
    dhaContent: 'High bioavailable zinc'
  },
]

export interface BoxSizeOption {
  id: 'taster' | 'growing' | 'feast'
  name: string
  subname: string
  capacity: number
  badge?: string
  freeGift: string
  savingsLabel: string
  basePrice: number
  popular?: boolean
}

export const BOX_SIZES: BoxSizeOption[] = [
  {
    id: 'taster',
    name: 'Taster Explorer',
    subname: '8 Pouches / Snacks',
    capacity: 8,
    freeGift: 'Milestone Recipe Card',
    savingsLabel: 'Save 15% on sub',
    basePrice: 38.40,
    popular: false,
  },
  {
    id: 'growing',
    name: 'Growing Sprout',
    subname: '16 Pouches / Snacks',
    capacity: 16,
    badge: 'MOST POPULAR ⭐',
    freeGift: 'Free Silicone Feeding Spoon ($9 value)',
    savingsLabel: 'Save 20% + Free Cold Ship',
    basePrice: 68.00,
    popular: true,
  },
  {
    id: 'feast',
    name: 'Toddler Feast Box',
    subname: '24 Pouches / Snacks',
    capacity: 24,
    badge: 'BEST VALUE 🎉',
    freeGift: 'Free Insulated Cooler Bag + Snack Bib ($24 value)',
    savingsLabel: 'Save 25% + Priority Cold Express',
    basePrice: 96.00,
    popular: false,
  },
]

export interface DeliveryFrequency {
  id: string
  label: string
  discount: number
  description: string
  perk: string
}

export const FREQUENCIES: DeliveryFrequency[] = [
  {
    id: 'every-2-weeks',
    label: 'Every 2 Weeks',
    discount: 0.20,
    description: 'Optimal pasture freshness & continuous probiotic gut support',
    perk: 'Free cold shipping forever ❄️',
  },
  {
    id: 'every-3-weeks',
    label: 'Every 3 Weeks',
    discount: 0.20,
    description: 'Great for steady weaning exploration',
    perk: 'Pause or skip anytime via SMS 📱',
  },
  {
    id: 'every-4-weeks',
    label: 'Every 4 Weeks',
    discount: 0.15,
    description: 'Monthly stock-up for busy parents',
    perk: 'Zero lock-in contract ✨',
  },
  {
    id: 'one-time',
    label: 'One-Time Order',
    discount: 0,
    description: 'Try a single cold delivery with no subscription',
    perk: 'Standard cold shipping applies',
  },
]
