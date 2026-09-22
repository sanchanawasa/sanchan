/**
 * ZEC NINJA 888 — ZRC-721 protocol helpers.
 * This file never handles or stores private keys.
 * Signing/broadcasting must be performed by a compatible Zcash transparent-wallet flow.
 */
window.ZecNinjaChain = (() => {
  const COLLECTION = "NINJAZEC888";
  const SUPPLY = 888;
  const ROYALTY_BPS = 100;
  const ZATOSHIS_PER_ZEC = 100000000;

  const clean = (v) => String(v ?? "").trim();
  const assert = (ok, msg) => { if (!ok) throw new Error(msg); };
  const tokenId = (id) => {
    const n = Number(id);
    assert(Number.isInteger(n) && n >= 0 && n < SUPPLY, "Token ID must be 0–887");
    return String(n);
  };
  const zecToZatoshis = (zec) => {
    const n = Number(zec);
    assert(Number.isFinite(n) && n > 0, "Price must be greater than 0 ZEC");
    return String(Math.round(n * ZATOSHIS_PER_ZEC));
  };
  const inscriptionId = (id) => {
    const s = clean(id);
    assert(/^[0-9a-fA-F]{64}i\d+$/.test(s), "Use inscription id: <64-char txid>i<outputIndex>");
    return s;
  };
  const transparentAddress = (addr) => {
    const s = clean(addr);
    assert(/^t[13][A-Za-z0-9]{30,}$/.test(s), "Marketplace settlement requires a transparent Zcash t-address");
    return s;
  };

  function deploy(metadataRootCid) {
    const meta = clean(metadataRootCid);
    assert(meta && !meta.startsWith("REPLACE_"), "Metadata IPFS CID is required");
    return {p:"zrc-721",o:"deploy",collection:COLLECTION,supply:String(SUPPLY),meta,royalty:String(ROYALTY_BPS)};
  }
  function mint(id) {
    return {p:"zrc-721",o:"mint",collection:COLLECTION,id:tokenId(id)};
  }
  function list(id, priceZec, payoutAddress) {
    return {p:"zord",o:"ls",id:inscriptionId(id),pr:zecToZatoshis(priceZec),py:transparentAddress(payoutAddress)};
  }
  function delist(id) {
    return {p:"zord",o:"dl",id:inscriptionId(id)};
  }

  return {COLLECTION,SUPPLY,ROYALTY_BPS,ZATOSHIS_PER_ZEC,deploy,mint,list,delist,zecToZatoshis};
})();