import os from 'os'
import fs from 'fs'
import path from 'path'
import ini from 'ini'
import clc from 'cli-color'
import Table from 'cli-table'
import log from './log'


export default {

    data: {
        default: {
            host: '',
            port: '',
            basePath: '',
            binVersion: '0.00'
        }
    },

    module: 'Main',
    log: log.log,
    error: log.error,
    notify: log.notify,

    getInterfaces(){
        let ifaces = [];
        Object.keys(os.networkInterfaces()).forEach(function (ifname) {
          var alias = 0;
          os.networkInterfaces()[ifname].forEach(function (iface) {
            if ('IPv4' !== iface.family || iface.internal !== false) {
              return;
            }

            if (alias >= 1) {
              ifaces.push({
                title: `${ifname}-${alias}:${iface.address}`,
                ip: iface.address
              });
            } else {
              ifaces.push({
                title: `${ifname}: ${iface.address}`,
                ip: iface.address
              });
            }
            ++alias;
          });
        });
        return ifaces
    },

    getInterfaceChoices(addCustom=false){
        let interfaces = []
        this.getInterfaces().map( iface => {
            interfaces.push({ value: iface.ip, name: iface.title })
        })

        if(addCustom)
          interfaces.push({ value: 'custom', name: 'Use a custom Host IP or Domain' })

        return interfaces
    },

    getFile(asset=''){
        return path.join(path.dirname(process.execPath), asset)
    },

    getPath(path=''){
        return this.getFile(path)
    },

    loadConfig(){
        let file = this.getFile('config.ini')
        let config = {}

        try {
            config = ini.parse(fs.readFileSync(file, 'utf-8'))
        }
        catch(e){
            this.error("Couldn't load config.ini. Please run the Setup or make a config file.")
        }

        return { ...this.data.default, ...config }
    },

    saveConfig(config){
        try {
            let file = this.getFile('config.ini')
            fs.writeFileSync(file, ini.stringify({ ...this.default, ...config }) )
            this.notify("Saved config to " + file, 'Config')
        }
        catch(e){
            this.log(e)
        }
    },

    init(){
        let configFile = this.getFile('config.ini')

        if(!fs.existsSync(configFile)){
            this.saveConfig(this.data.default)
            this.notify("empty config.ini has been created", 'Main')
        }
        else {
            this.error("config.ini already exists", 'Main')
        }
    },

    getServerState(){
        if(global.state.server == 'running')
          return clc.green(global.state.server)

        if(global.state.server == 'stopped')
          return clc.red(global.state.server)

        return clc.cyan(global.state.server)
    },

    getCDN(config){
        return clc.bgWhite.black('CDN Address: http://' + config.host + ':' + config.port + ' ')
    },

    getTable(head=[], chars={}){
        let defaultChars = {'mid': '', 'left-mid': '', 'mid-mid': '', 'right-mid': ''}

        return new Table({
            head,
            chars: { ...defaultChars, ...chars },
        })
    },

}
