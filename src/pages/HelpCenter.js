import React, { useState } from 'react';

const HelpCenter = () => {
  const [activeCategory, setActiveCategory] = useState('general');

  const categories = [
    { id: 'general', name: 'General' },
    { id: 'recognition', name: 'Image Recognition' },
    { id: 'video', name: 'Video Conversion' },
    { id: 'processing', name: 'Image Processing' },
    { id: 'billing', name: 'Billing & Plans' },
  ];

  const faqs = {
    general: [
      {
        question: 'What is LensLynx?',
        answer: 'LensLynx is an AI-powered platform that provides advanced image and video processing capabilities, including image recognition, video conversion, and image processing with various effects and filters.',
      },
      {
        question: 'How do I get started?',
        answer: 'Getting started is easy! Simply sign up for an account, choose a plan that suits your needs, and you can start using our services right away. We offer a free tier to help you explore our features.',
      },
      {
        question: 'What file formats are supported?',
        answer: 'We support all major image formats including JPEG, PNG, GIF, and WebP. For video conversion, we support MP4, MOV, and AVI formats.',
      },
    ],
    recognition: [
      {
        question: 'How accurate is the image recognition?',
        answer: 'Our image recognition system is highly accurate, with a success rate of over 95% for common objects and scenes. The accuracy may vary depending on the complexity of the image and the specific category being analyzed.',
      },
      {
        question: 'Can I train the system for custom objects?',
        answer: 'Yes! We offer custom training capabilities for enterprise users. Contact our support team to learn more about custom model training.',
      },
      {
        question: 'What categories can be recognized?',
        answer: 'We support recognition across 15+ categories including people, animals, food, vehicles, architecture, and more. Each category is optimized for specific types of objects and scenes.',
      },
    ],
    video: [
      {
        question: 'What is the maximum video duration?',
        answer: 'The maximum video duration depends on your plan. Free users can create videos up to 10 seconds, while paid plans support videos up to 60 seconds.',
      },
      {
        question: 'What animation styles are available?',
        answer: 'We offer 5 animation styles: Zoom, Pan, Rotate, Bounce, and Fade. Each style can be customized with different parameters to achieve your desired effect.',
      },
      {
        question: 'Can I add music to my videos?',
        answer: 'Yes! You can add background music to your videos. We provide a library of royalty-free music, or you can upload your own audio files.',
      },
    ],
    processing: [
      {
        question: 'What filters are available?',
        answer: 'We offer a wide range of filters including Vintage, Cinematic, Dramatic, and Dreamy. Each filter can be adjusted with parameters like intensity and color balance.',
      },
      {
        question: 'Can I remove backgrounds from images?',
        answer: 'Yes! Our background removal feature uses advanced AI to accurately detect and remove backgrounds from images. You can replace the background with a solid color or another image.',
      },
      {
        question: 'How do I adjust image settings?',
        answer: 'You can adjust various image settings including brightness, contrast, saturation, and blur. Each adjustment can be fine-tuned using intuitive sliders.',
      },
    ],
    billing: [
      {
        question: 'What plans are available?',
        answer: 'We offer Free, Pro, and Enterprise plans. Each plan includes different features and usage limits. Check our pricing page for detailed information.',
      },
      {
        question: 'How does billing work?',
        answer: 'Billing is monthly or annual, depending on your preference. You can upgrade or downgrade your plan at any time. Usage beyond your plan limits is charged per unit.',
      },
      {
        question: 'Do you offer refunds?',
        answer: 'Yes, we offer a 14-day money-back guarantee for all paid plans. If you&apos;re not satisfied with our service, contact our support team for a refund.',
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-light text-gray-900 mb-4">Help Center</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Find answers to common questions and get support for LensLynx
          </p>
        </div>

        {/* Search Bar */}
        <div className="mt-8 max-w-2xl mx-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="Search for help..."
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            />
            <button className="absolute right-3 top-3 text-gray-400 hover:text-gray-600">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Categories */}
        <div className="mt-12">
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-6 py-2 rounded-full text-sm font-medium ${
                  activeCategory === category.id
                    ? 'bg-yellow-500 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* FAQs */}
        <div className="mt-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {faqs[activeCategory].map((faq, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-2">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Support */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Still Need Help?</h2>
          <p className="text-gray-600 mb-8">
            Our support team is here to help you with any questions or issues you may have.
          </p>
          <a 
            href="/contact" 
            className="inline-flex items-center px-6 py-3 border border-yellow-600 text-base font-medium rounded-md shadow-sm text-gray-900 bg-yellow-500 hover:bg-yellow-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors duration-200"
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
};

export default HelpCenter; 