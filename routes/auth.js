const Joi = require('joi')
const bcrypt = require('bcrypt')
const _ = require('lodash')
const {User} = require('../models/user')
const mongoose = require('mongoose')
const express = require('express')
const router = express.Router()

router.post('/',async (req,res)=>{
    const {error} = validate(req.body)
    if (error) return res.status(400).send(error.details[0].message)

    let user = await User.findOne({ email: req.body.email })//chk if user already in db
    if (!user) return res.status(400).send('invalid email')
     
    
    const validPassword = await bcrypt.compare(req.body.password,user.password)//compare plain text pass and hash pass
    console.log("req = " + req.body.password)
    console.log("user = " + user.password)
    console.log(validPassword)
    if (validPassword) return res.status(400).send('invalid password')

    const token = user.generateAuthToken()
    res.send(token)
})

function validate(req){
    const schema = {
        email: Joi.string().min(5).max(255).required().email(),
        password: Joi.string().min(5).max(255).required()
    }
    return Joi.validate(req,schema)
} 
module.exports=router