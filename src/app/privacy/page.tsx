const sections = [
  {
    title: 'What we collect',
    body: 'We collect the account details, profile fields, study materials, activity data, and subscription data needed to operate the platform. This may include your name, email, uploaded content, planner data, and usage events.',
  },
  {
    title: 'How we use data',
    body: 'We use your data to authenticate you, save your work, personalize recommendations, process billing, support tutoring services, and improve product reliability.',
  },
  {
    title: 'AI processing',
    body: 'Some features send selected content to AI providers so summaries, worksheets, feedback, or recommendations can be generated. Avoid submitting sensitive information you do not want processed through those tools.',
  },
  {
    title: 'Sharing and retention',
    body: 'We do not sell your personal information. Data is shared only with service providers required to run the product, such as authentication, database, payment, hosting, and email delivery vendors.',
  },
  {
    title: 'Your controls',
    body: 'You can update core profile data from the dashboard. For account deletion, billing issues, or privacy requests, contact support so the request can be handled directly.',
  },
]

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-16 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <p className="text-sm font-medium text-violet-600">Legal</p>
          <h1 className="text-4xl font-bold mt-2">Privacy Policy</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-4">
            Effective March 26, 2026. This policy explains how ElevateOS handles account and learning data.
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
              Privacy questions or requests can be sent to support@elevateos.org.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
