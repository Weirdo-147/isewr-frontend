import React from 'react';

const Careers = () => {
  const jobOpenings = [
    {
      title: 'Senior AI Engineer',
      department: 'Engineering',
      location: 'San Francisco, CA',
      type: 'Full-time',
      description: 'Join our AI team to develop cutting-edge image and video processing algorithms.',
      requirements: [
        '5+ years of experience in AI/ML',
        'Strong Python skills',
        'Experience with deep learning frameworks',
        'PhD in Computer Science or related field',
      ],
    },
    {
      title: 'Frontend Developer',
      department: 'Engineering',
      location: 'Remote',
      type: 'Full-time',
      description: 'Help build beautiful and intuitive user interfaces for our AI-powered tools.',
      requirements: [
        '3+ years of React experience',
        'Strong JavaScript skills',
        'Experience with modern CSS frameworks',
        'Understanding of web performance',
      ],
    },
    {
      title: 'Product Manager',
      department: 'Product',
      location: 'San Francisco, CA',
      type: 'Full-time',
      description: 'Lead the development of our AI-powered image and video processing products.',
      requirements: [
        '4+ years of product management experience',
        'Experience with AI/ML products',
        'Strong analytical skills',
        'Excellent communication abilities',
      ],
    },
  ];

  const benefits = [
    {
      title: 'Health & Wellness',
      description: 'Comprehensive health coverage, wellness programs, and mental health support',
      icon: (
        <svg className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
    },
    {
      title: 'Learning & Development',
      description: 'Annual learning budget, conference attendance, and professional development opportunities',
      icon: (
        <svg className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
    },
    {
      title: 'Work-Life Balance',
      description: 'Flexible work hours, remote work options, and unlimited PTO',
      icon: (
        <svg className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-light text-gray-900 mb-4">Join Our Team</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Help us revolutionize image and video processing with AI technology
          </p>
        </div>

        {/* Benefits Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-semibold text-gray-900 mb-8 text-center">Why Work With Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((benefit) => (
              <div key={benefit.title} className="bg-white p-6 rounded-lg shadow-lg">
                <div className="flex items-center mb-4">
                  {benefit.icon}
                  <h3 className="ml-3 text-lg font-medium text-gray-900">{benefit.title}</h3>
                </div>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Job Openings */}
        <div className="mt-16">
          <h2 className="text-2xl font-semibold text-gray-900 mb-8">Open Positions</h2>
          <div className="space-y-8">
            {jobOpenings.map((job) => (
              <div key={job.title} className="bg-white p-6 rounded-lg shadow-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{job.title}</h3>
                    <p className="text-gray-600">{job.department}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-600">{job.location}</p>
                    <p className="text-gray-600">{job.type}</p>
                  </div>
                </div>
                <p className="mt-4 text-gray-600">{job.description}</p>
                <div className="mt-4">
                  <h4 className="font-medium text-gray-900">Requirements:</h4>
                  <ul className="mt-2 list-disc list-inside text-gray-600">
                    {job.requirements.map((req) => (
                      <li key={req}>{req}</li>
                    ))}
                  </ul>
                </div>
                <div className="mt-6">
                  <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-500 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500">
                    Apply Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Careers; 