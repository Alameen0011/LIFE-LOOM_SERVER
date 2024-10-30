import {body,validationResult} from 'express-validator'

export const signupValidationRules = () => {
    console.log("inside validation rules")
    return [
        body('firstName')
        .notEmpty().withMessage('First name is required')
        .isLength({min:2}).withMessage('First name must be atleast 2 character long')
        .trim(),

        body('lastName')
        .notEmpty().withMessage('last name is required')
        .isLength({min:2}).withMessage('last Name must be atleast 2 character long')
        .trim(),

        body('email')
        .notEmpty().withMessage('email is required')
        .isEmail().withMessage('Must be valid email address')
        .normalizeEmail()
        .isLength({ max: 100 }).withMessage('Email must not exceed 100 characters.'),
      

        body('phone')
        .notEmpty().withMessage('Phone number is required.')
        .matches(/^\d{10}$/).withMessage('Phone number must be 10.'),
        
        body('password')
        .notEmpty().withMessage('Password is required.')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long.')
        .matches(/\d/).withMessage('Password must contain a number.')
        .matches(/[a-zA-Z]/).withMessage('Password must contain a letter.')
        .trim(),



    ]
};

// Validation rules for user login
export const loginValidationRules = () => {
    return [
      body('email')
        .notEmpty().withMessage('Email is required.')
        .isEmail().withMessage('Must be a valid email address.')
        .normalizeEmail(),
  
      body('password')
        .notEmpty().withMessage('Password is required.')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long.'),
    ];
  };

//validation rules for Password reset
export const forgotValidationRules = () => {

    return [
      body('email')
      .notEmpty().withMessage('Email is required.')
      .isEmail().withMessage('Must be a valid email address.')
      .normalizeEmail(),


    ]
}
  

//A middleware to check validation result - express validator will not directly throw error 

export const validate = (req,res,next) => {
    console.log("inside validate middleware")
    const errors =  validationResult(req)
    console.log(errors)

    if(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array().map(error => error.msg)  });
    }else{
      next()
    }


}

