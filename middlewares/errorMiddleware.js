export const errorHandler = (error,req,res,next) => {
    //preparing structed error response 
    let statusCode = error.statusCode === 200 ? 500 :res.statusCode 
    
    let message = error.message
    //checking for specific type of Errors
    if(error.name === 'CastError' && error.kind === 'objectId' ){
        statusCode = 404;
        message = 'Resource not found'
    }
    /*This block helps handle a common MongoDB-specific error,
     providing a more user-friendly response when a resource
     isn't found due to an invalid ID.
    */

   //Structred error Response
   return res.status(statusCode).json({
    success:"false",
    message:message,
    // stack: process.env.NODE_ENV === 'production' ? null : error.stack,
 
   })

}
