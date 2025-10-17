/**
 * CMS Client - Content Management System
 * Handles theme, content, blog, and job management
 */

import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

// ============================================================================
// TYPES
// ============================================================================

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  foreground: string;
  muted: string;
  border: string;
  // Additional semantic colors
  success?: string;
  warning?: string;
  error?: string;
  info?: string;
}

export interface ThemeFonts {
  heading: string;
  body: string;
  mono: string;
}

export interface TypographyScale {
  heading: {
    h1: { size: string; weight: string; lineHeight: string };
    h2: { size: string; weight: string; lineHeight: string };
    h3: { size: string; weight: string; lineHeight: string };
    h4: { size: string; weight: string; lineHeight: string };
  };
  body: {
    base: { size: string; lineHeight: string };
    large: { size: string; lineHeight: string };
    small: { size: string; lineHeight: string };
  };
}

export interface ContentBlock {
  id: string;
  page_id: string;
  block_key: string;
  block_type: 'text' | 'richtext' | 'json' | 'image' | 'video';
  content: any;
  display_order: number;
  is_visible: boolean;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt?: string;
  content: string;
  cover_image?: string;
  category_id?: string;
  author_id: string;
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

export interface JobPosting {
  id: string;
  slug: string;
  title: string;
  department: string;
  location: string;
  employment_type: string;
  experience_level: string;
  salary_range?: string;
  description: string;
  requirements: string[];
  nice_to_have?: string[];
  category_id?: string;
  status: 'open' | 'closed' | 'draft';
  apply_url?: string;
  apply_email?: string;
  posted_at?: Date;
  closes_at?: Date;
  view_count: number;
  application_count: number;
}

// ============================================================================
// THEME MANAGEMENT
// ============================================================================

export class ThemeManager {
  async getThemeColors(): Promise<ThemeColors> {
    const result = await db.execute(
      sql`SELECT value FROM site_settings WHERE key = 'theme_colors'`
    );
    return result.rows[0]?.value as ThemeColors || this.getDefaultColors();
  }

  async updateThemeColors(colors: ThemeColors, userId: string): Promise<void> {
    await db.execute(
      sql`
        UPDATE site_settings 
        SET value = ${JSON.stringify(colors)}::jsonb,
            updated_by = ${userId},
            updated_at = NOW()
        WHERE key = 'theme_colors'
      `
    );
  }

  async getThemeFonts(): Promise<ThemeFonts> {
    const result = await db.execute(
      sql`SELECT value FROM site_settings WHERE key = 'theme_fonts'`
    );
    return result.rows[0]?.value as ThemeFonts || this.getDefaultFonts();
  }

  async updateThemeFonts(fonts: ThemeFonts, userId: string): Promise<void> {
    await db.execute(
      sql`
        UPDATE site_settings 
        SET value = ${JSON.stringify(fonts)}::jsonb,
            updated_by = ${userId},
            updated_at = NOW()
        WHERE key = 'theme_fonts'
      `
    );
  }

  async getTypography(): Promise<TypographyScale> {
    const result = await db.execute(
      sql`SELECT value FROM site_settings WHERE key = 'theme_typography'`
    );
    return result.rows[0]?.value as TypographyScale || this.getDefaultTypography();
  }

  async updateTypography(typography: TypographyScale, userId: string): Promise<void> {
    await db.execute(
      sql`
        UPDATE site_settings 
        SET value = ${JSON.stringify(typography)}::jsonb,
            updated_by = ${userId},
            updated_at = NOW()
        WHERE key = 'theme_typography'
      `
    );
  }

  private getDefaultColors(): ThemeColors {
    return {
      primary: '#2563EB',
      secondary: '#7C3AED',
      accent: '#059669',
      background: '#FFFFFF',
      foreground: '#1F2937',
      muted: '#F3F4F6',
      border: '#E5E7EB',
      success: '#16A34A',
      warning: '#EA580C',
      error: '#DC2626',
      info: '#2563EB'
    };
  }

  private getDefaultFonts(): ThemeFonts {
    return {
      heading: 'Inter',
      body: 'Inter',
      mono: 'JetBrains Mono'
    };
  }

  private getDefaultTypography(): TypographyScale {
    return {
      heading: {
        h1: { size: '3.5rem', weight: '700', lineHeight: '1.1' },
        h2: { size: '2.5rem', weight: '600', lineHeight: '1.2' },
        h3: { size: '1.875rem', weight: '600', lineHeight: '1.3' },
        h4: { size: '1.5rem', weight: '600', lineHeight: '1.4' }
      },
      body: {
        base: { size: '1rem', lineHeight: '1.6' },
        large: { size: '1.125rem', lineHeight: '1.7' },
        small: { size: '0.875rem', lineHeight: '1.5' }
      }
    };
  }

  /**
   * Generate CSS variables from theme settings
   */
  async generateCSSVariables(): Promise<string> {
    const colors = await this.getThemeColors();
    const fonts = await this.getThemeFonts();
    const typography = await this.getTypography();

    return `
:root {
  /* Colors */
  --color-primary: ${colors.primary};
  --color-secondary: ${colors.secondary};
  --color-accent: ${colors.accent};
  --color-background: ${colors.background};
  --color-foreground: ${colors.foreground};
  --color-muted: ${colors.muted};
  --color-border: ${colors.border};
  --color-success: ${colors.success || '#16A34A'};
  --color-warning: ${colors.warning || '#EA580C'};
  --color-error: ${colors.error || '#DC2626'};
  --color-info: ${colors.info || '#2563EB'};
  
  /* Fonts */
  --font-heading: ${fonts.heading}, sans-serif;
  --font-body: ${fonts.body}, sans-serif;
  --font-mono: ${fonts.mono}, monospace;
  
  /* Typography */
  --text-h1-size: ${typography.heading.h1.size};
  --text-h1-weight: ${typography.heading.h1.weight};
  --text-h1-line-height: ${typography.heading.h1.lineHeight};
  
  --text-h2-size: ${typography.heading.h2.size};
  --text-h2-weight: ${typography.heading.h2.weight};
  --text-h2-line-height: ${typography.heading.h2.lineHeight};
  
  --text-base-size: ${typography.body.base.size};
  --text-base-line-height: ${typography.body.base.lineHeight};
}
    `.trim();
  }
}

// ============================================================================
// CONTENT MANAGEMENT
// ============================================================================

export class ContentManager {
  async getAllPages(): Promise<any[]> {
    const result = await db.execute(
      sql`SELECT id, slug, title, status, published_at FROM cms_pages ORDER BY title ASC`
    );
    return result.rows as any;
  }

  async getPage(slug: string): Promise<any> {
    const result = await db.execute(
      sql`SELECT * FROM cms_pages WHERE slug = ${slug} AND status = 'published'`
    );
    return result.rows[0];
  }

  async getPageBlocks(pageId: string, includeHidden: boolean = false): Promise<ContentBlock[]> {
    const result = await db.execute(
      includeHidden
        ? sql`
            SELECT * FROM content_blocks 
            WHERE page_id = ${pageId}
            ORDER BY display_order ASC
          `
        : sql`
            SELECT * FROM content_blocks 
            WHERE page_id = ${pageId} AND is_visible = true
            ORDER BY display_order ASC
          `
    );
    return result.rows as any;
  }
  
  async getAllBlocksForPage(pageSlug: string): Promise<ContentBlock[]> {
    const result = await db.execute(
      sql`
        SELECT cb.* FROM content_blocks cb
        JOIN cms_pages p ON p.id = cb.page_id
        WHERE p.slug = ${pageSlug}
        ORDER BY cb.display_order ASC
      `
    );
    return result.rows as any;
  }

  async getBlockByKey(pageSlug: string, blockKey: string): Promise<any> {
    const result = await db.execute(
      sql`
        SELECT cb.* FROM content_blocks cb
        JOIN cms_pages p ON p.id = cb.page_id
        WHERE p.slug = ${pageSlug} AND cb.block_key = ${blockKey}
        AND p.status = 'published' AND cb.is_visible = true
      `
    );
    return result.rows[0]?.content;
  }

  async updateBlock(
    pageSlug: string,
    blockKey: string,
    content: any,
    userId: string
  ): Promise<void> {
    await db.execute(
      sql`
        UPDATE content_blocks cb
        SET content = ${JSON.stringify(content)}::jsonb,
            updated_by = ${userId},
            updated_at = NOW()
        FROM cms_pages p
        WHERE cb.page_id = p.id 
        AND p.slug = ${pageSlug} 
        AND cb.block_key = ${blockKey}
      `
    );
  }

  async createBlock(
    pageSlug: string,
    blockKey: string,
    blockType: ContentBlock['block_type'],
    content: any,
    userId: string
  ): Promise<void> {
    await db.execute(
      sql`
        INSERT INTO content_blocks (page_id, block_key, block_type, content, updated_by)
        SELECT p.id, ${blockKey}, ${blockType}, ${JSON.stringify(content)}::jsonb, ${userId}
        FROM cms_pages p
        WHERE p.slug = ${pageSlug}
      `
    );
  }
}

// ============================================================================
// BLOG MANAGEMENT
// ============================================================================

export class BlogManager {
  async getPosts(options: {
    status?: 'draft' | 'published' | 'archived';
    category?: string;
    featured?: boolean;
    limit?: number;
    offset?: number;
  } = {}): Promise<BlogPost[]> {
    const { status = 'published', category, featured, limit = 10, offset = 0 } = options;

    let query = sql`SELECT * FROM blog_posts WHERE status = ${status}`;

    if (category) {
      query = sql`${query} AND category_id = (SELECT id FROM blog_categories WHERE slug = ${category})`;
    }

    if (featured !== undefined) {
      query = sql`${query} AND featured = ${featured}`;
    }

    query = sql`${query} ORDER BY published_at DESC LIMIT ${limit} OFFSET ${offset}`;

    const result = await db.execute(query);
    return result.rows as any;
  }

  async getPost(slug: string): Promise<BlogPost | null> {
    const result = await db.execute(
      sql`SELECT * FROM blog_posts WHERE slug = ${slug}`
    );
    return result.rows[0] as any || null;
  }

  async createPost(post: Partial<BlogPost>, authorId: string): Promise<string> {
    const result = await db.execute(
      sql`
        INSERT INTO blog_posts (
          slug, title, excerpt, content, cover_image, category_id,
          author_id, status, meta_title, meta_description, tags
        ) VALUES (
          ${post.slug},
          ${post.title},
          ${post.excerpt || ''},
          ${post.content},
          ${post.cover_image || ''},
          ${post.category_id || null},
          ${authorId},
          ${post.status || 'draft'},
          ${post.meta_title || post.title},
          ${post.meta_description || post.excerpt || ''},
          ${post.tags || []}
        )
        RETURNING id
      `
    );
    return result.rows[0].id;
  }

  async updatePost(id: string, updates: Partial<BlogPost>): Promise<void> {
    const updateFields: string[] = [];
    const values: any[] = [];

    if (updates.title) {
      updateFields.push('title = $' + (values.length + 1));
      values.push(updates.title);
    }
    if (updates.content) {
      updateFields.push('content = $' + (values.length + 1));
      values.push(updates.content);
    }
    if (updates.status) {
      updateFields.push('status = $' + (values.length + 1));
      values.push(updates.status);
    }

    if (updateFields.length > 0) {
      updateFields.push('updated_at = NOW()');
      await db.execute(
        sql.raw(`UPDATE blog_posts SET ${updateFields.join(', ')} WHERE id = '${id}'`)
      );
    }
  }

  async incrementViewCount(slug: string): Promise<void> {
    await db.execute(
      sql`UPDATE blog_posts SET view_count = view_count + 1 WHERE slug = ${slug}`
    );
  }
}

// ============================================================================
// JOB MANAGEMENT
// ============================================================================

export class JobManager {
  async getJobs(options: {
    status?: 'open' | 'closed' | 'draft';
    department?: string;
    limit?: number;
  } = {}): Promise<JobPosting[]> {
    const { status = 'open', department, limit = 20 } = options;

    let query = sql`SELECT * FROM job_postings WHERE status = ${status}`;

    if (department) {
      query = sql`${query} AND department = ${department}`;
    }

    query = sql`${query} ORDER BY posted_at DESC LIMIT ${limit}`;

    const result = await db.execute(query);
    return result.rows as any;
  }

  async getJob(slug: string): Promise<JobPosting | null> {
    const result = await db.execute(
      sql`SELECT * FROM job_postings WHERE slug = ${slug}`
    );
    return result.rows[0] as any || null;
  }

  async createJob(job: Partial<JobPosting>): Promise<string> {
    const result = await db.execute(
      sql`
        INSERT INTO job_postings (
          slug, title, department, location, employment_type, 
          experience_level, salary_range, description, requirements,
          nice_to_have, status, apply_url, apply_email
        ) VALUES (
          ${job.slug},
          ${job.title},
          ${job.department},
          ${job.location},
          ${job.employment_type},
          ${job.experience_level},
          ${job.salary_range || ''},
          ${job.description},
          ${job.requirements || []},
          ${job.nice_to_have || []},
          ${job.status || 'draft'},
          ${job.apply_url || ''},
          ${job.apply_email || ''}
        )
        RETURNING id
      `
    );
    return result.rows[0].id;
  }

  async incrementApplicationCount(slug: string): Promise<void> {
    await db.execute(
      sql`
        UPDATE job_postings 
        SET application_count = application_count + 1 
        WHERE slug = ${slug}
      `
    );
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export const themeManager = new ThemeManager();
export const contentManager = new ContentManager();
export const blogManager = new BlogManager();
export const jobManager = new JobManager();

