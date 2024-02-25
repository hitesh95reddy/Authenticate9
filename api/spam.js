const express=require('express')
const router=express.Router()
const {RegisteredUser,SpamNumber}=require('../database')
const { Op } = require('sequelize');

router.post('/addSpam',async (req,res)=>{
    const {userid,phoneNumber}=req.body;
    if (!(userid && phoneNumber)){
        res.status(400).json({err:"Invalid Request. Required fields not provided"});
        return;
    }
    try{
        RegisteredUser.findOne({where:{user_id:userid}}).then(user=>{
            if(user){
                SpamNumber.findOne({where:{[Op.and]:[{added_by:userid},{phone_number:phoneNumber}]}}).then(spam=>{
                    if(spam){
                        res.status(400).json({err:"You Have Already Marked this number as spam"});
                    }else{
                        const spam=SpamNumber.create({
                            added_by:userid,
                            phone_number:phoneNumber
                        });
                        res.status(200).json({"message":"Number is marked as spam successfully"});
                    }
                })
            }else{
                res.status(400).json({err:"Only Registered Users can add phone numbers to spam"});
            }
        })
    }catch(error){
        res.status(500).json({err:"Issue occurred"});
    }
})

router.get('/allSpamReportedByUser',async (req,res)=>{
    const {userid}=req.body;
    if(userid){
    try{
        RegisteredUser.findOne({where:{user_id:userid}}).then(user=>{
            if(user){
                SpamNumber.findAll({where:{added_by:userid}}).then(spamNumbers=>{
                    res.json(spamNumbers);
                })
            }else{
                res.status(400).json({err:"Only Registered Users can view spam numbers"});
            }
        })}
        catch(error){
            res.status(500).json({err:"Issue occurred"});
        }}
        else{
            res.status(400).json({err:"Invalid Request. User ID not provided"});
        }
})

router.get('/allSpamNumbers',async (req,res)=>{
    SpamNumber.findAll({attributes:['phone_number']}).then(spamNumbers=>{
        res.json(spamNumbers);
    }).catch(error=>{
        res.status(500).json({err:"Issue occurred"});
    })
})
module.exports=router
