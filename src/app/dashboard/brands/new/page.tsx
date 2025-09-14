'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { 
  Building2, 
  Globe, 
  Plus, 
  X, 
  ArrowLeft, 
  ArrowRight,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { createBrand } from '@/lib/database'
import { validateUrl, extractDomain } from '@/lib/utils'
import Link from 'next/link'

const industries = [
  'Technology',
  'E-commerce',
  'Healthcare',
  'Finance',
  'Education',
  'Manufacturing',
  'Retail',
  'Media & Entertainment',
  'Travel & Hospitality',
  'Real Estate',
  'Automotive',
  'Food & Beverage',
  'Fashion & Beauty',
  'Sports & Fitness',
  'Non-profit',
  'Other'
]

export default function NewBrandPage() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    website_url: '',
    industry: '',
    description: '',
    competitors: ['']
  })
  const [urlValidation, setUrlValidation] = useState<{[key: string]: boolean}>({})
  const router = useRouter()

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))

    // Validate URLs in real-time
    if (field === 'website_url' && value) {
      setUrlValidation(prev => ({
        ...prev,
        website_url: validateUrl(value)
      }))
    }
  }

  const handleCompetitorChange = (index: number, value: string) => {
    const newCompetitors = [...formData.competitors]
    newCompetitors[index] = value
    setFormData(prev => ({
      ...prev,
      competitors: newCompetitors
    }))

    // Validate competitor URL
    if (value) {
      setUrlValidation(prev => ({
        ...prev,
        [`competitor_${index}`]: validateUrl(value)
      }))
    }
  }

  const addCompetitor = () => {
    if (formData.competitors.length < 5) {
      setFormData(prev => ({
        ...prev,
        competitors: [...prev.competitors, '']
      }))
    }
  }

  const removeCompetitor = (index: number) => {
    if (formData.competitors.length > 1) {
      const newCompetitors = formData.competitors.filter((_, i) => i !== index)
      setFormData(prev => ({
        ...prev,
        competitors: newCompetitors
      }))
    }
  }

  const validateStep1 = () => {
    if (!formData.name.trim()) {
      setError('Brand name is required')
      return false
    }
    if (!formData.website_url.trim()) {
      setError('Website URL is required')
      return false
    }
    if (!validateUrl(formData.website_url)) {
      setError('Please enter a valid website URL')
      return false
    }
    if (!formData.industry) {
      setError('Please select an industry')
      return false
    }
    return true
  }

  const validateStep2 = () => {
    const validCompetitors = formData.competitors.filter(url => url.trim())
    for (const url of validCompetitors) {
      if (!validateUrl(url)) {
        setError('Please enter valid competitor URLs')
        return false
      }
    }
    return true
  }

  const handleNext = () => {
    setError('')
    
    if (step === 1 && validateStep1()) {
      setStep(2)
    } else if (step === 2 && validateStep2()) {
      setStep(3)
    }
  }

  const handleBack = () => {
    setError('')
    setStep(step - 1)
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError('')

    try {
      // Filter out empty competitor URLs
      const validCompetitors = formData.competitors.filter(url => url.trim())
      
      const brandData = {
        name: formData.name.trim(),
        website_url: formData.website_url.trim(),
        industry: formData.industry,
        description: formData.description.trim() || null,
        competitors: validCompetitors.length > 0 ? validCompetitors : null,
        user_id: 'current-user-id' // This would come from auth context
      }

      const newBrand = await createBrand(brandData)
      
      // Redirect to the brand detail page
      router.push(`/dashboard/brands/${newBrand.id}`)
    } catch (error: any) {
      setError(error.message || 'Failed to create brand')
    } finally {
      setLoading(false)
    }
  }

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Brand Information</h2>
        <p className="text-gray-600">
          Tell us about your brand so we can evaluate its AI visibility.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Brand Name *</Label>
          <Input
            id="name"
            placeholder="Enter your brand name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="website_url">Website URL *</Label>
          <div className="relative">
            <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="website_url"
              type="url"
              placeholder="https://example.com"
              value={formData.website_url}
              onChange={(e) => handleInputChange('website_url', e.target.value)}
              className="pl-10"
              required
            />
            {formData.website_url && (
              <div className="absolute right-3 top-3">
                {urlValidation.website_url ? (
                  <CheckCircle className="h-4 w-4 text-success-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-danger-600" />
                )}
              </div>
            )}
          </div>
          {formData.website_url && urlValidation.website_url && (
            <p className="text-xs text-success-600">
              Domain: {extractDomain(formData.website_url)}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="industry">Industry *</Label>
          <Select value={formData.industry} onValueChange={(value) => handleInputChange('industry', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select your industry" />
            </SelectTrigger>
            <SelectContent>
              {industries.map((industry) => (
                <SelectItem key={industry} value={industry}>
                  {industry}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description (Optional)</Label>
          <Textarea
            id="description"
            placeholder="Brief description of your brand and what you do..."
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={3}
          />
          <p className="text-xs text-gray-500">
            This helps our AI models better understand your brand context.
          </p>
        </div>
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Competitor Analysis</h2>
        <p className="text-gray-600">
          Add up to 5 competitor websites for benchmarking your AI visibility against theirs.
        </p>
      </div>

      <div className="space-y-4">
        <Label>Competitor Websites (Optional)</Label>
        {formData.competitors.map((competitor, index) => (
          <div key={index} className="flex items-center space-x-2">
            <div className="flex-1 relative">
              <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder={`Competitor ${index + 1} URL`}
                value={competitor}
                onChange={(e) => handleCompetitorChange(index, e.target.value)}
                className="pl-10"
              />
              {competitor && (
                <div className="absolute right-3 top-3">
                  {urlValidation[`competitor_${index}`] ? (
                    <CheckCircle className="h-4 w-4 text-success-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-danger-600" />
                  )}
                </div>
              )}
            </div>
            {formData.competitors.length > 1 && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => removeCompetitor(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}

        {formData.competitors.length < 5 && (
          <Button
            type="button"
            variant="outline"
            onClick={addCompetitor}
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Competitor
          </Button>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Why add competitors?</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Compare your AI visibility scores against industry leaders</li>
            <li>• Identify gaps and opportunities in your AI presence</li>
            <li>• Get benchmarked recommendations for improvement</li>
          </ul>
        </div>
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Review & Confirm</h2>
        <p className="text-gray-600">
          Please review your brand information before creating the profile.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building2 className="h-5 w-5" />
            <span>{formData.name}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium text-gray-500">Website</Label>
            <p className="text-sm">{formData.website_url}</p>
          </div>
          
          <div>
            <Label className="text-sm font-medium text-gray-500">Industry</Label>
            <Badge variant="secondary">{formData.industry}</Badge>
          </div>

          {formData.description && (
            <div>
              <Label className="text-sm font-medium text-gray-500">Description</Label>
              <p className="text-sm text-gray-700">{formData.description}</p>
            </div>
          )}

          {formData.competitors.filter(c => c.trim()).length > 0 && (
            <div>
              <Label className="text-sm font-medium text-gray-500">Competitors</Label>
              <div className="space-y-1">
                {formData.competitors.filter(c => c.trim()).map((competitor, index) => (
                  <p key={index} className="text-sm text-gray-700">
                    {extractDomain(competitor)}
                  </p>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h4 className="font-medium text-green-900 mb-2">What happens next?</h4>
        <ul className="text-sm text-green-800 space-y-1">
          <li>• Your brand profile will be created</li>
          <li>• You can start your first AI visibility evaluation</li>
          <li>• Results will be available in your dashboard</li>
        </ul>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/dashboard" 
            className="inline-flex items-center text-brand-600 hover:text-brand-700 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
          
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Add New Brand</h1>
            <div className="text-sm text-gray-500">
              Step {step} of 3
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="mt-4 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-brand-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Form */}
        <Card>
          <CardContent className="p-6">
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}

            {/* Navigation */}
            <div className="flex justify-between pt-6 border-t">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={step === 1}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>

              {step < 3 ? (
                <Button onClick={handleNext}>
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={loading}>
                  {loading ? 'Creating Brand...' : 'Create Brand'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}