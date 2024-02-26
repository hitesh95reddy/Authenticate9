const express=require('express');
const router=express.Router();
const bcrypt = require('bcryptjs');
const { Sequelize } = require('sequelize');

const { RegisteredUser } = require('../database');

router.post('/register', async (req, res) => {
    const { name, phoneNumber, password } = req.body;
    if (!(name && phoneNumber && password)) {
      res.status(400).json({ err: 'Invalid Request. Required fields not provided' });
      return;
    }
    var email = null;
    if (req.body.email) {
      email = req.body.email;
    }
    console.log(req.body)
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await RegisteredUser.create({
        name: name,
        phone_number: phoneNumber,
        password: hashedPassword,
        email: email
      });
      res.json({"message":"User Registered Successfully"});
    } catch (error) {
      if (error instanceof Sequelize.UniqueConstraintError) {
        res.status(400).json({ err: 'Phone Number already added by a registered user' });
      } else {
        res.status(500).json({ err: 'Issue occurred' });
      }
    }});

router.post('/login',(req,res)=>{
    const {name,password}=req.body;
    if(!(name && password)){
        res.status(400).json({err:"Invalid Request. Required fields not provided"});
        return;
    }
    RegisteredUser.findOne({where:{name:name}}).then(user=>{
        if(user){
            bcrypt.compare(password,user.password,(err,response)=>{
                if(response){
                    res.json({message:"Login Successful"});
                }else{
                    res.status(400).json({err:"Invalid username/password provided"});
                }
            })
        }else{
            res.status(400).json({err:"Invalid username/password provided"});
        }
    })
})

router.get('/users',async (req,res)=>{
    const users = await RegisteredUser.findAll();
    res.json(users);
})

module.exports=router
