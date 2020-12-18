const mongoose = require('mongoose')

const {User}= require('../../../models/user')
const auth = require('../../../middleware/auth')

describe('auth middlweware,',()=>{
     it('shud populate req.user with payload of a valid jwt',()=>{
        const user = { 
            _id: mongoose.Types.ObjectId().toHexString(), isAdmin: true }
        const token = new User(user).generateAuthToken()
        const req = {
            header: jest.fn().mockReturnValue(token)
        }
        const res = {}
        const next = jest.fn()

        auth(req, res, next)
        expect(req.user).toMatchObject(user)

    })
    
})