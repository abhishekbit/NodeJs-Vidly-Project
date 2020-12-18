const {Rental, validate} = require('../models/rental')
const {Movie} = require('../models/movie')
const {Customer} = require('../models/customer')
const Fawn = require('fawn')
const mongoose = require('mongoose')
const express = require('express')
const router = express.Router()

Fawn.init(mongoose)

router.get('/',async (req,res)=>{
    const rentals = await Rental.find().sort('-dateOut')
    res.send(customer)
})

router.post('/', async (req, res)=>{
    const {error} = validate(req.body)
    if (error) return res.status(400).send(error.details[0].message)
    
   
    const customer = await  Customer.findById(req.body.customerId)
    if(!customer) return res.status(400).send('Invalid Customer')

    const movie = await Movie.findById(req.body.movieId)
    if(!movie) return res.status(400).send('Invalid Movie')

    if(movie.numberInStock===0) return res.status(400).send('Movie out of stock')

    let rental = new Rental({
       customer:{
           _id: customer._id,
           name: customer.name,
           phone: customer.phone
       },
       movie:{
           _id: movie._id,
           title: movie.title,
           dailyRentalRate: movie.dailyRentalRate
       } 
    })

    try{
        new Fawn.Task()
            .save('rentals',rental)
            .update('movies',{ _id: movie._id},{
                $inc: { numberInStock: -1 }
            })
            .run()

 /*   rental = await rental.save()
    movie.numberInStock--
    movie.save()
*/
        res.send(rental)
    }
    catch(ex){
        res.status(500).send('Sumthing failed')
    }
})

router.put('/:id', async (req,res)=>{
    const {error} = validate(req.body)
    if(error) return res.status(400).send(error.details[0].message)

    const rental = await Rental.findByIdAndUpdate(req.params.id, 
        {
            customer:{
                _id: customer._id,
                name: customer.name,
                phone: customer.phone
            },
            movie:{
                _id: movie._id,
                title: movie.title,
                dailyRentalRate: movie.dailyRentalRate
            } 
        },{new: true})

    if(!rental) return res.status(404).send('rental with given id not found!!')

    res.send(rental)
}) 

router.delete('/:id', async (req,res)=>{
    const rental = await Rental.findByIdAndRemove(req.params.id)
    
    if(!rental) return res.status(404).send('rental with given id not found!!')
    
    res.send(rental)
})

router.get('/:id', async (req,res)=>{
    const rental = await Rental.findByIdAndUpdate(req.params.id)
    
    if(!rental) return res.status(404).send('customer with given id not found!!')
    res.send(rental)
})

module.exports=router