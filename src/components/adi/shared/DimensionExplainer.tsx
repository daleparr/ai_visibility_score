'use client';

import { HelpCircle, X, Lightbulb } from 'lucide-react';
import { useState } from 'react';

interface DimensionInfo {
  title: string;
  simple: string;
  detailed: string;
  quickWin: string;
  example?: {
    bad: string;
    good: string;
  };
}

const DIMENSION_EXPLANATIONS: Record<string, DimensionInfo> = {
  schema_structured_data: {
    title: 'Schema & Structured Data',
    simple: 'Markup that helps AI understand your content',
    detailed: 'AI models rely on Schema.org markup to parse your pages. Without it, they may misinterpret or ignore key information like product details, reviews, and FAQs.',
    quickWin: 'Add FAQ and Product schema to key pages today',
    example: {
      bad: 'Plain text: "Great shoes, $99, 4.5 stars"',
      good: 'Schema markup: Product=Shoes, Price=$99, Rating=4.5/5, InStock=Yes'
    }
  },
  llm_readability: {
    title: 'LLM Readability',
    simple: 'How easy it is for AI to read and understand your content',
    detailed: 'AI models prefer clear, structured content with headers, bullets, and direct answers. Dense paragraphs and jargon confuse them.',
    quickWin: 'Turn your H2s into questions and answer them directly below',
    example: {
      bad: 'Dense paragraph with no structure',
      good: 'Clear headers, bullet points, direct answers'
    }
  },
  semantic_clarity: {
    title: 'Semantic Clarity',
    simple: 'How clearly your content defines what you offer',
    detailed: 'Avoid vague terms like "premium quality" or "best-in-class." AI models need specific, concrete descriptions to understand and recommend your offerings.',
    quickWin: 'Replace vague adjectives with specific facts and numbers',
    example: {
      bad: 'Premium quality shoes for professionals',
      good: 'Italian leather dress shoes, handcrafted, 2-year warranty'
    }
  },
  citation_authority: {
    title: 'Citation Authority',
    simple: 'How often authoritative sources mention your brand',
    detailed: 'AI models trust sources that are frequently cited by reputable websites, news outlets, and industry publications. Build your citation network.',
    quickWin: 'Get featured in industry publications and trade journals'
  },
  ai_answer_quality: {
    title: 'AI Answer Quality',
    simple: 'How accurately AI models describe your brand',
    detailed: 'When AI is asked about your category, does it mention you? When it mentions you, is the information accurate and comprehensive?',
    quickWin: 'Test ChatGPT/Claude with "[your category] recommendations" and analyze gaps'
  },
  reputation_signals: {
    title: 'Reputation & Trust Signals',
    simple: 'Reviews, ratings, and trust indicators',
    detailed: 'AI models look for third-party validation: customer reviews, industry awards, certifications, and media coverage.',
    quickWin: 'Add review schema and showcase industry awards prominently'
  },
  conversational_copy: {
    title: 'Conversational Copy',
    simple: 'Content written in natural, conversational language',
    detailed: 'AI models trained on human conversations understand natural language better than corporate jargon. Write like you talk.',
    quickWin: 'Rewrite one key page in simple, conversational language'
  },
  ontologies_taxonomy: {
    title: 'Ontologies & Taxonomy',
    simple: 'Logical organization and categorization of content',
    detailed: 'Clear site structure, proper categorization, and internal linking help AI understand your content hierarchy and relationships.',
    quickWin: 'Create a logical category structure and add breadcrumbs'
  },
  knowledge_graphs: {
    title: 'Knowledge Graphs',
    simple: 'Presence in external knowledge bases',
    detailed: 'Being listed in Wikidata, industry databases, and knowledge graphs signals legitimacy to AI models.',
    quickWin: 'Create/update your Wikidata entry with accurate information'
  },
  geo_visibility: {
    title: 'Geographic Visibility',
    simple: 'How well AI understands your location and service area',
    detailed: 'AI models need clear signals about where you operate, including local business schema, address information, and regional keywords.',
    quickWin: 'Add LocalBusiness schema with complete address and service areas'
  },
  hero_products: {
    title: 'Hero Products',
    simple: 'Clear identification of your main offerings',
    detailed: 'AI models need to know what you are known for. Prominently feature your best products with detailed, structured information.',
    quickWin: 'Create dedicated pages for top 3 products with rich schema'
  },
  shipping_freight: {
    title: 'Shipping & Delivery Info',
    simple: 'Clear shipping policies and delivery information',
    detailed: 'For e-commerce, AI models look for shipping costs, delivery times, and return policies to give complete recommendations.',
    quickWin: 'Add shipping schema and create a clear shipping policy page'
  }
};

interface DimensionExplainerProps {
  dimension: string;
  className?: string;
}

export function DimensionExplainer({ dimension, className = '' }: DimensionExplainerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const info = DIMENSION_EXPLANATIONS[dimension];
  
  if (!info) return null;
  
  return (
    <div className={`relative inline-block ${className}`}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 transition-colors"
        aria-label={`Explain ${info.title}`}
      >
        <HelpCircle className="h-4 w-4" />
        <span className="text-sm font-medium">What's this?</span>
      </button>
      
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Popover */}
          <div className="absolute z-50 w-80 p-4 bg-white rounded-lg shadow-xl border-2 border-blue-200 mt-2 left-0 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-start justify-between mb-3">
              <h4 className="font-semibold text-gray-900 pr-6">{info.title}</h4>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 flex-shrink-0"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <p className="text-sm text-gray-700 mb-3 font-medium">
              {info.simple}
            </p>
            
            <p className="text-sm text-gray-600 mb-3 leading-relaxed">
              {info.detailed}
            </p>
            
            {info.example && (
              <div className="mb-3 space-y-2 text-xs">
                <div className="p-2 bg-red-50 rounded border border-red-200">
                  <span className="font-medium text-red-900">❌ Without:</span>
                  <div className="text-red-700 mt-1">{info.example.bad}</div>
                </div>
                <div className="p-2 bg-green-50 rounded border border-green-200">
                  <span className="font-medium text-green-900">✅ With:</span>
                  <div className="text-green-700 mt-1">{info.example.good}</div>
                </div>
              </div>
            )}
            
            <div className="p-3 bg-green-50 rounded border border-green-200">
              <div className="flex items-start gap-2">
                <Lightbulb className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-green-900">Quick Win:</p>
                  <p className="text-xs text-green-800 mt-1">{info.quickWin}</p>
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => setIsOpen(false)}
              className="mt-3 text-sm text-blue-600 hover:underline w-full text-center"
            >
              Got it, thanks
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// Inline tooltip version (less intrusive)
export function DimensionTooltip({ dimension, children }: { dimension: string; children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const info = DIMENSION_EXPLANATIONS[dimension];
  
  if (!info) return <>{children}</>;
  
  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <div className="cursor-help border-b border-dashed border-gray-400">
        {children}
      </div>
      
      {isOpen && (
        <div className="absolute z-50 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg bottom-full left-1/2 transform -translate-x-1/2 mb-2 pointer-events-none">
          <p className="font-medium mb-1">{info.title}</p>
          <p className="opacity-90">{info.simple}</p>
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
            <div className="border-8 border-transparent border-t-gray-900" />
          </div>
        </div>
      )}
    </div>
  );
}

