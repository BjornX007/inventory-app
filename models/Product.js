import mongoose from "mongoose";

const { Schema } = mongoose;

const ProductSchema = new Schema(
  {
    warehouseId: {
      type: Schema.Types.ObjectId,
      ref: "Warehouse",
      required: true,
    },

    product_name: { type: String, required: true },
    specification: { type: String },
    brand_name: { type: String },
    code: { type: String, required: true },

    qty: { type: Number, default: 0 },

    warehouses: [
      {
        warehouse: {
          type: Schema.Types.ObjectId,
          ref: "Warehouse",
        },
      },
    ],

    qrToken: {
      type: String,
      unique: true,
      sparse: true,
    },

    qrImage: { type: String },
  },
  { timestamps: true }
);

// ---- CRITICAL FIXES BELOW ----

// Ensure mongoose.models exists (it can be undefined in some builds)
if (!mongoose.models) {
  mongoose.models = {};
}

// Prevent OverwriteModelError AND undefined access
const Product =
  mongoose.models.Product || mongoose.model("Product", ProductSchema);

export default Product;
