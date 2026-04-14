import { redirect } from 'next/navigation'

// /dashboard/partner/* now lives at /tutor-dashboard/* — redirect permanently
export default function TutoringDashboardPartnerLayout() {
  redirect('/tutor-dashboard')
}
