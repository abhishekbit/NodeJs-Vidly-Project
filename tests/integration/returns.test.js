const moment = require('moment')
const request = require('supertest')
const { User} = require('../../models/user')
const { Movie } = require('../../models/movie')
const { Rental} = require('../../models/rental')
const mongoose = require('mongoose');

describe('/api/returns',()=>{
    let server
    let customerId
    let movie
    let movieId
    let rental
    let token

    const exec = () => {
        return request(server)
        .post('/api/returns')
        .set('x-auth-token',token)
        .send({customerId: customerId,movieId})
    }

    beforeEach( async() => { 
        server = require('../../index')
        
        customerId = mongoose.Types.ObjectId()
        movieId = mongoose.Types.ObjectId()

        token = new User().generateAuthToken()

        movie = new Movie({
            _id: movieId,
            title: 'Inception',
            dailyRentalRate: 2,
            genre:{name: 'Horror'},
            numberInStock: 10
        })
        await movie.save()

        rental = new Rental({
            customer:{
                _id: customerId,
                name: '12345',
                phone: '12345'
            },
            movie:{
                _id: movieId,
                title: 'Inception',
                dailyRentalRate: 2
            }
        })
        await rental.save()
    })
    
    afterEach( async () => { 
    await server.close() 
    await Rental.remove({})
    await Movie.remove({})
    }) 

    it('shud return a 401 if  client not logged in', async()=>{
       token = ''
       
       const res = await exec()

       expect(res.status).toBe(401)
    }) 
    
    it('shud return a 400 if customer id not provided', async()=>{
        customerId = ''

        const res = await exec()
  
        expect(res.status).toBe(400)
    })
    
    it('shud return a 400 if movie id  not provided', async()=>{
        movieId = ''

        const res = await exec()

        expect(res.status).toBe(400)
    })

    it('shud return a 404 if no Rental found', async()=>{
        await Rental.remove({})

        const res = await exec()
        
        expect(res.status).toBe(404)
    })

    it('shud return a 400 if  return already processed', async()=>{
        rental.dateReturned = new Date()
//        console.log(rental.dateReturned)
        await rental.save()

        const res = await exec()
        
        expect(res.status).toBe(400)
    })

    it('shud return a 200 if request is valid', async()=>{
        
        const res = await exec()
        
        expect(res.status).toBe(200)
    })

    it('shud set the return date if input is valid', async()=>{
       
        const res = await exec()

        const rentalInDb = await Rental.findById(rental._id)
  
        const diff = new Date() - rentalInDb.dateReturned
//        console.log(diff)
        expect(diff).toBeLessThan(10*1000)
    })

    it('shud set the rentalFee if input is valid', async()=>{
 
        rental.dateOut = moment().add(-7,'days').toDate()
        await rental.save()

        const res = await exec()

        const rentalInDb = await Rental.findById(rental._id)
        expect(rentalInDb.rentalFee).toBe(14)
    })

    it('shud increase the movie stock if input valid', async()=>{

        const res = await exec()

        const movieInDb = await Movie.findById(movieId)
//        console.log(movieInDb)
        expect(movieInDb.numberInStock).toBe(movie.numberInStock+1)
    })

    it('shud return the rental if input is valid', async()=>{
 
        const res = await exec()

        expect(Object.keys(res.body)).toEqual(
            expect.arrayContaining(['dateOut', 'dateReturned',
            'rentalFee', 'customer', 'movie' ]))

    })

})
