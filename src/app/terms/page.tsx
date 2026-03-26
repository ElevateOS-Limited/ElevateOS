const sections = [
  {
    title: 'Platform use',
    body: 'ElevateOS provides study planning, practice, notes, tutoring support, and related student workflow tools. You are responsible for how you use generated output and for reviewing any academic or admissions guidance before relying on it.',
  },
  {
    title: 'Accounts and access',
    body: 'You must keep your login credentials secure and use the platform only for your own authorized account. We may suspend access for abuse, unauthorized sharing, or behavior that risks other users or the service.',
  },
  {
    title: 'Payments and subscriptions',
    body: 'Paid plans renew according to the billing interval selected at checkout unless canceled through the billing portal or as required by law. Plan limits, trial periods, and features may change as the MVP evolves.',
  },
  {
    title: 'Acceptable conduct',
    body: 'Do not upload unlawful material, attempt to access other users’ data, abuse AI features, or use the platform to cheat, harass, or violate school or tutoring policies.',
  },
  {
    title: 'Service changes',
    body: 'ElevateOS is an actively developed product. We may add, remove, or modify features as we improve reliability, safety, and fit for the tutoring MVP.',
  },
]

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-16 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <p className="text-sm font-medium text-violet-600">Legal</p>
          <h1 className="text-4xl font-bold mt-2">Terms of Service</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-4">
            Effective March 26, 2026. These terms govern use of ElevateOS at elevateos.org.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8 space-y-6">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-xl font-semibold mb-2">{section.title}</h2>
              <p className="text-gray-600 dark:text-gray-300 leading-7">{section.body}</p>
            </section>
          ))}

          <section>
            <h2 className="text-xl font-semibold mb-2">Contact</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-7">
              Questions about these terms can be sent to support@elevateos.org.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
