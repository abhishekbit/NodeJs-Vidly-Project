const Joi = require('joi')
const {Movie} = require('../models/movie')
const moment = require('moment')
const validate = require('../middleware/validate')
const auth = require('../middleware/auth')
const {Rental} = require('../models/rental')
const express = require('express')
const router = express.Router()


router.post('/', [auth, validate(validateReturn)] , async (req,res)=>{
  const rental = await Rental.lookup(req.body.customerId,req.body.movieId)
  
  if (!rental) return res.status(404).send('rental not found')
  
  if (rental.dateReturned) return res.status(400).send('return already processed')

  rental.return()
  await rental.save()

  await Movie.update({ _id: rental.movie._id},
    {$inc: { numberInStock: 1} 
  })
  
  return res.status(200).send(rental)

//    const returns = await Rental.find().sort('name')
//  res.send(returns)
})


function validateReturn(req){
  const schema = {
      customerId: Joi.objectId().required(),
      movieId: Joi.objectId().required()
  }
  return Joi.validate(req,schema)
}



module.exports = router