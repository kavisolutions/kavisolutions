# Kavi Farms — page handover

Status: **built, not launched.** `/farms` returns 404 until an administrator
enables it under **Settings → Live pages → Kavi Farms**.

## What exists

| Piece | Location |
| --- | --- |
| Page component | `app/components/FarmsPage.tsx` |
| Enquiry form | `app/components/FarmsForms.tsx` |
| Editable content | `app/lib/farms-data.ts` |
| Route + launch gate | `app/app/farms/page.tsx` |
| API endpoint | `api/src/modules/farms/` |
| Email template | `api/src/_shared/mailer.ts` → `sendFarmsEnquiryEmail` |

## Content rules

- Prices are deliberately **“Price on enquiry”**. Confirm current availability
  and the package contribution before accepting any payment.
- The tourism package is a working farm experience, not a resort booking. Do
  not promise hotel-style amenities, guaranteed waterfalls or fixed weather.
- Product photography is placeholder until real farm photographs are supplied.
- The page is written as a separate vertical with its own identity. Keep it
  modular so it can move to its own domain later.

## Enquiries

`POST /api/farms/enquiries` is public and throttled to 5 requests/minute per IP.
`kind` is `"product"` or `"tourism"`; the controller rejects fields from the
wrong track. The recipient comes from admin settings (`contact_email`), falling
back to `SMTP_USER`. Subject prefix: `[Kavi Farms]`.

## Publishing

1. Sign in as an administrator.
2. Open **Admin → Settings → Live pages**.
3. Toggle **Kavi Farms** to Published.
4. The page is live on the next request; no rebuild is needed.
5. Add navigation/footer links only after publishing.

## Future scope

- Product inventory, real prices and checkout.
- Package availability calendar and booking deposits.
- Amazon/Flipkart seller integrations.
- A separate Kavi Farms domain and brand system.
