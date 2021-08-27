const fs = require('fs')
const File = require('../models/File')
const config = require('config')

class FileService {
    createDir(file) {
        const filePath = `${config.get('filePath')}\\${file.user}\\${file.path}`
        console.log(file, 'file')
        return new Promise((resolve, reject) => {
            try {
                if(!fs.existsSync(filePath)){
                    fs.mkdirSync(filePath, { recursive: true })
                    return resolve({message: 'File was created'})
                }else{
                    return reject({message: 'File already exist'})
                }
            } catch (e) {
                return reject(e)
            }
        })

    }
}


module.exports = new FileService()