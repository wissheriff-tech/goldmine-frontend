import Tesseract from 'tesseract.js';

export async function extractReceiptData(file) {
  const { data: { text } } = await Tesseract.recognize(file, 'eng');
  return parseReceiptText(text);
}

function parseReceiptText(raw) {
  const flat = raw.replace(/\r?\n/g, ' ').replace(/\s{2,}/g, ' ');

  let amount = '';
  let senderNumber = '';
  let referenceId = '';

  // Amount — Le / SLE / NLE currency markers
  const amountTries = [
    flat.match(/(?:amount|amt|total|sent|paid|value|recharge)[:\s]+(?:le|sle|nle)?\s*([\d,]+)/i),
    flat.match(/(?:le|sle|nle)\s*([\d,]+(?:\.\d{1,2})?)/i),
    flat.match(/([\d,]{4,})\s*(?:le|sle|nle)/i),
  ];
  for (const m of amountTries) {
    if (!m) continue;
    const n = parseInt(m[1].replace(/,/g, ''), 10);
    if (n >= 1000 && n <= 100_000_000) { amount = n.toString(); break; }
  }

  // Sierra Leone phone numbers: 9 digits starting 07X/03X, or with +232 prefix
  const phoneM = flat.match(
    /(?:from|de|sender|mobile|phone|msisdn)?[:\s]?(\+?232[\s.\-]?[0-9]{2}[\s.\-]?[0-9]{3}[\s.\-]?[0-9]{4}|0[37][0-9][\s.\-]?[0-9]{3}[\s.\-]?[0-9]{4})/i
  );
  if (phoneM) {
    const digits = phoneM[1].replace(/[\s.\-]/g, '');
    if (digits.startsWith('232')) senderNumber = '+' + digits;
    else if (digits.startsWith('0')) senderNumber = '+232' + digits.slice(1);
    else senderNumber = digits;
  }

  // Reference ID — labelled field first, then bare code pattern
  const refM = flat.match(
    /(?:ref(?:erence)?(?:\s*(?:id|no|num(?:ber)?)?)?|transaction\s*(?:id|no|ref)|txn|receipt\s*(?:id|no)?)[:\s#]+([A-Z0-9]{6,20})/i
  ) || flat.match(/\b([A-Z]{1,4}[0-9]{8,14}[A-Z0-9]{0,4})\b/);
  if (refM) referenceId = refM[1].toUpperCase();

  return { amount, senderNumber, referenceId };
}
