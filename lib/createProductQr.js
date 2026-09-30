import { nanoid } from "nanoid";
import QRCode from "qrcode";

export async function createProductQr() {
  const qrToken = `PRD-${nanoid(10)}`;

  const qrImage = await QRCode.toDataURL(qrToken, {
    margin: 1,
    scale: 6
  });

  return { qrToken, qrImage };
}
