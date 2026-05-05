export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50 dark:from-gray-900 dark:via-black dark:to-gray-900 pt-32 pb-16">
      <div className="max-w-4xl mx-auto px-4 md:px-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2" style={{ fontFamily: 'var(--font-playfair)' }}>
          Privacy Policy
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">Last updated: April 2026</p>

        <div className="prose prose-lg dark:prose-invert max-w-none space-y-6 text-gray-700 dark:text-gray-300">
          
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">1. Introduction</h2>
            <p>
              Wedding Wall ("we," "us," "our," or "Company") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Service.
            </p>
            <p>
              This Privacy Policy applies to all visitors and users of Wedding Wall, and is compliant with Malaysian data protection laws, including the Personal Data Protection Act 2010 (PDPA).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">2. Information We Collect</h2>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">2.1 Information You Provide Directly</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Guest Information:</strong> Name (required), email (optional)</li>
              <li><strong>Wedding Code:</strong> To access the gallery</li>
              <li><strong>Photos:</strong> Any images you upload to the gallery</li>
              <li><strong>Password/Access Credentials:</strong> For family panel access</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">2.2 Automatically Collected Information</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Device information (type, browser, operating system)</li>
              <li>IP address and geolocation data (approximate)</li>
              <li>Session identifiers and cookies</li>
              <li>Pages visited and time spent on the Service</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">2.3 Photos and Content</h3>
            <p>
              Any photos, messages, or content you upload to Wedding Wall are collected and stored. We do not extract metadata from photos or use facial recognition unless explicitly authorized.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">3. How We Use Your Information</h2>
            <p>We use the information we collect for the following purposes:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>To provide and maintain the Service</li>
              <li>To authenticate and authorize access to galleries and features</li>
              <li>To store and display your photos within the wedding gallery</li>
              <li>To send important notifications about gallery status or expiration</li>
              <li>To improve and optimize the Service</li>
              <li>To comply with legal obligations and prevent fraud</li>
              <li>To analyze usage patterns and aggregate statistics</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">4. Data Sharing and Disclosure</h2>
            <p>
              Wedding Wall does not sell, trade, or rent your personal information to third parties. However, we may share your information in the following limited circumstances:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>With Authorized Users:</strong> Photos and guest information are shared with other authorized gallery participants</li>
              <li><strong>Service Providers:</strong> We may share data with trusted service providers (hosting, email services) who are contractually bound to protect your data</li>
              <li><strong>Legal Requirements:</strong> If required by law or court order, we may disclose your information</li>
              <li><strong>Security:</strong> In case of suspected illegal activity or Terms violation</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">5. Data Security</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Password Hashing:</strong> All passwords are hashed using bcrypt with 10 salt rounds before storage</li>
              <li><strong>HTTPS/SSL:</strong> All data transmissions are encrypted in transit</li>
              <li><strong>Access Control:</strong> Only authorized personnel can access user data</li>
              <li><strong>Regular Backups:</strong> Data is backed up regularly to prevent loss</li>
            </ul>
            <p className="mt-4">
              However, no method of transmission over the internet is 100% secure. While we strive to protect your data, we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">6. Data Retention and Deletion</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>During Subscription:</strong> Your photos and data are retained for the duration of your subscription (7, 14, or 30 days)</li>
              <li><strong>After Expiration:</strong> Photos may be automatically deleted after the subscription period ends</li>
              <li><strong>Guest Information:</strong> Names and basic guest data are retained for audit purposes for up to 6 months</li>
              <li><strong>Upon Request:</strong> You can request deletion of your photos at any time, and we will comply within 30 days</li>
              <li><strong>Deleted Data:</strong> Once deleted, data cannot be recovered</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">7. Your Rights Under PDPA (Malaysia)</h2>
            <p>Under the Personal Data Protection Act 2010, you have the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Access your personal data held by Wedding Wall</li>
              <li>Request correction of inaccurate or incomplete data</li>
              <li>Request deletion of your personal data (subject to legal obligations)</li>
              <li>Opt-out of marketing communications</li>
              <li>Lodge a complaint with the Malaysian Personal Data Protection Commissioner (PDPC)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">8. Cookies and Tracking</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Wedding Wall uses cookies to maintain user sessions and preferences</li>
              <li>We do not use third-party tracking or advertising cookies</li>
              <li>You can disable cookies in your browser, but this may affect Service functionality</li>
              <li>No data is shared with advertising networks or analytics companies</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">9. Third-Party Links</h2>
            <p>
              Wedding Wall may contain links to third-party websites. We are not responsible for the privacy practices of external sites. Please review their privacy policies before providing any information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">10. Children's Privacy</h2>
            <p>
              Wedding Wall is not intended for children under the age of 13. We do not knowingly collect personal information from children. If we discover we have collected data from a child under 13, we will delete it immediately.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">11. Changes to Privacy Policy</h2>
            <p>
              Wedding Wall may update this Privacy Policy from time to time. We will notify you of any material changes via email or on the Service. Your continued use of the Service after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">12. Contact Information</h2>
            <p>
              If you have questions about this Privacy Policy or wish to exercise your rights under PDPA, please contact us at:
            </p>
            <p className="mt-4">
              <strong>Wedding Wall Customer Support</strong>
              <br />
              Email: santaikuppi@gmail.com
              <br />
              Website: <a href="https://wedding-wall.vercel.app" className="text-orange-500 hover:text-orange-600 dark:hover:text-orange-400 underline">https://wedding-wall.vercel.app</a>
              <br />
              Response Time: Within 30 days
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">13. Complaint Procedure</h2>
            <p>
              If you are not satisfied with our response to your privacy concerns, you may lodge a complaint with the Personal Data Protection Commissioner (PDPC) in Malaysia:
            </p>
            <p className="mt-4">
              <strong>Office of the Personal Data Protection Commissioner (PDPC)</strong>
              <br />
              Website: www.pdpc.gov.my
              <br />
              Email: pdpc@pdpc.gov.my
            </p>
          </section>

        </div>

        <div className="mt-12 p-6 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Last Updated: April 2026. This Privacy Policy complies with the Personal Data Protection Act 2010 (PDPA) of Malaysia and is regularly reviewed to ensure compliance.
          </p>
        </div>
      </div>
    </div>
  );
}
