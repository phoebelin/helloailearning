import { Client } from '@notionhq/client';

const notion = new Client({
  auth: process.env.NOTION_API_TOKEN,
});

interface WaitlistEntry {
  email: string;
  name?: string;
}

/**
 * Clean and validate Notion database ID
 * Extracts the UUID from a URL or validates the format
 * Returns the ID WITHOUT hyphens (Notion API prefers this format)
 */
function cleanDatabaseId(databaseId: string): string {
  // Remove any URL parts if present
  let cleaned = databaseId.trim();
  
  // If it contains a URL, extract the ID part
  // Notion URLs look like: https://www.notion.so/workspace/abc123def456...
  // or: https://www.notion.so/abc123def456...
  if (cleaned.includes('notion.so')) {
    // Extract the last part after the last slash
    const parts = cleaned.split('/');
    cleaned = parts[parts.length - 1];
  }
  
  // Remove any query parameters or fragments
  cleaned = cleaned.split('?')[0].split('#')[0];
  
  // Remove hyphens to get the raw UUID
  const uuidWithoutHyphens = cleaned.replace(/-/g, '');
  
  // Validate it's a 32-character hex string
  if (!/^[0-9a-f]{32}$/i.test(uuidWithoutHyphens)) {
    throw new Error(
      `Invalid database ID format. Expected a 32-character UUID, got: ${databaseId}\n` +
      `Please check the setup guide for how to extract the correct database ID from your Notion URL.`
    );
  }
  
  // Return WITHOUT hyphens (Notion API prefers this format)
  return uuidWithoutHyphens;
}

/**
 * Add a waitlist entry to Notion database
 */
export async function addWaitlistEntry({ email, name }: WaitlistEntry) {
  try {
    if (!process.env.NOTION_DATABASE_ID) {
      throw new Error('NOTION_DATABASE_ID is not configured');
    }

    if (!process.env.NOTION_API_TOKEN) {
      throw new Error('NOTION_API_TOKEN is not configured');
    }

    // Clean and validate the database ID
    const databaseId = cleanDatabaseId(process.env.NOTION_DATABASE_ID);
    
    // Log for debugging (first 8 chars only for security)
    console.log('Using database ID:', databaseId.substring(0, 8) + '...');

    // Retrieve database schema to determine property types
    const database = await notion.databases.retrieve({ database_id: databaseId });
    const db = database as any; // Handle Notion API response type
    const dbProperties = db.properties || {};

    // Log all properties for debugging
    const propertyKeys = Object.keys(dbProperties);
    console.log('Database properties found:', propertyKeys.length);
    console.log('Database properties:', propertyKeys.map(key => ({
      name: key,
      type: dbProperties[key]?.type || 'unknown'
    })));

    // Build properties based on actual database schema
    const properties: any = {};

    // Handle Email property
    if (dbProperties.Email) {
      if (dbProperties.Email.type === 'email') {
        properties.Email = {
          type: 'email',
          email: email,
        };
      } else if (dbProperties.Email.type === 'title') {
        properties.Email = {
          type: 'title',
          title: [
            {
              text: {
                content: email,
              },
            },
          ],
        };
      } else {
        // Fallback: try email type first
        properties.Email = {
          type: 'email',
          email: email,
        };
      }
    } else {
      // If Email property doesn't exist, try email type
      properties.Email = {
        type: 'email',
        email: email,
      };
    }

    // Handle Name property
    if (name) {
      if (dbProperties.Name) {
        if (dbProperties.Name.type === 'title') {
          properties.Name = {
            type: 'title',
            title: [
              {
                text: {
                  content: name,
                },
              },
            ],
          };
        } else if (dbProperties.Name.type === 'rich_text') {
          properties.Name = {
            type: 'rich_text',
            rich_text: [
              {
                text: {
                  content: name,
                },
              },
            ],
          };
        } else {
          // Fallback: try title type
          properties.Name = {
            type: 'title',
            title: [
              {
                text: {
                  content: name,
                },
              },
            ],
          };
        }
      } else {
        // If Name property doesn't exist, try title type
        properties.Name = {
          type: 'title',
          title: [
            {
              text: {
                content: name,
              },
            },
          ],
        };
      }
    }

    // Handle Date property - always set "Date submitted" 
    // Since we know the property exists and is named "Date submitted"
    const currentDate = new Date().toISOString();
    const datePropertyName = 'Date submitted';
    
    // Always try to set the date property, regardless of whether we detected it
    // The property exists in the database, so we'll set it
    properties[datePropertyName] = {
      type: 'date',
      date: {
        start: currentDate,
      },
    };
    
    console.log('Setting date property:', {
      propertyName: datePropertyName,
      date: currentDate,
      propertiesBeingSent: Object.keys(properties)
    });

    // Log the final properties object before sending
    console.log('Final properties object:', JSON.stringify(properties, null, 2));
    
    const response = await notion.pages.create({
      parent: {
        database_id: databaseId,
      },
      properties,
    });
    
    console.log('Page created successfully:', response.id);

    return {
      success: true,
      pageId: response.id,
    };
  } catch (error: any) {
    console.error('Error adding waitlist entry to Notion:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    console.error('Error body:', error.body);
    
    // Handle specific Notion API errors
    if (error.code === 'object_not_found') {
      return {
        success: false,
        error: 'Database not found. Make sure: 1) Your integration is connected to the database (check Connections in database settings), 2) Your NOTION_DATABASE_ID is correct (32-character UUID), 3) The database exists and is accessible.',
      };
    }
    
    if (error.code === 'unauthorized') {
      return {
        success: false,
        error: 'Unauthorized. Please check your NOTION_API_TOKEN is correct and the integration has access to the database.',
      };
    }

    // Check if it's a validation error about the date property
    if (error.message && error.message.includes('Date submitted')) {
      console.error('Date property validation error detected');
      return {
        success: false,
        error: `Date property error: ${error.message}. Please check that "Date submitted" property exists and is of type "Date" in your Notion database.`,
      };
    }

    // Log full error for debugging
    console.error('Full Notion API error:', JSON.stringify(error, null, 2));

    return {
      success: false,
      error: error.message || 'Failed to add entry to waitlist',
    };
  }
}

