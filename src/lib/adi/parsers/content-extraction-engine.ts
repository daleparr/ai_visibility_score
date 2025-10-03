/**
 * Content Extraction Engine
 * Advanced content analysis and extraction using the Enhanced HTML Parser
 * Provides intelligent content categorization and business intelligence
 */

import { EnhancedHTMLParser, ContentExtractionResult, HTMLParsingUtils } from './enhanced-html-parser';

export interface BusinessIntelligence {
  industry: string;
  businessType: string;
  products: Array<{
    name: string;
    price?: string;
    description?: string;
    category?: string;
  }>;
  services: string[];
  locations: string[];
  contactInfo: {
    emails: string[];
    phones: string[];
    addresses: string[];
  };
  socialMedia: Record<string, string>;
  brandMentions: number;
  competitorMentions: string[];
  keyTopics: string[];
  contentQuality: {
    score: number;
    factors: string[];
  };
}

export interface SEOInsights {
  titleOptimization: {
    score: number;
    issues: string[];
    suggestions: string[];
  };
  metaDescription: {
    score: number;
    issues: string[];
    suggestions: string[];
  };
  headingStructure: {
    score: number;
    issues: string[];
    h1Count: number;
    missingLevels: number[];
  };
  contentAnalysis: {
    wordCount: number;
    readabilityScore: number;
    keywordDensity: Record<string, number>;
    duplicateContent: boolean;
  };
  technicalSEO: {
    structuredDataPresent: boolean;
    canonicalUrl?: string;
    robotsDirectives?: string;
    imageOptimization: number;
  };
}

export interface AccessibilityAudit {
  score: number;
  issues: Array<{
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    element?: string;
  }>;
  improvements: string[];
}

export class ContentExtractionEngine {
  private parser: EnhancedHTMLParser;
  private extractionResult: ContentExtractionResult | null = null;

  constructor() {
    this.parser = new EnhancedHTMLParser();
  }

  /**
   * Process HTML content and extract comprehensive insights
   */
  async processHTML(html: string, url?: string): Promise<{
    content: ContentExtractionResult;
    businessIntelligence: BusinessIntelligence;
    seoInsights: SEOInsights;
    accessibility: AccessibilityAudit;
  }> {
    try {
      // Parse HTML
      await this.parser.parseHTML(html, url);
      
      // Extract all content
      this.extractionResult = this.parser.extractAll();
      
      // Generate insights
      const businessIntelligence = this.generateBusinessIntelligence();
      const seoInsights = this.generateSEOInsights();
      const accessibility = this.auditAccessibility();
      
      return {
        content: this.extractionResult,
        businessIntelligence,
        seoInsights,
        accessibility
      };
    } catch (error) {
      console.error('Content extraction failed:', error);
      throw new Error(`Content extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate business intelligence from extracted content
   */
  private generateBusinessIntelligence(): BusinessIntelligence {
    if (!this.extractionResult) throw new Error('No extraction result available');

    const { content, structuredData, seo } = this.extractionResult;
    
    // Industry detection based on keywords and structured data
    const industry = this.detectIndustry();
    const businessType = this.detectBusinessType();
    
    // Extract products from structured data and content
    const products = this.extractProducts();
    
    // Extract services
    const services = this.extractServices();
    
    // Extract locations
    const locations = this.extractLocations();
    
    // Contact information
    const rawContactInfo = HTMLParsingUtils.extractContactInfo(this.parser);
    const contactInfo = {
      emails: rawContactInfo.emails || [],
      phones: rawContactInfo.phones || [],
      addresses: rawContactInfo.addresses || []
    };
    
    // Social media
    const socialMedia = HTMLParsingUtils.extractSocialLinks(this.parser);
    
    // Brand mentions analysis
    const brandMentions = this.countBrandMentions();
    
    // Competitor analysis
    const competitorMentions = this.detectCompetitorMentions();
    
    // Key topics extraction
    const keyTopics = this.extractKeyTopics();
    
    // Content quality assessment
    const contentQuality = this.assessContentQuality();
    
    return {
      industry,
      businessType,
      products,
      services,
      locations,
      contactInfo,
      socialMedia,
      brandMentions,
      competitorMentions,
      keyTopics,
      contentQuality
    };
  }

  /**
   * Generate SEO insights and recommendations
   */
  private generateSEOInsights(): SEOInsights {
    if (!this.extractionResult) throw new Error('No extraction result available');

    const { title, description, headings, metadata, seo } = this.extractionResult;
    
    // Title optimization
    const titleOptimization = this.analyzeTitleOptimization(title);
    
    // Meta description analysis
    const metaDescriptionAnalysis = this.analyzeMetaDescription(description);
    
    // Heading structure analysis
    const headingStructure = this.analyzeHeadingStructure(headings);
    
    // Content analysis
    const contentAnalysis = {
      wordCount: seo.wordCount,
      readabilityScore: seo.readabilityScore,
      keywordDensity: seo.keywordDensity,
      duplicateContent: this.detectDuplicateContent()
    };
    
    // Technical SEO
    const technicalSEO = {
      structuredDataPresent: this.extractionResult.structuredData.length > 0,
      canonicalUrl: metadata.canonical,
      robotsDirectives: metadata.robots,
      imageOptimization: this.calculateImageOptimization()
    };
    
    return {
      titleOptimization,
      metaDescription: metaDescriptionAnalysis,
      headingStructure,
      contentAnalysis,
      technicalSEO
    };
  }

  /**
   * Audit accessibility issues
   */
  private auditAccessibility(): AccessibilityAudit {
    const issues: AccessibilityAudit['issues'] = [];
    const improvements: string[] = [];
    
    // Check for missing alt text
    const imagesWithoutAlt = this.extractionResult?.images.filter(img => !img.alt) || [];
    if (imagesWithoutAlt.length > 0) {
      issues.push({
        type: 'missing_alt_text',
        severity: 'high',
        description: `${imagesWithoutAlt.length} images missing alt text`,
        element: 'img'
      });
      improvements.push('Add descriptive alt text to all images');
    }
    
    // Check heading structure
    const headings = this.extractionResult?.headings || [];
    const h1Count = headings.filter(h => h.level === 1).length;
    
    if (h1Count === 0) {
      issues.push({
        type: 'missing_h1',
        severity: 'critical',
        description: 'No H1 heading found',
        element: 'h1'
      });
      improvements.push('Add a descriptive H1 heading to the page');
    } else if (h1Count > 1) {
      issues.push({
        type: 'multiple_h1',
        severity: 'medium',
        description: `Multiple H1 headings found (${h1Count})`,
        element: 'h1'
      });
      improvements.push('Use only one H1 heading per page');
    }
    
    // Check for empty links
    const emptyLinks = this.extractionResult?.links.filter(link => !link.text.trim()) || [];
    if (emptyLinks.length > 0) {
      issues.push({
        type: 'empty_links',
        severity: 'medium',
        description: `${emptyLinks.length} links without text`,
        element: 'a'
      });
      improvements.push('Ensure all links have descriptive text');
    }
    
    // Calculate overall score
    const maxScore = 100;
    const deductions = issues.reduce((total, issue) => {
      switch (issue.severity) {
        case 'critical': return total + 25;
        case 'high': return total + 15;
        case 'medium': return total + 10;
        case 'low': return total + 5;
        default: return total;
      }
    }, 0);
    
    const score = Math.max(0, maxScore - deductions);
    
    return {
      score,
      issues,
      improvements
    };
  }

  /**
   * Detect industry based on content analysis
   */
  private detectIndustry(): string {
    const content = this.extractionResult?.content.mainContent.toLowerCase() || '';
    const title = this.extractionResult?.title.toLowerCase() || '';
    const combined = `${title} ${content}`;
    
    const industryKeywords = {
      'E-commerce/Retail': ['shop', 'buy', 'cart', 'checkout', 'product', 'store', 'retail', 'sale', 'discount'],
      'Technology': ['software', 'app', 'tech', 'digital', 'platform', 'api', 'cloud', 'ai', 'machine learning'],
      'Healthcare': ['health', 'medical', 'doctor', 'patient', 'treatment', 'clinic', 'hospital', 'medicine'],
      'Finance': ['bank', 'finance', 'investment', 'loan', 'credit', 'insurance', 'financial', 'money'],
      'Education': ['school', 'university', 'course', 'learn', 'education', 'student', 'teacher', 'training'],
      'Real Estate': ['property', 'real estate', 'house', 'home', 'rent', 'buy', 'apartment', 'mortgage'],
      'Food & Beverage': ['restaurant', 'food', 'menu', 'dining', 'cafe', 'bar', 'recipe', 'cooking'],
      'Travel': ['travel', 'hotel', 'flight', 'vacation', 'booking', 'trip', 'tourism', 'destination'],
      'Fashion': ['fashion', 'clothing', 'apparel', 'style', 'wear', 'dress', 'shoes', 'accessories'],
      'Automotive': ['car', 'auto', 'vehicle', 'automotive', 'dealer', 'parts', 'service', 'repair']
    };
    
    let bestMatch = 'General';
    let maxScore = 0;
    
    Object.entries(industryKeywords).forEach(([industry, keywords]) => {
      const score = keywords.reduce((count, keyword) => {
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        const matches = combined.match(regex);
        return count + (matches ? matches.length : 0);
      }, 0);
      
      if (score > maxScore) {
        maxScore = score;
        bestMatch = industry;
      }
    });
    
    return bestMatch;
  }

  /**
   * Detect business type (B2B, B2C, etc.)
   */
  private detectBusinessType(): string {
    const content = this.extractionResult?.content.mainContent.toLowerCase() || '';
    
    const b2bIndicators = ['enterprise', 'business', 'corporate', 'solution', 'professional', 'industry'];
    const b2cIndicators = ['customer', 'personal', 'individual', 'consumer', 'family', 'home'];
    
    const b2bScore = b2bIndicators.reduce((score, indicator) => {
      return score + (content.includes(indicator) ? 1 : 0);
    }, 0);
    
    const b2cScore = b2cIndicators.reduce((score, indicator) => {
      return score + (content.includes(indicator) ? 1 : 0);
    }, 0);
    
    if (b2bScore > b2cScore) return 'B2B';
    if (b2cScore > b2bScore) return 'B2C';
    return 'Mixed';
  }

  /**
   * Extract products from content and structured data
   */
  private extractProducts(): BusinessIntelligence['products'] {
    const products: BusinessIntelligence['products'] = [];
    
    // Extract from structured data
    this.extractionResult?.structuredData.forEach(data => {
      if (data.type === 'Product' && data.properties) {
        products.push({
          name: data.properties.name || '',
          price: data.properties.price || data.properties.offers?.price,
          description: data.properties.description,
          category: data.properties.category
        });
      }
    });
    
    // Extract using HTML parsing utilities
    const productInfo = HTMLParsingUtils.extractProductInfo(this.parser);
    if (productInfo.name) {
      products.push({
        name: productInfo.name,
        price: productInfo.price,
        description: productInfo.description
      });
    }
    
    return products;
  }

  /**
   * Extract services from content
   */
  private extractServices(): string[] {
    const content = this.extractionResult?.content.mainContent || '';
    const serviceKeywords = ['service', 'consulting', 'support', 'maintenance', 'installation', 'repair', 'training'];
    
    const services: string[] = [];
    const sentences = content.split(/[.!?]+/);
    
    sentences.forEach(sentence => {
      serviceKeywords.forEach(keyword => {
        if (sentence.toLowerCase().includes(keyword)) {
          const cleanSentence = sentence.trim();
          if (cleanSentence.length > 10 && cleanSentence.length < 200) {
            services.push(cleanSentence);
          }
        }
      });
    });
    
    return [...new Set(services)].slice(0, 10); // Remove duplicates and limit
  }

  /**
   * Extract location information
   */
  private extractLocations(): string[] {
    const locations: string[] = [];
    
    // From structured data
    this.extractionResult?.structuredData.forEach(data => {
      if (data.properties.address || data.properties.location) {
        const address = data.properties.address || data.properties.location;
        if (typeof address === 'string') {
          locations.push(address);
        } else if (address.addressLocality || address.addressRegion) {
          locations.push(`${address.addressLocality || ''} ${address.addressRegion || ''}`.trim());
        }
      }
    });
    
    // From contact info
    const contactInfo = HTMLParsingUtils.extractContactInfo(this.parser);
    locations.push(...contactInfo.addresses);
    
    return [...new Set(locations)];
  }

  /**
   * Count brand mentions in content
   */
  private countBrandMentions(): number {
    const title = this.extractionResult?.title || '';
    const content = this.extractionResult?.content.mainContent || '';
    const combined = `${title} ${content}`.toLowerCase();
    
    // Extract potential brand name from title or domain
    const brandName = title.split(/[-|–—]/)[0].trim().toLowerCase();
    
    if (!brandName || brandName.length < 2) return 0;
    
    const regex = new RegExp(`\\b${brandName}\\b`, 'gi');
    const matches = combined.match(regex);
    
    return matches ? matches.length : 0;
  }

  /**
   * Detect competitor mentions
   */
  private detectCompetitorMentions(): string[] {
    // This would typically use a database of known competitors
    // For now, we'll use a simple heuristic
    const content = this.extractionResult?.content.mainContent.toLowerCase() || '';
    const competitors: string[] = [];
    
    // Look for phrases like "vs", "compared to", "alternative to"
    const competitorPatterns = [
      /vs\.?\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g,
      /compared to\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g,
      /alternative to\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g
    ];
    
    competitorPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const competitor = match.replace(/^(vs\.?\s+|compared to\s+|alternative to\s+)/i, '');
          if (competitor.length > 2 && competitor.length < 50) {
            competitors.push(competitor);
          }
        });
      }
    });
    
    return [...new Set(competitors)];
  }

  /**
   * Extract key topics from content
   */
  private extractKeyTopics(): string[] {
    const keywordDensity = this.extractionResult?.seo.keywordDensity || {};
    
    // Get top keywords and filter out common words
    const commonWords = ['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'man', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy', 'did', 'its', 'let', 'put', 'say', 'she', 'too', 'use'];
    
    return Object.keys(keywordDensity)
      .filter(word => !commonWords.includes(word) && word.length > 3)
      .slice(0, 10);
  }

  /**
   * Assess content quality
   */
  private assessContentQuality(): BusinessIntelligence['contentQuality'] {
    const factors: string[] = [];
    let score = 100;
    
    const wordCount = this.extractionResult?.seo.wordCount || 0;
    const readabilityScore = this.extractionResult?.seo.readabilityScore || 0;
    
    // Word count assessment
    if (wordCount < 300) {
      factors.push('Content too short (less than 300 words)');
      score -= 20;
    } else if (wordCount > 2000) {
      factors.push('Comprehensive content length');
      score += 10;
    }
    
    // Readability assessment
    if (readabilityScore < 30) {
      factors.push('Content difficult to read');
      score -= 15;
    } else if (readabilityScore > 60) {
      factors.push('Good readability score');
      score += 5;
    }
    
    // Structure assessment
    const headings = this.extractionResult?.headings || [];
    if (headings.length === 0) {
      factors.push('No headings found');
      score -= 15;
    } else if (headings.length > 3) {
      factors.push('Well-structured with headings');
      score += 5;
    }
    
    // Image assessment
    const images = this.extractionResult?.images || [];
    if (images.length === 0) {
      factors.push('No images found');
      score -= 10;
    } else {
      const imagesWithAlt = images.filter(img => img.alt);
      if (imagesWithAlt.length / images.length < 0.5) {
        factors.push('Many images missing alt text');
        score -= 10;
      }
    }
    
    return {
      score: Math.max(0, Math.min(100, score)),
      factors
    };
  }

  /**
   * Analyze title optimization
   */
  private analyzeTitleOptimization(title: string): SEOInsights['titleOptimization'] {
    const issues: string[] = [];
    const suggestions: string[] = [];
    let score = 100;
    
    if (!title) {
      issues.push('No title tag found');
      suggestions.push('Add a descriptive title tag');
      score = 0;
    } else {
      if (title.length < 30) {
        issues.push('Title too short');
        suggestions.push('Expand title to 50-60 characters');
        score -= 20;
      } else if (title.length > 60) {
        issues.push('Title too long');
        suggestions.push('Shorten title to under 60 characters');
        score -= 15;
      }
      
      if (!title.includes('|') && !title.includes('-')) {
        suggestions.push('Consider adding brand name separated by | or -');
      }
    }
    
    return { score: Math.max(0, score), issues, suggestions };
  }

  /**
   * Analyze meta description
   */
  private analyzeMetaDescription(description: string): SEOInsights['metaDescription'] {
    const issues: string[] = [];
    const suggestions: string[] = [];
    let score = 100;
    
    if (!description) {
      issues.push('No meta description found');
      suggestions.push('Add a compelling meta description');
      score = 0;
    } else {
      if (description.length < 120) {
        issues.push('Meta description too short');
        suggestions.push('Expand to 150-160 characters');
        score -= 20;
      } else if (description.length > 160) {
        issues.push('Meta description too long');
        suggestions.push('Shorten to under 160 characters');
        score -= 15;
      }
    }
    
    return { score: Math.max(0, score), issues, suggestions };
  }

  /**
   * Analyze heading structure
   */
  private analyzeHeadingStructure(headings: ContentExtractionResult['headings']): SEOInsights['headingStructure'] {
    const issues: string[] = [];
    let score = 100;
    
    const h1Count = headings.filter(h => h.level === 1).length;
    const levels = [...new Set(headings.map(h => h.level))].sort();
    const missingLevels: number[] = [];
    
    if (h1Count === 0) {
      issues.push('No H1 heading found');
      score -= 30;
    } else if (h1Count > 1) {
      issues.push('Multiple H1 headings found');
      score -= 20;
    }
    
    // Check for skipped heading levels
    for (let i = 1; i < levels.length; i++) {
      if (levels[i] - levels[i-1] > 1) {
        const skipped = levels[i-1] + 1;
        missingLevels.push(skipped);
        issues.push(`Heading level H${skipped} skipped`);
        score -= 10;
      }
    }
    
    return {
      score: Math.max(0, score),
      issues,
      h1Count,
      missingLevels
    };
  }

  /**
   * Detect duplicate content (simplified)
   */
  private detectDuplicateContent(): boolean {
    const paragraphs = this.extractionResult?.paragraphs || [];
    const uniqueParagraphs = new Set(paragraphs);
    
    return paragraphs.length > uniqueParagraphs.size;
  }

  /**
   * Calculate image optimization score
   */
  private calculateImageOptimization(): number {
    const images = this.extractionResult?.images || [];
    if (images.length === 0) return 100;
    
    const imagesWithAlt = images.filter(img => img.alt && img.alt.trim().length > 0);
    return Math.round((imagesWithAlt.length / images.length) * 100);
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.parser.destroy();
    this.extractionResult = null;
  }
}
