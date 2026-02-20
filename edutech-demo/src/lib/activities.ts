export type ActivityCatalogItem = {
  id: string
  title: string
  category: 'research' | 'community' | 'competition' | 'leadership' | 'creative' | 'internship'
  supportBy: string
  supportOffer: string
  subscription: 'FREE' | 'PRO' | 'ELITE'
  days: string[]
  fitTags: string[]
  outcome: string
}

export const ACTIVITY_CATALOG: ActivityCatalogItem[] = [
  {
    id: 'lab-shadow',
    title: 'University Lab Shadow Program',
    category: 'research',
    supportBy: 'STEM mentor network',
    supportOffer: 'Research topic scoping + publication mentoring',
    subscription: 'ELITE',
    days: ['Tuesday', 'Thursday', 'Saturday'],
    fitTags: ['stem', 'science', 'engineering', 'research', 'top university'],
    outcome: 'Builds credible research profile for top STEM programs.',
  },
  {
    id: 'impact-fellows',
    title: 'Community Impact Fellows',
    category: 'community',
    supportBy: 'Social impact coaches',
    supportOffer: 'Project design + leadership accountability check-ins',
    subscription: 'PRO',
    days: ['Monday', 'Wednesday', 'Friday'],
    fitTags: ['community', 'leadership', 'social impact', 'service'],
    outcome: 'Strengthens service and leadership narrative for holistic admissions.',
  },
  {
    id: 'olympiad',
    title: 'Olympiad / Competition Track',
    category: 'competition',
    supportBy: 'Competition coaches',
    supportOffer: 'Weekly problem sets + mock rounds',
    subscription: 'PRO',
    days: ['Tuesday', 'Thursday'],
    fitTags: ['math', 'physics', 'competition', 'stem'],
    outcome: 'Adds high-signal academic achievement for selective schools.',
  },
  {
    id: 'startup-studio',
    title: 'Student Startup Studio',
    category: 'leadership',
    supportBy: 'Founder mentors',
    supportOffer: 'MVP guidance + storytelling + pitch reviews',
    subscription: 'ELITE',
    days: ['Saturday', 'Sunday'],
    fitTags: ['business', 'leadership', 'entrepreneurship', 'product'],
    outcome: 'Demonstrates initiative, execution and leadership.',
  },
  {
    id: 'portfolio-writing',
    title: 'Narrative & Portfolio Writing Lab',
    category: 'creative',
    supportBy: 'Admissions writing coaches',
    supportOffer: 'Essay strategy + weekly writing feedback',
    subscription: 'FREE',
    days: ['Wednesday', 'Sunday'],
    fitTags: ['writing', 'humanities', 'storytelling', 'liberal arts'],
    outcome: 'Improves essays and personal positioning.',
  },
  {
    id: 'micro-internship',
    title: 'Micro-Internship Matching',
    category: 'internship',
    supportBy: 'Career partner network',
    supportOffer: 'Short practical projects with mentor review',
    subscription: 'PRO',
    days: ['Friday', 'Saturday'],
    fitTags: ['career', 'internship', 'exploration', 'undecided'],
    outcome: 'Helps undecided students discover interests while building resume proof.',
  },
]
