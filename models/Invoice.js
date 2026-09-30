import mongoose from "mongoose";
import toShortId from "../lib/shortId";

const InvoiceSchema = new mongoose.Schema(
  {
     searchText: {
    type: String,
    index: true,
  },
    // Short, readable invoice ID
    shortId: {
      type: String,
      unique: true,
      sparse: true,
    },

    type: {
      type: String,
      enum: ["IN", "OUT", "TRANSFER"],
      required: true,
    },

      // 👇 WHO CREATED IT (THIS IS ALL YOU NEED)
    createdByUsername: {
      type: String,
      default: "system",
      index: true,
    },
     createdByUserId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User",
  index: true,
},

    person: { type: String, default: "" },
    message: { type: String, default: "" },

    originMode: {
      type: String,
      enum: ["warehouse", "client"],
      required: true,
    },

    destinationMode: {
      type: String,
      enum: ["warehouse", "client"],
      required: true,
    },

    originWarehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Warehouse",
      default: null,
    },

    destinationWarehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Warehouse",
      default: null,
    },

    originClient: { type: String, default: "" },
    destinationClient: { type: String, default: "" },

    products: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        name: { type: String, required: true },
        qty: { type: Number, required: true },
      },
    ],
  },
  { timestamps: true }
);

/**
 * AUTO-GENERATE shortId ONCE _AFTER_ the document has an _id
 * (this is the correct way — avoids your previous bugs)
 */
InvoiceSchema.post("save", function (doc) {
  // Already has shortId — skip
  if (doc.shortId) return;

  // Generate based on the Mongo _id
  doc.shortId = toShortId(doc._id.toString());

  // Save silently (no infinite loop)
  doc.constructor.updateOne(
    { _id: doc._id },
    { $set: { shortId: doc.shortId } }
  ).exec();
});
InvoiceSchema.pre("save", function (next) {
  if (!this.shortId) {
    this.shortId = toShortId(this._id);
  }
  next();
});

export default mongoose.models.Invoice ||
  mongoose.model("Invoice", InvoiceSchema);
