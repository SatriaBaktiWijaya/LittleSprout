import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import confetti from 'canvas-confetti'
import {
  X, Check, Plus, Minus, Sparkles, Snowflake, Truck,
  ShieldCheck, ArrowRight, ArrowLeft, RefreshCw,
  Gift, Baby, Calendar, Clock, Lock,
  Volume2, VolumeX, CheckCircle2,
  Info
} from 'lucide-react'
import {
  BUILD_PRODUCTS,
  BOX_SIZES,
  FREQUENCIES,
  type ProductItem,
  type BoxSizeOption,
  type DeliveryFrequency
} from '@/lib/buildBoxData'
import { soundEffects } from '@/lib/sounds'
import { ShapeMorph } from '@/components/ui/shape'

interface BuildBoxModalProps {
  isOpen: boolean
  onClose: () => void
  initialStage?: string
  initialBundle?: Record<number, number>
}

type StepType = 'builder' | 'schedule' | 'personalize' | 'checkout' | 'celebration'

export const BuildBoxModal: React.FC<BuildBoxModalProps> = ({
  isOpen,
  onClose,
  initialStage: _initialStage = '6+',
  initialBundle = {}
}) => {
  // Step navigation
  const [currentStep, setCurrentStep] = useState<StepType>('builder')
  const contentRef = useRef<HTMLDivElement>(null)

  // Auto scroll to top when changing steps
  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }, [currentStep])

  // Sound preference
  const [soundEnabled, setSoundEnabled] = useState(true)

  // Box size
  const [selectedSize, setSelectedSize] = useState<BoxSizeOption>(BOX_SIZES[1]) // Default 16-pack Growing Sprout

  // Products bundle selection
  const [bundle, setBundle] = useState<Record<number, number>>(() => {
    if (Object.keys(initialBundle).length > 0) {
      return initialBundle
    }
    // Default smart starting mix
    return { 1: 3, 2: 3, 3: 2 }
  })

  // Filter category
  const [activeCategory, setActiveCategory] = useState<'all' | 'puree' | 'finger-food'>('all')

  // Selected product detail modal
  const [inspectProduct, setInspectProduct] = useState<ProductItem | null>(null)

  // Frequency
  const [selectedFrequency, setSelectedFrequency] = useState<DeliveryFrequency>(FREQUENCIES[0])

  // Preferred delivery weekday
  const [deliveryDay, setDeliveryDay] = useState<'Tuesday' | 'Thursday' | 'Friday'>('Thursday')

  // Personalization
  const [babyName, setBabyName] = useState('Leo')
  const [babyAge, setBabyAge] = useState('8 months')
  const [dietaryNote, setDietaryNote] = useState('Excited for first tastes & gentle digestion')

  // Checkout inputs
  const [formData, setFormData] = useState({
    parentName: 'Sarah Jenkins',
    email: 'sarah.jenkins@example.com',
    phone: '(555) 382-9912',
    address: '428 Maple Blossom Lane',
    apt: 'Apt 4B',
    city: 'Portland',
    state: 'OR',
    zip: '97201',
    deliveryNote: 'Please leave in porch shade near front door 🏡',
    promoCode: '',
    promoApplied: false,
    discountAmount: 0,
    paymentMethod: 'card' as 'card' | 'apple_pay' | 'google_pay',
    cardNumber: '4242 •••• •••• 4242',
    cardExp: '08/28',
    cardCvc: '883',
  })

  const [isProcessingOrder, setIsProcessingOrder] = useState(false)
  const [orderId, setOrderId] = useState('')

  // Calculate box total items
  const totalItems = Object.values(bundle).reduce((sum, count) => sum + count, 0)
  const capacity = selectedSize.capacity
  const isFull = totalItems >= capacity
  const remainingSlots = Math.max(0, capacity - totalItems)

  // Pricing calculations
  const rawSubtotal = BUILD_PRODUCTS.reduce((sum, p) => sum + p.price * (bundle[p.id] ?? 0), 0)
  const subDiscountPercent = selectedFrequency.discount
  const subDiscountValue = rawSubtotal * subDiscountPercent
  const promoDiscountValue = formData.promoApplied ? (rawSubtotal - subDiscountValue) * 0.2 : 0
  const totalDiscount = subDiscountValue + promoDiscountValue
  const shippingFee = selectedFrequency.id === 'one-time' ? 6.99 : 0
  const finalPrice = Math.max(0, rawSubtotal - totalDiscount + shippingFee)

  // Play sound wrapper
  const playSfx = (type: 'pop' | 'whoosh' | 'chime' | 'fanfare') => {
    if (!soundEnabled) return
    soundEffects[type]()
  }

  // Add to bundle
  const handleAddProduct = (id: number) => {
    if (totalItems >= capacity) {
      playSfx('whoosh')
      return
    }
    playSfx('pop')
    setBundle(prev => ({
      ...prev,
      [id]: (prev[id] ?? 0) + 1
    }))

    // If this fill completes the box, play happy chime!
    if (totalItems + 1 === capacity) {
      setTimeout(() => {
        playSfx('chime')
        triggerConfetti(0.5, 0.4)
      }, 150)
    }
  }

  // Remove from bundle
  const handleRemoveProduct = (id: number) => {
    playSfx('whoosh')
    setBundle(prev => {
      const current = prev[id] ?? 0
      if (current <= 1) {
        const next = { ...prev }
        delete next[id]
        return next
      }
      return { ...prev, [id]: current - 1 }
    })
  }

  // Auto-fill balanced best-seller mix
  const handleAutofill = () => {
    playSfx('chime')
    triggerConfetti(0.5, 0.5)

    // Distribute according to capacity
    if (capacity === 8) {
      setBundle({ 1: 3, 2: 3, 3: 2 })
    } else if (capacity === 16) {
      setBundle({ 1: 4, 2: 4, 3: 4, 4: 2, 5: 2 })
    } else {
      setBundle({ 1: 6, 2: 6, 3: 6, 4: 3, 5: 3 })
    }
  }

  // Clear box
  const handleClearBox = () => {
    playSfx('whoosh')
    setBundle({})
  }

  // Trigger cheerful confetti blast
  const triggerConfetti = (originX = 0.5, originY = 0.5) => {
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { x: originX, y: originY },
        colors: ['#22c55e', '#f59e0b', '#38bdf8', '#fb7185', '#a855f7'],
        disableForReducedMotion: true,
      })
    } catch {
      // Ignore
    }
  }

  // Apply promo code
  const handleApplyPromo = () => {
    const code = formData.promoCode.trim().toUpperCase()
    if (code === 'FIRSTSPROUT' || code === 'SPROUTLOVE' || code === 'BABY20') {
      playSfx('chime')
      triggerConfetti(0.7, 0.6)
      setFormData(prev => ({
        ...prev,
        promoApplied: true,
      }))
    } else {
      alert("Try promo code: FIRSTSPROUT for an extra 20% off!")
    }
  }

  // Fast demo fill
  const handleFastFillDemo = () => {
    setFormData(prev => ({
      ...prev,
      parentName: 'Sarah & Alex Jenkins',
      email: 'happy.parents@littlesprout.com',
      phone: '(555) 729-1092',
      address: '742 Evergreen Terrace',
      apt: 'Suite 302',
      city: 'Seattle',
      state: 'WA',
      zip: '98101',
      deliveryNote: 'Please place in shade near front porch · Ring bell so we can chill it! 🧊',
      promoCode: 'FIRSTSPROUT',
      promoApplied: true,
    }))
    playSfx('chime')
    triggerConfetti(0.5, 0.3)
  }

  // Final submit order
  const handlePlaceOrder = () => {
    setIsProcessingOrder(true)
    playSfx('pop')

    setTimeout(() => {
      setIsProcessingOrder(false)
      const generatedId = 'LSP-' + Math.floor(100000 + Math.random() * 900000)
      setOrderId(generatedId)
      setCurrentStep('celebration')
      playSfx('fanfare')

      // Joyful continuous confetti celebration!
      const end = Date.now() + 2.5 * 1000
      const interval = setInterval(() => {
        if (Date.now() > end) {
          return clearInterval(interval)
        }
        confetti({
          startVelocity: 30,
          spread: 360,
          ticks: 60,
          origin: {
            x: Math.random(),
            y: Math.random() - 0.2
          },
          colors: ['#22c55e', '#f59e0b', '#38bdf8', '#f43f5e', '#ec4899']
        })
      }, 250)
    }, 1200)
  }

  // Filtered products
  const displayedProducts = activeCategory === 'all'
    ? BUILD_PRODUCTS
    : BUILD_PRODUCTS.filter(p => p.category === activeCategory)

  // Contextual cheerful message based on fill status
  const getCheerfulCopy = () => {
    if (totalItems === 0) return "Tap '+' on any pouch below to start packing your cold shipper! ❄️"
    if (totalItems < capacity / 2) return `Great start! ${remainingSlots} more to pack tiny tummy's dream box! 🥑`
    if (totalItems < capacity) return `Almost there! Just ${remainingSlots} more to complete your box! 🍓`
    return "Woohoo! Your box is bursting with fresh organic pasture goodness! 🎉"
  }

  // Prevent background scroll when modal open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-gray-900/70 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Main Dialog Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[94vh] flex flex-col overflow-hidden border border-green-100 z-10"
      >
        {/* Top Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 text-white px-5 sm:px-8 py-4 flex items-center justify-between flex-shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-xl shadow-inner">
              🌱
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-lg sm:text-xl tracking-tight" style={{ fontFamily: 'var(--font-display, "Bricolage Grotesque", serif)' }}>
                  LittleSprout Box Studio
                </h3>
                <ShapeMorph name="daisy-12" className="w-5 h-5 text-emerald-200 animate-spin" style={{ animationDuration: '24s' }} />
                <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/20 text-white border border-white/30">
                  Cold-Chain Fresh
                </span>
              </div>
              <p className="text-xs text-white/80">
                100% Organic Pasture A2 Dairy · Cultured with 6 Infant Probiotics
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Audio Toggle */}
            <button
              onClick={() => {
                const nextState = !soundEnabled
                setSoundEnabled(nextState)
                if (nextState) soundEffects.pop()
              }}
              title={soundEnabled ? 'Mute cheerful sounds' : 'Enable cheerful sounds'}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs flex items-center gap-1 transition-all"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-200" /> : <VolumeX className="w-4 h-4 text-white/60" />}
              <span className="hidden md:inline">{soundEnabled ? 'Sound On' : 'Muted'}</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all hover:rotate-90 duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Cheerful Journey Stepper (Only show before celebration) */}
        {currentStep !== 'celebration' && (
          <div className="bg-emerald-50/70 border-b border-emerald-100 px-4 sm:px-8 py-3 flex items-center justify-between overflow-x-auto gap-2 flex-shrink-0">
            {[
              { id: 'builder', label: '1. Pack Box', icon: '📦' },
              { id: 'schedule', label: '2. Delivery Rhythm', icon: '🚚' },
              { id: 'personalize', label: '3. Baby Card', icon: '💌' },
              { id: 'checkout', label: '4. Cheerful Checkout', icon: '✨' },
            ].map(st => {
              const isActive = currentStep === st.id
              const isPassed =
                (st.id === 'builder' && ['schedule', 'personalize', 'checkout'].includes(currentStep)) ||
                (st.id === 'schedule' && ['personalize', 'checkout'].includes(currentStep)) ||
                (st.id === 'personalize' && currentStep === 'checkout')

              return (
                <button
                  key={st.id}
                  disabled={st.id !== 'builder' && totalItems < capacity}
                  onClick={() => {
                    playSfx('pop')
                    setCurrentStep(st.id as StepType)
                  }}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${isActive
                      ? 'bg-green-600 text-white shadow-md shadow-green-600/20 scale-105'
                      : isPassed
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                >
                  <span>{st.icon}</span>
                  <span>{st.label}</span>
                  {isPassed && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                </button>
              )
            })}
          </div>
        )}

        {/* Scrollable Content Body */}
        <div ref={contentRef} className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#fdfdfc]">
          <AnimatePresence mode="wait">
            {/* ════════════════════════════════════════════════════════════
                STEP 1: BOX BUILDER & PACKING
               ════════════════════════════════════════════════════════════ */}
            {currentStep === 'builder' && (
              <motion.div
                key="step-builder"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-6"
              >
                {/* 1. Box Size Selector */}
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <div>
                      <h4 className="font-extrabold text-gray-900 text-base sm:text-lg flex items-center gap-2">
                        <span>Step 1: Choose Your Sprout Box Size</span>
                      </h4>
                      <p className="text-xs text-gray-500">Pick the capacity that best matches your little one's feeding appetite.</p>
                    </div>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
                      Free Dry-Ice Insulation Included ❄️
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {BOX_SIZES.map(size => {
                      const isSel = selectedSize.id === size.id
                      return (
                        <div
                          key={size.id}
                          onClick={() => {
                            playSfx('pop')
                            setSelectedSize(size)
                          }}
                          className={`relative p-4 rounded-2xl border-2 cursor-pointer transition-all ${isSel
                              ? 'border-green-600 bg-emerald-50/60 shadow-md ring-2 ring-green-600/20 scale-[1.02]'
                              : 'border-gray-200 hover:border-emerald-300 bg-white hover:bg-gray-50/50'
                            }`}
                        >
                          {size.badge && (
                            <span className="absolute -top-3 right-3 text-[10px] font-black uppercase tracking-wider bg-amber-500 text-white px-2 py-0.5 rounded-full shadow-sm">
                              {size.badge}
                            </span>
                          )}
                          <div className="flex justify-between items-start mb-1">
                            <h5 className="font-bold text-gray-900 text-sm sm:text-base">{size.name}</h5>
                            <span className="text-xs font-extrabold text-emerald-700">${size.basePrice.toFixed(2)}</span>
                          </div>
                          <p className="text-xs text-emerald-800 font-semibold mb-2">{size.subname}</p>
                          <div className="text-[11px] text-gray-500 flex items-center gap-1.5 pt-2 border-t border-gray-100">
                            <Gift className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                            <span className="truncate">{size.freeGift}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* 2. Visual "Sprout Cooler Shipper" Box Visualization */}
                <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50/60 rounded-3xl p-5 border border-emerald-200/80 shadow-sm relative overflow-hidden">
                  {/* Decorative background snowflake */}
                  <Snowflake className="absolute -right-6 -bottom-6 w-32 h-32 text-emerald-200/30 pointer-events-none" />

                  <div className="flex flex-wrap items-center justify-between gap-3 mb-4 relative z-10">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl">📦</span>
                        <h4 className="font-extrabold text-gray-900 text-sm sm:text-base">
                          Live Cooler Box Packing ({totalItems} / {capacity} Pouches Packed)
                        </h4>
                      </div>
                      <p className="text-xs text-emerald-800 font-medium mt-0.5">
                        {getCheerfulCopy()}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleAutofill}
                        className="px-3 py-1.5 rounded-xl bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-100 text-xs font-bold flex items-center gap-1 shadow-sm transition-all active:scale-95"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        Autofill Best Mix ✨
                      </button>
                      {totalItems > 0 && (
                        <button
                          onClick={handleClearBox}
                          className="px-2.5 py-1.5 rounded-xl text-gray-400 hover:text-red-500 text-xs font-medium transition-colors"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Bouncy Progress Bar */}
                  <div className="w-full bg-emerald-200/70 h-3.5 rounded-full overflow-hidden mb-4 p-0.5 shadow-inner">
                    <motion.div
                      className="bg-gradient-to-r from-emerald-500 via-green-500 to-teal-400 h-full rounded-full shadow-sm"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (totalItems / capacity) * 100)}%` }}
                      transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                    />
                  </div>

                  {/* Visual Slot Grid inside the Cooler Box */}
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-3 border border-emerald-100 shadow-inner">
                    <div className="text-[11px] font-semibold text-gray-500 mb-2 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Snowflake className="w-3.5 h-3.5 text-cyan-600" />
                        Cold Insulated Chamber
                      </span>
                      <span className="text-emerald-700">
                        {isFull ? '✅ Complete!' : `${remainingSlots} slot${remainingSlots > 1 ? 's' : ''} remaining`}
                      </span>
                    </div>

                    {/* Slot Cells */}
                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                      {Array.from({ length: capacity }).map((_, idx) => {
                        // Find which product belongs to this slot
                        let accumulated = 0
                        let filledProduct: ProductItem | null = null

                        for (const p of BUILD_PRODUCTS) {
                          const count = bundle[p.id] ?? 0
                          if (idx >= accumulated && idx < accumulated + count) {
                            filledProduct = p
                            break
                          }
                          accumulated += count
                        }

                        if (filledProduct) {
                          return (
                            <motion.div
                              key={`slot-${idx}-${filledProduct.id}`}
                              initial={{ scale: 0.5, y: -10, opacity: 0 }}
                              animate={{ scale: 1, y: 0, opacity: 1 }}
                              exit={{ scale: 0.5, opacity: 0 }}
                              whileHover={{ scale: 1.08 }}
                              onClick={() => filledProduct && handleRemoveProduct(filledProduct.id)}
                              className="group relative aspect-square rounded-xl p-1 flex flex-col items-center justify-center text-center cursor-pointer shadow-sm border border-emerald-200 transition-all overflow-hidden"
                              style={{ backgroundColor: `${filledProduct.color}25` }}
                              title={`${filledProduct.name} (Click to remove)`}
                            >
                              <img
                                src={filledProduct.img}
                                alt={filledProduct.name}
                                className="w-7 h-7 sm:w-9 sm:h-9 object-cover rounded-lg drop-shadow"
                              />
                              <span className="text-[9px] font-bold text-gray-800 truncate w-full px-0.5 mt-0.5">
                                {filledProduct.shortName}
                              </span>

                              {/* Hover to remove overlay */}
                              <div className="absolute inset-0 bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
                                <Minus className="w-4 h-4" />
                              </div>
                            </motion.div>
                          )
                        }

                        return (
                          <div
                            key={`empty-${idx}`}
                            className="aspect-square rounded-xl border-2 border-dashed border-emerald-200/90 flex flex-col items-center justify-center text-emerald-300 text-xs font-semibold bg-emerald-50/20"
                          >
                            <span className="text-sm opacity-50">+</span>
                            <span className="text-[9px] opacity-40">Slot {idx + 1}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>

                {/* 3. Products Shelf with Category Filters */}
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                    <div>
                      <h4 className="font-extrabold text-gray-900 text-base sm:text-lg">
                        Select Pouches & Snacks
                      </h4>
                      <p className="text-xs text-gray-500">
                        100% pasture-raised A2 dairy, zero added sugars, non-GMO verified.
                      </p>
                    </div>

                    {/* Filter Pills */}
                    <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-2xl">
                      {[
                        { id: 'all', label: 'All Flavors' },
                        { id: 'puree', label: '🥄 6+ mo Purees' },
                        { id: 'finger-food', label: '🧀 10+ mo Finger Bites' },
                      ].map(cat => (
                        <button
                          key={cat.id}
                          onClick={() => setActiveCategory(cat.id as 'all' | 'puree' | 'finger-food')}
                          className={`px-3 py-1 text-xs font-bold rounded-xl transition-all ${activeCategory === cat.id
                              ? 'bg-white text-gray-900 shadow-sm'
                              : 'text-gray-500 hover:text-gray-900'
                            }`}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Product Cards Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {displayedProducts.map(p => {
                      const count = bundle[p.id] ?? 0
                      const isProductSelected = count > 0

                      return (
                        <div
                          key={p.id}
                          className={`rounded-2xl p-4 border transition-all relative flex flex-col justify-between ${isProductSelected
                              ? 'border-emerald-500 bg-emerald-50/30 shadow-md ring-1 ring-emerald-500/30'
                              : 'border-gray-200 bg-white hover:border-emerald-200 hover:shadow-sm'
                            }`}
                        >
                          <div>
                            {/* Card Header */}
                            <div className="flex items-start gap-3 mb-3">
                              <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-gray-50 flex-shrink-0 shadow-sm">
                                <img
                                  src={p.img}
                                  alt={p.name}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                />
                                <span className="absolute top-1 left-1 bg-white/90 backdrop-blur-sm text-[10px] font-extrabold text-emerald-800 px-1.5 py-0.5 rounded-md shadow-xs">
                                  {p.stage} mo
                                </span>
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1 mb-0.5">
                                  <span className="text-base">{p.emoji}</span>
                                  <h5 className="font-bold text-gray-900 text-sm leading-tight truncate">
                                    {p.name}
                                  </h5>
                                </div>
                                <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-1.5">
                                  {p.tagline}
                                </p>
                                <span className="text-xs font-bold text-gray-900">
                                  ${p.price.toFixed(2)}{' '}
                                  <span className="text-[10px] text-gray-400 font-normal">/ pouch</span>
                                </span>
                              </div>
                            </div>

                            {/* Benefit badges */}
                            <div className="flex flex-wrap gap-1.5 mb-3">
                              {p.benefits.map((b, bi) => (
                                <span
                                  key={bi}
                                  className="text-[10px] font-semibold bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full"
                                >
                                  {b}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Controls Row */}
                          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                            <button
                              onClick={() => setInspectProduct(p)}
                              className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 hover:underline"
                            >
                              <Info className="w-3.5 h-3.5" />
                              Nutrition
                            </button>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleRemoveProduct(p.id)}
                                disabled={count === 0}
                                className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-gray-700 font-bold transition-all active:scale-95"
                              >
                                <Minus className="w-4 h-4" />
                              </button>

                              <span className="w-6 text-center font-extrabold text-sm text-gray-900">
                                {count}
                              </span>

                              <button
                                onClick={() => handleAddProduct(p.id)}
                                disabled={totalItems >= capacity}
                                className="w-8 h-8 rounded-xl bg-green-600 hover:bg-green-700 disabled:opacity-30 disabled:cursor-not-allowed text-white flex items-center justify-center font-bold shadow-sm transition-all active:scale-95"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Bottom Step Action Bar */}
                <div className="sticky bottom-0 bg-white/95 backdrop-blur-md p-4 -mx-4 -mb-4 sm:-mx-6 sm:-mb-6 lg:-mx-8 lg:-mb-8 border-t border-gray-200 flex flex-wrap items-center justify-between gap-4 z-20 shadow-lg">
                  <div>
                    <div className="text-xs text-gray-500">
                      Capacity: <span className="font-bold text-gray-900">{totalItems} / {capacity}</span> pouches
                    </div>
                    <div className="text-base sm:text-lg font-extrabold text-gray-900 flex items-center gap-2">
                      <span>Est. Subtotal: ${rawSubtotal.toFixed(2)}</span>
                      {selectedSize.freeGift && (
                        <span className="text-[11px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                          + {selectedSize.freeGift.split('(')[0]}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        if (totalItems < capacity) {
                          // Auto fill remaining
                          handleAutofill()
                        }
                        playSfx('chime')
                        setCurrentStep('schedule')
                      }}
                      className="px-6 py-3 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-extrabold text-sm sm:text-base shadow-md hover:shadow-lg transition-all flex items-center gap-2 active:scale-98"
                    >
                      {totalItems < capacity ? (
                        <>
                          <span>Autofill & Next: Delivery</span>
                          <Sparkles className="w-4 h-4 text-amber-300" />
                        </>
                      ) : (
                        <>
                          <span>Next: Choose Delivery Rhythm</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ════════════════════════════════════════════════════════════
                STEP 2: DELIVERY RHYTHM & SCHEDULE
               ════════════════════════════════════════════════════════════ */}
            {currentStep === 'schedule' && (
              <motion.div
                key="step-schedule"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-6 max-w-3xl mx-auto"
              >
                <div className="text-center max-w-xl mx-auto mb-6">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full inline-block mb-2">
                    Step 2: Freshness Schedule
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900" style={{ fontFamily: 'var(--font-display, "Bricolage Grotesque", serif)' }}>
                    How Often Should We Ship Your Cold Box?
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Dairy is cultured fresh to order. You can easily adjust, skip, or pause delivery with 1 text.
                  </p>
                </div>

                {/* Cadence Options */}
                <div className="space-y-3">
                  {FREQUENCIES.map(freq => {
                    const isSelected = selectedFrequency.id === freq.id
                    return (
                      <div
                        key={freq.id}
                        onClick={() => {
                          playSfx('pop')
                          setSelectedFrequency(freq)
                        }}
                        className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${isSelected
                            ? 'border-green-600 bg-emerald-50/70 shadow-md ring-2 ring-green-600/20'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? 'border-green-600 bg-green-600 text-white' : 'border-gray-300 bg-white'
                              }`}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <h5 className="font-extrabold text-gray-900 text-sm sm:text-base">
                                {freq.label}
                              </h5>
                              {freq.discount > 0 && (
                                <span className="bg-green-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                                  Save {Math.round(freq.discount * 100)}%
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5">{freq.description}</p>
                            <span className="text-[11px] font-semibold text-emerald-800 mt-1 inline-block">
                              ✨ {freq.perk}
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-base sm:text-lg font-extrabold text-gray-900">
                            ${(rawSubtotal * (1 - freq.discount)).toFixed(2)}
                          </span>
                          {freq.discount > 0 && (
                            <div className="text-xs text-gray-400 line-through">
                              ${rawSubtotal.toFixed(2)}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Delivery Day Preference */}
                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                  <h5 className="font-bold text-gray-900 text-sm mb-1 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-600" />
                    Preferred Delivery Day
                  </h5>
                  <p className="text-xs text-gray-500 mb-3">
                    Shipped in insulated shippers with dry ice guaranteed to keep dairy chilled under 40°F for up to 60 hours.
                  </p>

                  <div className="grid grid-cols-3 gap-3">
                    {(['Tuesday', 'Thursday', 'Friday'] as const).map(day => (
                      <button
                        key={day}
                        onClick={() => {
                          playSfx('pop')
                          setDeliveryDay(day)
                        }}
                        className={`p-3 rounded-xl border text-center text-xs font-bold transition-all ${deliveryDay === day
                            ? 'border-green-600 bg-emerald-50 text-emerald-800 ring-1 ring-green-600'
                            : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                          }`}
                      >
                        <div>{day}s</div>
                        <span className="text-[10px] text-gray-400 font-normal">Morning Cold Drop</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Perks Reminder Banner */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="flex items-center gap-2 p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 text-xs text-emerald-900 font-medium">
                    <Snowflake className="w-4 h-4 text-cyan-600 flex-shrink-0" />
                    <span>Free Cold Delivery Forever</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 text-xs text-emerald-900 font-medium">
                    <Clock className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span>SMS Skip or Pause 1-Tap</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 text-xs text-emerald-900 font-medium">
                    <ShieldCheck className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span>100% Love-It Guarantee</span>
                  </div>
                </div>

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      playSfx('whoosh')
                      setCurrentStep('builder')
                    }}
                    className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-bold text-xs hover:bg-gray-50 flex items-center gap-1.5"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Box Packing
                  </button>

                  <button
                    onClick={() => {
                      playSfx('chime')
                      setCurrentStep('personalize')
                    }}
                    className="px-6 py-3 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-extrabold text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                  >
                    Next: Personalize Baby's Box
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ════════════════════════════════════════════════════════════
                STEP 3: PERSONALIZE BABY CARD
               ════════════════════════════════════════════════════════════ */}
            {currentStep === 'personalize' && (
              <motion.div
                key="step-personalize"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-6 max-w-3xl mx-auto"
              >
                <div className="text-center max-w-xl mx-auto mb-6">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full inline-block mb-2">
                    Step 3: Personal Touch
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900" style={{ fontFamily: 'var(--font-display, "Bricolage Grotesque", serif)' }}>
                    Personalize Your Little Sprout's Welcome Box
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Every box includes a custom-printed pasture milestone postcard with feeding tips for your baby's age!
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  {/* Left: Input Fields */}
                  <div className="space-y-4 bg-white p-5 rounded-3xl border border-gray-200 shadow-sm">
                    <div>
                      <label className="block text-xs font-bold text-gray-800 mb-1">
                        Baby's First Name
                      </label>
                      <input
                        type="text"
                        value={babyName}
                        onChange={e => setBabyName(e.target.value)}
                        placeholder="e.g. Leo, Maya, Oliver"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-green-600 focus:ring-2 focus:ring-green-600/20 text-sm font-semibold outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-800 mb-1">
                        Baby's Current Age / Milestone
                      </label>
                      <input
                        type="text"
                        value={babyAge}
                        onChange={e => setBabyAge(e.target.value)}
                        placeholder="e.g. 7 months, 12 months"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-green-600 focus:ring-2 focus:ring-green-600/20 text-sm outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-800 mb-1">
                        Dietary Focus or Tummy Notes (Optional)
                      </label>
                      <textarea
                        value={dietaryNote}
                        onChange={e => setDietaryNote(e.target.value)}
                        rows={2}
                        placeholder="e.g. Sensitive tummy, starting solids, loves avocado"
                        className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-green-600 focus:ring-2 focus:ring-green-600/20 text-xs outline-hidden resize-none"
                      />
                    </div>

                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
                      <Gift className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                      <span>
                        <strong>Free in Box #1:</strong> We also include a soft-tip BPA-free silicone training spoon ($9 value)!
                      </span>
                    </div>
                  </div>

                  {/* Right: Live Interactive Card Preview */}
                  <div className="relative">
                    <div className="bg-gradient-to-br from-amber-50 via-emerald-50 to-teal-50 rounded-3xl p-6 border-2 border-emerald-300 shadow-xl relative overflow-hidden rotate-1 hover:rotate-0 transition-transform">
                      {/* Signature Shape Stamp seal */}
                      <div className="absolute top-3 right-3 flex flex-col items-center justify-center text-center">
                        <div className="relative w-14 h-14 flex items-center justify-center">
                          <ShapeMorph name="sunburst-24" className="w-14 h-14 text-amber-400 absolute inset-0 animate-spin" style={{ animationDuration: '32s' }} />
                          <span className="text-[7.5px] font-black text-amber-950 relative z-10 uppercase tracking-tighter leading-tight text-center">
                            PASTURE<br />CERTIFIED
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 mb-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 shadow-xs">
                          <ShapeMorph name="clover-soft" className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="text-[10px] uppercase font-bold tracking-widest text-emerald-800">
                            LittleSprout Farm Welcome Card
                          </div>
                          <h4 className="font-extrabold text-gray-900 text-base">
                            Hand-Packed for Baby {babyName || 'Little One'}!
                          </h4>
                        </div>
                      </div>

                      <div className="bg-white/90 backdrop-blur-xs rounded-2xl p-4 border border-emerald-100 shadow-inner mb-3">
                        <p className="text-xs text-gray-600 italic leading-relaxed">
                          "Dear {babyName || 'Little Sprout'}, welcome to your wholesome food adventure! May every spoonful of our pasture-fresh A2 dairy bring joy, smiling cheeks, and a thriving tummy."
                        </p>
                        <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500 font-medium">
                          <span>Age: <strong>{babyAge || 'Curious Sprout'}</strong></span>
                          <span>Stage: <strong>Pasture Explorer</strong></span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-emerald-800 font-semibold">
                        <span>🥛 100% Grass-Fed A2 Whole Milk</span>
                        <span>❄️ Farm-Chilled Guarantee</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      playSfx('whoosh')
                      setCurrentStep('schedule')
                    }}
                    className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-bold text-xs hover:bg-gray-50 flex items-center gap-1.5"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </button>

                  <button
                    onClick={() => {
                      playSfx('chime')
                      setCurrentStep('checkout')
                    }}
                    className="px-6 py-3 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-extrabold text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                  >
                    Next: Checkout & Cold Shipping
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ════════════════════════════════════════════════════════════
                STEP 4: CHEERFUL CHECKOUT PAGE
               ════════════════════════════════════════════════════════════ */}
            {currentStep === 'checkout' && (
              <motion.div
                key="step-checkout"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-6"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gray-200">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full inline-block mb-1">
                      Final Step: Secure Cold Checkout
                    </span>
                    <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900" style={{ fontFamily: 'var(--font-display, "Bricolage Grotesque", serif)' }}>
                      You're 60 seconds away from baby's chilled pasture box!
                    </h3>
                  </div>

                  {/* Fast Fill Demo Button */}
                  <button
                    type="button"
                    onClick={handleFastFillDemo}
                    className="px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs"
                    title="Populates sample test data instantly"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    ⚡ Fast Fill Demo Info
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  {/* Left Column: Form Details (7 cols) */}
                  <div className="lg:col-span-7 space-y-5">
                    {/* Customer Information */}
                    <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                      <h4 className="font-extrabold text-gray-900 text-sm flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs">1</span>
                        Parent & Contact Information
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">Parent's Full Name</label>
                          <input
                            type="text"
                            value={formData.parentName}
                            onChange={e => setFormData({ ...formData, parentName: e.target.value })}
                            className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs font-medium focus:border-green-600 outline-hidden"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">Email (for shipping updates)</label>
                          <input
                            type="email"
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs font-medium focus:border-green-600 outline-hidden"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Phone Number (SMS delivery alert & 1-click skip)</label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={e => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs font-medium focus:border-green-600 outline-hidden"
                        />
                      </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                      <h4 className="font-extrabold text-gray-900 text-sm flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs">2</span>
                        Cold-Chain Shipping Destination
                      </h4>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Street Address</label>
                        <input
                          type="text"
                          value={formData.address}
                          onChange={e => setFormData({ ...formData, address: e.target.value })}
                          className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs font-medium focus:border-green-600 outline-hidden"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">Apt / Suite</label>
                          <input
                            type="text"
                            value={formData.apt}
                            onChange={e => setFormData({ ...formData, apt: e.target.value })}
                            className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs font-medium focus:border-green-600 outline-hidden"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">City</label>
                          <input
                            type="text"
                            value={formData.city}
                            onChange={e => setFormData({ ...formData, city: e.target.value })}
                            className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs font-medium focus:border-green-600 outline-hidden"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">ZIP Code</label>
                          <input
                            type="text"
                            value={formData.zip}
                            onChange={e => setFormData({ ...formData, zip: e.target.value })}
                            className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs font-medium focus:border-green-600 outline-hidden"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          Delivery Instructions for Courier (Important for cold drop)
                        </label>
                        <input
                          type="text"
                          value={formData.deliveryNote}
                          onChange={e => setFormData({ ...formData, deliveryNote: e.target.value })}
                          placeholder="e.g. Leave in shade on front porch, ring bell"
                          className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs font-medium focus:border-green-600 outline-hidden"
                        />
                      </div>
                    </div>

                    {/* Payment Method */}
                    <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                      <h4 className="font-extrabold text-gray-900 text-sm flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs">3</span>
                          Payment Method
                        </span>
                        <span className="text-[11px] text-gray-400 flex items-center gap-1 font-normal">
                          <Lock className="w-3 h-3 text-emerald-600" /> 256-Bit Encrypted
                        </span>
                      </h4>

                      {/* Payment Method Tabs */}
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: 'card', label: 'Credit Card', icon: '💳' },
                          { id: 'apple_pay', label: 'Apple Pay', icon: '🍏' },
                          { id: 'google_pay', label: 'Google Pay', icon: '⚡' },
                        ].map(m => (
                          <button
                            type="button"
                            key={m.id}
                            onClick={() => {
                              playSfx('pop')
                              setFormData({ ...formData, paymentMethod: m.id as 'card' | 'apple_pay' | 'google_pay' })
                            }}
                            className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${formData.paymentMethod === m.id
                                ? 'border-green-600 bg-emerald-50 text-emerald-900 shadow-xs ring-1 ring-green-600'
                                : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                              }`}
                          >
                            <span>{m.icon}</span>
                            <span>{m.label}</span>
                          </button>
                        ))}
                      </div>

                      {formData.paymentMethod === 'card' ? (
                        <div className="space-y-3 pt-1">
                          <div>
                            <label className="block text-[11px] font-semibold text-gray-600 mb-1">Card Number</label>
                            <input
                              type="text"
                              value={formData.cardNumber}
                              onChange={e => setFormData({ ...formData, cardNumber: e.target.value })}
                              className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs font-mono outline-hidden"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[11px] font-semibold text-gray-600 mb-1">Exp Date</label>
                              <input
                                type="text"
                                value={formData.cardExp}
                                onChange={e => setFormData({ ...formData, cardExp: e.target.value })}
                                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs font-mono outline-hidden"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-semibold text-gray-600 mb-1">CVC</label>
                              <input
                                type="text"
                                value={formData.cardCvc}
                                onChange={e => setFormData({ ...formData, cardCvc: e.target.value })}
                                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs font-mono outline-hidden"
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100 text-center text-xs text-emerald-800">
                          Click <strong>Place Cold Order</strong> below to authenticate with {formData.paymentMethod === 'apple_pay' ? 'Apple Pay' : 'Google Pay'}.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Order Summary (5 cols) */}
                  <div className="lg:col-span-5 bg-gradient-to-b from-gray-50 to-white rounded-3xl p-5 border border-gray-200 shadow-md space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                      <h4 className="font-extrabold text-gray-900 text-sm">Order Summary</h4>
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        {selectedSize.name} ({totalItems} items)
                      </span>
                    </div>

                    {/* Packed items mini-list */}
                    <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                      {BUILD_PRODUCTS.filter(p => (bundle[p.id] ?? 0) > 0).map(p => (
                        <div key={p.id} className="flex items-center justify-between text-xs py-1">
                          <div className="flex items-center gap-2">
                            <img src={p.img} alt={p.name} className="w-8 h-8 rounded-lg object-cover" />
                            <div>
                              <p className="font-bold text-gray-800">{p.shortName}</p>
                              <p className="text-[10px] text-gray-400">Qty: {bundle[p.id]}</p>
                            </div>
                          </div>
                          <span className="font-semibold text-gray-700">
                            ${(p.price * (bundle[p.id] ?? 0)).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Personalized Box Preview Pill */}
                    <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200 text-xs flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Baby className="w-4 h-4 text-amber-600" />
                        <div>
                          <p className="font-bold text-gray-800">For Baby {babyName || 'Little One'}</p>
                          <p className="text-[10px] text-gray-500">{babyAge} · Custom Welcome Card included</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-green-600">FREE</span>
                    </div>

                    {/* Promo Code Input */}
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">
                        Have a promo code? (Try: <span className="text-emerald-700 cursor-pointer underline" onClick={() => setFormData({ ...formData, promoCode: 'FIRSTSPROUT' })}>FIRSTSPROUT</span>)
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={formData.promoCode}
                          onChange={e => setFormData({ ...formData, promoCode: e.target.value })}
                          placeholder="Promo code"
                          className="flex-1 px-3 py-1.5 rounded-xl border border-gray-200 text-xs uppercase font-mono outline-hidden"
                        />
                        <button
                          type="button"
                          onClick={handleApplyPromo}
                          className="px-3 py-1.5 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-bold transition-all"
                        >
                          Apply
                        </button>
                      </div>
                      {formData.promoApplied && (
                        <p className="text-[11px] text-green-600 font-bold mt-1 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> 20% Sprout discount applied! 🎉
                        </p>
                      )}
                    </div>

                    {/* Cost Breakdown */}
                    <div className="space-y-2 pt-3 border-t border-gray-200 text-xs">
                      <div className="flex justify-between text-gray-600">
                        <span>Items Subtotal</span>
                        <span>${rawSubtotal.toFixed(2)}</span>
                      </div>

                      {subDiscountValue > 0 && (
                        <div className="flex justify-between text-emerald-700 font-medium">
                          <span>Subscription Savings ({Math.round(selectedFrequency.discount * 100)}%)</span>
                          <span>-${subDiscountValue.toFixed(2)}</span>
                        </div>
                      )}

                      {promoDiscountValue > 0 && (
                        <div className="flex justify-between text-emerald-700 font-medium">
                          <span>Promo Code (FIRSTSPROUT)</span>
                          <span>-${promoDiscountValue.toFixed(2)}</span>
                        </div>
                      )}

                      <div className="flex justify-between text-gray-600">
                        <span className="flex items-center gap-1">
                          <Snowflake className="w-3.5 h-3.5 text-cyan-600" />
                          Cold-Chain Express Shipping
                        </span>
                        <span>{shippingFee === 0 ? <strong className="text-green-600">FREE</strong> : `$${shippingFee.toFixed(2)}`}</span>
                      </div>

                      <div className="flex justify-between items-baseline pt-2 border-t border-gray-300 text-sm font-extrabold text-gray-900">
                        <span>Grand Total Today</span>
                        <span className="text-xl font-black text-emerald-700">
                          ${finalPrice.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="button"
                      disabled={isProcessingOrder}
                      onClick={handlePlaceOrder}
                      className="w-full py-4 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-extrabold text-base shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
                    >
                      {isProcessingOrder ? (
                        <>
                          <RefreshCw className="w-5 h-5 animate-spin" />
                          <span>Chilling & Packing Box...</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4 text-emerald-200" />
                          <span>Place Cold Order · ${finalPrice.toFixed(2)}</span>
                        </>
                      )}
                    </button>

                    <p className="text-[11px] text-center text-gray-400">
                      100% Love-It Guarantee · Arrives Chilled or Full Refund · Cancel/Skip Anytime
                    </p>
                  </div>
                </div>

                {/* Back button */}
                <div className="pt-2">
                  <button
                    onClick={() => {
                      playSfx('whoosh')
                      setCurrentStep('personalize')
                    }}
                    className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 font-bold text-xs hover:bg-gray-50 flex items-center gap-1.5"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Back to Baby Card
                  </button>
                </div>
              </motion.div>
            )}

            {/* ════════════════════════════════════════════════════════════
                STEP 5: CELEBRATION & ORDER SUCCESS SCREEN
               ════════════════════════════════════════════════════════════ */}
            {currentStep === 'celebration' && (
              <motion.div
                key="step-celebration"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-6 sm:py-10 max-w-xl mx-auto space-y-6"
              >
                {/* Bouncing Box Hero */}
                <div className="relative inline-block mx-auto">
                  <motion.div
                    animate={{ y: [0, -12, 0] }}
                    transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
                    className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl bg-gradient-to-tr from-green-500 via-emerald-400 to-teal-400 text-white flex items-center justify-center text-5xl sm:text-6xl shadow-2xl mx-auto border-4 border-white"
                  >
                    📦
                  </motion.div>
                  <span className="absolute -top-2 -right-2 text-2xl animate-bounce">✨</span>
                  <span className="absolute -bottom-1 -left-2 text-2xl">🌱</span>
                </div>

                <div>
                  <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-800 bg-emerald-100 px-3.5 py-1 rounded-full">
                    Order Confirmed #{orderId}
                  </span>
                  <h3 className="text-3xl sm:text-4xl font-black text-gray-900 mt-2" style={{ fontFamily: 'var(--font-display, "Bricolage Grotesque", serif)' }}>
                    Hooray! Baby {babyName || 'Little One'}'s Box is on the Way!
                  </h3>
                  <p className="text-sm text-gray-600 mt-2 max-w-md mx-auto leading-relaxed">
                    We just sent receipt & tracking confirmation to <strong>{formData.email}</strong>.
                    Our pasture team is currently hand-packing your {selectedSize.name} in thermal insulation with dry ice.
                  </p>
                </div>

                {/* Tracking Timeline */}
                <div className="bg-white p-5 rounded-3xl border border-emerald-100 shadow-sm text-left space-y-3">
                  <h4 className="font-extrabold text-xs uppercase tracking-wider text-gray-400">
                    Cold-Chain Freshness Journey
                  </h4>

                  <div className="space-y-3">
                    {[
                      { icon: '🌾', title: '100% Pasture Grass-Fed A2 Milk Batched', status: 'Completed', time: 'Just now' },
                      { icon: '🥄', title: 'Cold-Cultured with 6 Live Probiotic Strains', status: 'Completed', time: 'Guaranteed Live Cultures' },
                      { icon: '❄️', title: 'Sealing in Eco-Shipper with Dry-Ice Sublimation', status: 'In Progress', time: 'Guaranteed < 40°F' },
                      { icon: '🚚', title: `Cold Transit to ${formData.city || 'Your Doorstep'}`, status: 'Scheduled', time: `Expected ${deliveryDay}` },
                    ].map((step, i) => (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2.5">
                          <span className="text-base">{step.icon}</span>
                          <div>
                            <p className="font-bold text-gray-800">{step.title}</p>
                            <p className="text-[10px] text-gray-400">{step.time}</p>
                          </div>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${step.status === 'Completed' ? 'bg-green-100 text-green-700' :
                            step.status === 'In Progress' ? 'bg-amber-100 text-amber-800 animate-pulse' :
                              'bg-gray-100 text-gray-500'
                          }`}>
                          {step.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Delivery notes acknowledgment */}
                <div className="bg-emerald-50 rounded-2xl p-4 text-xs text-emerald-900 flex items-center gap-3 text-left">
                  <Truck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <div>
                    <span className="font-bold">Courier Instruction Noted:</span>
                    <p className="text-emerald-800/80">{formData.deliveryNote}</p>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => {
                      triggerConfetti(0.5, 0.5)
                      playSfx('fanfare')
                    }}
                    className="px-5 py-2.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-xs"
                  >
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    Blast More Confetti! 🎉
                  </button>

                  <button
                    onClick={onClose}
                    className="px-6 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white font-extrabold text-xs transition-all shadow-md"
                  >
                    Back to LittleSprout Home 🌱
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Product Quick-Peek Modal */}
        <AnimatePresence>
          {inspectProduct && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-60 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
              onClick={() => setInspectProduct(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={e => e.stopPropagation()}
                className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-gray-100 relative"
              >
                <button
                  onClick={() => setInspectProduct(null)}
                  className="absolute top-4 right-4 p-1.5 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-3 mb-4">
                  <img src={inspectProduct.img} alt={inspectProduct.name} className="w-16 h-16 rounded-2xl object-cover" />
                  <div>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      {inspectProduct.stage} Months
                    </span>
                    <h4 className="font-extrabold text-gray-900 text-base mt-1">{inspectProduct.name}</h4>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="bg-gray-50 p-3 rounded-xl">
                    <span className="font-bold text-gray-700 block mb-0.5">Ingredients:</span>
                    <p className="text-gray-600 leading-relaxed">{inspectProduct.ingredients}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="bg-emerald-50 p-2.5 rounded-xl">
                      <span className="text-[10px] text-emerald-700 font-bold block">TEXTURE</span>
                      <span className="font-extrabold text-gray-800 text-xs">{inspectProduct.texture}</span>
                    </div>
                    <div className="bg-amber-50 p-2.5 rounded-xl">
                      <span className="text-[10px] text-amber-700 font-bold block">HEALTHY FATS</span>
                      <span className="font-extrabold text-gray-800 text-xs">{inspectProduct.fatContent}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-blue-50 rounded-xl text-blue-900">
                    <span className="font-bold block mb-0.5">Pediatrician Advisory Note:</span>
                    <p className="text-[11px] text-blue-800 leading-relaxed">
                      "Cultured with infant-specific strains that populate healthy gut microbiome during the crucial first 1,000 days."
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    handleAddProduct(inspectProduct.id)
                    setInspectProduct(null)
                  }}
                  className="w-full mt-4 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-xs shadow-sm transition-all"
                >
                  Add This Flavor to Box +
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
