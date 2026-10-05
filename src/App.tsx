import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Button } from '@/components/ui/button'
import {
  Leaf, ShieldCheck, Star, ChevronDown, ChevronRight,
  Plus, Minus, Snowflake, Truck, Heart, CheckCircle2,
  Award, Baby, Apple, Milk, ShoppingCart, Timer,
  Sparkles, ArrowRight, Menu, X, Box
} from 'lucide-react'
import { BuildBoxModal } from '@/components/build-box/BuildBoxModal'
import { soundEffects } from '@/lib/sounds'
import { ShapeMorph } from '@/components/ui/shape'

/* ─── Product data ─── */
const PRODUCTS = [
  { id: 1, name: 'Banana & Avocado Greek Yogurt', stage: '6+', img: '/images/banana-pouch.png', color: '#a7c4a0', price: 4.8 },
  { id: 2, name: 'Blueberry & Purple Carrot Probiotic', stage: '6+', img: '/images/blueberry-pouch.png', color: '#818cf8', price: 4.8 },
  { id: 3, name: 'Golden Mango & Sweet Potato', stage: '6+', img: '/images/mango-pouch.png', color: '#f59e0b', price: 4.8 },
  { id: 4, name: 'Melty Mozzarella & Herb Bites', stage: '10+', img: '/images/cheese-bites.png', color: '#f97316', price: 5.2 },
  { id: 5, name: 'Mild Cheddar Snack Bites', stage: '12+', img: '/images/cheese-bites.png', color: '#eab308', price: 5.2 },
]

const REVIEWS = [
  { name: "Emma R.", babyAge: "8 months", rating: 5, text: "Finally, a yogurt I trust! My daughter Maya lights up when she sees the pouch. Zero added sugar and independently tested for heavy metals gives me so much peace of mind.", verified: true },
  { name: "Marcus T.", babyAge: "14 months", rating: 5, text: "The subscription is a lifesaver. Leo devours the cheese bites. I love that I can skip or swap flavors with a single text. The cold-box packaging is seriously impressive.", verified: true },
  { name: "Sarah L.", babyAge: "10 months", rating: 5, text: "We tried so many brands and this is the only one that does not upset our little baby tummy. The A2 protein makes a real difference. Will never go back to grocery store brands.", verified: true },
  { name: "David K.", babyAge: "18 months", rating: 4, text: "Great variety of flavors and textures. My toddler loves the mango pouch. Wish they had a slightly larger family pack option, but the quality is unmatched.", verified: true },
]

const FAQS = [
  { q: "When can my baby start eating dairy?", a: "According to AAP guidelines, yogurt and soft cheese are ideal complementary foods starting at 6 months. The cultured fermentation process breaks down lactose, making it easier to digest than fluid milk (which should wait until 12+ months as a drink)." },
  { q: "Why is A2 grass-fed milk better for babies?", a: "A2 milk contains only the A2 beta-casein protein, which studies suggest is easier to digest than the A1 protein found in conventional dairy. This can result in less gas, bloating, and digestive discomfort for sensitive little tummies." },
  { q: "How long do the pouches and cheese stay fresh?", a: "Refrigerated: 45 days from production. For travel, pouches stay safe at room temperature in a diaper bag for up to 4 hours. Always check the best-by date printed on each pouch." },
  { q: "How does the subscription work? Can I cancel easily?", a: "Absolutely! We text you a reminder 3 days before each delivery. Reply SKIP to skip a box, SWAP to change flavors, or PAUSE to pause anytime. Cancel in 1-click from your online dashboard. Zero commitment, zero hassle." },
  { q: "Is the packaging safe and eco-friendly?", a: "Yes! Our pouches are BPA/BPS-free with baby-safe choke-proof caps. Shipping boxes use 100% curbside-recyclable plant-fiber insulation and dry ice that sublimates safely. We are committed to zero-plastic-waste shipping by 2027." },
]


/* ─── Main App Component ─── */
export default function App() {
  const [selectedStage, setSelectedStage] = useState<string>('6+')
  const [bundle, setBundle] = useState<Record<number, number>>({})
  const [isSubscribe, setIsSubscribe] = useState(true)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [scrolled, setScrolled] = useState(false)
  const [showSticky, setShowSticky] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isBuildBoxModalOpen, setIsBuildBoxModalOpen] = useState(false)
  const heroRef = useRef<HTMLElement>(null)
  const bundleRef = useRef<HTMLElement>(null)

  const bundleTotal = Object.values(bundle).reduce((a, b) => a + b, 0)
  const BUNDLE_SIZE = 8
  const filledProducts = PRODUCTS.filter(p => (bundle[p.id] ?? 0) > 0)

  const rawPrice = filledProducts.reduce((sum, p) => sum + p.price * (bundle[p.id] ?? 0), 0)
  const finalPrice = isSubscribe ? rawPrice * 0.8 : rawPrice

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
      if (heroRef.current) {
        const heroBottom = heroRef.current.getBoundingClientRect().bottom
        setShowSticky(heroBottom < 0)
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const addToBundle = (id: number) => {
    if (bundleTotal >= BUNDLE_SIZE) {
      soundEffects.whoosh()
      return
    }
    soundEffects.pop()
    setBundle(prev => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }))
    if (bundleTotal + 1 === BUNDLE_SIZE) {
      setTimeout(() => soundEffects.chime(), 150)
    }
  }

  const removeFromBundle = (id: number) => {
    soundEffects.whoosh()
    setBundle(prev => {
      const count = (prev[id] ?? 0) - 1
      if (count <= 0) {
        const next = { ...prev }
        delete next[id]
        return next
      }
      return { ...prev, [id]: count }
    })
  }

  const openBuildBox = () => {
    soundEffects.chime()
    setIsBuildBoxModalOpen(true)
  }

  const scrollToBundle = () => {
    bundleRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const filteredProducts = selectedStage === 'all'
    ? PRODUCTS
    : PRODUCTS.filter(p => {
        const stageNum = parseInt(selectedStage)
        const productStageNum = parseInt(p.stage)
        return productStageNum <= stageNum + 3
      })

  return (
    <div className="min-h-screen" data-mode="light">
      {/* ═══ 1. ANNOUNCEMENT BAR ═══ */}
      <div className="announcement-bar py-2.5">
        <div className="marquee">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex items-center gap-12 px-6">
              <span className="flex items-center gap-2 text-sm font-medium">
                <Leaf className="w-4 h-4" /> Free Temperature-Controlled Cold Shipping on Starter Kits
              </span>
              <span className="text-white/40">•</span>
              <span className="flex items-center gap-2 text-sm font-medium">
                <Snowflake className="w-4 h-4" /> Arrives Fresh & Chilled or Your Money Back
              </span>
              <span className="text-white/40">•</span>
              <span className="flex items-center gap-2 text-sm font-medium">
                <ShieldCheck className="w-4 h-4" /> Clean Label Certified — Tested for 200+ Toxins
              </span>
              <span className="text-white/40">•</span>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ 2. STICKY HEADER ═══ */}
      <header className={`site-header ${scrolled ? 'scrolled' : ''}`}>
        <div className="container-main flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-xs">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg tracking-tight" style={{ fontFamily: 'var(--font-display, "Bricolage Grotesque", serif)' }}>
                LittleSprout
              </span>
              <ShapeMorph name="daisy-12" className="w-4 h-4 text-emerald-500 animate-spin" style={{ animationDuration: '20s' }} />
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <a href="#why-a2" className="text-sm font-medium text-gray-600 hover:text-green-700 transition-colors">Why A2 Dairy</a>
            <a href="#purity" className="text-sm font-medium text-gray-600 hover:text-green-700 transition-colors">Clean Label Proof</a>
            <a href="#bundle" className="text-sm font-medium text-gray-600 hover:text-green-700 transition-colors">Bundle & Save</a>
            <a href="#reviews" className="text-sm font-medium text-gray-600 hover:text-green-700 transition-colors">Reviews</a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={openBuildBox}
              className="hidden md:inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-full text-sm font-semibold hover:bg-green-700 transition-all shadow-md hover:shadow-lg active:scale-95"
            >
              <ShoppingCart className="w-4 h-4" />
              Build Box
              {bundleTotal > 0 && (
                <span className="ml-1 bg-white text-green-700 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold animate-pulse">
                  {bundleTotal}
                </span>
              )}
            </button>
            <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-green-100 bg-white/95 backdrop-blur-md">
            <nav className="container-main py-4 flex flex-col gap-3">
              <a href="#why-a2" className="text-sm font-medium py-2" onClick={() => setMobileMenuOpen(false)}>Why A2 Dairy</a>
              <a href="#purity" className="text-sm font-medium py-2" onClick={() => setMobileMenuOpen(false)}>Clean Label Proof</a>
              <a href="#bundle" className="text-sm font-medium py-2" onClick={() => setMobileMenuOpen(false)}>Bundle & Save</a>
              <a href="#reviews" className="text-sm font-medium py-2" onClick={() => setMobileMenuOpen(false)}>Reviews</a>
              <button
                onClick={() => { openBuildBox(); setMobileMenuOpen(false) }}
                className="mt-2 w-full py-3 bg-green-600 text-white rounded-full font-semibold flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                Build Your Box Studio
              </button>
            </nav>
          </div>
        )}
      </header>

      {/* ═══ 3. HERO SECTION ═══ */}
      <section ref={heroRef} className="hero-section section relative overflow-hidden" style={{ paddingTop: '64px', paddingBottom: '64px' }}>
        {/* Floating Organic Shapes */}
        <div className="absolute top-10 left-12 w-20 h-20 text-emerald-400/25 pointer-events-none animate-spin" style={{ animationDuration: '35s' }}>
          <ShapeMorph name="daisy-12" />
        </div>
        <div className="absolute top-24 right-1/4 w-16 h-16 text-amber-400/25 pointer-events-none animate-pulse">
          <ShapeMorph name="sunburst-24" />
        </div>
        <div className="absolute bottom-12 left-1/3 w-14 h-14 text-teal-400/25 pointer-events-none">
          <ShapeMorph name="clover-soft" />
        </div>

        <div className="container-main relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left: Copy */}
            <div className="space-y-6 relative z-10">
              <div className="flex items-center gap-2">
                <span className="badge-organic shimmer flex items-center gap-1.5">
                  <ShapeMorph name="clover-soft" className="w-3.5 h-3.5 inline text-emerald-700" />
                  USDA Organic
                </span>
                <span className="badge-organic shimmer flex items-center gap-1.5" style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}>
                  <ShapeMorph name="daisy-12" className="w-3.5 h-3.5 inline text-white" />
                  Clean Label Certified
                </span>
              </div>

              <h1
                className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight"
                style={{ fontFamily: 'var(--font-display, "Bricolage Grotesque", serif)', color: '#1a1a2e' }}
              >
                The Purest First Dairy for{' '}
                <span className="bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent">
                  Delicate Little Tummies
                </span>
              </h1>

              <p className="text-lg text-gray-600 max-w-lg leading-relaxed">
                Nutrient-dense, 100% grass-fed organic A2 whole milk yogurt & gentle cheese snacks.{' '}
                <strong className="text-gray-800">Zero added sugar.</strong> Rigorously tested for 200+ heavy metals and toxins.
              </p>

              {/* Trust pills */}
              <div className="flex flex-wrap gap-3">
                <span className="trust-pill"><ShieldCheck className="w-4 h-4 text-green-600" /> Heavy Metal Tested</span>
                <span className="trust-pill"><Milk className="w-4 h-4 text-green-600" /> A2 Grass-Fed Protein</span>
                <span className="trust-pill"><Apple className="w-4 h-4 text-green-600" /> 0g Added Sugar</span>
              </div>

              {/* CTA Group */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Button
                  variant="default"
                  size="lg"
                  onClick={openBuildBox}
                  className="pulse-cta !bg-green-600 hover:!bg-green-700 !text-white !rounded-full !px-8 !h-14 !text-base !font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                >
                  <Sparkles className="w-5 h-5 text-amber-300" />
                  Build Your Starter Box — Save 20%
                  <ArrowRight className="w-5 h-5 ml-1" />
                </Button>
                <button
                  onClick={scrollToBundle}
                  className="flex items-center gap-2 text-sm font-semibold text-green-700 hover:text-green-800 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <Box className="w-5 h-5 text-green-600" />
                  </div>
                  Preview Flavors Below
                </button>
              </div>

              {/* Star rating snippet */}
              <div className="flex items-center gap-2 pt-1">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="text-sm text-gray-600 font-medium">Rated 4.9/5 by 3,400+ Parents</span>
              </div>
            </div>

            {/* Right: Product images */}
            <div className="relative flex items-center justify-center min-h-[400px]">
              <img
                src="/images/baby-hero.jpg"
                alt="Happy baby eating yogurt"
                className="relative z-10 w-[340px] md:w-[400px] rounded-3xl shadow-2xl border-4 border-white/80"
                style={{ objectFit: 'cover' }}
              />

              {/* Floating Product in Organic Shape 1: Wild Blueberry */}
              <div
                onClick={openBuildBox}
                className="floating-product absolute -left-6 sm:-left-10 top-6 sm:top-10 z-20 cursor-pointer group"
                title="Tap to customize your box with Blueberry & Purple Carrot"
              >
                <div className="relative w-32 h-32 md:w-40 md:h-40 flex items-center justify-center transition-all duration-300 group-hover:scale-105">
                  {/* Organic Shape Backdrop (Clover) */}
                  <div className="absolute inset-0 text-indigo-100/90 drop-shadow-lg transition-transform duration-500 group-hover:rotate-6">
                    <ShapeMorph name="clover-soft" className="w-full h-full" />
                  </div>
                  <div className="absolute inset-1.5 text-indigo-300/40">
                    <ShapeMorph name="clover-soft" variant="outline" className="w-full h-full" />
                  </div>
                  {/* Product PNG */}
                  <img
                    src="/images/blueberry-pouch.png"
                    alt="Blueberry yogurt pouch"
                    className="relative z-10 w-24 md:w-28 drop-shadow-md object-contain transition-transform duration-300 group-hover:scale-110"
                  />
                  {/* Feature Pill */}
                  <span className="absolute -bottom-2 z-20 bg-white/95 text-indigo-900 border border-indigo-200/80 px-2.5 py-0.5 rounded-full text-[10px] md:text-[11px] font-extrabold shadow-sm flex items-center gap-1 whitespace-nowrap backdrop-blur-xs">
                    🫐 6+ mo · Probiotics
                  </span>
                </div>
              </div>

              {/* Floating Product in Organic Shape 2: Golden Mango */}
              <div
                onClick={openBuildBox}
                className="floating-product absolute -right-6 sm:-right-10 top-12 sm:top-16 z-20 cursor-pointer group"
                title="Tap to customize your box with Golden Mango & Sweet Potato"
              >
                <div className="relative w-32 h-32 md:w-40 md:h-40 flex items-center justify-center transition-all duration-300 group-hover:scale-105">
                  {/* Organic Shape Backdrop (Scalloped Square) */}
                  <div className="absolute inset-0 text-amber-100/90 drop-shadow-lg transition-transform duration-500 group-hover:-rotate-6">
                    <ShapeMorph name="scalloped-square" className="w-full h-full" />
                  </div>
                  <div className="absolute inset-1.5 text-amber-300/40">
                    <ShapeMorph name="scalloped-square" variant="outline" className="w-full h-full" />
                  </div>
                  {/* Product PNG */}
                  <img
                    src="/images/mango-pouch.png"
                    alt="Mango yogurt pouch"
                    className="relative z-10 w-24 md:w-28 drop-shadow-md object-contain transition-transform duration-300 group-hover:scale-110"
                  />
                  {/* Feature Pill */}
                  <span className="absolute -bottom-2 z-20 bg-white/95 text-amber-950 border border-amber-200/80 px-2.5 py-0.5 rounded-full text-[10px] md:text-[11px] font-extrabold shadow-sm flex items-center gap-1 whitespace-nowrap backdrop-blur-xs">
                    🥭 0g Sugar · A2 Milk
                  </span>
                </div>
              </div>

              {/* Floating Product in Organic Shape 3: Mozzarella Bites */}
              <div
                onClick={openBuildBox}
                className="floating-product absolute -right-4 sm:-right-8 bottom-0 sm:bottom-4 z-20 cursor-pointer group"
                title="Tap to customize your box with Melty Mozzarella Bites"
              >
                <div className="relative w-32 h-32 md:w-38 md:h-38 flex items-center justify-center transition-all duration-300 group-hover:scale-105">
                  {/* Organic Shape Backdrop (Cushion) */}
                  <div className="absolute inset-0 text-orange-100/90 drop-shadow-lg transition-transform duration-500 group-hover:rotate-6">
                    <ShapeMorph name="cushion" className="w-full h-full" />
                  </div>
                  <div className="absolute inset-1.5 text-orange-300/40">
                    <ShapeMorph name="cushion" variant="outline" className="w-full h-full" />
                  </div>
                  {/* Product PNG */}
                  <img
                    src="/images/cheese-bites.png"
                    alt="Cheese bites"
                    className="relative z-10 w-24 md:w-28 drop-shadow-md object-contain transition-transform duration-300 group-hover:scale-110"
                  />
                  {/* Feature Pill */}
                  <span className="absolute -bottom-2 z-20 bg-white/95 text-orange-950 border border-orange-200/80 px-2.5 py-0.5 rounded-full text-[10px] md:text-[11px] font-extrabold shadow-sm flex items-center gap-1 whitespace-nowrap backdrop-blur-xs">
                    🧀 10+ mo · Melt-in-Mouth
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 4. SOCIAL PROOF BANNER ═══ */}
      <div className="social-proof-bar py-6">
        <div className="container-main flex flex-wrap items-center justify-center gap-8 md:gap-16">
          <div className="flex items-center gap-2 text-gray-500">
            <Award className="w-5 h-5 text-green-600" />
            <span className="text-sm font-semibold">Clean Label Project</span>
          </div>
          <div className="flex items-center gap-2 text-gray-500">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-semibold">USDA Organic Certified</span>
          </div>
          <div className="flex items-center gap-2 text-gray-500">
            <Heart className="w-5 h-5 text-pink-500" />
            <span className="text-sm font-semibold">Trusted by 25,000+ Parents</span>
          </div>
          <div className="flex items-center gap-2 text-gray-500">
            <Baby className="w-5 h-5 text-amber-500" />
            <span className="text-sm font-semibold">Pediatrician Recommended</span>
          </div>
        </div>
      </div>

      {/* ═══ 5. DEVELOPMENTAL STAGE SELECTOR ═══ */}
      <section id="why-a2" className="section" style={{ background: 'var(--ls-cream)' }}>
        <div className="container-main text-center">
          <span className="badge-organic mb-4 inline-block">Age-Appropriate Nutrition</span>
          <h2
            className="text-3xl md:text-4xl font-extrabold mb-3"
            style={{ fontFamily: 'var(--font-display, "Bricolage Grotesque", serif)' }}
          >
            Tailored to Every Stage of Growth
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto mb-10">
            Every stage of weaning calls for different textures, nutrients, and flavors. Select your baby's age to see the perfect match.
          </p>

          <div className="t-tabs inline-flex flex-wrap justify-center mx-auto mb-12" role="tablist">
            {[
              { label: '6–9 Months', sub: 'First Smooth Tastes', value: '6+', icon: '🍼' },
              { label: '9–12 Months', sub: 'Texture Explorers', value: '10+', icon: '🥄' },
              { label: '12–24 Months', sub: 'Independent Snackers', value: '12+', icon: '🧀' },
            ].map(stage => {
              const isActive = selectedStage === stage.value
              return (
                <button
                  key={stage.value}
                  role="tab"
                  aria-selected={isActive}
                  className="t-tab"
                  onClick={() => {
                    soundEffects?.tap?.()
                    setSelectedStage(stage.value)
                  }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="stage-sliding-pill"
                      className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-green-600 rounded-[18px] shadow-md -z-10"
                      transition={{
                        type: 'spring',
                        stiffness: 400,
                        damping: 30
                      }}
                    />
                  )}
                  <div className="text-2xl mb-1">{stage.icon}</div>
                  <div className="font-bold text-sm">{stage.label}</div>
                  <div className={`text-xs ${isActive ? 'text-white/90' : 'text-gray-400'}`}>{stage.sub}</div>
                </button>
              )
            })}
          </div>

          {/* Product previews with centered alignment and smooth motion transitions */}
          <motion.div
            layout
            transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
            className="flex flex-wrap justify-center gap-4 sm:gap-5 max-w-6xl mx-auto min-h-[300px]"
          >
            <AnimatePresence mode="popLayout">
              {filteredProducts.map(p => (
                <motion.div
                  key={p.id}
                  layout
                  initial={{ opacity: 0, scale: 0.85, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.85, y: -10 }}
                  transition={{
                    type: 'spring',
                    stiffness: 380,
                    damping: 28,
                    opacity: { duration: 0.25 },
                    layout: { duration: 0.38, ease: [0.25, 1, 0.5, 1] }
                  }}
                  className="bundle-card text-center group w-full sm:w-[200px] md:w-[214px] flex flex-col justify-between"
                >
                  <div className="w-full aspect-square rounded-2xl overflow-hidden mb-3 bg-gradient-to-b from-emerald-50/50 via-white to-gray-50/80 p-3 flex items-center justify-center border border-green-50 shadow-inner">
                    <img
                      src={p.img}
                      alt={p.name}
                      className="w-full h-full object-contain group-hover:scale-108 transition-transform duration-300 drop-shadow-sm"
                    />
                  </div>
                  <div className="w-full flex flex-col flex-1 justify-between">
                    <p className="text-sm font-bold text-gray-800 leading-tight min-h-[2.5rem] flex items-center justify-center">
                      {p.name}
                    </p>
                    <div className="mt-2.5 flex items-center justify-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-green-100 text-green-700">
                        {p.stage} months
                      </span>
                      <span className="text-xs font-semibold text-gray-500">
                        ${p.price.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* ═══ 6. INTERACTIVE BUNDLE BUILDER ═══ */}
      <section ref={bundleRef} id="bundle" className="section" style={{ background: 'linear-gradient(180deg, #f0fdf4, var(--ls-cream))' }}>
        <div className="container-main">
          <div className="text-center mb-10">
            <span className="badge-organic mb-4 inline-block" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
              Save 20%
            </span>
            <h2
              className="text-3xl md:text-4xl font-extrabold mb-3"
              style={{ fontFamily: 'var(--font-display, "Bricolage Grotesque", serif)' }}
            >
              Build Your Taste & Grow Starter Box
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Pick {BUNDLE_SIZE} pouches & snacks. Mix and match your baby's favorites.
            </p>
          </div>

          {/* Visual Cooler Box Slots Preview */}
          <div className="max-w-xl mx-auto mb-6 bg-white/90 backdrop-blur-sm rounded-3xl p-5 border border-green-200 shadow-md">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                <Snowflake className="w-4 h-4 text-cyan-600" />
                LittleSprout Cold Shipper ({bundleTotal} / {BUNDLE_SIZE} Packed)
              </span>
              <button
                onClick={openBuildBox}
                className="text-xs font-extrabold text-green-700 hover:text-green-800 flex items-center gap-1 bg-green-50 hover:bg-green-100 px-3 py-1 rounded-full transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Open Studio & Card 💌
              </button>
            </div>

            {/* Visual slots */}
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 mb-4">
              {Array.from({ length: BUNDLE_SIZE }).map((_, idx) => {
                let accumulated = 0
                let filledProduct = null
                for (const p of PRODUCTS) {
                  const count = bundle[p.id] ?? 0
                  if (idx >= accumulated && idx < accumulated + count) {
                    filledProduct = p
                    break
                  }
                  accumulated += count
                }

                if (filledProduct) {
                  return (
                    <div
                      key={idx}
                      onClick={() => filledProduct && removeFromBundle(filledProduct.id)}
                      className="aspect-square rounded-2xl p-1 bg-emerald-50 border border-emerald-300 flex flex-col items-center justify-center cursor-pointer hover:bg-red-50 hover:border-red-300 transition-all shadow-xs group"
                      title={`${filledProduct.name} (Click to remove)`}
                    >
                      <img src={filledProduct.img} alt="" className="w-8 h-8 rounded-lg object-cover" />
                      <span className="text-[8px] font-bold text-gray-700 truncate w-full text-center mt-0.5 group-hover:hidden">
                        {filledProduct.name.split(' ')[0]}
                      </span>
                      <span className="text-[8px] font-bold text-red-600 hidden group-hover:inline">
                        Remove
                      </span>
                    </div>
                  )
                }

                return (
                  <div
                    key={idx}
                    onClick={openBuildBox}
                    className="aspect-square rounded-2xl border-2 border-dashed border-emerald-200/90 flex flex-col items-center justify-center text-emerald-300 hover:border-emerald-400 hover:text-emerald-600 cursor-pointer transition-colors bg-emerald-50/20"
                  >
                    <span className="text-sm font-bold">+</span>
                    <span className="text-[8px] opacity-60">Slot {idx + 1}</span>
                  </div>
                )
              })}
            </div>

            {/* Slot progress bar */}
            <div>
              <div className="flex justify-between mb-1.5 text-xs font-semibold text-gray-600">
                <span>Packing Progress</span>
                {bundleTotal === BUNDLE_SIZE ? (
                  <span className="text-green-600 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Box Ready to Ship! 🎉
                  </span>
                ) : (
                  <span>{BUNDLE_SIZE - bundleTotal} slots remaining</span>
                )}
              </div>
              <div className="slot-progress">
                <div
                  className="slot-progress-fill"
                  style={{ width: `${(bundleTotal / BUNDLE_SIZE) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Product grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
            {PRODUCTS.map(p => {
              const count = bundle[p.id] ?? 0
              return (
                <div key={p.id} className={`bundle-card flex gap-4 items-center ${count > 0 ? 'selected' : ''}`}>
                  <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-b from-white to-gray-50">
                    <img src={p.img} alt={p.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm text-gray-800 leading-tight">{p.name}</h4>
                    <p className="text-xs text-green-600 font-medium mt-1">{p.stage} months</p>
                    <p className="text-xs text-gray-400 mt-0.5">${p.price.toFixed(2)} / pouch</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      className="counter-btn"
                      onClick={() => removeFromBundle(p.id)}
                      disabled={count === 0}
                      style={{ opacity: count === 0 ? 0.3 : 1 }}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-6 text-center font-bold text-sm">{count}</span>
                    <button
                      className="counter-btn"
                      onClick={() => addToBundle(p.id)}
                      disabled={bundleTotal >= BUNDLE_SIZE}
                      style={{ opacity: bundleTotal >= BUNDLE_SIZE ? 0.3 : 1 }}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Subscription toggle + pricing */}
          <div className="max-w-lg mx-auto">
            <div className="sub-toggle mb-6">
              <div
                className={`sub-toggle-option ${isSubscribe ? 'active' : ''}`}
                onClick={() => setIsSubscribe(true)}
              >
                <div className="text-sm">Subscribe & Save</div>
                <div className="text-xs opacity-80 mt-0.5">20% Off + Free Shipping</div>
              </div>
              <div
                className={`sub-toggle-option ${!isSubscribe ? 'active' : ''}`}
                onClick={() => setIsSubscribe(false)}
              >
                <div className="text-sm">One-Time Purchase</div>
                <div className="text-xs opacity-80 mt-0.5">Standard Price</div>
              </div>
            </div>

            {isSubscribe && (
              <div className="price-highlight mb-6">
                <span className="savings-badge">BEST VALUE</span>
                <div className="flex items-end gap-3 mb-2">
                  <span className="text-3xl font-extrabold text-gray-900">${finalPrice.toFixed(2)}</span>
                  <span className="text-lg text-gray-400 line-through">${rawPrice.toFixed(2)}</span>
                </div>
                <p className="text-sm text-gray-600">
                  Only ${bundleTotal > 0 ? (finalPrice / bundleTotal).toFixed(2) : '—'}/pouch · Free cold shipping forever
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">🥄 Free Silicone Spoon</span>
                  <span className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium">💬 SMS Skip/Pause</span>
                  <span className="text-xs bg-amber-50 text-amber-700 px-3 py-1 rounded-full font-medium">❄️ Cold Delivery</span>
                </div>
              </div>
            )}

            {!isSubscribe && (
              <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-6">
                <div className="flex items-end gap-3 mb-2">
                  <span className="text-3xl font-extrabold text-gray-900">${rawPrice.toFixed(2)}</span>
                </div>
                <p className="text-sm text-gray-500">+ $6.99 cold shipping</p>
              </div>
            )}

            <Button
              variant="default"
              size="lg"
              fullWidth
              onClick={openBuildBox}
              className="!bg-green-600 hover:!bg-green-700 !text-white !rounded-2xl !h-14 !text-base !font-bold shadow-lg hover:shadow-xl transition-all"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              {bundleTotal < BUNDLE_SIZE
                ? `Pack ${BUNDLE_SIZE - bundleTotal} More or Open Studio 📦`
                : `Proceed to Personalize & Checkout — $${finalPrice.toFixed(2)}`}
            </Button>

            <p className="text-center text-xs text-gray-400 mt-3 flex items-center justify-center gap-1">
              <Timer className="w-3 h-3" /> Zero commitment. Cancel or pause anytime with a single text.
            </p>
          </div>
        </div>
      </section>

      {/* ═══ 7. PURITY COMPARISON TABLE ═══ */}
      <section id="purity" className="section" style={{ background: 'white' }}>
        <div className="container-main">
          <div className="text-center mb-10">
            <span className="badge-organic mb-4 inline-block" style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}>
              Transparency First
            </span>
            <h2
              className="text-3xl md:text-4xl font-extrabold mb-3"
              style={{ fontFamily: 'var(--font-display, "Bricolage Grotesque", serif)' }}
            >
              Why LittleSprout is Different
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              See how our organic A2 dairy stacks up against typical supermarket brands.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="comparison-table w-full text-sm">
              <thead>
                <tr>
                  <th className="!bg-gray-800">Criteria</th>
                  <th className="!bg-green-600">
                    <div className="flex items-center gap-2">
                      <Leaf className="w-4 h-4" /> LittleSprout
                    </div>
                  </th>
                  <th className="!bg-gray-500">Supermarket Baby Brand</th>
                  <th className="!bg-gray-500">Adult Organic Yogurt</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Heavy Metal Testing', '✅ 100% Batch-Tested & Published', '❌ Undisclosed', '❌ Not Infant-Certified'],
                  ['Milk Source', '✅ 100% Pasture Grass-Fed A2', '⚠️ Grain-fed Conventional', '⚠️ Standard A1/A2 Mix'],
                  ['Added Sugar', '✅ 0g (Zero)', '❌ 6–11g (Fruit Concentrates)', '❌ 8–14g Cane Sugar'],
                  ['Healthy Brain Fats', '✅ 5g Whole Milk + DHA', '⚠️ 1.5g (Skim Milk)', '⚠️ 2–3g'],
                  ['Live Probiotic Strains', '✅ 6 Infant-Specific Strains', '⚠️ 1–2 Strains', '⚠️ Standard Cultures'],
                  ['Packaging Safety', '✅ BPA-Free + Choke-Safe Cap', '⚠️ Standard Plastic', '❌ Choking Hazard Cap'],
                ].map(([label, us, super_, adult], i) => (
                  <tr key={i}>
                    <td className="font-semibold text-gray-800">{label}</td>
                    <td className="text-green-700 font-medium bg-green-50/50">{us}</td>
                    <td className="text-gray-600">{super_}</td>
                    <td className="text-gray-600">{adult}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ═══ 8. COLD-CHAIN DELIVERY ═══ */}
      <section className="section" style={{ background: 'linear-gradient(180deg, var(--ls-cream), #f0fdf4)' }}>
        <div className="container-main">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="badge-organic mb-4 inline-block" style={{ background: 'linear-gradient(135deg, #06b6d4, #0891b2)' }}>
                Freshness Guaranteed
              </span>
              <h2
                className="text-3xl md:text-4xl font-extrabold mb-4"
                style={{ fontFamily: 'var(--font-display, "Bricolage Grotesque", serif)' }}
              >
                Ice-Cold Delivery to Your Doorstep
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Every LittleSprout box is shipped in our custom-engineered eco-insulated cold shipper.
                Your baby's dairy arrives chilled and safe — or we replace it instantly, free of charge.
              </p>

              <div className="space-y-4">
                {[
                  { icon: <Snowflake className="w-5 h-5 text-cyan-600" />, title: 'Dry-Ice Cooling System', desc: 'Maintains < 40°F for up to 60 hours during transit' },
                  { icon: <Leaf className="w-5 h-5 text-green-600" />, title: '100% Plant-Fiber Insulation', desc: 'Fully curbside-recyclable, compostable materials' },
                  { icon: <Truck className="w-5 h-5 text-blue-600" />, title: 'Real-Time Temperature Tracking', desc: 'SMS alerts with delivery photo confirmation' },
                  { icon: <ShieldCheck className="w-5 h-5 text-amber-600" />, title: 'Freshness Guarantee', desc: 'Not cold on arrival? Full replacement, no questions asked' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/60 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center flex-shrink-0">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-gray-800">{item.title}</h4>
                      <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-center">
              <img
                src="/images/cold-chain-box.jpg"
                alt="Eco-insulated cold delivery box"
                className="w-full max-w-md rounded-3xl shadow-2xl hover:scale-[1.02] transition-transform duration-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 9. PEDIATRICIAN ENDORSEMENT ═══ */}
      <section className="section" style={{ background: 'white' }}>
        <div className="container-main">
          <div className="text-center mb-10">
            <span className="badge-organic mb-4 inline-block" style={{ background: 'linear-gradient(135deg, #ec4899, #be185d)' }}>
              Doctor Recommended
            </span>
            <h2
              className="text-3xl md:text-4xl font-extrabold mb-3"
              style={{ fontFamily: 'var(--font-display, "Bricolage Grotesque", serif)' }}
            >
              Backed by Pediatric Experts
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="endorsement-card">
              <div className="flex items-center gap-4 mb-4 relative z-10">
                <img
                  src="/images/doctor.jpg"
                  alt="Dr. Rachel Harris"
                  className="w-16 h-16 rounded-full object-cover border-2 border-green-200 shadow-md"
                />
                <div>
                  <h4 className="font-bold text-gray-800">Dr. Rachel Harris, MD, FAAP</h4>
                  <p className="text-xs text-gray-500">Board-Certified Pediatrician & Mother of Two</p>
                </div>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed italic relative z-10">
                "Whole milk fats and A2 proteins are critical during the first 1,000 days of life.
                LittleSprout is the only baby dairy I wholeheartedly recommend to parents in my clinic."
              </p>
              <p className="text-xs text-gray-400 mt-3 relative z-10">
                * Dr. Harris is a paid member of the LittleSprout Pediatric Advisory Board.
              </p>
            </div>

            <div className="endorsement-card">
              <div className="flex items-center gap-4 mb-4 relative z-10">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white text-xl font-bold shadow-md">
                  ER
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">Elena Rostova, MS, RD, CSP</h4>
                  <p className="text-xs text-gray-500">Board Certified Pediatric Dietitian</p>
                </div>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed italic relative z-10">
                "Most parents don't realize how much sugar is hidden in toddler yogurts. LittleSprout's
                zero-added-sugar formulation helps prevent early sweet-tooth conditioning — a critical win for
                lifelong health."
              </p>
              <p className="text-xs text-gray-400 mt-3 relative z-10">
                * Elena is a paid member of the LittleSprout Nutritional Advisory Board.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 10. CUSTOMER REVIEWS ═══ */}
      <section id="reviews" className="section" style={{ background: 'var(--ls-cream)' }}>
        <div className="container-main">
          <div className="text-center mb-10">
            <span className="badge-organic mb-4 inline-block" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
              Verified Reviews
            </span>
            <h2
              className="text-3xl md:text-4xl font-extrabold mb-3"
              style={{ fontFamily: 'var(--font-display, "Bricolage Grotesque", serif)' }}
            >
              What Parents Are Saying
            </h2>
            <div className="flex items-center justify-center gap-2 mt-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-sm font-semibold text-gray-700">4.9 out of 5</span>
              <span className="text-sm text-gray-400">(3,420 reviews)</span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {REVIEWS.map((r, i) => (
              <div key={i} className="review-card">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold text-sm">
                      {r.name[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-gray-800">{r.name}</span>
                        {r.verified && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Verified
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-400">Baby age: {r.babyAge}</span>
                    </div>
                  </div>
                  <div className="flex">
                    {[...Array(r.rating)].map((_, j) => (
                      <Star key={j} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{r.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 11. FAQ SECTION ═══ */}
      <section className="section" style={{ background: 'white' }}>
        <div className="container-main max-w-3xl">
          <div className="text-center mb-10">
            <h2
              className="text-3xl md:text-4xl font-extrabold mb-3"
              style={{ fontFamily: 'var(--font-display, "Bricolage Grotesque", serif)' }}
            >
              Frequently Asked Questions
            </h2>
            <p className="text-gray-500">Everything you need to know about our baby dairy products.</p>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div key={i} className="t-acc" data-open={openFaq === i}>
                <button
                  type="button"
                  className="t-acc-head"
                  aria-expanded={openFaq === i}
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="pr-4">{faq.q}</span>
                  <span className="t-acc-chevron">
                    <ChevronDown className="w-5 h-5 flex-shrink-0" />
                  </span>
                </button>
                <div className="t-acc-panel">
                  <div className="t-acc-panel-inner">
                    <p className="text-sm text-gray-600 leading-relaxed">{faq.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 12. FINAL CTA FOOTER ═══ */}
      <section className="cta-footer section text-white text-center">
        <div className="container-main relative z-10">
          <h2
            className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4"
            style={{ fontFamily: 'var(--font-display, "Bricolage Grotesque", serif)' }}
          >
            Give Your Baby the Purest Start
          </h2>
          <p className="text-lg text-white/80 max-w-2xl mx-auto mb-8">
            100% organic A2 whole milk dairy. Zero added sugars. Heavy metal tested.
            Delivered cold to your door. Join 25,000+ parents who trust LittleSprout.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Button
              variant="default"
              size="lg"
              onClick={openBuildBox}
              className="!bg-white !text-green-700 hover:!bg-green-50 !rounded-full !px-10 !h-14 !text-base !font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
            >
              <Sparkles className="w-5 h-5 text-amber-500" />
              Build Your Starter Box — Save 20%
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-6 mt-8 text-sm text-white/60">
            <span className="flex items-center gap-1"><Snowflake className="w-4 h-4" /> Free Cold Shipping</span>
            <span className="flex items-center gap-1"><Timer className="w-4 h-4" /> Cancel Anytime</span>
            <span className="flex items-center gap-1"><ShieldCheck className="w-4 h-4" /> Freshness Guaranteed</span>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container-main">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                  <Leaf className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-lg">LittleSprout</span>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">
                Premium organic baby dairy for the first 1,000 days of life. Because every tummy deserves the purest start.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-3 text-sm">Products</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="hover:text-white transition-colors cursor-pointer">Yogurt Pouches</li>
                <li className="hover:text-white transition-colors cursor-pointer">Cheese Bites</li>
                <li className="hover:text-white transition-colors cursor-pointer">Starter Bundles</li>
                <li className="hover:text-white transition-colors cursor-pointer">Gift Sets</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-3 text-sm">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="hover:text-white transition-colors cursor-pointer">Our Story</li>
                <li className="hover:text-white transition-colors cursor-pointer">Clean Label Promise</li>
                <li className="hover:text-white transition-colors cursor-pointer">Pediatric Advisory Board</li>
                <li className="hover:text-white transition-colors cursor-pointer">Sustainability</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-3 text-sm">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="hover:text-white transition-colors cursor-pointer">FAQ</li>
                <li className="hover:text-white transition-colors cursor-pointer">Manage Subscription</li>
                <li className="hover:text-white transition-colors cursor-pointer">Shipping & Returns</li>
                <li className="hover:text-white transition-colors cursor-pointer">Contact Us</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 flex flex-wrap justify-between items-center text-xs text-gray-500">
            <p>© 2026 LittleSprout Organics. All rights reserved.</p>
            <p>Yogurt and soft cheese are suitable for infants 6+ months as complementary food, not as a replacement for breast milk or formula.</p>
          </div>
        </div>
      </footer>

      {/* ═══ STICKY MOBILE BAR ═══ */}
      <div className={`sticky-bar ${showSticky ? 'visible' : ''} md:hidden`}>
        <div className="flex items-center gap-3">
          <img src="/images/banana-pouch.png" alt="Product" className="w-10 h-10 rounded-lg object-contain" />
          <div>
            <p className="text-xs font-bold text-gray-800">Taste & Grow Kit</p>
            <p className="text-xs text-green-600 font-semibold">${finalPrice > 0 ? finalPrice.toFixed(2) : '38.40'}</p>
          </div>
        </div>
        <button
          onClick={openBuildBox}
          className="px-5 py-2.5 bg-green-600 text-white rounded-full text-sm font-bold shadow-md flex items-center gap-1 active:scale-95"
        >
          <span>Customize Box</span>
          <ChevronRight className="w-4 h-4 inline" />
        </button>
      </div>

      {/* ═══ BUILD BOX & CHEERFUL CHECKOUT MODAL ═══ */}
      <BuildBoxModal
        isOpen={isBuildBoxModalOpen}
        onClose={() => setIsBuildBoxModalOpen(false)}
        initialBundle={bundle}
        initialStage={selectedStage}
      />
    </div>
  )
}
