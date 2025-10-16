'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Clock, Tag, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  cover_image?: string;
  category: { name: string; slug: string };
  published_at: Date;
  tags: string[];
  view_count: number;
  author: { name: string };
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [featured, setFeatured] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const [postsRes, featuredRes] = await Promise.all([
        fetch('/api/cms/blog?status=published&limit=10'),
        fetch('/api/cms/blog?status=published&featured=true&limit=1')
      ]);

      const postsData = await postsRes.json();
      const featuredData = await featuredRes.json();

      setPosts(postsData.posts || []);
      setFeatured(featuredData.posts?.[0] || null);
    } catch (error) {
      console.error('Failed to load posts:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold mb-4">AIDI Blog</h1>
          <p className="text-xl text-gray-600">
            Insights on AEO, benchmarking methodology, and AI visibility trends
          </p>
        </div>
      </div>

      {/* Featured Post */}
      {featured && (
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="flex items-start gap-2 mb-4">
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-semibold rounded-full">
                Featured Post
              </span>
            </div>
            <Link href={`/blog/${featured.slug}`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 hover:opacity-90 transition-opacity">
                {featured.cover_image && (
                  <div className="relative h-80 rounded-xl overflow-hidden">
                    <Image
                      src={featured.cover_image}
                      alt={featured.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className={featured.cover_image ? '' : 'md:col-span-2'}>
                  <h2 className="text-3xl font-bold mb-4 hover:text-blue-600 transition-colors">
                    {featured.title}
                  </h2>
                  <p className="text-lg text-gray-600 mb-4">{featured.excerpt}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {format(new Date(featured.published_at), 'MMMM d, yyyy')}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      5 min read
                    </span>
                  </div>
                  <div className="mt-4">
                    <span className="text-blue-600 font-medium inline-flex items-center gap-1">
                      Read full article
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      )}

      {/* Posts Grid */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-8">Latest Posts</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`}>
              <article className="bg-white rounded-xl border hover:shadow-lg transition-shadow h-full flex flex-col">
                {post.cover_image && (
                  <div className="relative h-48 w-full rounded-t-xl overflow-hidden">
                    <Image
                      src={post.cover_image}
                      alt={post.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="p-6 flex-1 flex flex-col">
                  {post.category && (
                    <div className="mb-3">
                      <span className="text-xs font-semibold text-blue-600 uppercase">
                        {post.category.name}
                      </span>
                    </div>
                  )}
                  <h3 className="text-xl font-semibold mb-2 hover:text-blue-600 transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 flex-1">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(post.published_at), 'MMM d, yyyy')}
                    </span>
                    <span className="text-blue-600 font-medium">
                      Read →
                    </span>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>

        {posts.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p>No blog posts yet. Check back soon!</p>
          </div>
        )}
      </div>
    </div>
  );
}
