import { NextRequest, NextResponse } from 'next/server';
import { Client } from '@notionhq/client';

/**
 * List all databases accessible by the integration
 * GET /api/waitlist/list-databases
 * 
 * This helps you find the correct database ID if you're having trouble
 */
export async function GET(request: NextRequest) {
  try {
    if (!process.env.NOTION_API_TOKEN) {
      return NextResponse.json(
        { error: 'NOTION_API_TOKEN is not configured' },
        { status: 500 }
      );
    }

    const notion = new Client({
      auth: process.env.NOTION_API_TOKEN,
    });

    // Search for all items
    const response = await notion.search({});

    // Filter results to only include databases
    const databases = response.results
      .filter((item: any) => item.object === 'database')
      .map((item: any) => ({
        id: item.id,
        idWithoutHyphens: item.id.replace(/-/g, ''),
        title: item.title?.[0]?.plain_text || 'Untitled',
        url: item.url,
        properties: Object.keys(item.properties || {}),
      }));

    // Also show what types of items the integration CAN see
    const itemTypes = response.results.reduce((acc: any, item: any) => {
      acc[item.object] = (acc[item.object] || 0) + 1;
      return acc;
    }, {});

    if (databases.length === 0) {
      const hasAnyAccess = response.results.length > 0;
      
      return NextResponse.json({
        success: true,
        count: 0,
        databases: [],
        itemTypes,
        totalItemsFound: response.results.length,
        error: 'No databases found',
        diagnosis: hasAnyAccess 
          ? 'Integration can see some items but no databases. The database may be private and not connected to the integration.'
          : 'Integration cannot see any items. This could mean: 1) Integration has no workspace access, 2) All items are private and not shared, 3) Integration token is invalid.',
        troubleshooting: [
          '**If your database is PRIVATE, you MUST connect the integration:**',
          '',
          '1. Open your Waitlist database in Notion',
          '2. Click the "..." menu (three dots) in the top right corner',
          '3. Select "Connections" or "Add connections"',
          '4. Find your integration in the list (e.g., "Hello AI Learning Waitlist")',
          '5. Toggle it ON or click "Connect"',
          '6. Make sure it shows as "Connected"',
          '',
          '**Alternative method (if Connections option is not available):**',
          '',
          '1. Right-click on the database in the Notion sidebar',
          '2. Select "Share"',
          '3. In the share dialog, type your integration name',
          '4. Add it as a collaborator',
          '',
          '**Important for private databases:**',
          '- Private databases are NOT accessible by default',
          '- The integration must be explicitly connected/shared',
          '- Even if the integration is in the same workspace, it needs explicit access',
        ],
        note: hasAnyAccess 
          ? 'Integration is working (can see some items), but needs to be connected to your specific database.'
          : 'Integration may not have workspace access. Check integration settings at notion.so/my-integrations',
      });
    }

    return NextResponse.json({
      success: true,
      count: databases.length,
      databases,
      itemTypes,
      totalItemsFound: response.results.length,
      instructions: [
        '1. Find your waitlist database in the list above',
        '2. Copy the "idWithoutHyphens" value',
        '3. Update your .env.local file: NOTION_DATABASE_ID=<idWithoutHyphens>',
        '4. Restart your dev server',
      ],
    });
  } catch (error: any) {
    console.error('List databases error:', error);
    
    if (error.code === 'unauthorized') {
      return NextResponse.json(
        { 
          error: 'Unauthorized',
          message: 'Your NOTION_API_TOKEN is invalid or the integration has been revoked',
          troubleshooting: [
            '1. Go to https://www.notion.so/my-integrations',
            '2. Check that your integration exists and is active',
            '3. Copy a fresh integration token',
            '4. Update your .env.local file',
          ]
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Failed to list databases',
        message: error.message,
        code: error.code,
      },
      { status: 500 }
    );
  }
}

