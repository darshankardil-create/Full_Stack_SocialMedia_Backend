import express from "express"
import {sendtokenforsignup,verifytoken,login, Userinfodoc,getallpost,getonlymypost} from "./controller.js"



const router=express.Router()


router.post("/sendtokenforsignin",sendtokenforsignup)
router.get("/verifytoken",verifytoken)
router.post("/login",login)
router.get("/Userinfodoc/:id",Userinfodoc)
router.get("/getallpost/:offset/:limit",getallpost)
router.get("/getonlymypost/:userid",getonlymypost)

export default router