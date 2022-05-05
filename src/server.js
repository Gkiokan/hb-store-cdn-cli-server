import express from 'express'
import http from 'http'
import fs from 'fs'
import fg from 'fast-glob'
import path from 'path'
import hb from './hb'
import db from './db'
import cli from './cli'
import log from './log'
import clc from 'cli-color'
import helper from './helper'
import pkgInfo from 'ps4-pkg-info'
// import { getPs4PkgInfo } from "@njzy/ps4-pkg-info"
import { getPs4PkgInfo } from "./pkg-tool/node"
import md5File from 'md5-file'
import normalize from 'normalize-path'

export default {
    ip: null,
    port: null,
    basePath: null,
    files: [],
    host: {
        app: null,
        server: null,
        router: null,
    },

    module: 'Server',
    log: log.log,
    error: log.error,
    notify: log.notify,

    getBaseURI(){
        return 'http://' + this.ip + ':' + this.port
    },

    setConfig(config){
        this.ip       = config.host
        this.port     = config.port
        this.basePath = config.basePath
    },

    sendFiles(){
        // this.getWindow().webContents.send('server-files', this.files)
        // #todo render a table of available files
        // console.log("Found files", this.files)
        if(this.files.count)
          cli.showList(this.files)

        else
          this.error("No files found in basePath! Check your basePath and put sommething in!")

        cli.server()
    },

    setState(state=null){
        // this.getWindow().send('server-state', state)
        global.state.server = state
        this.log(clc.cyan("Set Server State to " + state))
    },

    updatePS4IP(ip){
        // this.getWindow().send('update-ps4-ip', ip)
        this.log("I guess we have a ps4 IP here " + ip)
    },

    addCORSHandler(){
        this.host.app.use((req, res, next) => {
            res.setHeader('Access-Control-Allow-Origin', '*')
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
            // res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
            // res.setHeader('Access-Control-Allow-Credentials', true);
            next()
        })
    },

    addRouterMiddleware(){
        this.host.app.use((req, res, next) => {
            this.host.router(req, res, next)
        })
    },

    createPaths(){
        this.log("Server is ready to create paths")
        db.renewDB()
        this.files = []
        this.host.router = new express.Router()
        this.addHearthbeatEndpoint()
        this.addFilesFromBasePath()
    },

    async rescanFolder(config){
        console.log("Trigger re-scan")
        this.setConfig(config)
        this.createPaths()
        this.notify("Re-scaned BasePath")
    },

    addHearthbeatEndpoint(){
        this.log("Create Hearthbeat endpoint")
        this.host.router.get('/hb', function(request, response){
            response.status(200).json({
                remoteAddress: request.connection.remoteAddress,
                remotePort: request.connection.remotePort,
                localAddress: request.connection.localAddress,
                localPort: request.connection.localPort,
                message: "Hearthbeat of HB-Store CDN Server is working"
            })
        })

        // storage database
        this.host.router.get('/store.db', (request, response) => {
            // console.log("HB-Store Download store.db Request", request)
            // console.log("PS4 IP", request.ip )
            var r = /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/
            let ip = request.ip
            let cleanedIP = ip.match(r)[0]
            this.updatePS4IP(cleanedIP)

            let store = db.getStorePath()
            response.status(200).download(store, 'store.db')
        })

        // check the storage checksum
        this.host.router.get('/api.php', function(request, response){
            if('db_check_hash' in request.query){
                let hash  = md5File.sync(db.getStorePath())
                response.status(200).json({
                    hash,
                    params: request.query,
                })
            }
        })

        // number of downloads?
        this.host.router.get('/download.php', function(request, response){
            response.status(200).json({
                number_of_downloads: "1337",
            })
        })

        // load server binaries
        for (const asset of ['homebrew.elf', 'homebrew.elf.sig', 'remote.md5'])
          this.host.router.get('/update/' + asset, function(request, response){
              let file = helper.getFile('bin/' + asset)
              response.status(200).download(file, asset)
          })
    },

    async addFilesFromBasePath(){

        try {
            let folder = fs.statSync(this.basePath)
            let isFolder = folder.isDirectory()

            if(!isFolder){
              this.error("BasePath does exist but doesn't seem to be a valid folder.")
              cli.run()
              return
            }

        }
        catch (err) {
           if (err.code === 'ENOENT' || err.code === 'ENOTDIR') {
              return this.error("BasePath folder doesn't exist");
           }
        }

        this.log("Search for pkg files in basePath at " + this.basePath)
        let patchedBasePath = normalize(this.basePath)
        let toRemoveBasePath = (patchedBasePath.charAt(0) == "/") ? patchedBasePath.substr(1).replace(/[^a-zA-Z0-9-_./]/g, '') : patchedBasePath.replace(/[^a-zA-Z0-9-_./]/g, '')

        let files = fg.sync([patchedBasePath + '/**/*.pkg'])
        this.log("Found " + files.length + " files in basePath")

        // loop for files and map the files to a file object
        let base = this.getBaseURI()
        let i = 1
        for (const file of files){
            // console.log("Start file ", file)
            try {
                // let data = await pkgInfo.extract(file)
                let data = await getPs4PkgInfo(file, { generateBase64Icon: true })
                                        .catch( e => {
                                            this.error("Error in PKG Extraction: "+ e + '; File: ' + file)
                                            throw e
                                        })
                // console.log(data)
                let item = hb.createItem(data, file, i)
                    item = hb.removeBasePath(item, toRemoveBasePath)
                    item = hb.addImages(item, base)
                    item = this.addFileEndpoint(item, base)

                this.files.push(item)
                // console.log(item)
                i = i+1
            }
            catch(e){
                this.error("Error", e)
            }

            // console.log("End file ", file)
            // console.log("====")
        }

        db.addAllItems(this.files)
        // console.log("=====================================")
        // console.log("patched file 0 ", this.files[0] )
        // console.log("=====================================")

        this.sendFiles()
    },

    addFileEndpoint(item, base){
        this.host.router.get(`/${item.patchedFilename}`, function(request, response){
            response.status(200).download(item.path, item.filename)
        })

        this.host.router.get(`/${item.patchedFilename}/icon0.png`, function(request, response){
            let imgData = item.icon0.replace(/^data:image\/png;base64,/, '');
            let img = Buffer.from(imgData, 'base64')

            response.writeHead(200, {
              'Content-Type': 'image/png',
              'Content-Length': img.length
            })

            response.end(img)
        })

        item.package = base + '/' + item.patchedFilename

        return item
    },

    createServer(){
        const app = express();
        this.host.app = app
        this.host.router = express.Router()
        this.log("Server created")
    },

    async start(config){
        this.setConfig(config)

        if(global.state.server == 'running'){
            this.log(clc.magenta("Server is already started. Restarting server"))
            this.restart(config)
            return
        }

        if(!this.host.app){
            this.createServer()
        }

        // console.log(this.ip, this.ip.length, this.port, this.port.length)
        if(this.ip.length == 0 || this.port.length == 0){
            this.error("Server cannot start. Please configure IP and Port")
            // this.$message({ type: 'warning', message: error });
            return
        }

        this.host.server = await this.host.app.listen(this.port, () => {
            this.notify('Server is running on ' + this.ip + ' at port ' + this.port)
            this.setState('running')

            this.addCORSHandler()
            this.addRouterMiddleware()
            this.createPaths()
        })
        .on('error', (e) => {
            // console.log({ ...e })
            this.setState('stopped')

            if(e.code === 'EADDRINUSE'){
              let error = "Port " + this.port + " is already in use. Choose another port and restart the Server"
              this.error(error)
            }
            else {
              this.error('Error in listening on ' + this.ip + ' at port ' + this.port + ". Error: " + e.code)
            }
        })
    },

    async stop(restart=false, config={}){
        this.log('Closing Server')

        if(this.host.server)
          await this.host.server.close(() => {
              this.log('Server closed')
              this.setState('stopped')

              if(restart)
                this.start(config)
              else
                cli.run()
          })
        else
          this.error("Server can not be closed. Server Object does't exist")
    },

    async restart(config){
        this.log("Server restarting triggered")
        this.stop(true, config)
    },

}
