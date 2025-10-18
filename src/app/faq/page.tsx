import { FigmaFAQPage } from '@/components/FigmaFAQPage'

// Disable caching so CMS changes appear immediately
export const revalidate = 0;

export default async function FAQPage() {
  // Use Figma design
  // CMS FAQ content integration will be added in future enhancement
  return <FigmaFAQPage />;
}
