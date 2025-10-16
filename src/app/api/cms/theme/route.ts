import { NextRequest, NextResponse } from 'next/server';
import { themeManager } from '@/lib/cms/cms-client';
import { getServerSession } from 'next-auth/next';

// GET /api/cms/theme - Get current theme settings
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

// PUT /api/cms/theme - Update theme settings
export async function PUT(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { colors, fonts, typography } = body;

    // Update theme settings
    const userId = (session.user as any).id || (session.user as any).email || 'system';
    
    if (colors) {
      await themeManager.updateThemeColors(colors, userId);
    }

    if (fonts) {
      await themeManager.updateThemeFonts(fonts, userId);
    }

    if (typography) {
      await themeManager.updateTypography(typography, userId);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update theme:', error);
    return NextResponse.json(
      { error: 'Failed to update theme settings' },
      { status: 500 }
    );
  }
}

