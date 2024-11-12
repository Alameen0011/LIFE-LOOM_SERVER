import Category from "../../models/category.model.js";
import Product from "../../models/product.model.js";

export const handleAddProduct = async (req, res, next) => {
  try {
    const {
      name,
      description,
      price,
      category,
      brand,
      gender,
      sku,
      sizes,
      images,
    } = req.body;

    const totalStock = sizes.reduce((total, size) => total + size.stock, 0);

    if (!sizes || sizes.length == 0) {
      return res
        .status(400)
        .json({ message: "At least one size with stock is required" });
    }

    if (!images || images.length < 3) {
      return res
        .status(400)
        .json({ message: "At least 3 product images are required" });
    }

    // Create new product instance
    const newProduct = new Product({
      productName: name,
      description,
      category,
      gender,
      price,
      sizes,
      images,
      sku,
      brand,
      totalStock,
    });

    // Save product to the database
    const savedProduct = await newProduct.save();

    // Respond with the saved product
    res.status(201).json({
      success: true,
      message: "Product added successfully!",
      product: savedProduct,
    });
  } catch (error) {
    console.error("Error adding product:", error);
    next(error);
  }
};

// desc => for listing products in product table
// GET /api/admin/products
export const handleFetchAllProducts = async (req, res, next) => {
  try {
    console.log(req.query, "req.query from client");

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 4;

    console.log(page, limit, "page,limit");

    const skip = (page - 1) * limit;

    const totalProductCount = await Product.countDocuments();

    console.log(totalProductCount, "total product count");

    const totalPages = Math.ceil(totalProductCount / limit);

    console.log(totalPages, "total pages ");

    //Fetch all products with populated Category
    const products = await Product.find({ deleted: false })
      .populate("category")
      .skip(skip)
      .limit(limit);

    //Fetching all categoreis
    const category = await Category.find({ status: true });
    if (!category) {
      return res
        .status(500)
        .json({ success: false, message: "Failed to fetch categories" });
    }

    //checking if product exists
    if (!products.length) {
      return res.status(200).json({
        success: true,
        message: "No products found",
        category,
      });
    }

    //if everything was succesfull
    return res.status(200).json({
      success: true,
      products,
      page,
      totalPages,
      category,
    });
  } catch (error) {
    console.log(error, "error on products");
    next(error);
  }
};

export const handleSoftDeleteProduct = async (req, res, next) => {
  try {
    const productId = req.params.id;

    if (!productId) {
      return res.status(404).json({
        success: false,
        message: "product id not found from req",
      });
    }

    const product = await Product.findByIdAndUpdate(
      productId,
      { deleted: true },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product soft deleted successFully",
      product,
    });
  } catch (error) {
    console.log(error, "ERROR WHILE DELETING PRODUCT");
    next(error);
  }
};

export const handleFetchSingleProduct = async (req, res, next) => {
  try {
    const productId = req.params.id;

    console.log(productId, "product id from params");

    if (!productId) {
      return res
        .status(400)
        .json({ message: "Invalid id , cannot find product" });
    }

    const product = await Product.findById(productId).populate("category");

    console.log(product, "product fetfched with the help of id param");

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({ message: "product fetched successfully", product });
  } catch (error) {
    console.error("Error fetching category:", error);
    next(error);
  }
};

export const handleUpdateProduct = async (req, res, next) => {
  try {
    console.log("insider update product controller");
    const productId = req.params.id;

    const {
      name,
      description,
      price,
      category,
      brand,
      gender,
      sku,
      sizes,
      images,
    } = req.body;

    console.log(category, "category error occured place");

    if (!productId) {
      return res.status(400).json({ message: "product id is required" });
    }

    if (!sizes || sizes.length == 0) {
      return res
        .status(400)
        .json({ message: "At least one size with stock is required" });
    }

    if (!images || images.length < 3) {
      return res
        .status(400)
        .json({ message: "At least 3 product images are required" });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "product not found",
      });
    }

    if (category) {
      const categoryExist = await Category.findById(category);

      if (!categoryExist) {
        return res.status(404).json({
          success: false,
          message: "Category not found",
        });
      }
    }

    product.productName = name || product.productName;
    product.description = description || product.description;
    product.price = price || product.price;
    product.category = category || product.category;
    product.brand = brand || product.brand;
    product.gender = gender || product.gender;
    product.sku = sku || product.sku;
    product.images = images || product.images;
    product.sizes = sizes || product.sizes;

    if (sizes) {
      product.sizes = sizes;
      product.totalStock = sizes.reduce((total, size) => total + size.stock, 0);
    }

    const updatedProduct = await product.save();

    res.status(200).json({
      success: true,
      message: "product updated successfully",
      updatedProduct,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    next(error);
  }
};
