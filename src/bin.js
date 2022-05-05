import helper from './helper'
import cli from './cli'
import axios from 'axios'
import fs from 'fs'
import path from 'path'
import download from 'download'
import clc from 'cli-color'

export default {
    updateAvailable: false,
    newUpdateAvailableVersion: "0.00",

    data: {
        source: 'https://api.github.com/repos/LightningMods/PS4-Store/releases',
        files: [
            'homebrew.elf',
            'homebrew.elf.sig',
            'remote.md5'
        ],
    },

    notify(msg){
        this.log(clc.green(msg))
    },

    log(msg){
        console.log("[Bin] " + msg)
    },

    async getRelease(){
        let { data } = await axios.get(this.data.source)
        return data.length ? data[0] : false
    },

    getName(release=null){
        if(!release) return "NO_RELEASE_OBJECT"
        return release.name
    },

    getVersion(release=null){
        if(!release) return "NO_RELEASE_OBJECT"
        return release.tag_name
    },

    getAssets(release=null){
        if(!release) return "NO_RELEASE_OBJECT"
        let assets = release.assets
        let urls = []

        assets.map( f => {
            urls.push({
                name: f.name,
                progress: 0,
                url: f.browser_download_url
            })
        })

        return urls
    },

    checkVersion(currentVersion="0.00", version="0.00"){
        this.log("Compare " + 'Current Version: '+  currentVersion + ' <> GitHub version: ' + version)
        return this.compareVersion(currentVersion, version)
    },

    compareVersion(v1, v2) {
        const v1Parts = v1.split('.')
        const v2Parts = v2.split('.')
        const length = Math.max(v1Parts.length, v2Parts.length)
        for (let i = 0; i < length; i++) {
          const value = (parseInt(v1Parts[i]) || 0) - (parseInt(v2Parts[i]) || 0)
          if (value < 0) return -1
          if (value > 0) return 1
        }
        return 0
    },

    async checkServerBinaries(){
        let release = await this.getRelease()
        let version = this.getVersion(release)
        let assets  = this.getAssets(release)
        let name    = this.getName(release)
        let config  = helper.loadConfig()

        // console.log({ version, assets, name })
        let compare = this.checkVersion(config.binVersion, version)

        if(compare == 1){
          this.log("Your current Binary are higher then the release")
          cli.run()
        }

        if(compare == 0){
          this.log("Your Server Binaries are up to date")
          cli.run()
        }

        if(compare == -1){
          this.updateAvailable = true
          this.newUpdateAvailableVersion = version
          this.log("New Server Binaries are available. Update in progress")
          await this.downloadServerBinaries(config, assets, version)
          cli.run()
        }
    },

    async downloadServerBinaries(config, assets, version){
        let binPath = helper.getFile('/bin')
        if (!fs.existsSync(binPath)) {
            fs.mkdirSync(binPath);
        }

        let files = []
        assets.map(f => files.push(f.url))

        this.log("Found " + files.length + " to download. Downloading ...", files)

        await files.map( async file => fs.writeFileSync(binPath + '/' + path.basename(file), await download(file)) )
        config.binVersion = version
        helper.saveConfig(config)

        this.notify("Download finished.")
    },
}
