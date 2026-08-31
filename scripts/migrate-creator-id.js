/**
 * One-time migration for the Firestore security rules rewrite.
 *
 * Before: deals had no `creatorId` field and lived under sequential IDs
 * (deal-1, deal-2...); the profile lived at creators/creator_sarah_jenkins.
 * The new firestore.rules require every deal to carry `creatorId` matching
 * a real Firebase Auth uid, or the creator dashboard will no longer be able
 * to list them (they won't disappear from the database, just from the UI).
 *
 * This script uses the Admin SDK (which bypasses security rules) to:
 *   1. Copy creators/creator_sarah_jenkins -> creators/<your-auth-uid>
 *   2. Stamp creatorId=<your-auth-uid> on every existing deal that's missing it
 *   3. (optional, --rekey) Replace old sequential/guessable deal IDs with
 *      random tokens, matching how new deals are created client-side.
 *
 * WARNING about --rekey: any brand portal links you've already shared
 * (?brand_portal=deal-1 etc.) will stop working once that deal's ID
 * changes. You'll need to regenerate and resend those links. If you have
 * no live/pending brand links yet, --rekey is safe and recommended. If
 * you do, run this once WITHOUT --rekey first, then re-share links, then
 * decide.
 *
 * USAGE:
 *   cd scripts
 *   npm install
 *   node migrate-creator-id.js \
 *     --serviceAccount=/path/to/serviceAccountKey.json \
 *     --creatorId=<your-firebase-auth-uid> \
 *     [--rekey]
 *
 * Where to get each value:
 *   --serviceAccount : Firebase Console -> Project Settings -> Service
 *                       accounts -> Generate new private key. Save it
 *                       somewhere OUTSIDE this repo (or it'll be caught
 *                       by .gitignore if you do put it in scripts/, but
 *                       outside is safer). Never commit this file.
 *   --creatorId      : Sign into the app once with Google (the new
 *                       sign-in screen), then Firebase Console ->
 *                       Authentication -> Users -> copy your User UID.
 */

const path = require('path');
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');

const FIRESTORE_DATABASE_ID = 'ai-studio-madeal-1d73da09-3136-445a-9578-c3a910a6802c';
const LEGACY_CREATOR_DOC_ID = 'creator_sarah_jenkins';

function parseArgs() {
  const args = {};
  for (const arg of process.argv.slice(2)) {
    const match = arg.match(/^--([^=]+)(?:=(.*))?$/);
    if (match) args[match[1]] = match[2] ?? true;
  }
  return args;
}

function generateSecureId(prefix) {
  const crypto = require('crypto');
  return `${prefix}_${crypto.randomUUID()}`;
}

async function main() {
  const args = parseArgs();

  if (!args.serviceAccount || !args.creatorId) {
    console.error(
      'Usage: node migrate-creator-id.js --serviceAccount=<path> --creatorId=<uid> [--rekey]'
    );
    process.exit(1);
  }

  const creatorId = args.creatorId;
  const doRekey = !!args.rekey;
  const serviceAccountPath = path.resolve(args.serviceAccount);
  const serviceAccount = require(serviceAccountPath);

  const app = initializeApp({ credential: cert(serviceAccount) });
  const db = getFirestore(app, FIRESTORE_DATABASE_ID);

  console.log(`Migrating data to creatorId = ${creatorId}`);
  console.log(`Re-key deal IDs: ${doRekey ? 'YES' : 'no (add --rekey to enable)'}\n`);

  // ---------------------------------------------------------------
  // 1. Creator profile
  // ---------------------------------------------------------------
  const legacyProfileRef = db.collection('creators').doc(LEGACY_CREATOR_DOC_ID);
  const newProfileRef = db.collection('creators').doc(creatorId);
  const legacyProfileSnap = await legacyProfileRef.get();

  if (legacyProfileSnap.exists) {
    const newProfileSnap = await newProfileRef.get();
    if (!newProfileSnap.exists) {
      await newProfileRef.set(legacyProfileSnap.data());
      console.log(`✔ Copied profile creators/${LEGACY_CREATOR_DOC_ID} -> creators/${creatorId}`);
    } else {
      console.log(`- Profile creators/${creatorId} already exists, skipping copy.`);
    }
  } else {
    console.log(`- No legacy profile found at creators/${LEGACY_CREATOR_DOC_ID}, skipping.`);
  }

  // ---------------------------------------------------------------
  // 2. Deals: stamp creatorId, optionally re-key IDs
  // ---------------------------------------------------------------
  const dealsSnap = await db.collection('deals').get();
  console.log(`\nFound ${dealsSnap.size} deal(s).\n`);

  let stamped = 0;
  let rekeyed = 0;
  let skipped = 0;

  for (const docSnap of dealsSnap.docs) {
    const deal = docSnap.data();

    if (deal.creatorId && deal.creatorId !== '') {
      skipped++;
      continue;
    }

    if (doRekey) {
      const newId = generateSecureId('deal');
      const newRef = db.collection('deals').doc(newId);
      const batch = db.batch();
      batch.set(newRef, { ...deal, id: newId, creatorId });
      batch.delete(docSnap.ref);
      await batch.commit();
      console.log(`✔ Re-keyed ${docSnap.id} -> ${newId}`);
      rekeyed++;
    } else {
      await docSnap.ref.update({ creatorId });
      console.log(`✔ Stamped creatorId on ${docSnap.id}`);
      stamped++;
    }
  }

  console.log(
    `\nDone. ${stamped} stamped, ${rekeyed} re-keyed, ${skipped} already had a creatorId.`
  );
  if (doRekey && rekeyed > 0) {
    console.log(
      '\n⚠ Re-keyed deals now have new IDs. Any previously shared brand portal ' +
      'links for those deals are now broken — regenerate and resend them.'
    );
  }
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
