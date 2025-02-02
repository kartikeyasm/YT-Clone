//A function is passed as a parameter inside asyncHandler
// therefore asyncHandler is a super function
const asyncHandler = (fn) => async (req, res, next)=>{
    try{
        await fn(req,res,next);
    }catch(error){
        res.status(error.code|| 500).json({
            success: false,
            message: error.message
        });
    }
}

export {asyncHandler}

/*  //Another way of writing code
const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next))
        .catch((err) => next(err))
    }
}
*/