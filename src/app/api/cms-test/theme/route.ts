import { NextRequest, NextResponse } from 'next/server';
import { themeManager } from '@/lib/cms/cms-client';

/**
 * CMS Test API - No Auth Required
 * For testing CMS functionality without authentication
 */

// GET /api/cms-test/theme - Get current theme settings
export async function GET(req: NextRequest) {
  try {
    const [colors, fonts, typography] = await Promise.all([
      themeManager.getThemeColors(),
      themeManager.getThemeFonts(),
      themeManager.getTypography()
    ]);

    return NextResponse.json({
      colors,
      fonts,
      typography
    });
  } catch (error) {
    console.error('Failed to get theme:', error);
    return NextResponse.json(
      { error: 'Failed to load theme settings' },
      { status: 500 }
    );
  }
}

// PUT /api/cms-test/theme - Update theme settings (NO AUTH CHECK for testing)
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { colors, fonts, typography } = body;
    const testUserId = 'test-user'; // Hardcoded for testing

    // Update theme settings
    if (colors) {
      await themeManager.updateThemeColors(colors, testUserId);
    }

    if (fonts) {
      await themeManager.updateThemeFonts(fonts, testUserId);
    }

    if (typography) {
      await themeManager.updateTypography(typography, testUserId);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update theme:', error);
    return NextResponse.json(
      { error: 'Failed to update theme settings', details: error },
      { status: 500 }
    );
  }
}

