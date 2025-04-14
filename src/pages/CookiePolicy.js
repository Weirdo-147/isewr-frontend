import React from 'react';

const CookiePolicy = () => {
  const cookieTypes = [
    {
      name: 'Essential Cookies',
      description: 'These cookies are necessary for the website to function properly. They enable basic functions like page navigation and access to secure areas of the website.',
      examples: [
        'Session management',
        'Load balancing',
        'Security features',
      ],
    },
    {
      name: 'Analytics Cookies',
      description: 'These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously.',
      examples: [
        'Page views',
        'Traffic sources',
        'User behavior',
      ],
    },
    {
      name: 'Functionality Cookies',
      description: 'These cookies enable the website to provide enhanced functionality and personalization based on your preferences.',
      examples: [
        'Language settings',
        'User preferences',
        'Form auto-fill',
      ],
    },
    {
      name: 'Marketing Cookies',
      description: 'These cookies are used to track visitors across websites. The intention is to display ads that are relevant and engaging for individual users.',
      examples: [
        'Ad preferences',
        'Campaign tracking',
        'Social media integration',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-light text-gray-900 mb-4">Cookie Policy</h1>
          <p className="text-xl text-gray-600">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="mt-12 space-y-8">
          {/* Introduction */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Introduction</h2>
            <p className="text-gray-600 mb-4">
              This Cookie Policy explains how LensLynx ("we", "us", or "our") uses cookies and similar technologies to recognize you when you visit our website. It explains what these technologies are and why we use them, as well as your rights to control our use of them.
            </p>
            <p className="text-gray-600">
              In some cases we may use cookies to collect personal information, or that becomes personal information if we combine it with other information.
            </p>
          </div>

          {/* What are cookies */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">What are cookies?</h2>
            <p className="text-gray-600 mb-4">
              Cookies are small data files that are placed on your computer or mobile device when you visit a website. Cookies are widely used by website owners in order to make their websites work, or to work more efficiently, as well as to provide reporting information.
            </p>
            <p className="text-gray-600">
              Cookies set by the website owner (in this case, LensLynx) are called "first-party cookies". Cookies set by parties other than the website owner are called "third-party cookies". Third-party cookies enable third-party features or functionality to be provided on or through the website.
            </p>
          </div>

          {/* Types of cookies we use */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Types of cookies we use</h2>
            <div className="space-y-6">
              {cookieTypes.map((type) => (
                <div key={type.name} className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0">
                  <h3 className="text-xl font-medium text-gray-900 mb-2">{type.name}</h3>
                  <p className="text-gray-600 mb-4">{type.description}</p>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Examples:</h4>
                    <ul className="list-disc list-inside text-gray-600 space-y-1">
                      {type.examples.map((example) => (
                        <li key={example}>{example}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* How to control cookies */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">How to control cookies</h2>
            <p className="text-gray-600 mb-4">
              You can set your browser to refuse all or some browser cookies, or to alert you when websites set or access cookies. If you disable or refuse cookies, please note that some parts of this website may become inaccessible or not function properly.
            </p>
            <div className="bg-gray-50 p-4 rounded-md">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Browser-specific instructions:</h4>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Chrome: Settings → Privacy and security → Cookies and other site data</li>
                <li>Firefox: Options → Privacy & Security → Cookies and Site Data</li>
                <li>Safari: Preferences → Privacy → Cookies and website data</li>
                <li>Edge: Settings → Cookies and site permissions → Cookies and site data</li>
              </ul>
            </div>
          </div>

          {/* Contact */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact us</h2>
            <p className="text-gray-600">
              If you have any questions about our use of cookies or other technologies, please email us at noreply@lenslynx.art.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookiePolicy; 