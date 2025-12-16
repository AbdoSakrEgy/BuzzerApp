import z from "zod";
import {
  addAddressSchema,
  deleteAddressSchema,
  getAddressSchema,
  updateAddressSchema,
  getAllAddressesSchema,
} from "./address.validation";

export type addAddressDTO = z.infer<typeof addAddressSchema>;
export type getAddressDTO = z.infer<typeof getAddressSchema>;
export type updateAddressDTO = z.infer<typeof updateAddressSchema>;
export type deleteAddressDTO = z.infer<typeof deleteAddressSchema>;
export type getAllAddressesDTO = z.infer<typeof getAllAddressesSchema>;
