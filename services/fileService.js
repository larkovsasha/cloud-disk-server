

const fs = require('fs')
const File = require('../models/File')
const config = require('config')

class FileService {
    createDir(file) {
        const filePath = `${config.get('filePath')}\\${file.user}\\${file.path}`
        return new Promise((resolve, reject) => {
            try {
                if(!fs.existsSync(filePath)){
                    fs.mkdirSync(filePath, { recursive: true })
                    return resolve({message: 'File was created'})
                }else{
                    console.log(file)
                    return reject({message: 'File already exist'})
                }
            } catch (e) {
                return reject(e)
            }
        })

    }
    deleteFile(file){
        const path = this.getPath(file)
        if(file.type === 'dir'){
            fs.rmdirSync(path)
        }else{
            fs.unlinkSync(path)
        }
        console.log(path)

    }


    getPath(file) {
        return `${config.get('filePath')}\\${file.user}\\${file.path}`
    }
}


module.exports = new FileService()