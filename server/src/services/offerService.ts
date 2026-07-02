import { Types } from "mongoose";
import { OfferModel } from "../models/offersModel.js";
import { IOrder } from "../models/orderModel.js";


export const applyOffer = async (order: IOrder, offerId: string | Types.ObjectId) => {
  const offer = await OfferModel.findById(offerId);

  if (!offer || !offer.isActive) {
    throw new Error("Invalid offer");
  }

  const now = new Date();

  if (
    (offer.validFrom && now < offer.validFrom) ||
    (offer.validTill && now > offer.validTill)
  ) {
    throw new Error("Offer expired");
  }

  if (
    offer.usageLimit &&
    offer.usageCount >= offer.usageLimit
  ) {
    throw new Error("Offer usage limit reached");
  }

  if (order.subTotalAmount < offer.minOrderValue) {
    throw new Error("Minimum order value not met");
  }

  let discount = 0;

  if (offer.discountType === "FLAT") {
    discount = offer.discountValue;
  }

  if (offer.discountType === "PERCENTAGE") {
    discount =
      (order.subTotalAmount * offer.discountValue) / 100;
  }

  if (offer.maxDiscount) {
    discount = Math.min(discount, offer.maxDiscount);
  }

  discount = Math.min(discount, order.subTotalAmount);

  order.offer = {
    offerId: offer._id,
    type: offer.type,
    discountType: offer.discountType,
    discountValue: offer.discountValue,
    calculatedDiscount: discount,
    description: offer.description,
  };

  order.discount = discount;

  offer.usageCount += 1;
  await offer.save();

  return order;
};