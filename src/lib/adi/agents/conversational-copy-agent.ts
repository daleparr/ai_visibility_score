
import { BaseADIAgent } from './base-agent'
import type { 
  ADIAgentInput, 
  ADIAgentOutput, 
  ADIAgentConfig
} from '../../../types/adi'

/**
 * Conversational Copy Agent - Evaluates LLM readability and conversational copy quality
 * Analyzes content for natural language processing, readability, and AI-friendly formatting
 */
export class ConversationalCopyAgent extends BaseADIAgent {
  constructor() {
    const config: ADIAgentConfig = {
      name: 'conversational_copy_agent',
      version: '1.0.0',
      description: 'Evaluates LLM readability and conversational copy quality for AI consumption',
      dependencies: ['crawl_agent'],
      timeout: 8000,
      retryLimit: 2,
      parallelizable: true
    }
    super(config)
  }

  async execute(input: ADIAgentInput): Promise<ADIAgentOutput> {
    const startTime = Date.now()
    
    try {
      console.log(`💬 Conversational Copy Agent: Starting evaluation for ${input.context.websiteUrl}`)
      
      const results: {
        resultType: string
        rawValue: number
        normalizedScore: number
        confidenceLevel: number
        evidence: Record<string, any>
      }[] = []
      
      // Get crawl data from previous results
      const crawlData = this.getCrawlData(input.previousResults || [])
      
      // 1. Analyze content readability for LLMs
      const readabilityResult = await this.analyzeContentReadability(crawlData)
      results.push(readabilityResult)
      
      // 2. Evaluate conversational tone and style
      const conversationalToneResult = await this.analyzeConversationalTone(crawlData)
      results.push(conversationalToneResult)
      
      // 3. Check for natural language patterns
      const naturalLanguageResult = await this.analyzeNaturalLanguagePatterns(crawlData)
      results.push(naturalLanguageResult)
      
      // 4. Evaluate content structure for AI consumption
      const aiStructureResult = await this.analyzeAIFriendlyStructure(crawlData)
      results.push(aiStructureResult)
      
      // 5. Analyze question-answer patterns
      const qaPatternResult = await this.analyzeQuestionAnswerPatterns(crawlData)
      results.push(qaPatternResult)

      const executionTime = Date.now() - startTime
      
      console.log(`✅ Conversational Copy Agent: Completed in ${executionTime}ms`)
      
      return {
        agentName: this.config.name,
        status: 'completed',
        results,
        executionTime,
        metadata: {
          totalPagesAnalyzed: crawlData?.pages?.length || 1,
          contentWordsAnalyzed: this.countWords(crawlData || { content: '' }),
          readabilityScore: this.calculateOverallReadability(results),
          agentVersion: this.config.version,
          timestamp: new Date().toISOString()
        }
      }
      
    } catch (error) {
      const executionTime = Date.now() - startTime
      console.error(`❌ Conversational Copy Agent failed:`, error)
      
      return {
        agentName: this.config.name,
        status: 'failed',
        results: [],
        executionTime,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        metadata: {
          timestamp: new Date().toISOString(),
          error: error
        }
      }
    }
  }

  /**
   * Analyze content readability for LLMs
   */
  private async analyzeContentReadability(crawlData: any): Promise<{
    resultType: string
    rawValue: number
    normalizedScore: number
    confidenceLevel: number
    evidence: Record<string, any>
  }> {
    const content = this.extractTextContent(crawlData)
    
    // Calculate readability metrics
    const readabilityMetrics = {
      averageSentenceLength: this.calculateAverageSentenceLength(content),
      averageWordLength: this.calculateAverageWordLength(content),
      complexWordRatio: this.calculateComplexWordRatio(content),
      passiveVoiceRatio: this.calculatePassiveVoiceRatio(content),
      fleschKincaidScore: this.calculateFleschKincaidScore(content)
    }
    
    // Score based on LLM-friendly readability
    const readabilityScore = this.calculateReadabilityScore(readabilityMetrics)
    
    return {
      resultType: 'content_readability',
      rawValue: Math.round(readabilityMetrics.fleschKincaidScore),
      normalizedScore: readabilityScore,
      confidenceLevel: 0.85,
      evidence: {
        ...readabilityMetrics,
        totalWords: this.countWords({ content }),
        totalSentences: this.countSentences(content),
        readabilityGrade: this.getReadabilityGrade(readabilityMetrics.fleschKincaidScore),
        llmFriendlinessFactors: this.analyzeLLMFriendliness(readabilityMetrics)
      }
    }
  }

  /**
   * Analyze conversational tone and style
   */
  private async analyzeConversationalTone(crawlData: any): Promise<{
    resultType: string
    rawValue: number
    normalizedScore: number
    confidenceLevel: number
    evidence: Record<string, any>
  }> {
    const content = this.extractTextContent(crawlData)
    
    const toneMetrics = {
      personalPronouns: this.countPersonalPronouns(content),
      questionCount: this.countQuestions(content),
      imperativeCount: this.countImperatives(content),
      contractionsCount: this.countContractions(content),
      conversationalMarkers: this.findConversationalMarkers(content)
    }
    
    const conversationalScore = this.calculateConversationalScore(toneMetrics, content.length)
    
    return {
      resultType: 'conversational_tone',
      rawValue: toneMetrics.personalPronouns + toneMetrics.questionCount,
      normalizedScore: conversationalScore,
      confidenceLevel: 0.75,
      evidence: {
        ...toneMetrics,
        toneAnalysis: this.analyzeTone(toneMetrics),
        conversationalIndicators: this.getConversationalIndicators(toneMetrics),
        formalityLevel: this.calculateFormalityLevel(toneMetrics)
      }
    }
  }

  /**
   * Analyze natural language patterns
   */
  private async analyzeNaturalLanguagePatterns(crawlData: any): Promise<{
    resultType: string
    rawValue: number
    normalizedScore: number
    confidenceLevel: number
    evidence: Record<string, any>
  }> {
    const content = this.extractTextContent(crawlData)
    
    const patterns = {
      transitionWords: this.findTransitionWords(content),
      coherenceMarkers: this.findCoherenceMarkers(content),
      topicSentences: this.findTopicSentences(content),
      narrativeFlow: this.analyzeNarrativeFlow(content),
      semanticConnections: this.findSemanticConnections(content)
    }
    
    const naturalLanguageScore = this.calculateNaturalLanguageScore(patterns)
    
    return {
      resultType: 'natural_language_patterns',
      rawValue: patterns.transitionWords.length + patterns.coherenceMarkers.length,
      normalizedScore: naturalLanguageScore,
      confidenceLevel: 0.8,
      evidence: {
        transitionWordsFound: patterns.transitionWords.length,
        coherenceMarkersFound: patterns.coherenceMarkers.length,
        topicSentencesIdentified: patterns.topicSentences.length,
        narrativeFlowScore: patterns.narrativeFlow,
        semanticConnectionsFound: patterns.semanticConnections.length,
        languagePatternAnalysis: this.analyzeLanguagePatterns(patterns)
      }
    }
  }

  /**
   * Analyze AI-friendly content structure
   */
  private async analyzeAIFriendlyStructure(crawlData: any): Promise<{
    resultType: string
    rawValue: number
    normalizedScore: number
    confidenceLevel: number
    evidence: Record<string, any>
  }> {
    const content = this.extractTextContent(crawlData)
    const htmlContent = crawlData?.content || ''
    
    const structureMetrics = {
      headingHierarchy: this.analyzeHeadingHierarchy(htmlContent),
      listStructures: this.findListStructures(htmlContent),
      paragraphLength: this.analyzeParagraphLength(content),
      bulletPoints: this.countBulletPoints(htmlContent),
      definitionPatterns: this.findDefinitionPatterns(content)
    }
    
    const structureScore = this.calculateStructureScore(structureMetrics)
    
    return {
      resultType: 'ai_friendly_structure',
      rawValue: structureMetrics.headingHierarchy.levels + structureMetrics.listStructures.length,
      normalizedScore: structureScore,
      confidenceLevel: 0.9,
      evidence: {
        headingLevels: structureMetrics.headingHierarchy.levels,
        headingConsistency: structureMetrics.headingHierarchy.consistency,
        listStructuresFound: structureMetrics.listStructures.length,
        averageParagraphLength: structureMetrics.paragraphLength.average,
        bulletPointsCount: structureMetrics.bulletPoints,
        definitionPatternsFound: structureMetrics.definitionPatterns.length,
        structuralAnalysis: this.analyzeStructuralQuality(structureMetrics)
      }
    }
  }

  /**
   * Analyze question-answer patterns
   */
  private async analyzeQuestionAnswerPatterns(crawlData: any): Promise<{
    resultType: string
    rawValue: number
    normalizedScore: number
    confidenceLevel: number
    evidence: Record<string, any>
  }> {
    const content = this.extractTextContent(crawlData)
    const htmlContent = crawlData?.content || ''
    
    const qaPatterns = {
      faqSections: this.findFAQSections(htmlContent),
      questionPatterns: this.findQuestionPatterns(content),
      answerPatterns: this.findAnswerPatterns(content),
      howToPatterns: this.findHowToPatterns(content),
      definitionAnswers: this.findDefinitionAnswers(content)
    }
    
    const qaScore = this.calculateQAScore(qaPatterns)
    
    return {
      resultType: 'question_answer_patterns',
      rawValue: qaPatterns.questionPatterns.length + qaPatterns.answerPatterns.length,
      normalizedScore: qaScore,
      confidenceLevel: 0.85,
      evidence: {
        faqSectionsFound: qaPatterns.faqSections.length,
        questionPatternsFound: qaPatterns.questionPatterns.length,
        answerPatternsFound: qaPatterns.answerPatterns.length,
        howToPatternsFound: qaPatterns.howToPatterns.length,
        definitionAnswersFound: qaPatterns.definitionAnswers.length,
        qaAnalysis: this.analyzeQAQuality(qaPatterns)
      }
    }
  }

  // Helper methods for content analysis
  private extractTextContent(crawlData: any): string {
    if (!crawlData?.content) return ''
    
    // Remove HTML tags and extract clean text
    return crawlData.content
      .replace(/<script[^>]*>.*?<\/script>/gis, '')
      .replace(/<style[^>]*>.*?<\/style>/gis, '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  }

  private calculateAverageSentenceLength(content: string): number {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0)
    const words = content.split(/\s+/).filter(w => w.length > 0)
    return sentences.length > 0 ? words.length / sentences.length : 0
  }

  private calculateAverageWordLength(content: string): number {
    const words = content.split(/\s+/).filter(w => w.length > 0)
    const totalChars = words.join('').length
    return words.length > 0 ? totalChars / words.length : 0
  }

  private calculateComplexWordRatio(content: string): number {
    const words = content.split(/\s+/).filter(w => w.length > 0)
    const complexWords = words.filter(word => this.isComplexWord(word))
    return words.length > 0 ? complexWords.length / words.length : 0
  }

  private isComplexWord(word: string): boolean {
    // Simple heuristic: words with 3+ syllables or 7+ characters
    return word.length >= 7 || this.countSyllables(word) >= 3
  }

  private countSyllables(word: string): number {
    // Simple syllable counting heuristic
    const vowels = word.toLowerCase().match(/[aeiouy]+/g)
    return vowels ? vowels.length : 1
  }

  private calculatePassiveVoiceRatio(content: string): number {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0)
    const passiveIndicators = /\b(was|were|been|being)\s+\w+ed\b/gi
    const passiveSentences = sentences.filter(s => passiveIndicators.test(s))
    return sentences.length > 0 ? passiveSentences.length / sentences.length : 0
  }

  private calculateFleschKincaidScore(content: string): number {
    const sentences = this.countSentences(content)
    const words = this.countWords({ content })
    const syllables = this.countSyllables(content)
    
    if (sentences === 0 || words === 0) return 0
    
    return 206.835 - (1.015 * (words / sentences)) - (84.6 * (syllables / words))
  }

  private calculateReadabilityScore(metrics: any): number {
    let score = 50 // Base score
    
    // Flesch-Kincaid score (higher is better for readability)
    if (metrics.fleschKincaidScore > 60) score += 20
    else if (metrics.fleschKincaidScore > 30) score += 10
    
    // Average sentence length (shorter is better for LLMs)
    if (metrics.averageSentenceLength < 15) score += 15
    else if (metrics.averageSentenceLength < 20) score += 10
    
    // Complex word ratio (lower is better)
    if (metrics.complexWordRatio < 0.1) score += 10
    else if (metrics.complexWordRatio < 0.2) score += 5
    
    // Passive voice ratio (lower is better)
    if (metrics.passiveVoiceRatio < 0.1) score += 5
    
    return Math.min(100, Math.max(0, score))
  }

  private getReadabilityGrade(score: number): string {
    if (score >= 90) return 'Very Easy'
    if (score >= 80) return 'Easy'
    if (score >= 70) return 'Fairly Easy'
    if (score >= 60) return 'Standard'
    if (score >= 50) return 'Fairly Difficult'
    if (score >= 30) return 'Difficult'
    return 'Very Difficult'
  }

  private analyzeLLMFriendliness(metrics: any): string[] {
    const factors: string[] = []
    
    if (metrics.averageSentenceLength < 20) factors.push('Appropriate sentence length')
    if (metrics.complexWordRatio < 0.15) factors.push('Low complex word usage')
    if (metrics.passiveVoiceRatio < 0.15) factors.push('Active voice preference')
    if (metrics.fleschKincaidScore > 50) factors.push('Good readability score')
    
    return factors
  }

  private countPersonalPronouns(content: string): number {
    const pronouns = /\b(I|you|we|us|our|your|my|mine)\b/gi
    return (content.match(pronouns) || []).length
  }

  private countQuestions(content: string): number {
    return (content.match(/\?/g) || []).length
  }

  private countImperatives(content: string): number {
    // Simple heuristic for imperative sentences
    const imperativePatterns = /\b(try|use|get|find|discover|learn|start|begin|click|visit|contact)\b/gi
    return (content.match(imperativePatterns) || []).length
  }

  private countContractions(content: string): number {
    const contractions = /\b\w+'\w+\b/g
    return (content.match(contractions) || []).length
  }

  private findConversationalMarkers(content: string): string[] {
    const markers = [
      'well', 'so', 'now', 'actually', 'basically', 'essentially',
      'you know', 'I mean', 'let me', 'here\'s the thing'
    ]
    
    const found: string[] = []
    markers.forEach(marker => {
      const regex = new RegExp(`\\b${marker.replace(/'/g, "\\'")}\\b`, 'gi')
      if (regex.test(content)) {
        found.push(marker)
      }
    })
    
    return found
  }

  private calculateConversationalScore(metrics: any, contentLength: number): number {
    let score = 30 // Base score
    
    // Personal pronouns (indicates engagement)
    const pronounRatio = metrics.personalPronouns / (contentLength / 100)
    if (pronounRatio > 2) score += 20
    else if (pronounRatio > 1) score += 15
    
    // Questions (indicates interaction)
    const questionRatio = metrics.questionCount / (contentLength / 500)
    if (questionRatio > 1) score += 15
    else if (questionRatio > 0.5) score += 10
    
    // Conversational markers
    if (metrics.conversationalMarkers.length > 3) score += 15
    else if (metrics.conversationalMarkers.length > 1) score += 10
    
    // Contractions (indicates informality)
    if (metrics.contractionsCount > 0) score += 10
    
    return Math.min(100, Math.max(0, score))
  }

  private analyzeTone(metrics: any): string {
    if (metrics.personalPronouns > 10 && metrics.questionCount > 2) return 'Highly conversational'
    if (metrics.personalPronouns > 5 || metrics.questionCount > 1) return 'Conversational'
    if (metrics.conversationalMarkers.length > 0) return 'Somewhat conversational'
    return 'Formal'
  }

  private getConversationalIndicators(metrics: any): string[] {
    const indicators: string[] = []
    
    if (metrics.personalPronouns > 5) indicators.push('Uses personal pronouns')
    if (metrics.questionCount > 1) indicators.push('Asks questions')
    if (metrics.contractionsCount > 0) indicators.push('Uses contractions')
    if (metrics.conversationalMarkers.length > 0) indicators.push('Uses conversational markers')
    
    return indicators
  }

  private calculateFormalityLevel(metrics: any): string {
    const formalityScore = 
      (metrics.contractionsCount > 0 ? -10 : 10) +
      (metrics.personalPronouns > 5 ? -10 : 5) +
      (metrics.conversationalMarkers.length > 2 ? -15 : 0)
    
    if (formalityScore > 10) return 'Formal'
    if (formalityScore > 0) return 'Semi-formal'
    if (formalityScore > -10) return 'Informal'
    return 'Very informal'
  }

  private findTransitionWords(content: string): string[] {
    const transitions = [
      'however', 'therefore', 'furthermore', 'moreover', 'additionally',
      'consequently', 'meanwhile', 'nevertheless', 'nonetheless', 'thus'
    ]
    
    const found: string[] = []
    transitions.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi')
      if (regex.test(content)) {
        found.push(word)
      }
    })
    
    return found
  }

  private findCoherenceMarkers(content: string): string[] {
    const markers = [
      'first', 'second', 'third', 'finally', 'in conclusion',
      'for example', 'for instance', 'such as', 'in other words'
    ]
    
    const found: string[] = []
    markers.forEach(marker => {
      const regex = new RegExp(`\\b${marker}\\b`, 'gi')
      if (regex.test(content)) {
        found.push(marker)
      }
    })
    
    return found
  }

  private findTopicSentences(content: string): string[] {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0)
    
    // Simple heuristic: sentences that start paragraphs or contain topic indicators
    return sentences.filter(sentence => {
      const topicIndicators = /\b(this|these|the main|the primary|the key|important|significant)\b/i
      return topicIndicators.test(sentence) && sentence.length > 50
    })
  }

  private analyzeNarrativeFlow(content: string): number {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0)
    
    // Simple flow analysis based on sentence connections
    let flowScore = 0
    for (let i = 1; i < sentences.length; i++) {
      if (this.sentencesAreConnected(sentences[i-1], sentences[i])) {
        flowScore++
      }
    }
    
    return sentences.length > 1 ? (flowScore / (sentences.length - 1)) * 100 : 0
  }

  private sentencesAreConnected(sentence1: string, sentence2: string): boolean {
    // Simple heuristic: check for pronoun references or repeated key words
    const pronouns = /\b(this|that|these|those|it|they|them)\b/i
    if (pronouns.test(sentence2)) return true
    
    // Check for repeated key words (nouns)
    const words1 = sentence1.toLowerCase().split(/\s+/).filter(w => w.length > 4)
    const words2 = sentence2.toLowerCase().split(/\s+/).filter(w => w.length > 4)
    
    return words1.some(word => words2.includes(word))
  }

  private findSemanticConnections(content: string): string[] {
    const connections = [
      'because', 'since', 'due to', 'as a result', 'leads to',
      'causes', 'results in', 'related to', 'connected to'
    ]
    
    const found: string[] = []
    connections.forEach(connection => {
      const regex = new RegExp(`\\b${connection}\\b`, 'gi')
      if (regex.test(content)) {
        found.push(connection)
      }
    })
    
    return found
  }

  private calculateNaturalLanguageScore(patterns: any): number {
    let score = 40 // Base score
    
    // Transition words
    if (patterns.transitionWords.length > 5) score += 20
    else if (patterns.transitionWords.length > 2) score += 15
    
    // Coherence markers
    if (patterns.coherenceMarkers.length > 3) score += 15
    else if (patterns.coherenceMarkers.length > 1) score += 10
    
    // Narrative flow
    if (patterns.narrativeFlow > 70) score += 15
    else if (patterns.narrativeFlow > 50) score += 10
    
    // Semantic connections
    if (patterns.semanticConnections.length > 3) score += 10
    
    return Math.min(100, Math.max(0, score))
  }

  private analyzeLanguagePatterns(patterns: any): Record<string, any> {
    return {
      transitionQuality: patterns.transitionWords.length > 3 ? 'Good' : 'Needs improvement',
      coherenceLevel: patterns.coherenceMarkers.length > 2 ? 'High' : 'Medium',
      flowQuality: patterns.narrativeFlow > 60 ? 'Smooth' : 'Choppy',
      connectionStrength: patterns.semanticConnections.length > 2 ? 'Strong' : 'Weak'
    }
  }

  private analyzeHeadingHierarchy(htmlContent: string): { levels: number, consistency: number } {
    const headings = htmlContent.match(/<h[1-6][^>]*>.*?<\/h[1-6]>/gi) || []
    const levels = new Set()
    
    headings.forEach(heading => {
      const level = heading.match(/<h([1-6])/i)?.[1]
      if (level) levels.add(parseInt(level))
    })
    
    // Calculate consistency (proper hierarchy usage)
    const sortedLevels = Array.from(levels).sort() as number[]
    const consistency = sortedLevels.length > 0 ?
      (sortedLevels.every((level, index) => index === 0 || level === sortedLevels[index - 1] + 1) ? 100 : 70) : 0
    
    return { levels: levels.size, consistency }
  }

  private findListStructures(htmlContent: string): string[] {
    const lists = htmlContent.match(/<[uo]l[^>]*>.*?<\/[uo]l>/gis) || []
    return lists.map((list, index) => `list_${index}`)
  }

  private analyzeParagraphLength(content: string): { average: number, distribution: Record<string, number> } {
    const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0)
    const lengths = paragraphs.map(p => p.split(/\s+/).length)
    
    const average = lengths.length > 0 ? lengths.reduce((a, b) => a + b, 0) / lengths.length : 0
    
    const distribution = {
      short: lengths.filter(l => l < 50).length,
      medium: lengths.filter(l => l >= 50 && l < 150).length,
      long: lengths.filter(l => l >= 150).length
    }
    
    return { average, distribution }
  }

  private countBulletPoints(htmlContent: string): number {
    const bulletPoints = htmlContent.match(/<li[^>]*>.*?<\/li>/gis) || []
    return bulletPoints.length
  }

  private findDefinitionPatterns(content: string): string[] {
    const patterns = [
      /\b\w+\s+is\s+(?:a|an|the)\s+\w+/gi,
      /\b\w+\s+means\s+\w+/gi,
      /\b\w+\s+refers\s+to\s+\w+/gi,
      /\b\w+\s+can\s+be\s+defined\s+as\s+\w+/gi
    ]
    
    const found: string[] = []
    patterns.forEach((pattern, index) => {
      const matches = content.match(pattern) || []
      matches.forEach(match => found.push(`definition_${index}_${match.substring(0, 20)}`))
    })
    
    return found
  }

  private calculateStructureScore(metrics: any): number {
    let score = 30 // Base score
    
    // Heading hierarchy
    if (metrics.headingHierarchy.levels > 2 && metrics.headingHierarchy.consistency > 80) score += 25
    else if (metrics.headingHierarchy.levels > 1) score += 15
    
    // List structures
    if (metrics.listStructures.length > 3) score += 20
    else if (metrics.listStructures.length > 1) score += 15
    
    // Paragraph length
    if (metrics.paragraphLength.average > 30 && metrics.paragraphLength.average < 100) score += 15
    
    // Bullet points
    if (metrics.bulletPoints > 5) score += 10
    
    return Math.min(100, Math.max(0, score))
  }

  private analyzeStructuralQuality(metrics: any): Record<string, string> {
    return {
      headingStructure: metrics.headingHierarchy.levels > 2 ? 'Well-structured' : 'Basic',
      listUsage: metrics.listStructures.length > 2 ? 'Good' : 'Limited',
      paragraphStructure: metrics.paragraphLength.average < 150 ? 'Readable' : 'Too long',
      bulletPointUsage: metrics.bulletPoints > 3 ? 'Effective' : 'Minimal'
    }
  }

  private findFAQSections(htmlContent: string): string[] {
    const faqPatterns = [
      /faq/gi,
      /frequently\s+asked\s+questions/gi,
      /questions?\s+and\s+answers?/gi
    ]
    
    const found: string[] = []
    faqPatterns.forEach((pattern, index) => {
      if (pattern.test(htmlContent)) {
        found.push(`faq_section_${index}`)
      }
    })
    
    return found
  }

  private findQuestionPatterns(content: string): string[] {
    const questions = content.match(/[^.!?]*\?/g) || []
    return questions.map((q, index) => `question_${index}`)
  }

  private findAnswerPatterns(content: string): string[] {
    const answerPatterns = [
      /the\s+answer\s+is/gi,
      /this\s+means/gi,
      /in\s+other\s+words/gi,
      /to\s+put\s+it\s+simply/gi
    ]
    
    const found: string[] = []
    answerPatterns.forEach((pattern, index) => {
      const matches = content.match(pattern) || []
      matches.forEach((match, matchIndex) => found.push(`answer_${index}_${matchIndex}`))
    })
    
    return found
  }

  private findHowToPatterns(content: string): string[] {
    const howToPatterns = [
      /how\s+to\s+\w+/gi,
      /step\s+\d+/gi,
      /first,?\s+\w+/gi,
      /next,?\s+\w+/gi,
      /finally,?\s+\w+/gi
    ]
    
    const found: string[] = []
    howToPatterns.forEach((pattern, index) => {
      const matches = content.match(pattern) || []
      matches.forEach((match, matchIndex) => found.push(`howto_${index}_${matchIndex}`))
    })
    
    return found
  }

  private findDefinitionAnswers(content: string): string[] {
    const definitionPatterns = [
      /\w+\s+is\s+defined\s+as/gi,
      /\w+\s+means/gi,
      /the\s+definition\s+of\s+\w+/gi
    ]
    
    const found: string[] = []
    definitionPatterns.forEach((pattern, index) => {
      const matches = content.match(pattern) || []
      matches.forEach((match, matchIndex) => found.push(`definition_answer_${index}_${matchIndex}`))
    })
    
    return found
  }

  private calculateQAScore(patterns: any): number {
    let score = 20 // Base score
    
    // FAQ sections
    if (patterns.faqSections.length > 0) score += 30
    
    // Question patterns
    if (patterns.questionPatterns.length > 5) score += 20
    else if (patterns.questionPatterns.length > 2) score += 15
    
    // Answer patterns
    if (patterns.answerPatterns.length > 3) score += 15
    else if (patterns.answerPatterns.length > 1) score += 10
    
    // How-to patterns
    if (patterns.howToPatterns.length > 2) score += 10
    
    // Definition answers
    if (patterns.definitionAnswers.length > 1) score += 5
    
    return Math.min(100, Math.max(0, score))
  }

  private analyzeQAQuality(patterns: any): Record<string, string> {
    return {
      faqPresence: patterns.faqSections.length > 0 ? 'Present' : 'Missing',
      questionDensity: patterns.questionPatterns.length > 3 ? 'High' : 'Low',
      answerClarity: patterns.answerPatterns.length > 2 ? 'Clear' : 'Unclear',
      instructionalContent: patterns.howToPatterns.length > 1 ? 'Good' : 'Limited'
    }
  }

  private countWords(data: { content?: string }): number {
    if (!data.content) return 0
    const text = this.extractTextContent(data)
    return text.split(/\s+/).filter(w => w.length > 0).length
  }

  private countSentences(content: string): number {
    return content.split(/[.!?]+/).filter(s => s.trim().length > 0).length
  }

  private calculateOverallReadability(results: any[]): number {
    const readabilityResult = results.find(r => r.resultType === 'content_readability')
    return readabilityResult?.normalizedScore || 0
  }

  private getCrawlData(previousResults: any[]): any {
    return previousResults.find(r => r.result_type === 'crawl_agent')?.evidence || null
  }
}