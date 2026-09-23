# ZEC NINJA 888 — FINAL DEPLOY HANDOFF

Everything in the public app is intentionally kept **PRE-DEPLOY** until immutable asset roots are known.

## Final asset layout
Upload exactly:
- images/0.jpg ... images/887.jpg
- metadata/0.json ... metadata/887.json
- collection.json

Each metadata file must point to:
`ipfs://<IMAGE_ROOT_CID>/<tokenId>.jpg`

## Then set zec-ninja-chain.json
- image_root_cid
- metadata_root_cid
- mint_price_zec (when decided)

## Deploy
Collection: NINJAZEC888
Protocol: zrc-721
Supply: 888
Token IDs: 0..887
Royalty hint: 100 bps (1%) — confirm before signing.

Deploy payload:
`{"p":"zrc-721","o":"deploy","collection":"NINJAZEC888","supply":"888","meta":"<METADATA_ROOT_CID>","royalty":"100"}`

## Mint
Use marketplace.html to download all 888 deterministic mint payloads.
Signing/broadcast remains wallet-side. Never place a seed phrase/private key in this repository or site.

## Marketplace
marketplace.html supports deploy/mint payloads, list, delist, buy intent, price conversion, and the 888-token catalog.
Once image_root_cid is configured, the catalog automatically renders each token from immutable IPFS assets.

## Local production package verified\nThe production build contains exactly 888 token images and 888 metadata records, normalized to token IDs 0..887. The public marketplace intentionally switches to individual artwork only after the immutable image CID is configured.\n\n## Blocking items before real deploy
1. Pin the verified 888 individual images + metadata package to immutable storage/IPFS.
2. Put the resulting CIDs in zec-ninja-chain.json.
3. Confirm royalty 1%.
4. Decide mint price.
5. User signs/broadcasts deploy and mint transactions.

No fake CIDs or fake on-chain state should be published.
