# Migration scripts

One-time maintenance scripts. These run locally with a Firebase Admin
service account — they are never deployed and are not part of the app
build.

## migrate-creator-id.js

Required after the Firestore security rules rewrite (see root README /
CTO review). Stamps `creatorId` onto your existing deals and profile so
they remain visible under the new owner-scoped rules.

```bash
cd scripts
npm install
node migrate-creator-id.js \
  --serviceAccount=/path/to/serviceAccountKey.json \
  --creatorId=<your-firebase-auth-uid> \
  [--rekey]
```

**Before running:**
1. Sign into the app once with the new Google sign-in screen.
2. Firebase Console → Authentication → Users → copy your User UID. That's
   `--creatorId`.
3. Firebase Console → Project Settings → Service accounts → Generate new
   private key. Save it *outside* this repo if possible. **Never commit
   this file** — it grants full admin access to your database.

**`--rekey`** additionally replaces old guessable IDs (`deal-1`, `deal-2`,
...) with random tokens. Recommended, but breaks any brand portal links
you've already shared — see the comment at the top of the script.
