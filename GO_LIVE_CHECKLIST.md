# GO_LIVE_CHECKLIST.md

**Project:** ZanziGo
**Target Launch:** TBD
**Last Updated:** 2026-06-14

---

## PRE-LAUNCH (Must Complete)

### Infrastructure
- [ ] Set `WHATSAPP_CLOUD_ACCESS_TOKEN` in Vercel env vars
- [ ] Set `SUPABASE_SERVICE_ROLE_KEY` in Vercel env vars
- [ ] Verify Cloudflare DNS: `zanzigo.zanzibaba.com` → `cname.vercel-dns.com`
- [ ] Verify SSL certificate active on `zanzigo.zanzibaba.com`
- [ ] Test production URL loads correctly
- [ ] Verify all env vars present in Vercel dashboard

### Security
- [ ] Add admin authentication to `/admin/*` pages
- [ ] Tighten RLS policies (replace `WITH CHECK (true)`)
- [ ] Add CSRF protection or verify Supabase handles it
- [ ] Remove debug endpoints if any remain
- [ ] Verify no secrets in client-side code

### Database
- [ ] Verify `route_pricing` table has all 26 routes
- [ ] Verify `seasons` table has 3 seasons with correct multipliers
- [ ] Verify `settings` table has exchange_rate = 2800
- [ ] Run a test booking end-to-end
- [ ] Run a test driver registration end-to-end
- [ ] Verify trip assignment flow works

### WhatsApp Integration
- [ ] Configure WhatsApp Cloud API token
- [ ] Test booking confirmation message sends
- [ ] Test driver notification message sends
- [ ] Test trip acceptance message sends
- [ ] Verify acceptance token links work

### Admin
- [ ] Verify admin dashboard loads with stats
- [ ] Verify pricing management (edit prices)
- [ ] Verify seasons management (add/edit/delete)
- [ ] Verify driver approval flow
- [ ] Verify CSV export downloads
- [ ] Test settings page saves changes

### Driver Flow
- [ ] Verify driver registration form works
- [ ] Verify driver dashboard shows available requests
- [ ] Verify driver can accept a request
- [ ] Verify driver can start/complete a trip
- [ ] Verify earnings page shows data
- [ ] Verify profile page saves changes

### Tourist Flow
- [ ] Verify booking form loads with locations
- [ ] Verify price calculation shows correct USD/TZS
- [ ] Verify seasonal pricing applied correctly
- [ ] Verify booking submission creates request
- [ ] Verify booking status page shows updates
- [ ] Verify review form works after trip completion

---

## LAUNCH DAY

### Morning
- [ ] Run health check: `curl https://zanzigo.zanzibaba.com/api/health`
- [ ] Verify no Vercel function errors in dashboard
- [ ] Test one complete booking flow manually
- [ ] Send test WhatsApp message

### Go Live
- [ ] Announce on social media
- [ ] Monitor first 10 bookings
- [ ] Watch for error spikes
- [ ] Respond to driver inquiries

---

## POST-LAUNCH (Week 1)

- [ ] Monitor booking conversion rate
- [ ] Track driver acceptance rate
- [ ] Review WhatsApp delivery rates
- [ ] Gather tourist feedback
- [ ] Fix any critical bugs
- [ ] Optimize slow queries if any

---

## POST-LAUNCH (Month 1)

- [ ] Add payment integration (if needed)
- [ ] Implement driver ratings system
- [ ] Add booking cancellation flow
- [ ] Implement referral tracking
- [ ] Add multi-language support
- [ ] Performance optimization

---

## EMERGENCY CONTACTS

| Role | Contact |
|------|---------|
| Developer | emkuwa |
| Supabase Dashboard | https://supabase.com/dashboard/project/qmnpwinlvewbnjbruril |
| Vercel Dashboard | https://vercel.com/emkuwa-gmailcoms-projects/zanzigo |
| Cloudflare | zanzibaba.com zone |

---

## ROLLBACK PLAN

If critical issues occur:
1. Revert to previous Vercel deployment: `vercel rollback`
2. Or set maintenance page
3. Communicate via WhatsApp status page
