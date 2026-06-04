import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";

const router = Router();
router.route("/register").post(registerUser)
// router.post("/register",(req,res)=>{
//     res.status(201).json({
//         message: "ok"
//     })
// })

export default router