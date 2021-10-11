const multer = require('multer')
const moment = require('moment')



const storage = multer.diskStorage({
    destination(req, file, cb){
        console.log(req)
            cb(null, 'uploads/')
    },
    fileName(req, file, cb){
        //const date = moment().format('DDMMYYYY-HHmmss_SSS')
        cb(null, file.originalname)
    }
})

const fileFilter = () => {}


module.exports = multer({
    storage,
    fileFilter
})

