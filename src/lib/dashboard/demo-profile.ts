export type DemoDashboardProfile = {
  id: string
  name: string
  email: string
  image: string | null
  role: string
  gradeLevel: string
  curriculum: string
  subjects: string[]
  gpa: number
  satScore: number
  actScore: number | null
  intendedMajor: string
  targetUniversities: string[]
  careerInterests: string[]
  location: string
  bio: string
  coursesTaking: string[]
  activitiesDone: Array<{ name: string; impact: string }>
  goals: string[]
  customPreferences: Record<string, string>
  weeklyAvailability: {
    weekly: Record<string, 'open' | 'busy'>
    blockedDates: string[]
  }
  subscriptionStatus: string
  subscriptionEnds: Date | null
  trialEnds: Date | null
}

export const demoDashboardProfile: DemoDashboardProfile = {
  id: 'demo-student-yuki',
  name: 'Yuki Tanaka',
  email: 'yuki.tanaka@elevateos.demo',
  image: null,
  role: 'STUDENT',
  gradeLevel: 'Grade 11',
  curriculum: 'IB',
  subjects: ['Mathematics AA HL', 'Physics HL', 'English A SL'],
  gpa: 3.94,
  satScore: 1470,
  actScore: null,
  intendedMajor: 'Computer Science',
  targetUniversities: ['University of Tokyo', 'Waseda University', 'Keio University'],
  careerInterests: ['AI', 'Robotics', 'Entrepreneurship'],
  location: 'Tokyo, Japan',
  bio: 'IB student balancing admissions, activities, and one selective summer project.',
  coursesTaking: ['IB Math AA HL', 'IB Physics HL', 'IB English A SL', 'Japanese B SL'],
  activitiesDone: [
    {
      name: 'Robotics team lead',
      impact: 'Coordinates build sprints and demo scripts for a regional competition run.',
    },
    {
      name: 'Peer tutoring cohort',
      impact: 'Runs weekly math review sessions for 12 younger students.',
    },
    {
      name: 'Hackathon finalist',
      impact: 'Shipped a campus navigation prototype in 48 hours.',
    },
    {
      name: 'Essay workshop',
      impact: 'Converted a rough draft into an admissions-ready story arc.',
    },
  ],
  goals: [
    'Finish UTokyo and Waseda shortlists',
    'Raise timed calculus score above 90%',
    'Ship one summer project before the application sprint',
  ],
  customPreferences: {
    weeklyFocus: 'Admissions and calculus',
    weeklyReview: 'Sunday evening',
  },
  weeklyAvailability: {
    weekly: {
      Monday: 'open',
      Tuesday: 'busy',
      Wednesday: 'open',
      Thursday: 'open',
      Friday: 'busy',
      Saturday: 'open',
      Sunday: 'busy',
    },
    blockedDates: [],
  },
  subscriptionStatus: 'demo',
  subscriptionEnds: null,
  trialEnds: null,
}
