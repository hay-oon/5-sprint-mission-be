import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    tags: { type: [String], required: true }, // 여러개의 태그를 할당하기위해 문자열 배열을 사용
    image: { type: String },
  },
  { timestamps: true }
);

// 검색을 위한 인덱스
productSchema.index({ name: "text", description: "text" });

const Product = mongoose.model("Product", productSchema);

export default Product;
