import express from "express"
import {sendtokenforsignup,verifytoken,login, Userinfodoc,getallpost} from "./controller.js"



const router=express.Router()


router.post("/sendtokenforsignin",sendtokenforsignup)
router.get("/verifytoken",verifytoken)
router.post("/login",login)
router.get("/Userinfodoc/:id",Userinfodoc)
router.get("/getallpost/:offset/:limit",getallpost)

export default router