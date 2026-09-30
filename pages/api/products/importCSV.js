import dbConnect from "../../../lib/mongodb";
import Product from "../../../models/Product";
import StockLevel from "../../../models/StockLevel";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await dbConnect();

    const { products, warehouseId } = req.body;

    if (!warehouseId) {
      return res.status(400).json({ message: "Missing warehouse ID" });
    }

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: "Products must be a non-empty array" });
    }

    // --------------------------------------------------
    // Normalize & validate
    // --------------------------------------------------
    const cleanProducts = products.filter(
      (p) => p.code && p.product_name && Number(p.qty) > 0
    );

    if (cleanProducts.length === 0) {
      return res.status(400).json({ message: "No valid products to import" });
    }

    const codes = cleanProducts.map((p) => p.code);

    // --------------------------------------------------
    // 1️⃣ UPSERT PRODUCTS (by code)
    // --------------------------------------------------
    await Product.bulkWrite(
      cleanProducts.map((p) => ({
        updateOne: {
          filter: { code: p.code },
          update: {
            $set: {
              product_name: p.product_name,
              specification: p.specification,
              brand_name: p.brand_name,
              code: p.code
            }
          },
          upsert: true
        }
      }))
    );

    // --------------------------------------------------
    // 2️⃣ FETCH PRODUCTS → MAP CODE → ID
    // --------------------------------------------------
    const dbProducts = await Product.find({ code: { $in: codes } }).lean();

    const productIdByCode = {};
    dbProducts.forEach((prod) => {
      productIdByCode[prod.code] = prod._id;
    });

    // --------------------------------------------------
    // 3️⃣ FIND EXISTING STOCK (for reporting)
    // --------------------------------------------------
    const existingStock = await StockLevel.find({
      warehouse: warehouseId,
      product: { $in: dbProducts.map((p) => p._id) }
    }).lean();

    const existingProductIds = new Set(
      existingStock.map((s) => s.product.toString())
    );

    let increased = 0;
    let created = 0;

    // --------------------------------------------------
    // 4️⃣ UPSERT STOCK LEVELS (ADD QTY)
    // --------------------------------------------------
    const bulkStockOps = cleanProducts.map((p) => {
      const productId = productIdByCode[p.code];
      const exists = existingProductIds.has(productId.toString());

      if (exists) increased++;
      else created++;

      return {
        updateOne: {
          filter: {
            product: productId,
            warehouse: warehouseId
          },
          update: {
            $inc: { qty: p.qty }
          },
          upsert: true
        }
      };
    });

    await StockLevel.bulkWrite(bulkStockOps);

    // --------------------------------------------------
    // 5️⃣ RESPONSE
    // --------------------------------------------------
    return res.status(200).json({
      message: `✅ Import complete`,
      summary: {
        total: cleanProducts.length,
        stockCreated: created,
        stockIncreased: increased
      }
    });

  } catch (error) {
    console.error("CSV Import Error:", error);
    return res.status(500).json({
      message: "Import failed",
      error: error.message
    });
  }
}
