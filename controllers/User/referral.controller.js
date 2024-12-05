import User from "../../models/user.model.js";
import Wallet from "../../models/wallet.js";

export const handleFetchReferralCode = async (req, res, next) => {
  try {
    const userId = req.id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "user not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "refferal code retrieved",
      refferalCode: user.refferalCode,
    });
  } catch (error) {
    console.log("error while fetching referral code");
    next(error);
  }
};

export const handleApplyRefferalCode = async (req, res, next) => {

  
  try {
    console.log(req.body)
    const userId = req.id
    const { refferalCode } = req.body;

    console.log(refferalCode,"refferal code")

    if (!userId || !refferalCode) {
      return res.status(400).json({
        success: false,
        message: "user id and refferal code was required ",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "user not found",
      });
    }

    const refferedUser = await User.findOne({ refferalCode });

    console.log(refferedUser,"reffered User")

    if (!refferedUser) {
      return res.status(404).json({
        success: false,
        message: "reffered user found",
      });
    }

    let userWallet = await Wallet.findOne({ user: userId });
    let refferedUserWallet = await Wallet.findOne({ user: refferedUser._id });

    if (!userWallet) {
      userWallet = new Wallet({
        user: userId,
        balanceAmount: 0,
        transactions: [],
      });
    }
    if (!refferedUserWallet) {
      refferedUserWallet = new Wallet({
        user: refferedUser._id,
        balanceAmount: 0,
        transactions: [],
      });
    }

    if (user.seenRefferal === false) {
      user.seenRefferal = true;
      await user.save();
    }

    const refferalAmount = 150;

    const userTransaction = {
      transactionDate: new Date(),
      transactionType: "credited",
      transactionStatus: "Completed",
      amount: refferalAmount,
    };

    const reffereeTransaction = {
      transactionDate: new Date(),
      transactionType: "credited",
      transactionStatus: "Completed",
      amount: refferalAmount,
    };

    (userWallet.balanceAmount += refferalAmount),
      userWallet.transactions.push(userTransaction);
    await userWallet.save();

    refferedUserWallet.balanceAmount += refferalAmount;
    refferedUserWallet.transactions.push(reffereeTransaction);
    await refferedUserWallet.save();

    return res.status(200).json({
      success: true,
      message: "Refferal code applied successfully",
      userWallet: userWallet,
      refereeWallet: refferedUserWallet,
    });
  } catch (error) {
    console.log(error, "error while applying referral code");
    next(error);
  }
};

export const handleSkipRefferalOffer = async (req, res, next) => {
  try {
    const userId = req.id;

    const user = await User.findById(userId);

    console.log(user,"usereeeee")

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "user not found",
      });
    }

    user.seenRefferal = true;
    await user.save();

    res.status(200).json({
      success: true,
      message: "skipped successfully",
      seenRefferal: user.seenRefferal,
    });
  } catch (error) {
    console.log(error, "error while skipping referral offer");
    next(error);
  }
};


export const handleCheckRefferalstatus = async (req,res,next) => {
  try {
    console.log("inside check status")


    const userId = req.id;

    console.log(userId,"useriddddd")

    const user = await User.findById(userId);

    console.log(user,"userrrrrrrr")

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "user not found",
      });
    }

    return res.status(200).json({
      success:true,
      good:"goodmorning",
      seenRefferal:user.seenRefferal

    })


    
  } catch (error) {
    console.log(error,"error while checking referral status")
    next(error)
  }
}
