import React from 'react';

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-light text-gray-900 mb-4">Terms of Service</h1>
          <p className="text-xl text-gray-600">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="mt-12 space-y-8">
          {/* Agreement to Terms */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Agreement to Terms</h2>
            <p className="text-gray-600 mb-4">
              By accessing our service, you agree to be bound by these Terms of Service and agree that you are responsible for compliance with any applicable local laws.
            </p>
            <p className="text-gray-600">
              If you do not agree with any of these terms, you are prohibited from using or accessing this service.
            </p>
          </div>

          {/* Use License */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Use License</h2>
            <p className="text-gray-600 mb-4">
              Permission is granted to temporarily use our service for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Modify or copy the materials</li>
              <li>Use the materials for any commercial purpose</li>
              <li>Attempt to decompile or reverse engineer any software contained in the service</li>
              <li>Remove any copyright or other proprietary notations from the materials</li>
              <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
            </ul>
          </div>

          {/* User Content */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">User Content</h2>
            <p className="text-gray-600 mb-4">
              Our service allows you to upload, post, and share content. You retain all rights to your content, but you grant us a license to use, modify, and process your content to provide our services.
            </p>
            <p className="text-gray-600">
              You are solely responsible for your content and the consequences of posting it. We do not endorse any user content or opinions expressed by users.
            </p>
          </div>

          {/* Service Limitations */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Service Limitations</h2>
            <p className="text-gray-600 mb-4">
              We strive to provide the best possible service, but we cannot guarantee that our service will be uninterrupted, timely, secure, or error-free. We reserve the right to modify or discontinue our service at any time without notice.
            </p>
          </div>

          {/* Usage Restrictions */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Usage Restrictions</h2>
            <p className="text-gray-600 mb-4">
              You agree not to use our service to:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Violate any laws or regulations</li>
              <li>Infringe upon the rights of others</li>
              <li>Upload or transmit any harmful code or malware</li>
              <li>Interfere with or disrupt the service</li>
              <li>Attempt to gain unauthorized access to our systems</li>
            </ul>
          </div>

          {/* Payment Terms */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Payment Terms</h2>
            <p className="text-gray-600 mb-4">
              Some features of our service may require payment. By subscribing to a paid plan, you agree to pay all fees in accordance with the pricing and payment terms presented to you.
            </p>
          </div>

          {/* Termination */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Termination</h2>
            <p className="text-gray-600 mb-4">
              We may terminate or suspend your access to our service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
            </p>
          </div>

          {/* Limitation of Liability */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Limitation of Liability</h2>
            <p className="text-gray-600 mb-4">
              In no event shall LensLynx be liable for any damages arising out of the use or inability to use our service, even if we have been notified of the possibility of such damages.
            </p>
          </div>

          {/* Changes to Terms */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Changes to Terms</h2>
            <p className="text-gray-600 mb-4">
              We reserve the right to modify these terms at any time. We will notify you of any changes by posting the new Terms of Service on this page and updating the "Last updated" date.
            </p>
          </div>

          {/* Contact */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Us</h2>
            <p className="text-gray-600">
              If you have any questions about these Terms of Service, please contact us at noreply@lenslynx.art.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService; 