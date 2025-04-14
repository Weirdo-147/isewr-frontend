import React from 'react';

const Blog = () => {
  const featuredPost = {
    title: 'The Future of AI in Image Processing',
    excerpt: 'Exploring how artificial intelligence is revolutionizing the way we handle and transform images, from basic editing to advanced artistic transformations.',
    date: 'March 15, 2024',
    author: 'Emily Thompson',
    image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e',
    category: 'Technology',
  };

  const recentPosts = [
    {
      title: 'Getting Started with Image Recognition',
      excerpt: 'A comprehensive guide to understanding and implementing image recognition in your projects.',
      date: 'March 10, 2024',
      author: 'Michael Rodriguez',
      image: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb',
      category: 'Tutorials',
    },
    {
      title: 'Best Practices for Video Conversion',
      excerpt: 'Learn the essential tips and tricks for achieving the best video conversion results.',
      date: 'March 5, 2024',
      author: 'Sarah Chen',
      image: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4',
      category: 'Tips & Tricks',
    },
    {
      title: 'Understanding Deep Fake Technology',
      excerpt: 'A deep dive into the technology behind deep fakes and how to detect them.',
      date: 'February 28, 2024',
      author: 'Emily Thompson',
      image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b',
      category: 'Technology',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-light text-gray-900 mb-4">Blog</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Insights, tutorials, and updates from the LensLynx team
          </p>
        </div>

        {/* Featured Post */}
        <div className="mt-16">
          <h2 className="text-2xl font-semibold text-gray-900 mb-8">Featured Post</h2>
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="md:flex">
              <div className="md:flex-shrink-0">
                <img
                  className="h-48 w-full object-cover md:w-96"
                  src={featuredPost.image}
                  alt={featuredPost.title}
                />
              </div>
              <div className="p-8">
                <div className="uppercase tracking-wide text-sm text-yellow-500 font-semibold">
                  {featuredPost.category}
                </div>
                <h3 className="mt-2 text-2xl font-semibold text-gray-900">
                  {featuredPost.title}
                </h3>
                <p className="mt-4 text-gray-600">{featuredPost.excerpt}</p>
                <div className="mt-6 flex items-center">
                  <div className="flex-shrink-0">
                    <span className="text-sm text-gray-500">By {featuredPost.author}</span>
                  </div>
                  <div className="ml-4">
                    <span className="text-sm text-gray-500">{featuredPost.date}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Posts */}
        <div className="mt-16">
          <h2 className="text-2xl font-semibold text-gray-900 mb-8">Recent Posts</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {recentPosts.map((post) => (
              <div key={post.title} className="bg-white rounded-lg shadow-lg overflow-hidden">
                <img
                  className="h-48 w-full object-cover"
                  src={post.image}
                  alt={post.title}
                />
                <div className="p-6">
                  <div className="uppercase tracking-wide text-sm text-yellow-500 font-semibold">
                    {post.category}
                  </div>
                  <h3 className="mt-2 text-xl font-semibold text-gray-900">
                    {post.title}
                  </h3>
                  <p className="mt-4 text-gray-600">{post.excerpt}</p>
                  <div className="mt-6 flex items-center">
                    <div className="flex-shrink-0">
                      <span className="text-sm text-gray-500">By {post.author}</span>
                    </div>
                    <div className="ml-4">
                      <span className="text-sm text-gray-500">{post.date}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Blog; 