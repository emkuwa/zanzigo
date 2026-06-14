export async function GET() {
  return new Response(
    `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /driver/
Disallow: /api/

Sitemap: https://zanzigo.com/sitemap.xml
`,
    {
      headers: {
        'Content-Type': 'text/plain',
      },
    }
  );
}
