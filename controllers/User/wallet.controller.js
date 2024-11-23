import Wallet from "../../models/wallet.js"


export const handleGetUserWallet = async (req , res , next) => {
    try {

        const userId = req.id 

        let wallet = await Wallet.findOne({user:userId})

        if(!wallet){
            wallet = new Wallet({
                user:userId,
                balanceAmount:0,
                transactions:[]
            })
        }

        wallet?.transactions.sort((a,b) => new Date(b.transactionDate) - new Date(a.transactionDate))

        res.status(200).json({
            success:true,
            message:"fetched user wallet successfully",
            wallet
        })



        
    } catch (error) {
        console.log(error, "error while getting user wallet")
        next(error)
    }
}