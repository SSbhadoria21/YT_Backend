//using promises wrapper banate h db k index.js k code k liye
const asyncHandler = (reqHandler) => {
   return (req,res,next)=>{
        Promise
        .resolve(reqHandler(req,res,next))
        .catch((err)=> next(err))
    }
}
export {asyncHandler}



//higher-order function, jo ek function ko as a parameter leta h or uske andar kuch logic perform krta h, or uske baad us function ko call krta h, toh yahan hum asyncHandler naam ka ek higher-order function bana rahe hain, jo ek function ko as a parameter lega, or uske andar kuch logic perform karega, or uske baad us function ko call karega, toh chaliye ab hum asyncHandler naam ka ek higher-order function bana lete hain, jo ek function ko as a parameter lega, or uske andar kuch logic perform karega, or uske baad us function ko call karega.


//trycatch
// const asyncHandler = (fn) => async (req,res,next)=> {
//     try {
//         await fn(req,res,next)
//     } catch (error) {
//         res.status(err.code || 500).json({
//             success: false,
//             message: err.message || "Internal Server Error"
//         })
        
//     }
// }