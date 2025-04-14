import React from 'react';

const Security = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-light text-gray-900 mb-4">Security</h1>
          <p className="text-xl text-gray-600">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="mt-12 space-y-8">
          {/* Overview */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Security Overview</h2>
            <p className="text-gray-600 mb-4">
              At LensLynx, we take security seriously. We implement industry-standard security measures to protect your data and ensure the safety of our services.
            </p>
          </div>

          {/* Data Protection */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Data Protection</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">Encryption</h3>
                <p className="text-gray-600 mb-4">
                  All data transmitted between your device and our servers is encrypted using industry-standard TLS/SSL protocols. This ensures that your data remains secure during transmission.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">Storage Security</h3>
                <p className="text-gray-600 mb-4">
                  Your data is stored in secure, state-of-the-art data centers with multiple layers of security, including physical security, network security, and access controls.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">Access Controls</h3>
                <p className="text-gray-600 mb-4">
                  We implement strict access controls and authentication mechanisms to ensure that only authorized personnel can access your data.
                </p>
              </div>
            </div>
          </div>

          {/* Security Measures */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Security Measures</h2>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Regular security audits and penetration testing</li>
              <li>Continuous monitoring and threat detection</li>
              <li>Automated backup systems</li>
              <li>Incident response procedures</li>
              <li>Employee security training</li>
              <li>Secure development practices</li>
            </ul>
          </div>

          {/* Compliance */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Compliance</h2>
            <p className="text-gray-600 mb-4">
              We comply with relevant data protection regulations and industry standards, including:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>GDPR (General Data Protection Regulation)</li>
              <li>CCPA (California Consumer Privacy Act)</li>
              <li>ISO 27001 (Information Security Management)</li>
              <li>SOC 2 (Service Organization Control)</li>
            </ul>
          </div>

          {/* Reporting Security Issues */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Reporting Security Issues</h2>
            <p className="text-gray-600 mb-4">
              If you discover a security vulnerability or have concerns about our security practices, please report it to us immediately at noreply@lenslynx.art.
            </p>
            <p className="text-gray-600">
              We take all security reports seriously and will respond promptly to address any issues.
            </p>
          </div>

          {/* Best Practices */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Security Best Practices</h2>
            <p className="text-gray-600 mb-4">
              To help maintain the security of your account and data, we recommend:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Using strong, unique passwords</li>
              <li>Enabling two-factor authentication</li>
              <li>Keeping your software and devices updated</li>
              <li>Being cautious of phishing attempts</li>
              <li>Regularly reviewing your account activity</li>
            </ul>
          </div>

          {/* Contact */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Us</h2>
            <p className="text-gray-600">
              If you have any questions about our security measures, please contact our security team at noreply@lenslynx.art.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Security; 