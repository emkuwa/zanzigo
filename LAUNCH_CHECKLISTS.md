
# ZanziGo Launch Checklists

## 1. Driver Onboarding Checklist
- [ ] Verify driver's Zanzibar Taxi License.
- [ ] Confirm vehicle inspection and photo upload.
- [ ] Walk through the "One-Click Acceptance" flow.
- [ ] Test the "Online/Offline" toggle.
- [ ] Set up driver's WhatsApp notifications and verify delivery.
- [ ] Ensure driver knows to collect payment in USD/TZS directly.

## 2. Tourist Testing Checklist
- [ ] Test booking from mobile and desktop.
- [ ] Verify route pricing is accurate for all 17 seeded routes.
- [ ] Confirm success email/notification (if implemented).
- [ ] Verify "Track Booking" link works after submission.
- [ ] Test "Cancel Booking" flow.

## 3. Launch Day Checklist
- [ ] Change `WHATSAPP_PROVIDER` from `mock` to `whatsapp_cloud` or `twilio`.
- [ ] Verify `NEXT_PUBLIC_APP_URL` is set to `https://zanzigo.com`.
- [ ] Clear all test bookings and logs from the database.
- [ ] Monitor Admin Dashboard for the first 10 live requests.
- [ ] Check server logs for any 500 errors during peak usage.

## 4. Post-Launch Monitoring Checklist
- [ ] Review "Acceptance Rate" daily (Target: >80%).
- [ ] Monitor "Avg Response Time" (Target: <5 minutes).
- [ ] Weekly review of "Top Drivers" and "Popular Routes".
- [ ] Check "Conversion Rate" to see if the form is too long or confusing.
- [ ] Analyze "Cancelled Trips" to find common reasons.

---
**Target: 20 Drivers & 50 Bookings in Week 1** 🚀
