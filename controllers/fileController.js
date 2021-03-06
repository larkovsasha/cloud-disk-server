
const fileService = require('../services/fileService')
const User = require('../models/User')
const File = require('../models/File')
const config = require('config')
const fs = require('fs')
const uuid = require('uuid')


class FileController {
    async createDir(req, res) {
        try {
            const {name, type, parent} = req.body
            const file = new File({name, type, parent, user: req.user.id})
            const parentFile = await File.findOne({_id: parent})

            if (!parentFile) {
                file.path = name
                await fileService.createDir(file)
            } else {
                file.path = `${parentFile.path}\\${name}`
                await fileService.createDir(file)
                parentFile.children.push(file._id)
                await parentFile.save()
            }
            await file.save()
            return res.json(file)
        } catch (e) {
            console.log(e)
            res.status(400).json(e)
        }
    }


    async getFiles(req, res) {
        try {
            const sort = req.query.sort
            const files = await File.find({user: req.user.id, parent: req.query.parent}).sort({[sort]: 1})

            return res.json(files)

        } catch (e) {
            console.log(e)
            return res.status(500).json(e)
        }

    }

    async uploadFile(req, res) {
        try {
            const file = req.files.file

            const parent = await File.findOne({user: req.user.id, _id: req.body.parent})
            const user = await User.findOne({_id: req.user.id})

            if (user.usedSpace + file.size > user.diskSpace) {
                return res.status(400).json({message: 'There no space on the disk'})
            }

            user.usedSpace = user.usedSpace + file.size

            let path;
            if (parent) {
                path = `${config.get('filePath')}\\${user._id}\\${parent.path}\\${file.name}`
            } else {
                path = `${config.get('filePath')}\\${user._id}\\${file.name}`
            }

            if (fs.existsSync(path)) {
                return res.status(400).json({message: 'File already exist'})
            }


            const type = file.name.split('.').pop()
            let filePath = file.name
            if (parent) {
                filePath = parent.path + "\\" + file.name
            }

            const dbFile = new File({
                name: file.name,
                type,
                size: file.size,
                path: filePath,
                parent: parent?._id,
                user: user._id
            })

            await file.mv(path)

            await dbFile.save()
            await user.save()

            res.json(dbFile)
        } catch (e) {
            console.log(e)
            return res.status(500).json({message: "Upload error"})
        }
    }

    async downloadFile(req, res) {
        try {
            const file = await File.findOne({_id: req.query.id, user: req.user.id})
            const path = fileService.getPath(file)

            if (fs.existsSync(path)) {
                res.download(path, file.name)
            }

        } catch (e) {
            console.log(e)
            res.status(500).json({message: 'download error'})
        }

    }


    async deleteFile(req, res) {

        try {
            const file = await File.findOne({_id: req.query.id, user: req.user.id})
            if (!file) {
                return res.status(400).json({message: 'File not found'})
            }
            console.log(file)

            fileService.deleteFile(file)
            await file.remove()
            return res.json({message: 'File was deleted'})


        } catch (e) {
            console.log(e)
            return res.status(400).json({message: 'Dir is not empty'})
        }
    }

    async searchFile(req, res) {

        try {
            const searchName = req.query.search
            let files = await File.find({user: req.user.id})
            files = files.filter(file => file.name.includes(searchName))
            console.log(files)
            return res.json(files)
        } catch (e) {
            console.log(e)
            return res.status(400).json({message: 'Search error'})
        }
    }
    async uploadAvatar(req, res) {

        try {
            const file = req.files.file
            const user = await User.findById(req.user.id)
            if(user.avatar){
                fs.unlinkSync(config.get('staticPath') + "\\" + user.avatar)
            }


            const avatarName = uuid.v4() + ".jpg"
            file.mv(config.get('staticPath') + "\\" + avatarName)
            user.avatar = avatarName

            await user.save()
            return res.json({user})
        } catch (e) {
            console.log(e)
            return res.status(400).json({message: 'Avatar upload error'})
        }
    }
    async deleteAvatar(req, res) {
        console.log('delete')
        console.log(req.user.id)
        try {
            const user = await User.findById(req.user.id)
            fs.unlinkSync(config.get('staticPath') + "\\" + user.avatar)
            user.avatar = null
            await user.save()
            return res.json({user})
        } catch (e) {
            console.log(e)
            return res.status(400).json({message: 'Search error'})
        }
    }

}

module.exports = new FileController()