import helper from './helper'
import server from './server'
import bin from './bin'
import log from './log'
import inquirer from 'inquirer'
import fs from 'fs'
import path from 'path'
import clc from 'cli-color'
import clear from 'clear'

inquirer.registerPrompt('file-tree-selection', require('inquirer-file-tree-selection-prompt'))

export default {

    module: 'Main',
    log: log.log,
    error: log.error,
    notify: log.notify,

    async run(){
        let menu = await inquirer.prompt([
              {
                  type: 'list',
                  name: "run",
                  loop: false,
                  pageSize: 12,
                  message: "## Menu ## HB-Store CDN CLI Server",
                  choices: [
                      {
                          value: "start",
                          name: "[Server] Start the server as pre-configured"
                      },
                      new inquirer.Separator(),
                      {
                          value: "initConfig",
                          name: "[Config] Initialize empty config file",
                      },
                      {
                          value: "loadConfig",
                          name: "[Config] Show me the current Configuration",
                      },
                      {
                          value: "setup",
                          name: "[Config] Generate new Config file for Server",
                      },
                      new inquirer.Separator(),
                      {
                          value: "check-server-binaries",
                          name: "[Bin] Check Server Binaries",
                      },
                      {
                          value: "download-bin",
                          name: "[Bin] Force re-download server binaries",
                      },
                      new inquirer.Separator(),
                      {
                          value: "quit",
                          name: "Quit Application."
                      },
                      new inquirer.Separator(),
                  ]
              }
          ])
          .catch((error) => {
              console.log(error)
          });
          console.log(" ")

          // console.log("Run command", run)
          if(menu.run == 'setup'){
              let preConfig = helper.loadConfig()
              let newConfig = await this.configure()

              let finalConfig = { ...preConfig, ...newConfig }

              helper.saveConfig(finalConfig)
              await this.showCurrentConfig()
              this.run()
          }

          if(menu.run == 'loadConfig'){
              await this.showCurrentConfig()
              this.run()
          }

          if(menu.run == 'initConfig'){
              await helper.init()
              this.run()
          }

          if(menu.run == 'start'){
              let config = helper.loadConfig()
              server.start(config)
          }

          if(menu.run == 'check-server-binaries'){
              await bin.checkServerBinaries()
              this.run()
          }

          if(menu.run == 'download-bin'){
              await bin.forceServerBinariesDownload()
              this.run()
          }
    },

    async configure(){
          let interfaceChoices = helper.getInterfaceChoices(true)
          let defaultHost = interfaceChoices[0].value

          let config = await inquirer
              .prompt([
                  {
                      type: 'list',
                      name: 'host',
                      default: defaultHost,
                      message: "Which Network Interface are you using? Your local IP?",
                      choices: interfaceChoices,
                  },
                  {
                      name: 'custom',
                      message: "You want to use a custom Host. What is it?",
                      when(a){
                          if(a.host == 'custom')
                            return true
                      }
                  },
                  {
                      name: 'port',
                      default: 6449,
                      message: "Which port do you want to choose?"
                  },
                  { 
                      type: 'list',
                      name: 'path_choose',
                      default: '/pkg',
                      message: "Which basePath do you wanna set?",
                      choices: [
                          {
                              value: 'default',
                              name: "Default to current sub folder /pkg"
                          },
                          {
                              value: 'tree',
                              name: 'Choose with Tree view'
                          },
                          {
                              value: 'manual',
                              name: 'Put your path yourself in'
                          }
                      ]
                  },
                  {
                      name: 'manual',
                      message: "Put in the base path manually",
                      when(a){
                          if(a.path_choose == 'manual')
                            return true
                      }
                  },
                  {
                      type: 'file-tree-selection',
                      name: 'tree',
                      message: "Select your basePath?",
                      onlyShowDir: true,
                      when(a){
                        if(a.path_choose == 'tree')
                          return true
                      },
                      enableGoUpperDirector: true,
                  }
              ])
              .catch((error) => {
                  console.log(error)
              });


          if(config.host == 'custom')
              config.host = config.custom

          if(config.path_choose == 'manual')
              config.basePath = config.manual

          if(config.path_choose == 'tree')
              config.basePath = config.tree

          if(config.path_choose == 'default'){
              let pkgPath = path.join(path.dirname(process.execPath), '/pkg')
              if (!fs.existsSync(pkgPath)) {
                  fs.mkdirSync(pkgPath);
              }
              config.basePath = pkgPath
          }


          let finalConfig = {
              host: config.host,
              port: config.port,
              basePath: config.basePath,
          }

          return finalConfig
    },

    async server(){
        let config = helper.loadConfig()
        let menu = await inquirer.prompt([
              {
                  type: 'list',
                  name: "run",
                  message: "## Server ## HB-Store CDN CLI Server",
                  choices: [
                      {
                          value: "state",
                          name: "CDN Server is: " + helper.getServerState(),
                      },
                      {
                          value: "cdn",
                          name: helper.getCDN(config),
                      },
                      new inquirer.Separator(),
                      {
                          value: "start",
                          name: "[Server] Start the server"
                      },
                      {
                          value: "restart",
                          name: "[Server] Restart the server"
                      },
                      {
                          value: "stop",
                          name: "[Server] Stop the server"
                      },
                  ]
              }
          ])
          .catch((error) => {
              console.log(error)
          });

          if(menu.run == 'stop')
            server.stop()

          if(menu.run == 'start')
            server.start(config)

          if(menu.run == 'restart')
            server.restart(config)

          if(menu.run == 'state' || menu.run == 'cdn')
            this.server()
    },

    async startServer(){
        let config = helper.loadConfig()
        server.start(config)
    },

    async showCurrentConfig(){
        let config = helper.loadConfig()
        this.log("Loaded Config", 'Main')

        let table = helper.getTable(['Key', 'Value'])

        for (const [key, value] of Object.entries(config)) {
            table.push([key + " ", value + " "])
        }

        console.log(table.toString())
    },

    async showList(files=[]){
        let table = helper.getTable([ 'id', 'name', 'version', 'size' ])

        files.map( file => {
            let id = file.id ? file.id + " " : '-'
            let name = file.name ? file.name + " " : '-'
            let version = file.version ? file.version + " " : '-'
            let size = file.Size ? file.Size + " " : '-'
            table.push([id, name, version, size ])
        })

        try {
            console.log(table.toString())
        }
        catch(e){
            console.log(clc.red("Could not show the files list. Error accoured."))
            console.log(e)
        }
    },


}
