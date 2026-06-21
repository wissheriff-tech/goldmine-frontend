import Tesseract from 'tesseract.js';

export async function extractReceiptData(file) {
  const { data: { text } } = await Tesseract.recognize(file, 'eng');
  return parseReceiptText(text);
}

function cleanNum(str) {
  return parseInt(str.replace(/[,.\s]/g, ''), 10);
}

function normalizePhone(raw) {
  const digits = raw.replace(/[\s.\-()]/g, '');
  if (digits.startsWith('+232')) return '+232' + digits.slice(4);
  if (digits.startsWith('232')) return '+232' + digits.slice(3);
  if (digits.startsWith('0') && digits.length >= 9) return '+232' + digits.slice(1);
  return digits;
}

function parseReceiptText(raw) {
  // Flatten newlines but keep a line-aware version for labelled-field matching
  const flat = raw.replace(/\r?\n/g, ' ').replace(/\s{2,}/g, ' ');

  let amount = '', senderNumber = '', referenceId = '';

  // ── Amount ────────────────────────────────────────────────────────────────
  const NUM = '([\\d][\\d,. ]{1,12})';
  const CUR = '(?:le|sle|nle|sll|nsl)';
  const amountTries = [
    // "Amount: Le 50,000" / "Total: 50 000 SLE"
    flat.match(new RegExp(`(?:amount|amt|total|sent|paid|value|recharge|credit|debit)[:\\s]+(?:${CUR})?\\s*${NUM}`, 'i')),
    // "Le 50,000" or "SLE50000"
    flat.match(new RegExp(`(?:${CUR})[:\\s]*${NUM}`, 'i')),
    // "50,000 Le"
    flat.match(new RegExp(`${NUM}\\s*(?:${CUR})`, 'i')),
    // last resort: largest standalone number
    flat.match(/\b(\d[\d,. ]{2,10}\d)\b/),
  ];
  for (const m of amountTries) {
    if (!m) continue;
    const n = cleanNum(m[1]);
    if (n > 0 && n <= 500_000_000) { amount = n.toString(); break; }
  }

  // ── Phone numbers ─────────────────────────────────────────────────────────
  // SL numbers: 07X/03X (9 digits) or +232/232 prefix
  const SL_PHONE = '(\\+?232[\\s.\\-]?[0-9]{2}[\\s.\\-]?[0-9]{3}[\\s.\\-]?[0-9]{4}|\\b0[37][0-9][\\s.\\-]?[0-9]{3}[\\s.\\-]?[0-9]{4}\\b)';

  // Receiver — "Transfer to / Money transfer to / To:" field
  const toM = flat.match(new RegExp(`(?:transfer\\s*to|money\\s*transfer\\s*to|to|recipient|receiver|beneficiary)[:\\s]*${SL_PHONE}`, 'i'));
  const receiverRaw = toM ? toM[1].replace(/[\s.\-]/g, '') : null;

  // Sender — "From / Sender / Your number" field
  const fromM = flat.match(new RegExp(`(?:from|sender|de|your\\s*(?:number|no|account)|msisdn|mobile)[:\\s]*${SL_PHONE}`, 'i'));
  if (fromM) {
    senderNumber = normalizePhone(fromM[1]);
  } else {
    // Fall back: first SL number that isn't the receiver
    const allPhones = [...flat.matchAll(new RegExp(SL_PHONE, 'gi'))].map(m => m[1]);
    for (const p of allPhones) {
      const digits = p.replace(/[\s.\-]/g, '');
      if (receiverRaw && (digits === receiverRaw || digits.endsWith(receiverRaw.slice(-7)))) continue;
      senderNumber = normalizePhone(p);
      break;
    }
  }

  // ── Reference ID ──────────────────────────────────────────────────────────
  const refM = flat.match(
    /(?:ref(?:erence)?(?:\s*(?:id|no|num(?:ber)?)?)?|transaction\s*(?:id|no|ref)|txn\s*(?:id)?|receipt\s*(?:no|id)?|id\s*no)[:\s#]+([A-Z0-9]{5,25})/i
  ) || flat.match(/\b([A-Z]{1,4}[0-9]{6,16}[A-Z0-9]{0,6})\b/);
  if (refM) referenceId = refM[1].toUpperCase();

  return { amount, senderNumber, referenceId };
}
