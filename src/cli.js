import helper from './helper'
import server from './server'
import inquirer from 'inquirer'
import Table from 'cli-table'
import fs from 'fs'
import path from 'path'

inquirer.registerPrompt('file-tree-selection', require('inquirer-file-tree-selection-prompt'))

export default {

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

          // console.log("Run command", run)
          if(menu.run == 'setup'){
              let config = await this.configure()
              helper.saveConfig(config)
              this.showCurrentConfig()
          }

          if(menu.run == 'loadConfig'){
              this.showCurrentConfig()
          }

          if(menu.run == 'initConfig'){
              helper.init()
              this.run()
          }

          if(menu.run == 'start'){
              let config = helper.loadConfig()
              server.start({
                    ip: config.host,
                    port: config.port,
                    basePath: config.basePath,
                })
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
        console.log("Server is: ", state.server)
        let menu = await inquirer.prompt([
              {
                  type: 'list',
                  name: "run",
                  message: "## Server ## HB-Store CDN CLI Server",
                  choices: [
                      {
                          value: "start",
                          name: "Start the server"
                      },
                      {
                          value: "restart",
                          name: "Restart the server"
                      },
                      {
                          value: "start",
                          name: "Stop the server"
                      },
                  ]
              }
          ])
          .catch((error) => {
              console.log(error)
          });
    },

    showCurrentConfig(){
        let config = helper.loadConfig()
        console.log("Loaded Config")

        let table = new Table({
            head: ['key', 'value']
        })

        for (const [key, value] of Object.entries(config)) {
            table.push([key, value])
        }

        console.log(table.toString())
    },


    showList(files=[]){
        let table = new Table({
            head: [ 'id', 'name', 'version', 'size' ]
        })

        files.map( file => {
            table.push([file.id, file.name, file.version, file.Size ])
        })

        console.log(table.toString())
    }

}
