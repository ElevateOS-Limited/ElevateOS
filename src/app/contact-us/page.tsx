import Link from 'next/link'
import { Mail, Phone, MapPin, ArrowRight } from 'lucide-react'
import { LeadCaptureForm } from '@/components/public/LeadCaptureForm'

export default function ContactUsPage() {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8f5ef_0%,#ffffff_100%)] px-4 py-10 text-slate-950 dark:bg-slate-950 dark:text-white">
      <div className="mx-auto max-w-6xl">
        <header className="rounded-[2rem] border border-slate-900/10 bg-white/90 p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#9a5b00]">Contact us</p>
          <h1 className="font-display mt-2 text-4xl tracking-tight">Short intake, direct follow-up.</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300">
            If you are a parent, student, tutor, or partner, send one short note and we will route the conversation to the right place.
          </p>
        </header>

        <section className="grid gap-5 py-8 lg:grid-cols-[.95fr_1.05fr]">
          <article className="rounded-[2rem] border border-slate-900/10 bg-slate-950 p-6 text-white shadow-2xl shadow-slate-950/10 dark:border-white/10">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#f2c06d]">Direct channels</p>
            <div className="mt-5 space-y-4 text-sm text-white/78">
              <div className="flex items-start gap-3">
                <Mail className="mt-0.5 h-4 w-4 text-[#f2c06d]" />
                <div>
                  <p className="font-semibold text-white">Email</p>
                  <p>hello@elevateos.org</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="mt-0.5 h-4 w-4 text-[#f2c06d]" />
                <div>
                  <p className="font-semibold text-white">Phone / WhatsApp</p>
                  <p>Available on request for active families.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 text-[#f2c06d]" />
                <div>
                  <p className="font-semibold text-white">Coverage</p>
                  <p>Remote tutoring with local expansion through referrals.</p>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-white/5 p-4 text-sm leading-7 text-white/76">
              Parents are the payer. Students are the user. The product exists to make the tutoring service easier to run and easier to trust.
            </div>

            <div className="mt-5">
              <Link href="/onboarding" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10">
                Go to onboarding <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </article>

          <article className="rounded-[2rem] border border-slate-900/10 bg-[#f8f5ef] p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#9a5b00]">Inquiry form</p>
            <h2 className="mt-3 text-3xl font-semibold">Send one message and we will route it.</h2>
            <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300">
              Keep the message short. Tell us the student year, the subject, the role, and whether you want tutoring, onboarding, or a parent summary setup.
            </p>
            <LeadCaptureForm source="contact-us" defaultRoleInterest="other" className="mt-5" />
          </article>
        </section>
      </div>
    </div>
  )
}
