'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface FAQAccordionProps {
  question: string
  answer: string // HTML string
}

export function FAQAccordion({ question, answer }: FAQAccordionProps) {
  const [isOpen, setIsOpen] = useState(false)
  
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden hover:border-brand-300 transition-colors">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 bg-white hover:bg-gray-50 transition-all text-left"
        aria-expanded={isOpen}
      >
        <h3 className="text-lg font-semibold pr-4">{question}</h3>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-gray-500 flex-shrink-0" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-500 flex-shrink-0" />
        )}
      </button>
      
      {isOpen && (
        <div 
          className="p-6 pt-0 prose prose-lg max-w-none prose-headings:font-semibold prose-p:text-gray-700 prose-ul:text-gray-700 prose-strong:text-gray-900"
          dangerouslySetInnerHTML={{ __html: answer }}
        />
      )}
    </div>
  )
}

