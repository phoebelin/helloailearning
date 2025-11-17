import { NextRequest, NextResponse } from 'next/server';
import { addWaitlistEntry } from '@/lib/services/notion-waitlist';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name } = body;

    // Validate email
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate name if provided
    if (name && typeof name !== 'string') {
      return NextResponse.json(
        { error: 'Name must be a string' },
        { status: 400 }
      );
    }

    // Add to Notion
    const result = await addWaitlistEntry({ email, name });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to add to waitlist' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully added to waitlist',
    });
  } catch (error: any) {
    console.error('Waitlist API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

