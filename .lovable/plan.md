
Add Google Sign-In to the auth page using Lovable Cloud's managed Google OAuth (no credentials setup needed from the user).

## Plan

1. **Run the Configure Social Login tool for Google** — this generates `src/integrations/lovable/` module and installs `@lovable.dev/cloud-auth-js`. (Required first step; cannot edit those files manually.)

2. **Update `src/pages/Auth.tsx`**:
   - Add a "Continue with Google" button above the email/password form, separated by a divider ("or continue with email").
   - Wire it to `lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin })`.
   - Handle the result: if `result.error`, show toast; if `result.redirected`, return; otherwise navigate to `/`.
   - Add a Google "G" icon (inline SVG) for the button.

3. **Verify auth flow**: existing `useAuth` `onAuthStateChange` listener already handles session creation, and `handle_new_user` DB trigger auto-creates the company + profile + admin role on first signup — so Google sign-ups will get the same multi-tenant setup automatically.

## Notes
- Uses Lovable Cloud's managed Google OAuth — no Google Cloud Console setup required.
- Works on both preview and published URLs out of the box.
- No DB or edge function changes needed.
