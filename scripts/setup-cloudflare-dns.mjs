#!/usr/bin/env node
/**
 * Create/update Cloudflare CNAME for zanzigo.zanzibaba.com
 * Requires: CLOUDFLARE_API_TOKEN, CLOUDFLARE_ZONE_ID (zanzibaba.com)
 * Optional: VERCEL_CNAME_TARGET (default cname.vercel-dns.com)
 *
 * Run: node scripts/setup-cloudflare-dns.mjs
 */
const token = process.env.CLOUDFLARE_API_TOKEN?.trim();
const zoneId = process.env.CLOUDFLARE_ZONE_ID?.trim();
const target = process.env.VERCEL_CNAME_TARGET?.trim() || "cname.vercel-dns.com";
const name = process.env.ZANZIGO_DNS_NAME?.trim() || "zanzigo";

if (!token || !zoneId) {
  console.error("Set CLOUDFLARE_API_TOKEN and CLOUDFLARE_ZONE_ID (zanzibaba.com zone).");
  process.exit(1);
}

const headers = {
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
};

async function listRecords() {
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records?type=CNAME&name=${name}.zanzibaba.com`,
    { headers },
  );
  const json = await res.json();
  if (!json.success) throw new Error(JSON.stringify(json.errors));
  return json.result;
}

async function upsert() {
  const existing = await listRecords();
  const body = {
    type: "CNAME",
    name,
    content: target,
    proxied: true,
    ttl: 1,
  };

  if (existing.length > 0) {
    const id = existing[0].id;
    const res = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records/${id}`,
      { method: "PUT", headers, body: JSON.stringify(body) },
    );
    const json = await res.json();
    if (!json.success) throw new Error(JSON.stringify(json.errors));
    console.log("Updated CNAME:", `${name}.zanzibaba.com → ${target}`);
    return;
  }

  const res = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!json.success) throw new Error(JSON.stringify(json.errors));
  console.log("Created CNAME:", `${name}.zanzibaba.com → ${target}`);
}

upsert().catch((e) => {
  console.error(e);
  process.exit(1);
});
