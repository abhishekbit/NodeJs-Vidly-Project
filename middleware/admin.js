
module.exports = function(req,res,next){
    //set req.user 
    //401: unauthoised
    //403: forbidden
    if (!req.user.isAdmin) return res.status(403).send('Access denied')
    next()

}