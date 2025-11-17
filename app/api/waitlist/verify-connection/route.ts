import { NextRequest, NextResponse } from 'next/server';
import { Client } from '@notionhq/client';

/**
 * Verify connection to a specific database
 * POST /api/waitlist/verify-connection
 * Body: { databaseId: string }
 */
export async function POST(request: NextRequest) {
  try {
    if (!process.env.NOTION_API_TOKEN) {
      return NextResponse.json(
        { error: 'NOTION_API_TOKEN is not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    let { databaseId } = body;

    if (!databaseId) {
      databaseId = process.env.NOTION_DATABASE_ID;
    }

    if (!databaseId) {
      return NextResponse.json(
        { error: 'Database ID is required' },
        { status: 400 }
      );
    }

    const notion = new Client({
      auth: process.env.NOTION_API_TOKEN,
    });

    // Clean database ID
    const originalId = databaseId.trim();
    let cleanedId = originalId.replace(/-/g, '');

    // Validate format
    if (!/^[0-9a-f]{32}$/i.test(cleanedId)) {
      return NextResponse.json(
        { 
          error: 'Invalid database ID format',
          received: originalId,
          cleaned: cleanedId,
        },
        { status: 400 }
      );
    }

    // Try different formats
    const formats = [
      cleanedId, // Without hyphens
      `${cleanedId.slice(0, 8)}-${cleanedId.slice(8, 12)}-${cleanedId.slice(12, 16)}-${cleanedId.slice(16, 20)}-${cleanedId.slice(20, 32)}`, // With hyphens
    ];

    const results = [];

    for (const format of formats) {
      try {
        const database = await notion.databases.retrieve({ database_id: format });
        results.push({
          format,
          success: true,
          database: {
            id: database.id,
            title: database.title?.[0]?.plain_text || 'Untitled',
            properties: Object.keys(database.properties || {}),
          },
        });
        break; // If one works, stop trying
      } catch (error: any) {
        results.push({
          format,
          success: false,
          error: error.code || error.message,
        });
      }
    }

    const successful = results.find(r => r.success);

    if (successful) {
      return NextResponse.json({
        success: true,
        message: 'Database connection verified!',
        workingFormat: successful.format,
        database: successful.database,
        allAttempts: results,
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Could not connect to database with any format',
        attempts: results,
        troubleshooting: [
          '1. Make sure the integration is connected to the database',
          '2. Check that the database ID is correct (32 hex characters)',
          '3. Verify the integration has access to the workspace',
        ],
      },
      { status: 404 }
    );
  } catch (error: any) {
    console.error('Verify connection error:', error);
    return NextResponse.json(
      { 
        error: 'Unexpected error',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

