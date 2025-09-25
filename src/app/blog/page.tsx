import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Calendar, User, ArrowRight, Rss } from 'lucide-react'

export default function BlogPage() {
  const posts = [
    {
      id: 1,
      title: "🚫 Why SEO Crawlers Won’t Save You in the Age of AI Search",
      excerpt: "For the last 20 years, SEO tools have ruled digital visibility. They crawled your site, counted your tags, and told you whether Google’s spiders could index your pages. That era is ending.",
      author: "ADI Team",
      date: "2025-09-24",
      category: "Industry Analysis",
      readTime: "4 min read"
    },
    {
      id: 2,
      title: "The Future of AI Discoverability: What Brands Need to Know",
      excerpt: "As AI models become the primary way users discover information, brands must adapt their digital presence to remain visible and competitive.",
      author: "ADI Team",
      date: "2024-01-15",
      category: "Industry Insights",
      readTime: "5 min read"
    },
    {
      id: 3,
      title: "Understanding the ADI Framework: A Deep Dive",
      excerpt: "Explore the three pillars of AI discoverability and learn how each dimension impacts your brand's visibility across AI platforms.",
      author: "ADI Team",
      date: "2024-01-10",
      category: "Framework",
      readTime: "8 min read"
    },
    {
      id: 4,
      title: "Case Study: How Leading Brands Optimize for AI Discovery",
      excerpt: "Real-world examples of brands that have successfully improved their AI discoverability scores and the strategies they used.",
      author: "ADI Team",
      date: "2024-01-05",
      category: "Case Studies",
      readTime: "6 min read"
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Rss className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Blog</h1>
                <p className="text-gray-600 mt-1">Insights on AI discoverability and brand optimization</p>
              </div>
            </div>
            <Button variant="outline" disabled>
              Subscribe to Updates
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Featured Post */}
        <div className="mb-8">
          <Card className="border-2 border-blue-100">
            <CardHeader>
              <div className="flex items-center space-x-2 mb-2">
                <Badge variant="secondary" className="bg-blue-100 text-blue-700">Featured</Badge>
                <Badge variant="outline">{posts[0].category}</Badge>
              </div>
              <CardTitle className="text-2xl">
                {posts[0].title}
              </CardTitle>
              <CardDescription className="text-base">
                {posts[0].excerpt}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <User className="h-4 w-4" />
                    <span>{posts[0].author}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(posts[0].date).toLocaleDateString()}</span>
                  </div>
                  <span>{posts[0].readTime}</span>
                </div>
                <Button variant="outline" size="sm" disabled>
                  Read More
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Posts */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Posts</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.slice(1).map((post) => (
              <Card key={post.id} className="h-full">
                <CardHeader>
                  <div className="flex items-center space-x-2 mb-2">
                    <Badge variant="outline">{post.category}</Badge>
                  </div>
                  <CardTitle className="text-lg line-clamp-2">
                    {post.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-3">
                    {post.excerpt}
                  </CardDescription>
                </CardHeader>
                <CardContent className="mt-auto">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      <div className="flex items-center space-x-1 mb-1">
                        <User className="h-3 w-3" />
                        <span>{post.author}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(post.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {post.readTime}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="w-full mt-3" disabled>
                    Read More
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Newsletter Signup */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardHeader className="text-center">
            <CardTitle>Stay Updated</CardTitle>
            <CardDescription>
              Get the latest insights on AI discoverability delivered to your inbox
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button disabled>
              Subscribe to Newsletter
            </Button>
            <p className="text-xs text-gray-500 mt-2">
              Newsletter coming soon
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}