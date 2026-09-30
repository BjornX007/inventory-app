import dbConnect from "../../../lib/mongoose";
import Invoice from "../../../models/Invoice";

export default async function handler(req, res) {
  await dbConnect();

  const invoices = await Invoice.find().sort({ createdAt: -1 });

  res.status(200).json({ invoices });
}
