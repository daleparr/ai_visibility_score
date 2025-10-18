// Homepage with Figma design and CMS integration
import { contentManager } from '@/lib/cms/cms-client'
import { MinimalHomepageVariant } from '@/components/homepage/MinimalVariant'
import { FigmaHomepage } from '@/components/FigmaHomepage'

// Disable caching so CMS changes appear immediately
export const revalidate = 0;

export default async function HomePage() {
  // Check which homepage variant to display
  let homepageVariant = 'figma'; // Default to Figma design
  
  try {
    const variantSetting = await contentManager.getBlockByKey('homepage', 'homepage_variant');
    homepageVariant = variantSetting?.active_variant || 'figma';
  } catch (error) {
    console.log('Homepage variant not set, using Figma version');
  }

  // If minimal variant selected, render that instead
  if (homepageVariant === 'minimal') {
    return <MinimalHomepageVariant />;
  }

  // Use Figma design with CMS integration
  return <FigmaHomepage />;
}