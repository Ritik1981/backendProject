// Here we take a function as an arg and pass it down to another function 

// const asyncHandler = (func) => {
//     return (req,res,next) => {
//         Promise.resolve(func(req,res,next)).catch((err) => {
//             next(err) // next(err) means passing err to next middleware
//         })
//     }
// }


const asyncHandler = (func) => {
    return (req, res, next) => {
        Promise.resolve(func(req, res, next)).catch((err) => {
            next(err); // next(err) means passing err to next middleware
        });
    };
};

export default asyncHandler;










// const asyncFunction = (func) => { async () => {} }
//Using try catch

// const asyncFunction = (func) => async (req,res,next) => { // for db connection
//     try{
//         await func(req,res,next)
//     }
//     catch(err){
//         res.status(err.code).json({ // Passing status of error code and a json response
//             success: false,
//             message: err.message
//         })
//     }


// } 