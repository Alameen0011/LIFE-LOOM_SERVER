
// Success Response Middleware
export const successHandler = (req,res,next) => {
    res.success = (data,message,statusCode) => {
        return res.status(statusCode).json({
            success:true,
            message,
            data,
        });
    }
    next();

}

// This middleware adds a res.success() method to the res object that your route handlers can use to send consistent success responses.