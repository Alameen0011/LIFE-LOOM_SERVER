import Address from "../../models/address.model.js";
import User from "../../models/user.model.js";

export const handleGetUserProfile = async (req, res) => {
  try {
    const id = req.id;

    const user = await User.findById(id).select("-password");

    console.log(user);

    if (!user) {
      return res.status(404).json({
        status: false,
        message: "user does not exist",
      });
    }

    res.status(200).json({
      success: true,
      message: "fetched single user successfully",
      user,
    });
  } catch (error) {
    console.log("Error while getting user");
  }
};

export const handleUpdateUserProfile = async (req, res) => {
  try {
    const id = req.id;
    const { firstName, lastName, email, phone } = req.body;

    if (!firstName || !lastName || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { firstName, lastName, email, phone },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "cannot find user to update",
      });
    }

    res.status(200).json({
      success: true,
      message: "User profile updated SuccessFully",
      data: updatedUser,
    });
  } catch (error) {
    console.error("ERROR WHILE UPDATING USER PROFILE:", error);
    res.status(500).json({
      message: "An error occurred while updating the profile.",
      error: error.message,
    });
  }
};



//Address management controllers
export const handleAddAddress = async (req, res) => {
  try {
    console.log("inside handleAddress");
    const id = req.id;
    const { state, district, city, address, pincode, addressName, isDefault } =
      req.body;

    if (isDefault) {
      await Address.updateMany(
        { user: id, isDefault: true },
        { isDefault: false }
      );
    }

    const newAddress = await new Address({
      user: id,
      state,
      district,
      city,
      address,
      pincode,
      addressName,
      isDefault: isDefault || false,
    }).save();

    res.status(201).json({
      success: true,
      message: "Address added successFully",
      address: newAddress,
    });
  } catch (error) {
    console.log("error while adding address", error);
    res.status(500).json({
      success: false,
      message: "An error occured while adding address",
      error: error.message,
    });
  }
};

export const handleFetchAllAddress = async (req, res) => {
  try {
    const id = req.id;

    const Addresses = await Address.find({ user: id }).populate('user');

    console.log(Addresses, "all addresses fetched");

    if (!Addresses) {
      return res.status(404).json({
        success: false,
        message: "no Address found",
      });
    }

    res.status(200).json({
      success: true,
      message: "addresses fetched successFully",
      addresses: Addresses,
    });
  } catch (error) {
    console.error("Error while fetching address", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const handleFetchSingleAddress = async (req, res) => {
  try {

    const AddressId = req.params.id

    const singleAddress = await Address.findById(AddressId)

    if(!singleAddress){
        return res.status(404).json({
            success:false,
            message:"address not fouund"
        })
    }

    res.status(200).json({
        success:true,
        message:"fetched single address successFully",
        address:singleAddress
    })



  } catch (error) {
    console.log("Error while fetching single address");
    res.status(500).json({message:"server error please try again later"})
  }
};

export const handleUpdateAddress = async (req, res) => {
  try {



    const addressId = req.params.id;

    const {state,district,city,address,pincode,addressName,isDefault} = req.body

    //controller level validation or use library controller level validtion like joi or express validator

    const updatedAddress = await Address.findByIdAndUpdate(addressId,{state,district,city,address,pincode,addressName,isDefault},{new:true,runValidators:true})

    if(!updatedAddress){
        return res.status(404).json({
            success:false,
            message:"address not found"
        })
    }

    res.status(200).json({
        success:true,
        message:"address updated successfully",
        address:updatedAddress
    })





  } catch (error) {
    console.log("Error while updating address ");
    res.status(500).json({ message: 'Server error' });
  }
};
