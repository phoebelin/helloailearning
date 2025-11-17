import { NextRequest, NextResponse } from 'next/server';
import { Client } from '@notionhq/client';

/**
 * Test endpoint to verify Notion connection
 * GET /api/waitlist/test
 */
export async function GET(request: NextRequest) {
  try {
    // Check environment variables
    if (!process.env.NOTION_API_TOKEN) {
      return NextResponse.json(
        { 
          error: 'NOTION_API_TOKEN is not configured',
          check: 'Make sure .env.local exists and contains NOTION_API_TOKEN'
        },
        { status: 500 }
      );
    }

    if (!process.env.NOTION_DATABASE_ID) {
      return NextResponse.json(
        { 
          error: 'NOTION_DATABASE_ID is not configured',
          check: 'Make sure .env.local exists and contains NOTION_DATABASE_ID'
        },
        { status: 500 }
      );
    }

    // Initialize Notion client
    const notion = new Client({
      auth: process.env.NOTION_API_TOKEN,
    });

    // Clean database ID (remove hyphens)
    let databaseId = process.env.NOTION_DATABASE_ID.trim();
    const originalId = databaseId;
    databaseId = databaseId.replace(/-/g, '');
    
    // Validate format
    if (!/^[0-9a-f]{32}$/i.test(databaseId)) {
      return NextResponse.json(
        { 
          error: 'Invalid database ID format',
          received: process.env.NOTION_DATABASE_ID,
          cleaned: databaseId,
          expected: '32 hexadecimal characters (0-9, a-f)',
          hint: 'The database ID should be the 32-character hex string from your Notion URL'
        },
        { status: 400 }
      );
    }

    // Try to retrieve the database directly
    // Note: Even if connected, the database might not show in search results
    // But we can still access it directly by ID
    try {
      console.log('Attempting to retrieve database with ID:', databaseId.substring(0, 8) + '...');
      const database = await notion.databases.retrieve({ database_id: databaseId });
      
      // Access properties correctly - handle Notion API response type
      const db = database as any;
      const properties = db.properties || {};
      const propertyKeys = Object.keys(properties);
      const propertyDetails = propertyKeys.map((key) => {
        const prop = properties[key] as any;
        return {
          name: key,
          type: prop.type,
          // Include more details for debugging
          ...(prop.type === 'date' && { dateFormat: prop.date?.format }),
        };
      });

      const title = db.title && Array.isArray(db.title) 
        ? db.title[0]?.plain_text || 'Untitled'
        : 'Untitled';

      return NextResponse.json({
        success: true,
        message: 'Connection successful!',
        database: {
          id: db.id,
          title: title,
          properties: propertyKeys,
          propertyDetails: propertyDetails,
          rawPropertiesCount: propertyKeys.length,
        },
        checks: {
          hasEmailProperty: 'Email' in properties,
          hasNameProperty: 'Name' in properties,
          hasDateProperty: propertyDetails.some(p => p.type === 'date'),
          dateProperties: propertyDetails.filter(p => p.type === 'date').map(p => p.name),
        }
      });
    } catch (notionError: any) {
      console.error('Notion API error:', {
        code: notionError.code,
        message: notionError.message,
        status: notionError.status,
      });

      if (notionError.code === 'object_not_found') {
        // Try with hyphens in case that's the issue
        const withHyphens = `${databaseId.slice(0, 8)}-${databaseId.slice(8, 12)}-${databaseId.slice(12, 16)}-${databaseId.slice(16, 20)}-${databaseId.slice(20, 32)}`;
        
        return NextResponse.json(
          { 
            error: 'Database not found',
            databaseId: databaseId.substring(0, 8) + '...',
            originalId: originalId,
            triedFormat: 'without hyphens',
            troubleshooting: [
              '1. Double-check the database ID is correct:',
              `   - Original: ${originalId}`,
              `   - Cleaned: ${databaseId.substring(0, 8)}...`,
              '',
              '2. Verify the integration is connected:',
              '   - Open database → "..." → "Connections"',
              '   - Make sure your integration shows as "Connected"',
              '',
              '3. Try getting the database ID from the URL:',
              '   - Open your database in Notion',
              '   - Look at the URL: https://www.notion.so/workspace/DATABASE_ID',
              '   - The DATABASE_ID is the 32-character hex string',
              '   - Copy it EXACTLY (with or without hyphens)',
              '',
              '4. If still not working, try the list-databases endpoint:',
              '   http://localhost:3000/api/waitlist/list-databases',
              '   This will show all databases your integration can access',
            ],
            note: 'Even if connected, the database must be accessible via the API. Try the list-databases endpoint to see what your integration can access.'
          },
          { status: 404 }
        );
      }
      
      if (notionError.code === 'unauthorized') {
        return NextResponse.json(
          { 
            error: 'Unauthorized',
            troubleshooting: [
              '1. Check your NOTION_API_TOKEN is correct',
              '2. Verify the integration has access to the database',
              '3. Make sure the integration is connected to the database'
            ]
          },
          { status: 401 }
        );
      }

      throw notionError;
    }
  } catch (error: any) {
    console.error('Test endpoint error:', error);
    return NextResponse.json(
      { 
        error: 'Unexpected error',
        message: error.message,
        details: error.code || 'Unknown error code'
      },
      { status: 500 }
    );
  }
}

