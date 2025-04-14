import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-light text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-xl text-gray-600">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="mt-12 space-y-8">
          {/* Introduction */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Introduction</h2>
            <p className="text-gray-600 mb-4">
              At LensLynx, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our service.
            </p>
            <p className="text-gray-600">
              Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site.
            </p>
          </div>

          {/* Information We Collect */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Information We Collect</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">Personal Data</h3>
                <p className="text-gray-600 mb-4">
                  Personally identifiable information, such as your name, email address, and telephone number, and any other information that you choose to provide to us.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">Usage Data</h3>
                <p className="text-gray-600 mb-4">
                  Information about how you use our service, including your IP address, browser type, browser version, the pages of our service that you visit, the time and date of your visit, and other diagnostic data.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">Image and Video Data</h3>
                <p className="text-gray-600 mb-4">
                  Images and videos that you upload to our service for processing, recognition, or conversion.
                </p>
              </div>
            </div>
          </div>

          {/* How We Use Your Information */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">How We Use Your Information</h2>
            <p className="text-gray-600 mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Provide and maintain our service</li>
              <li>Notify you about changes to our service</li>
              <li>Provide customer support</li>
              <li>Monitor the usage of our service</li>
              <li>Detect, prevent and address technical issues</li>
              <li>Improve our service</li>
            </ul>
          </div>

          {/* Data Security */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Data Security</h2>
            <p className="text-gray-600 mb-4">
              The security of your data is important to us. We implement appropriate technical and organizational security measures to protect your personal information. However, please note that no method of transmission over the Internet or electronic storage is 100% secure.
            </p>
          </div>

          {/* Your Data Protection Rights */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your Data Protection Rights</h2>
            <p className="text-gray-600 mb-4">
              You have the following data protection rights:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>The right to access, update or delete your information</li>
              <li>The right of rectification</li>
              <li>The right to object</li>
              <li>The right of restriction</li>
              <li>The right to data portability</li>
              <li>The right to withdraw consent</li>
            </ul>
          </div>

          {/* Contact Us */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Us</h2>
            <p className="text-gray-600">
              If you have any questions about this Privacy Policy, please contact us at noreply@lenslynx.art.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy; 