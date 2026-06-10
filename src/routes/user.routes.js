import { Router } from "express";
import { loginUser, logoutUser, registerUser } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
import { verify } from "jsonwebtoken";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();
router.route("/register").post(
    upload.fields([
        {name:"avatar",maxCount:1},
        {name:"coverImage",maxCount:1}
    ]),
    registerUser)
// router.post("/register",(req,res)=>{
//     res.status(201).json({
//         message: "ok"
//     })
// })
router.route("/login").post(loginUser)

//secure routes
router.route("/logut").post(verifyJWT,logoutUser)

export default router