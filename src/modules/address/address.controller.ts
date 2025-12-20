import { Router } from "express";
import { auth } from "../../core/middlewares/auth.middleware";
import { validation } from "../../core/middlewares/validation.middleware";
import { AddressService } from "./address.service";
import {
  addAddressSchema,
  deleteAddressSchema,
  getAddressSchema,
  updateAddressSchema,
  getAllAddressesSchema,
} from "./address.validation";

const router = Router();
const addressService = new AddressService();

router.post("/add-address",auth,validation(addAddressSchema),addressService.addAddress);
router.get("/get-address/:id",auth,validation(getAddressSchema),addressService.getAddress);
router.get("/get-all-addresses",addressService.getAllAddresses);
router.patch("/update-address",auth,validation(updateAddressSchema),addressService.updateAddress);
router.delete("/delete-address/:id",auth,validation(deleteAddressSchema),addressService.deleteAddress);
router.patch("/set-default-address/:id",auth,validation(getAddressSchema),addressService.setDefaultAddress);

export default router;
