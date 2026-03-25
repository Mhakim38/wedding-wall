# Wedding Wall - Next Session Plan

## Current Status (2026-03-25)
- **Deployment:** Live on Vercel (Deployed Mar 25).
- **Database:** Production DB synced with `giftQrCodeUrl`.
- **UI:** Gallery layout refined for mobile.
  - Header is smaller on mobile.
  - QR Code & Gift buttons are minimal icon-only buttons.
  - "Join QR" and "Gift QR" (Angpao) are hidden behind an options menu (`...`).
- **Features:**
  - `localStorage` for persistent guest names.
  - Client-side image compression (max 1MB).
  - Session QR Code generation (on-the-fly).
  - Money Gift (Angpao) QR upload in Admin (`/secret-coffee`).

- **Fixes (2026-03-25):**
  - **UI Cleanup**: Removed duplicate "Uploading..." blue indicator (now only on button).
  - **Name Persistence**: Fixed `localStorage` logic so guest name auto-fills.
  - **Security**: Uploaded files now renamed to `timestamp-randomString.ext` to prevent malicious filenames.
  - **Error Handling**: Added graceful handling for non-JSON errors (e.g., "Entity Too Large").

## Next Steps (Deployment)
1. **Push to GitHub**: Sync local commits to the repository linked to Vercel.
2. **Database Migration**: The production database (Supabase) needs the new schema (`giftQrCodeUrl`).
   - Run `npx prisma migrate deploy` against the production DB URL.
3. **Environment Variables**: Verify `NEXT_PUBLIC_...` variables if needed (none added today, but good to check).
4. **Vercel Build**: Trigger a new deployment to install the new dependencies:
   - `qrcode`
   - `browser-image-compression`
   - `@fortawesome/free-solid-svg-icons` (updated imports)

## Questions/Risks
- Does the production environment have the correct AWS S3 permissions for the new `admin-uploads/` folder? (Should work if bucket policy is standard).
