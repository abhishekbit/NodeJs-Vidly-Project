const {User} = require('../../models/user')
const request = require('supertest')
const { Genre } = require('../../models/genre')

describe('auth middlweware,',()=>{
    beforeEach(() => { server = require('../../index')})
    afterEach( async () => { 
        await Genre.remove({})
        await server.close()         
    })

    let token

    const exec = () => {
        return request(server)
        .post('/api/genres')
        .set('x-auth-token',token)//set method converts token As string
        .send({name: 'genre1'})
    }

    beforeEach(()=>{
        token = new User().generateAuthToken()
    })

    it('shud return 401 if no token provided',async()=>{
        token = '' 
        
        const res = await exec()
        expect(res.status).toBe(401)
    })  
    it('shud return 400 if token invalid',async()=>{
        token = 'a' 
        const res = await exec()
        expect(res.status).toBe(400)
    })  
    it('shud return 200 if token valid',async()=>{
        const res = await exec()        
        expect(res.status).toBe(200)
    })
})


