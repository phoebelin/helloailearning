# How to Find Your Notion Database ID

If you're getting an error about an invalid database ID, follow these steps:

## Quick Method

1. **Open your Notion database** in your browser
2. **Look at the URL bar** - it will look something like:
   ```
   https://www.notion.so/workspace/abc123def456ghi789jkl012mno345pq
   ```
   or
   ```
   https://workspace.notion.site/abc123def456ghi789jkl012mno345pq
   ```

3. **The Database ID is the 32-character string** at the end (before any `?` or `#`)
   - Example: `abc123def456ghi789jkl012mno345pq`
   - This is what you need for `NOTION_DATABASE_ID`

## Common Mistake

❌ **Don't use the page slug/title** - that's the part that looks like:
   - `Al-Learning-for-kids-waitlist-2ada8904de6f8034a7e3daf3`
   - This contains words and is NOT the database ID

✅ **Use the UUID** - that's the 32-character hex string:
   - `2ada8904de6f8034a7e3daf3...` (but make sure it's exactly 32 characters total)

## If the URL is Confusing

1. Open your database
2. Click the **"..."** menu (three dots) in the top right
3. Click **"Copy link"**
4. Paste it somewhere - the database ID is the last part before any `?` or `#`
5. It should be exactly 32 hexadecimal characters (0-9, a-f)

## Example

If your URL is:
```
https://www.notion.so/Hello-AI-Learning/Al-Learning-for-kids-waitlist-2ada8904de6f8034a7e3daf3abc12345?v=xyz
```

The database ID is: `2ada8904de6f8034a7e3daf3abc12345` (the 32-character hex string)

**Note:** The part `Al-Learning-for-kids-waitlist-` is just the page title/slug, ignore it.

