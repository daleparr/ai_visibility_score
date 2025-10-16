'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Calendar,
  Tag,
  Image as ImageIcon
} from 'lucide-react';
import { format } from 'date-fns';

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt?: string;
  content: string;
  cover_image?: string;
  category_id?: string;
  status: 'draft' | 'published' | 'archived';
  published_at?: Date;
  featured: boolean;
  meta_title?: string;
  meta_description?: string;
  tags?: string[];
  view_count: number;
  created_at: Date;
  updated_at: Date;
}

export function BlogManager() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [view, setView] = useState<'list' | 'edit' | 'create'>('list');
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [postsRes, catsRes] = await Promise.all([
        fetch('/api/cms/blog'),
        fetch('/api/cms/blog/categories')
      ]);
      const postsData = await postsRes.json();
      const catsData = await catsRes.json();
      setPosts(postsData.posts || []);
      setCategories(catsData.categories || []);
    } catch (error) {
      console.error('Failed to load blog data:', error);
    } finally {
      setLoading(false);
    }
  };

  const deletePost = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      await fetch(`/api/cms/blog/${id}`, { method: 'DELETE' });
      await loadData();
    } catch (error) {
      console.error('Failed to delete post:', error);
    }
  };

  if (view === 'list') {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Blog Manager</h1>
            <p className="text-gray-600 mt-1">
              Manage blog posts, categories, and content
            </p>
          </div>
          <Button onClick={() => {
            setSelectedPost(null);
            setView('create');
          }}>
            <Plus className="h-4 w-4 mr-2" />
            New Post
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-2xl font-bold">
              {posts.filter(p => p.status === 'published').length}
            </div>
            <div className="text-sm text-gray-600">Published</div>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-2xl font-bold">
              {posts.filter(p => p.status === 'draft').length}
            </div>
            <div className="text-sm text-gray-600">Drafts</div>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-2xl font-bold">
              {posts.reduce((acc, p) => acc + p.view_count, 0)}
            </div>
            <div className="text-sm text-gray-600">Total Views</div>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-2xl font-bold">
              {categories.length}
            </div>
            <div className="text-sm text-gray-600">Categories</div>
          </div>
        </div>

        {/* Posts List */}
        <div className="bg-white rounded-lg border">
          <div className="p-4 border-b">
            <h3 className="font-semibold">All Posts</h3>
          </div>
          <div className="divide-y">
            {posts.map((post) => (
              <div key={post.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium text-lg">{post.title}</h4>
                      <StatusBadge status={post.status} />
                      {post.featured && (
                        <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">
                          Featured
                        </span>
                      )}
                    </div>
                    {post.excerpt && (
                      <p className="text-sm text-gray-600 mb-2">{post.excerpt}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {post.published_at
                          ? format(new Date(post.published_at), 'MMM d, yyyy')
                          : 'Not published'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {post.view_count} views
                      </span>
                      {post.tags && post.tags.length > 0 && (
                        <span className="flex items-center gap-1">
                          <Tag className="h-3 w-3" />
                          {post.tags.length} tags
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedPost(post);
                        setView('edit');
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deletePost(post.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <BlogPostEditor
      post={selectedPost}
      categories={categories}
      onSave={async (postData) => {
        try {
          const method = selectedPost ? 'PUT' : 'POST';
          const url = selectedPost
            ? `/api/cms/blog/${selectedPost.id}`
            : '/api/cms/blog';

          await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postData)
          });

          await loadData();
          setView('list');
        } catch (error) {
          console.error('Failed to save post:', error);
        }
      }}
      onCancel={() => setView('list')}
    />
  );
}

function BlogPostEditor({
  post,
  categories,
  onSave,
  onCancel
}: {
  post: BlogPost | null;
  categories: any[];
  onSave: (data: any) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    title: post?.title || '',
    slug: post?.slug || '',
    excerpt: post?.excerpt || '',
    content: post?.content || '',
    cover_image: post?.cover_image || '',
    category_id: post?.category_id || '',
    status: post?.status || 'draft',
    featured: post?.featured || false,
    meta_title: post?.meta_title || '',
    meta_description: post?.meta_description || '',
    tags: post?.tags?.join(', ') || ''
  });

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleTitleChange = (title: string) => {
    setFormData({
      ...formData,
      title,
      slug: formData.slug || generateSlug(title)
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">
          {post ? 'Edit Post' : 'Create New Post'}
        </h1>
        <Button variant="outline" onClick={onCancel}>
          ← Back to List
        </Button>
      </div>

      <div className="bg-white rounded-lg border p-6 space-y-6">
        {/* Title & Slug */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="title">Post Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Enter post title"
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="slug">URL Slug *</Label>
            <Input
              id="slug"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              placeholder="url-friendly-slug"
              className="mt-2"
            />
            <p className="text-xs text-gray-500 mt-1">
              URL: /blog/{formData.slug || 'post-slug'}
            </p>
          </div>
        </div>

        {/* Excerpt */}
        <div>
          <Label htmlFor="excerpt">Excerpt</Label>
          <Textarea
            id="excerpt"
            value={formData.excerpt}
            onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
            placeholder="Brief summary (used in previews and SEO)"
            rows={3}
            className="mt-2"
          />
        </div>

        {/* Content */}
        <div>
          <Label htmlFor="content">Content (Markdown/MDX) *</Label>
          <Textarea
            id="content"
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            placeholder="Write your post content here..."
            rows={20}
            className="mt-2 font-mono text-sm"
          />
          <p className="text-xs text-gray-500 mt-1">
            Supports Markdown and MDX syntax
          </p>
        </div>

        {/* Cover Image & Category */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="cover_image">Cover Image URL</Label>
            <Input
              id="cover_image"
              value={formData.cover_image}
              onChange={(e) => setFormData({ ...formData, cover_image: e.target.value })}
              placeholder="https://..."
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="category">Category</Label>
            <select
              id="category"
              value={formData.category_id}
              onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
              className="w-full mt-2 h-10 px-3 rounded-md border bg-white"
            >
              <option value="">Uncategorized</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tags */}
        <div>
          <Label htmlFor="tags">Tags</Label>
          <Input
            id="tags"
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            placeholder="aeo, benchmarking, methodology (comma-separated)"
            className="mt-2"
          />
        </div>

        {/* SEO */}
        <div className="space-y-4 pt-4 border-t">
          <h3 className="font-semibold">SEO Settings</h3>
          <div>
            <Label htmlFor="meta_title">Meta Title</Label>
            <Input
              id="meta_title"
              value={formData.meta_title}
              onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
              placeholder="Defaults to post title"
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="meta_description">Meta Description</Label>
            <Textarea
              id="meta_description"
              value={formData.meta_description}
              onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
              placeholder="SEO description (160 characters recommended)"
              rows={2}
              className="mt-2"
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.meta_description.length}/160 characters
            </p>
          </div>
        </div>

        {/* Options */}
        <div className="flex gap-6 pt-4 border-t">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.featured}
              onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
              className="rounded"
            />
            <span className="text-sm">Featured post</span>
          </label>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t">
          <Button
            onClick={() => onSave({
              ...formData,
              tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
              status: 'published',
              published_at: new Date()
            })}
          >
            Publish
          </Button>
          <Button
            variant="outline"
            onClick={() => onSave({
              ...formData,
              tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
              status: 'draft'
            })}
          >
            Save as Draft
          </Button>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config = {
    published: 'bg-green-100 text-green-800',
    draft: 'bg-gray-100 text-gray-800',
    archived: 'bg-red-100 text-red-800'
  };

  return (
    <span className={`px-2 py-0.5 text-xs font-medium rounded ${config[status as keyof typeof config]}`}>
      {status}
    </span>
  );
}

