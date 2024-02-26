const express=require('express')
const router=express.Router()
const {RegisteredUser,Contact}=require('../database')
const { Op,Sequelize } = require('sequelize');

router.post('/addContact',async (req,res)=>{
    const {userid,name,phoneNumber}=req.body;
    var email=null;
    if (!(userid && name && phoneNumber)){
        res.status(400).json({err:"Invalid Request. Required fields not provided"});
        return;
    }
    if(req.body.email){
        email=req.body.email;
    }
    try{
        RegisteredUser.findOne({where:{user_id:userid}}).then(user=>{
            if(user){
                Contact.findOne({where:{[Op.and]:[{phone_number:phoneNumber},{is_contact_of:userid}]}}).then(contact=>{
                    if(contact){
                        res.status(400).json({err:"Contact already exists"});
                    }else{
                        const contact=Contact.create({
                            is_contact_of:userid,
                            name:name,
                            phone_number:phoneNumber,
                            email:email
                        });
                        res.status(200).json({"message":"Contact Added Successfully"});
                    }
                })
            }else{
                res.status(400).json({err:"Invalid Request. Only Registered Users can add contacts"});
            }
        })
    }catch(error){
        res.status(500).json({err:"Issue occurred"});
    }
})

router.get('/allcontacts',async (req,res)=>{
    const {userid}=req.body;
    if(userid){
    try{
        RegisteredUser.findOne({where:{user_id:userid}}).then(user=>{
            if(user){
                Contact.findAll({where:{is_contact_of:userid}}).then(contacts=>{
                    res.json(contacts);
                })
            }else{
                res.status(400).json({err:"Invalid Request. Only Registered Users can view contacts"});
            }
        })}
        catch(error){
            res.status(500).json({err:"Issue occurred"});
        }}
        else{
            res.status(400).json({err:"Invalid Request. User ID not provided"});
        }
})
module.exports=router
