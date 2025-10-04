/**
 * Enhanced HTML Parser - JavaScript equivalent of Beautiful Soup
 * Provides sophisticated HTML parsing, DOM traversal, and content extraction
 * Designed to circumnavigate anti-bot 403 errors through intelligent parsing
 */

// Dynamic import for JSDOM (Node.js only)
let JSDOM: any = null;

// Initialize JSDOM only in Node.js environment
const initJSDOM = async () => {
  if (typeof window === 'undefined' && !JSDOM) {
    try {
      const jsdomModule = await import('jsdom' as any);
      JSDOM = jsdomModule.JSDOM;
    } catch (error) {
      console.warn('JSDOM not available, enhanced HTML parsing disabled:', error);
    }
  }
};

export interface ParsedElement {
  tag: string;
  text: string;
  attributes: Record<string, string>;
  children: ParsedElement[];
  parent?: ParsedElement;
}

export interface StructuredData {
  type: string;
  properties: Record<string, any>;
  context?: string;
}

export interface ContentExtractionResult {
  title: string;
  description: string;
  headings: { level: number; text: string }[];
  paragraphs: string[];
  links: { text: string; href: string; title?: string }[];
  images: { src: string; alt?: string; title?: string }[];
  structuredData: StructuredData[];
  metadata: {
    openGraph: Record<string, string>;
    twitterCard: Record<string, string>;
    canonical?: string;
    robots?: string;
    viewport?: string;
  };
  content: {
    mainContent: string;
    navigation: string[];
    footer: string;
    sidebar: string;
  };
  seo: {
    wordCount: number;
    readabilityScore: number;
    keywordDensity: Record<string, number>;
    internalLinks: number;
    externalLinks: number;
  };
}

export class EnhancedHTMLParser {
  private dom: any = null;
  private document: Document | null = null;

  /**
   * Parse HTML content and create DOM representation
   */
  async parseHTML(html: string, url?: string): Promise<void> {
    await initJSDOM();
    
    if (!JSDOM) {
      throw new Error('JSDOM not available - enhanced HTML parsing requires Node.js environment');
    }
    
    try {
      const virtualConsole = new JSDOM().window.console;
      virtualConsole.on("jsdomError", (e: Error) => {
        if (!e.message.includes("Could not parse CSS stylesheet")) {
          console.error(e);
        }
      });

      this.dom = new JSDOM(html, {
        url: url || 'https://example.com',
        contentType: 'text/html',
        includeNodeLocations: true,
        storageQuota: 10000000,
        resources: {
          fetch(url: string, options: any) {
            // Block all CSS requests to speed up parsing
            if (url.endsWith('.css')) {
              return Promise.resolve(Buffer.from(''));
            }
            return null;
          }
        },
        virtualConsole,
      });
      this.document = this.dom.window.document;
    } catch (error) {
      console.error('Failed to parse HTML:', error);
      throw new Error(`HTML parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Beautiful Soup-style element selection
   */
  select(selector: string): Element[] {
    if (!this.document) throw new Error('No document loaded. Call parseHTML first.');
    
    try {
      return Array.from(this.document.querySelectorAll(selector));
    } catch (error) {
      console.warn(`Invalid selector "${selector}":`, error);
      return [];
    }
  }

  /**
   * Find elements by tag name (Beautiful Soup: soup.find_all('tag'))
   */
  findAll(tagName: string, attributes?: Record<string, string>): Element[] {
    if (!this.document) throw new Error('No document loaded. Call parseHTML first.');
    
    let elements = Array.from(this.document.getElementsByTagName(tagName));
    
    if (attributes) {
      elements = elements.filter(el => {
        return Object.entries(attributes).every(([key, value]) => {
          const attrValue = el.getAttribute(key);
          if (value.includes('*')) {
            // Wildcard matching
            const regex = new RegExp(value.replace(/\*/g, '.*'));
            return attrValue ? regex.test(attrValue) : false;
          }
          return attrValue === value;
        });
      });
    }
    
    return elements;
  }

  /**
   * Find single element (Beautiful Soup: soup.find('tag'))
   */
  find(tagName: string, attributes?: Record<string, string>): Element | null {
    const elements = this.findAll(tagName, attributes);
    return elements.length > 0 ? elements[0] : null;
  }

  /**
   * Get element text content (Beautiful Soup: element.get_text())
   */
  getText(element: Element, separator: string = ' ', strip: boolean = true): string {
    if (!element) return '';
    
    let text = element.textContent || '';
    
    if (strip) {
      text = text.trim();
    }
    
    if (separator !== ' ') {
      // Replace multiple whitespace with separator
      text = text.replace(/\s+/g, separator);
    }
    
    return text;
  }

  /**
   * Get element attributes (Beautiful Soup: element.attrs)
   */
  getAttributes(element: Element): Record<string, string> {
    const attrs: Record<string, string> = {};
    
    if (element.attributes) {
      for (let i = 0; i < element.attributes.length; i++) {
        const attr = element.attributes[i];
        attrs[attr.name] = attr.value;
      }
    }
    
    return attrs;
  }

  /**
   * Extract structured data (JSON-LD, Microdata, RDFa)
   */
  extractStructuredData(): StructuredData[] {
    if (!this.document) return [];
    
    const structuredData: StructuredData[] = [];
    
    // JSON-LD extraction
    const jsonLdScripts = this.findAll('script', { type: 'application/ld+json' });
    jsonLdScripts.forEach(script => {
      try {
        const data = JSON.parse(script.textContent || '');
        if (data['@type']) {
          structuredData.push({
            type: data['@type'],
            properties: data,
            context: data['@context'] || 'https://schema.org'
          });
        }
      } catch (error) {
        console.warn('Failed to parse JSON-LD:', error);
      }
    });
    
    // Microdata extraction
    const microdataElements = this.select('[itemtype]');
    microdataElements.forEach(element => {
      const itemType = element.getAttribute('itemtype');
      if (itemType) {
        const properties: Record<string, any> = {};
        const propElements = this.select('[itemprop]');
        
        propElements.forEach(propEl => {
          const propName = propEl.getAttribute('itemprop');
          const propValue = propEl.getAttribute('content') || 
                           propEl.getAttribute('href') || 
                           this.getText(propEl);
          
          if (propName && propValue) {
            properties[propName] = propValue;
          }
        });
        
        structuredData.push({
          type: itemType.split('/').pop() || itemType,
          properties,
          context: itemType
        });
      }
    });
    
    return structuredData;
  }

  /**
   * Extract Open Graph and Twitter Card metadata
   */
  extractMetadata(): ContentExtractionResult['metadata'] {
    if (!this.document) return { openGraph: {}, twitterCard: {} };
    
    const openGraph: Record<string, string> = {};
    const twitterCard: Record<string, string> = {};
    
    // Open Graph
    const ogTags = this.findAll('meta', { property: 'og:*' });
    ogTags.forEach(tag => {
      const property = tag.getAttribute('property');
      const content = tag.getAttribute('content');
      if (property && content) {
        openGraph[property] = content;
      }
    });
    
    // Twitter Card
    const twitterTags = this.findAll('meta', { name: 'twitter:*' });
    twitterTags.forEach(tag => {
      const name = tag.getAttribute('name');
      const content = tag.getAttribute('content');
      if (name && content) {
        twitterCard[name] = content;
      }
    });
    
    // Other metadata
    const canonical = this.find('link', { rel: 'canonical' })?.getAttribute('href') || undefined;
    const robots = this.find('meta', { name: 'robots' })?.getAttribute('content') || undefined;
    const viewport = this.find('meta', { name: 'viewport' })?.getAttribute('content') || undefined;
    
    return {
      openGraph,
      twitterCard,
      canonical,
      robots,
      viewport
    };
  }

  /**
   * Intelligent content extraction (main content, navigation, etc.)
   */
  extractContent(): ContentExtractionResult['content'] {
    if (!this.document) return { mainContent: '', navigation: [], footer: '', sidebar: '' };
    
    // Main content detection using multiple strategies
    let mainContent = '';
    
    // Strategy 1: Semantic HTML5 elements
    const mainElement = this.find('main') || this.find('article') || this.find('[role="main"]');
    if (mainElement) {
      mainContent = this.getText(mainElement);
    }
    
    // Strategy 2: Largest content block
    if (!mainContent) {
      const contentCandidates = this.select('div, section, article');
      let largestElement: Element | null = null;
      let maxLength = 0;
      
      contentCandidates.forEach(el => {
        const text = this.getText(el);
        if (text.length > maxLength && text.length > 200) {
          maxLength = text.length;
          largestElement = el;
        }
      });
      
      if (largestElement) {
        mainContent = this.getText(largestElement);
      }
    }
    
    // Navigation extraction
    const navigation: string[] = [];
    const navElements = this.select('nav, [role="navigation"], .navigation, .nav, .menu');
    navElements.forEach(nav => {
      const links = this.select('a');
      links.forEach(link => {
        const text = this.getText(link).trim();
        if (text && text.length < 100) {
          navigation.push(text);
        }
      });
    });
    
    // Footer extraction
    const footerElement = this.find('footer') || this.find('[role="contentinfo"]') || this.find('.footer');
    const footer = footerElement ? this.getText(footerElement) : '';
    
    // Sidebar extraction
    const sidebarElement = this.find('aside') || this.find('[role="complementary"]') || this.find('.sidebar');
    const sidebar = sidebarElement ? this.getText(sidebarElement) : '';
    
    return {
      mainContent,
      navigation: [...new Set(navigation)], // Remove duplicates
      footer,
      sidebar
    };
  }

  /**
   * SEO analysis
   */
  analyzeSEO(): ContentExtractionResult['seo'] {
    if (!this.document) return { wordCount: 0, readabilityScore: 0, keywordDensity: {}, internalLinks: 0, externalLinks: 0 };
    
    const bodyText = this.getText(this.document.body || this.document.documentElement);
    const words = bodyText.toLowerCase().match(/\b\w+\b/g) || [];
    const wordCount = words.length;
    
    // Keyword density calculation
    const keywordDensity: Record<string, number> = {};
    const wordFreq: Record<string, number> = {};
    
    words.forEach(word => {
      if (word.length > 3) { // Ignore short words
        wordFreq[word] = (wordFreq[word] || 0) + 1;
      }
    });
    
    Object.entries(wordFreq).forEach(([word, freq]) => {
      keywordDensity[word] = (freq / wordCount) * 100;
    });
    
    // Sort by frequency and take top 10
    const topKeywords = Object.entries(keywordDensity)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .reduce((obj, [word, density]) => {
        obj[word] = density;
        return obj;
      }, {} as Record<string, number>);
    
    // Link analysis
    const links = this.findAll('a');
    let internalLinks = 0;
    let externalLinks = 0;
    
    links.forEach(link => {
      const href = link.getAttribute('href');
      if (href) {
        if (href.startsWith('http') && !href.includes(this.dom?.window.location.hostname || '')) {
          externalLinks++;
        } else if (!href.startsWith('#') && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
          internalLinks++;
        }
      }
    });
    
    // Simple readability score (Flesch-like)
    const sentences = bodyText.split(/[.!?]+/).length;
    const avgWordsPerSentence = wordCount / sentences;
    const avgSyllablesPerWord = 1.5; // Simplified estimate
    const readabilityScore = Math.max(0, Math.min(100, 
      206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord)
    ));
    
    return {
      wordCount,
      readabilityScore: Math.round(readabilityScore),
      keywordDensity: topKeywords,
      internalLinks,
      externalLinks
    };
  }

  /**
   * Comprehensive content extraction (Beautiful Soup equivalent)
   */
  extractAll(): ContentExtractionResult {
    if (!this.document) {
      throw new Error('No document loaded. Call parseHTML first.');
    }
    
    // Basic elements
    const titleElement = this.find('title');
    const title = titleElement ? this.getText(titleElement) : '';
    
    const descriptionElement = this.find('meta', { name: 'description' });
    const description = descriptionElement ? descriptionElement.getAttribute('content') || '' : '';
    
    // Headings
    const headings: { level: number; text: string }[] = [];
    for (let i = 1; i <= 6; i++) {
      const headingElements = this.findAll(`h${i}`);
      headingElements.forEach(h => {
        const text = this.getText(h).trim();
        if (text) {
          headings.push({ level: i, text });
        }
      });
    }
    
    // Paragraphs
    const paragraphElements = this.findAll('p');
    const paragraphs = paragraphElements
      .map(p => this.getText(p).trim())
      .filter(text => text.length > 20); // Filter out short paragraphs
    
    // Links
    const linkElements = this.findAll('a');
    const links = linkElements
      .map(link => ({
        text: this.getText(link).trim(),
        href: link.getAttribute('href') || '',
        title: link.getAttribute('title') || undefined
      }))
      .filter(link => link.text && link.href);
    
    // Images
    const imageElements = this.findAll('img');
    const images = imageElements.map(img => ({
      src: img.getAttribute('src') || '',
      alt: img.getAttribute('alt') || undefined,
      title: img.getAttribute('title') || undefined
    }));
    
    return {
      title,
      description,
      headings,
      paragraphs,
      links,
      images,
      structuredData: this.extractStructuredData(),
      metadata: this.extractMetadata(),
      content: this.extractContent(),
      seo: this.analyzeSEO()
    };
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    if (this.dom) {
      this.dom.window.close();
      this.dom = null;
      this.document = null;
    }
  }
}

/**
 * Utility functions for common parsing tasks
 */
export class HTMLParsingUtils {
  /**
   * Extract product information from e-commerce pages
   */
  static extractProductInfo(parser: EnhancedHTMLParser): Record<string, any> {
    const product: Record<string, any> = {};
    
    // Product name
    const nameSelectors = [
      'h1[itemprop="name"]',
      '.product-title',
      '.product-name',
      'h1.title',
      'h1'
    ];
    
    for (const selector of nameSelectors) {
      const element = parser.select(selector)[0];
      if (element) {
        product.name = parser.getText(element);
        break;
      }
    }
    
    // Price
    const priceSelectors = [
      '[itemprop="price"]',
      '.price',
      '.product-price',
      '.cost',
      '.amount'
    ];
    
    for (const selector of priceSelectors) {
      const element = parser.select(selector)[0];
      if (element) {
        product.price = parser.getText(element);
        break;
      }
    }
    
    // Description
    const descSelectors = [
      '[itemprop="description"]',
      '.product-description',
      '.description',
      '.product-details'
    ];
    
    for (const selector of descSelectors) {
      const element = parser.select(selector)[0];
      if (element) {
        product.description = parser.getText(element);
        break;
      }
    }
    
    return product;
  }

  /**
   * Extract contact information
   */
  static extractContactInfo(parser: EnhancedHTMLParser): Record<string, any> {
    const contact: Record<string, any> = {};
    
    // Email addresses
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const bodyText = parser.getText(parser.select('body')[0] || parser.select('html')[0]);
    const emails = bodyText.match(emailRegex) || [];
    contact.emails = [...new Set(emails)];
    
    // Phone numbers
    const phoneRegex = /(\+?1?[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/g;
    const phones = bodyText.match(phoneRegex) || [];
    contact.phones = [...new Set(phones)];
    
    // Address (look for structured data)
    const addressElements = parser.select('[itemprop*="address"], .address, .location');
    contact.addresses = addressElements.map(el => parser.getText(el)).filter(addr => addr.length > 10);
    
    return contact;
  }

  /**
   * Extract social media links
   */
  static extractSocialLinks(parser: EnhancedHTMLParser): Record<string, string> {
    const social: Record<string, string> = {};
    const socialDomains = {
      'facebook.com': 'facebook',
      'twitter.com': 'twitter',
      'x.com': 'twitter',
      'instagram.com': 'instagram',
      'linkedin.com': 'linkedin',
      'youtube.com': 'youtube',
      'tiktok.com': 'tiktok',
      'pinterest.com': 'pinterest'
    };
    
    const links = parser.findAll('a');
    links.forEach(link => {
      const href = link.getAttribute('href') || '';
      Object.entries(socialDomains).forEach(([domain, platform]) => {
        if (href.includes(domain)) {
          social[platform] = href;
        }
      });
    });
    
    return social;
  }
}
