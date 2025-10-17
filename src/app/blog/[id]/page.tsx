'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Calendar, Clock, Tag, ArrowLeft, Brain } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  cover_image?: string;
  category: { name: string; slug: string };
  published_at: string;
  tags: string[];
  view_count: number;
  meta_title?: string;
  meta_description?: string;
}

export default function BlogPostPage() {
  const params = useParams();
  const slug = params.id as string; // Next.js requires [id] for routing consistency
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPost();
  }, [slug]);

  const loadPost = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/cms/blog/${slug}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('Post not found');
        } else {
          setError('Failed to load post');
        }
        return;
      }
      
      const data = await response.json();
      
      if (data?.post) {
        setPost(data.post);
      } else {
        setError('Post not found');
      }
    } catch (error) {
      console.error('Failed to load post:', error);
      setError('Failed to load post');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {error || 'Post Not Found'}
          </h1>
          <Button asChild>
            <Link href="/blog">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Blog
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <Brain className="h-8 w-8 text-brand-600" />
              <span className="text-xl md:text-2xl font-bold gradient-text">AIDI</span>
            </Link>
            
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/" className="text-gray-600 hover:text-brand-600 transition-colors">
                Home
              </Link>
              <Link href="/methodology" className="text-gray-600 hover:text-brand-600 transition-colors">
                Methodology
              </Link>
              <Link href="/blog" className="text-brand-600 font-medium">
                Blog
              </Link>
              <Link href="/reports" className="text-gray-600 hover:text-brand-600 transition-colors">
                Industry Reports
              </Link>
              <Button variant="outline" size="sm" asChild>
                <Link href="/evaluate">Get Your Score</Link>
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Back to Blog */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Button variant="ghost" asChild className="text-gray-600 hover:text-brand-600">
            <Link href="/blog">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Blog
            </Link>
          </Button>
        </div>
      </div>

      {/* Article Content */}
      <article className="bg-white">
        <div className="max-w-4xl mx-auto px-4 py-12">
          {/* Category Badge */}
          {post.category && (
            <div className="mb-6">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full">
                {post.category.name}
              </span>
            </div>
          )}

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            {post.title}
          </h1>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              {post.excerpt}
            </p>
          )}

          {/* Metadata */}
          <div className="flex items-center gap-6 text-sm text-gray-500 mb-8 pb-8 border-b">
            <span className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {format(new Date(post.published_at), 'MMMM d, yyyy')}
            </span>
            <span className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {Math.ceil(post.content.length / 1000)} min read
            </span>
          </div>

          {/* Cover Image */}
          {post.cover_image && (
            <div className="mb-12">
              <img
                src={post.cover_image}
                alt={post.title}
                className="w-full h-auto rounded-xl"
              />
            </div>
          )}

          {/* Article Content - Simple pre-wrap display */}
          <div className="prose prose-lg prose-slate max-w-none">
            <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.8' }}>
              {post.content}
            </div>
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-12 pt-8 border-t">
              <div className="flex items-center gap-2 flex-wrap">
                <Tag className="h-4 w-4 text-gray-400" />
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* CTA Section */}
          <div className="mt-12 p-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white">
            <h3 className="text-2xl font-bold mb-4">
              Ready to Measure Your AI Visibility?
            </h3>
            <p className="text-lg mb-6 opacity-90">
              Get your AIDI score and see where your brand ranks in AI discoverability.
            </p>
            <div className="flex gap-4">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100" asChild>
                <Link href="/evaluate">Get Your AIDI Score</Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10" asChild>
                <Link href="/reports">View Industry Reports</Link>
              </Button>
            </div>
          </div>
        </div>
      </article>

      {/* Related Posts */}
      <div className="bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6">Continue Reading</h2>
          <div className="flex gap-4">
            <Button asChild>
              <Link href="/blog">
                <ArrowLeft className="h-4 w-4 mr-2" />
                All Posts
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/methodology">Our Methodology</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

