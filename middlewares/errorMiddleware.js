export const errorHandler = (error,req,res,next) => {
    //preparing structed error response 
    let statusCode = error.statusCode === 200 ? 500 :res.statusCode 
    
    let message = error.message 
    //checking for specific type of Errors
    if(error.name === 'CastError' && error.kind === 'objectId' ){
        statusCode = 404;
        message = 'Resource not found'
    }else if(error.name === "ValidationError"){
        statusCode = 400;
        message = 'Validation error'
    }else if(error.code === 11000){
        statusCode = 409;
        message = 'Duplicate field value entered'
    }else if(error.name === "ReferenceError"){
        statusCode = 400;
        
    }else if(error instanceof TypeError ){
        statusCode = 400;
        message = 'Invalide data Type'
    }
  

   //Structred error Response
   return res.status(statusCode).json({
    success:false,
    message:message,
    // stack: process.env.NODE_ENV === 'production' ? null : error.stack,
 
   })

}
