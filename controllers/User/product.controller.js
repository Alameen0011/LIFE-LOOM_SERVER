// desc => for listing products in PLP

import Category from "../../models/category.model.js";
import Product from "../../models/product.model.js";

// GET /api/v1/user/getProducts
export const handleGetProducts = async (req, res, next) => {
  try {
    const { page, limit, sortBy, categories, brands, searchTerm, priceRange } =
      req.query;

    console.log(req.query);

    const skip = (page - 1) * limit;
    const currPage = parseInt(page);

    const query = {
      deleted: false,
      status: true,
    };

    if (categories) {
      query.category = { $in: categories.split(",") };
    }

    if (searchTerm) {
      query.productName = { $regex: searchTerm, $options: "i" };
    }

    if (priceRange) {
      console.log(priceRange);
      const [minPrice, maxPrice] = priceRange.split(",").map(Number);
      query.price = { $gte: minPrice, $lte: maxPrice };
    }

    if (brands) {
      console.log(brands, "brand to find product");
      query.brand = { $in: brands.split(",") };
    }

    const sortOptions = {};

    if (sortBy === "LowToHigh") sortOptions.price = 1;
    if (sortBy === "HighToLow") sortOptions.price = -1;
    if (sortBy === "NewArrivals") sortOptions.createdAt = -1;
    if (sortBy === "Aa-Zz") sortOptions.name = 1;
    if (sortBy === "Zz-Aa") sortOptions.name = -1;

    console.log(query, "query to db");

    //Fetch all products with populated Category
    const products = await Product.find(query)
      .populate({
        path: "category",
        match: { status: true },
      })
      .populate({
        path: "offer",
        match: { status: "active" },
      })
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit));

    console.log(products, "products");

    const filteredProducts = products.filter(
      (product) => product.category !== null
    );

    console.log(filteredProducts, "filtered products");

    //checking if product exists
    if (!filteredProducts.length) {
      return res.status(200).json({
        success: true,
        message: "No products found",
      });
    }

    const totalProducts = await Product.countDocuments(query);

    //if everything was succesfull
    return res.status(200).json({
      success: true,
      filteredProducts,
      totalPages: Math.ceil(totalProducts / limit),
      page: currPage,
    });
  } catch (error) {
    console.log(error, "error on products");
    console.log(error.name, error.message);
    next(error);
  }
};

export const handleGetHomeProducts = async (req, res, next) => {
  try {
    const products = await Product.find().limit(4);
    if (products)
      res.status(200).json({
        success: true,
        message: "product fetched successFully",
        products,
      });
  } catch (error) {
    console.log(error, "errro while getting products for homepage");
    next(error);
  }
};

export const handleSingleProduct = async (req, res, next) => {
  try {
    const productId = req.params.id;

    console.log(productId, "product id from params");

    if (!productId) {
      return res
        .status(400)
        .json({ message: "Invalid id , cannot find product" });
    }

    const product = await Product.findById(productId).populate("category").populate("offer");

    console.log(product, "product fetfched with the help of id param");

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    //handling both fetching sigle product and related products

    const relatedProducts = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
    }).limit(4);

    res.status(200).json({
      message: "product and related products fetched successfully",
      product,
      relatedProducts,
    });
  } catch (error) {
    console.error("Error fetching category:", error);
    next(error);
  }
};
