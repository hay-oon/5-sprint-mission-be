"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const index_1 = __importDefault(require("./products/index"));
const index_2 = __importDefault(require("./articles/index"));
const index_3 = __importDefault(require("./comments/index"));
const index_4 = __importDefault(require("./auth/index"));
const router = express_1.default.Router();
router.use("/products", index_1.default);
router.use("/articles", index_2.default);
router.use("/", index_3.default);
router.use("/auth", index_4.default);
exports.default = router;
