import dbConnect from "../../../lib/mongoose";
import StockLog from "../../../models/StockLog";
import User from "../../../models/User";
import mongoose from "mongoose";

export default async function handler(req, res) {
  await dbConnect();

  try {
    // 🔐 AUTH FROM COOKIE (NOT QUERY)
    const cookie = req.headers.cookie || "";
    const userId = cookie
      .split("; ")
      .find(c => c.startsWith("userId="))
      ?.split("=")[1];

    if (!userId || !mongoose.isValidObjectId(userId)) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // 🔐 LOAD USER FROM DB
    const user = await User.findById(userId).select("role");
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { search, type } = req.query;

    const pipeline = [];

    // 🔥 HARD ACCESS CONTROL
    if (user.role === "user") {
      pipeline.push({
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
        },
      });
    }

    // 🔗 Product lookup
    pipeline.push(
      {
        $lookup: {
          from: "products",
          localField: "product",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" }
    );

    // 🔍 Search
    if (search) {
      const regex = new RegExp(search, "i");
      pipeline.push({
        $match: {
          $or: [
            { note: regex },
            { "product.product_name": regex },
            { "product.code": regex },
          ],
        },
      });
    }

    if (type === "manual") {
      pipeline.push({ $match: { source: "MANUAL" } });
    }

    if (type === "invoice") {
      pipeline.push({ $match: { source: "INVOICE" } });
    }

    pipeline.push({ $sort: { createdAt: -1 } });

    const logs = await StockLog.aggregate(pipeline);
    return res.status(200).json({ logs });

  } catch (err) {
    console.error("❌ Logs error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}
