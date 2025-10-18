'use client';

import { useEffect, useState } from 'react';
import { FigmaBlogPage } from '@/components/FigmaBlogPage';
import { BlogPageWithData } from '@/components/BlogPageWithData';

export default function BlogPage() {
  const [useRealData, setUseRealData] = useState(false);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try to fetch real blog posts from the database
    const fetchPosts = async () => {
      try {
        const response = await fetch('/api/cms/blog?status=published&limit=10');
        if (response.ok) {
          const data = await response.json();
          if (data.posts && data.posts.length > 0) {
            setPosts(data.posts);
            setUseRealData(true);
          }
        }
      } catch (error) {
        console.error('Failed to fetch blog posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">Loading blog posts...</div>
      </div>
    );
  }

  // Use real data if available, otherwise fall back to Figma design
  if (useRealData) {
    return <BlogPageWithData posts={posts} />;
  }

  // Fallback to Figma design with mock data
  return <FigmaBlogPage />;
}
