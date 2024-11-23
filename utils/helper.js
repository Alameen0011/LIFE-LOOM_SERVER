import Offer from "../models/offer.model.js";
import Product from "../models/product.model.js";

export const applyProductOffer = async (productId, newOffer) => {
  try {
    if (!newOffer || !newOffer._id || !newOffer.offerPercentage) {
      throw new Error("Invalid new offer object");
    }

    const product = await Product.findById(productId).populate("offer");

    if (!product) {
      throw new Error("Product not found");
    }

    const categoryOffer = await Offer.findOne({
      offerType: "category",
      targetId: product.category,
    });

    if (
      !product.offer ||
      newOffer.offerPercentage > product.offer.offerPercentage
    ) {
      if (
        !categoryOffer ||
        newOffer.offerPercentage > categoryOffer.offerPercentage
      ) {
        product.offer = newOffer._id;
        await product.save();
      }
    }
  } catch (error) {
    console.log(error, "Error while  applying offer to product");
    
  }
};

export const applyCategoryOffer = async (categoryId, newOffer) => {
  try {
    if (!newOffer || !newOffer._id || !newOffer.offerPercentage) {
      throw new Error("Invalid new Offer object");
    }
    const products = await Product.find({ category: categoryId }).populate(
      "offer"
    );

    const productsToUpdate = products.filter(
      (product) =>
        !product.offer ||
        newOffer.offerPercentage > product.offer.offerPercentage
    );

    if (productsToUpdate.length === 0) {
      console.log("No products require an offer update.");
      return;
    }

    const productIds = productsToUpdate.map((product) => product._id);

    await Product.updateMany(
      { _id: { $in: productIds } },
      { $set: { offer: newOffer._id } }
    );
    console.log(`Updated ${productsToUpdate.length} products with new offer.`);
  } catch (error) {
    console.log(
      error,
      "error while applying offer to product under certain category"
    );
  }
};

export const removeProductOffer = async (productId) => {

        try {
            const product = await Product.findOne({ _id: productId }).populate("offer");

            if (!product) {
              console.error(`Product with ID ${productId} not found.`);
              return;
            }
          
            const CategoryOfferExist = await Offer.findOne({
              targetId: product.category,
            });
          
            if (!CategoryOfferExist) {
              console.error(`categotry offer not exist.`);
              return;
            }
          
            if (product) {
              product.offer = CategoryOfferExist ? CategoryOfferExist._id : null;
            }
          
            await product.save();


            
        } catch (error) {
            console.log(error,"error while removing product offer")
            
        }

 
};

export const removeCategoryOffer = async (categoryId) => {
  try {
    const products = await Product.find({ category: categoryId }).populate(
      "offer"
    );

    if (!products) {
        console.error(`Products under this category not found.`);
        return;
      }
    

    for (const product of products) {
      const productOfferExist = await Offer.findOne({
        targetId: product._id,
      });

      if (product) {
        product.offer = productOfferExist ? productOfferExist._id : null;
      }

      await product.save();
    }
  } catch (error) {
    console.log(error,"error while removeing category offer")
  }
};
