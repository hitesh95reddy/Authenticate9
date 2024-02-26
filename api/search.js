const express=require('express')
const router=express.Router()
const {RegisteredUser,Contact,SpamNumber}=require('../database')
const { Op, Sequelize } = require('sequelize');

router.get('/searchByName',async (req,res)=>{
    const {name}=req.query;
    if(name){
    try{
        const registeredUsers1 = await RegisteredUser.findAll({
            attributes: ['name', 'phone_number'],
            where: {
              name: {
                [Op.iLike]: name+'%'
              }
            }
          });
          const contacts1 = await Contact.findAll({
            attributes: ['name', 'phone_number'],
            where: {
              name: {
                [Op.iLike]: name+'%'
              }
            }
          });
          const registeredUsers2 = await RegisteredUser.findAll({
            attributes: ['name', 'phone_number'],
            where: {
              name: {
                [Op.notILike]: name+'%',
                [Op.iLike]:'%'+name+"%"
              }
            }
          });
          const contacts2 = await Contact.findAll({
            attributes: ['name', 'phone_number'],
            where: {
              name: {
                [Op.notILike]: name+'%',
                [Op.iLike]:'%'+name+"%"
              }
            }
          });   
          const spamNumbers = await SpamNumber.findAll({
            attributes: ['phone_number', [Sequelize.fn('COUNT', Sequelize.col('*')), 'spam_count']],
            group: ['phone_number']
          });
        // console.log(registeredUsers1);
        // console.log(contacts1);
        // console.log(registeredUsers2);
        // console.log(contacts2)
          //console.log(spamNumbers);
          
          const spamNumbersDict = spamNumbers.reduce((acc, spamNumber) => {
            //console.log(spamNumber.dataValues.spam_count, spamNumber.dataValues.phone_number)
            acc[spamNumber.dataValues.phone_number] = spamNumber.dataValues.spam_count;
            return acc;
          }, {});

    
          let namePhoneArray = [];
          registeredUsers1.forEach(user => {
            if (!namePhoneArray.some(obj => obj.name === user.dataValues.name && obj.phone_number === user.dataValues.phone_number)) {

                namePhoneArray.push({name: user.dataValues.name, phone_number: user.dataValues.phone_number,spam_count:spamNumbersDict[user.dataValues.phone_number] || 0});
            }
            });

            contacts1.forEach(contact => {
            if (!namePhoneArray.some(obj => obj.name === contact.dataValues.name && obj.phone_number === contact.dataValues.phone_number)) {
                namePhoneArray.push({name: contact.dataValues.name, phone_number: contact.dataValues.phone_number,spam_count:spamNumbersDict[contact.dataValues.phone_number] || 0});
            }
            });

            registeredUsers2.forEach(user => {
            if (!namePhoneArray.some(obj => obj.name === user.dataValues.name && obj.phone_number === user.dataValues.phone_number)) {
                
                //console.log(spamNumbersDict[user.dataValues.phone_number] || 0);
                namePhoneArray.push({name: user.dataValues.name, phone_number: user.dataValues.phone_number,spam_count:spamNumbersDict[user.dataValues.phone_number] || 0});
            }
            });

            contacts2.forEach(contact => {
            if (!namePhoneArray.some(obj => obj.name === contact.dataValues.name && obj.phone_number === contact.dataValues.phone_number)) {
                namePhoneArray.push({name: contact.dataValues.name, phone_number: contact.dataValues.phone_number,spam_count:spamNumbersDict[contact.dataValues.phone_number] || 0});
            }
            });

            console.log(namePhoneArray);


        
        res.json({"results":namePhoneArray});

    }catch(error){
        
        res.status(500).json({err:"Issue occurred"});
    }}
    else{
        res.status(400).json({err:"Invalid Request. Name not provided"});
    }
})

router.get('/searchByNumber',async (req,res)=>{
    const {number}=req.query;

    if(number){
        const spamNumbers = await SpamNumber.findAll({
            attributes: ['phone_number', [Sequelize.fn('COUNT', Sequelize.col('*')), 'spam_count']],
            group: ['phone_number']
          });
          const spamNumbersDict = spamNumbers.reduce((acc, spamNumber) => {
            //console.log(spamNumber.dataValues.spam_count, spamNumber.dataValues.phone_number)
            acc[spamNumber.dataValues.phone_number] = spamNumber.dataValues.spam_count;
            return acc;
          }, {});  

        const registeredUsers = await RegisteredUser.findOne({where:{phone_number:number}});
        console.log('reg',registeredUsers)
        if(registeredUsers){
            console.log('reg',registeredUsers)
            res.json({"results":[{"name":registeredUsers.name,"phone_number":registeredUsers.phone_number,"no_of_users_reported_as_spam":spamNumbersDict[registeredUsers.phone_number] || 0,"email":registeredUsers.email}]});
        }else{
            const contacts = await Contact.findAll({attributes: ['name', 'phone_number'],where:{phone_number:number}});
            if(contacts.length>0){
                console.log('con',contacts)
                res.json({"results":contacts.map(contact=>{return {name:contact.name,phone_number:contact.phone_number,"no_of_users_reported_as_spam":spamNumbersDict[contact.phone_number] || 0}})});
            }else{
                const count = await SpamNumber.count({
                    where: {
                      phone_number: number
                    }
                  });
                  if(count>0){
                    res.json({number:number,msg:"Number is marked as spam by"+count+" users"});
                  }else{
                    res.json({err:"No user with this number exists"});
                  
                  }
            }
        }
    }else{
        res.status(400).json({err:"Invalid Request. Number not provided"});
    }
})
module.exports=router
