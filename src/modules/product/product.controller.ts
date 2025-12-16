import { Router } from "express";
import { multerUpload } from "../../utils/multer/multer.upload";
import { auth } from "../../core/middlewares/auth.middleware";
import { StoreInEnum } from "../../types/multer.types";
import { ProductService } from "./product.service";

const router = Router();
const productService = new ProductService();

router.patch("/add-product",auth,multerUpload({ storeIn: StoreInEnum.MEMORY }).array("productImages",3),productService.addProduct);
router.patch("/get-product",auth,productService.getProduct);
router.patch("/update-product",auth,multerUpload({ storeIn: StoreInEnum.MEMORY }).array("productImages",3),productService.updateProduct);
router.patch("/delete-product",auth,productService.deleteProduct);

export default router;
