import { Router } from "express";
import { multerUpload } from "../../utils/multer/multer.upload";
import { auth } from "../../core/middlewares/auth.middleware";
import { validation } from "../../core/middlewares/validation.middleware";
import { StoreInEnum } from "../../types/multer.types";
import { ProductService } from "./product.service";
import { getProductSchema, deleteProductSchema } from "./product.validation";

const router = Router();
const productService = new ProductService();

router.post("/add-product",auth,multerUpload({ storeIn: StoreInEnum.MEMORY }).array("productImages", 3),productService.addProduct);
router.get("/get-product/:id",auth,validation(getProductSchema),productService.getProduct);
router.patch("/update-product",auth,multerUpload({ storeIn: StoreInEnum.MEMORY }).array("productImages", 3),productService.updateProduct);
router.delete("/delete-product/:id",auth,validation(deleteProductSchema),productService.deleteProduct);

export default router;
