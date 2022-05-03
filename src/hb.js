import fs from 'fs'
import path from 'path'
import baseImage from './baseImage'

export default {
    files: [],

    createItem(data, file, pid=1){
        // let patchedFilename = item.name.replace(/[^a-zA-Z0-9-_.]/g, '')
        let patchedFilename = (file.charAt(0) == "/") ? file.substr(1).replace(/[^a-zA-Z0-9-_./]/g, '') : file.replace(/[^a-zA-Z0-9-_./]/g, '')
        let stats = fs.lstatSync(file)
        let size = this.formatBytes(stats.size, 2)

        let item = {
          "pid": pid,
          "id": data.paramSfo.TITLE_ID,
          "name": data.paramSfo.TITLE,
          "desc": "",
          "image": "__image",
          "package": "__package",
          "version": data.paramSfo.APP_VER,
          "picpath": "/user/app/NPXS39041/storedata/" + data.paramSfo.TITLE_ID + ".png",
          "desc_1": "",
          "desc_2": "",
          "ReviewStars": "Custom Rating",
          "Size": size,
          "Author": "HB-Store CDN",
          "apptype": "HB Game",
          "pv": "5.05+",
          "main_icon_path": "__image",
          "main_menu_pic": "/user/app/NPXS39041/storedata/" + data.paramSfo.TITLE_ID + ".png",
          "releaseddate": "2019-04-30",
          path: file,
          filename: path.basename(file),
          patchedFilename,
          icon0: data.icon0 ?? baseImage,
        }

        return item
    },

    removeBasePath(item, toRemove){
        item.patchedFilename = item.patchedFilename.replace(toRemove, '')

        if(item.patchedFilename.charAt(0) == '/')
          item.patchedFilename = item.patchedFilename.substr(1)

        return item
    },

    getImagePathURI(data){
        return data.patchedFilename + '/icon0.png'
    },

    addImages(data=null, base){
        let id    = data.id
        let patched
        let image = base + '/' + this.getImagePathURI(data)

        data.image = image
        data.main_icon_path = image

        return data
    },

    formatBytes(bytes, decimals=2, k=1000) {
        if (bytes === 0) return '0 Bytes';

        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    },

}
