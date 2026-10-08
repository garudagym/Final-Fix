# Garuda Fitness Zone V150 — Persistent Data + Auto SMS + Manual Fee Payment

## What changed
- Member data is read from MongoDB `Member` records instead of trusting the browser `clientDb` snapshot.
- Existing members are no longer overwritten on every Render restart/deploy. The demo member is only created when missing.
- Uploaded gallery/member images are stored as MongoDB `Media` documents and served through `/api/media/:id`, so they survive Render restarts/redeploys.
- Admin Payments now loads from `/api/payments`.
- Added Admin → Payments → **Mark membership fee as paid** for cash, UPI, bank transfer, or card payments made at the gym.
- Manual payments update the member's fee due date by 30 days, create a permanent Payment record, create an in-app notification, and attempt SMS automatically.
- Renewal reminders continue to run hourly and can send SMS when configured.
- SMS providers supported: generic JSON SMS API, MSG91, Twilio, and Meta WhatsApp Cloud API (Meta is WhatsApp, not SMS).

## Render SMS environment variables
### Generic SMS provider
- `SMS_PROVIDER=generic`
- `SMS_API_KEY=<your key>`
- `SMS_API_URL=<your provider JSON endpoint>`
- `SMS_FROM=<sender>

### MSG91
- `SMS_PROVIDER=msg91`
- `SMS_API_KEY=<MSG91 auth key>`
- `SMS_API_URL=https://control.msg91.com/api/v5/flow/` (or your approved endpoint)
- `SMS_FROM=<approved sender ID>`
- `MSG91_TEMPLATE_ID=<approved DLT template ID>`

### Meta WhatsApp Cloud API
- `SMS_PROVIDER=meta-whatsapp`
- `META_ACCESS_TOKEN=<Meta access token>`
- `META_PHONE_NUMBER_ID=<WhatsApp phone number ID>`
- `SMS_API_KEY` may also be used as the token fallback.

Meta WhatsApp sends WhatsApp messages, not carrier SMS.
