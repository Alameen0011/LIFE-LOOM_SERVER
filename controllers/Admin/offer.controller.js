import Offer from "../../models/offer.model.js";
import Product from "../../models/product.model.js";
import {
  applyCategoryOffer,
  applyProductOffer,
  removeCategoryOffer,
  removeProductOffer,
} from "../../utils/helper.js";

export const handleAddOffer = async (req, res, next) => {
  try {
    const { name, offerPercentage, endDate, offerType, targetId, targetName } =
      req.body;

    const OfferExist = await Offer.findOne({
      offerType,
      targetId,
    });

    if (OfferExist) {
      return res.status(400).json({
        success: false,
        message: `an offer already exist for this ${offerType}`,
      });
    }

    const OfferNameExist = await Offer.findOne({
      name,
    });

    if (OfferNameExist) {
      return res.status(400).json({
        success: false,
        message: "An offer with this name already exist ",
      });
    }

    const newOffer = await Offer.create({
      name,
      offerPercentage,
      offerType,
      endDate,
      targetName,
      targetId,
    });

    if (offerType === "product") {
      await applyProductOffer(targetId, newOffer);
    } else if (offerType === "category") {
      await applyCategoryOffer(targetId, newOffer);
    }

    res.status(201).json({
      success: true,
      message: "offer created successfully",
      newOffer,
    });
  } catch (error) {
    console.log(error, "error while adding offer");
    next(error);
  }
};

export const handleDeleteOffer = async (req, res, next) => {
  try {
    const { offerId } = req.body;

    console.log(offerId, "offer id for deletion purpose");

    const existOffer = await Offer.findById(offerId);

    if (!existOffer) {
      return res.status(404).json({
        success: false,
        message: "cannot found order",
      });
    }

    await Offer.deleteOne({ _id: offerId });

    if (existOffer.offerType === "product") {
      await removeProductOffer(existOffer.targetId);
    } else if (existOffer.offerType === "category") {
      await removeCategoryOffer(existOffer.targetId);
    }

    return res.status(200).json({
      success: true,
      message: "offer deleted successfully",
    });
  } catch (error) {
    console.log("error while deletion of offers ");
    next(error);
  }
};

export const handleFetchAllOffers = async (req, res, next) => {
  try {
    const offers = await Offer.find({});

    const categoryOffers = offers.filter(
      (offer) => offer.offerType === "category"
    );
    const productOffers = offers.filter(
      (offer) => offer.offerType === "product"
    );

    res.status(200).json({
      success: true,
      message: "offers fetched successfully",
      categoryOffers,
      productOffers,
    });
  } catch (error) {
    console.log(error, "errror while fetching offers");
    next(error);
  }
};

export const handleSearchProduct = async (req, res, next) => {
  try {
    const { searchTerm } = req.query;

    console.log(searchTerm,"search term")
    const products = await Product.find(
      {
        productName: { $regex: new RegExp(searchTerm, "i") },

        deleted: false,
        status: true,
      },
      { productName: true }
    );



    res.status(200).json({
      success:true,
      products
    })


  } catch (error) {
    console.log(error);
    next(error);
  }
};


