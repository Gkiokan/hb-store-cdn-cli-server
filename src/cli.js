import helper from './helper'
import server from './server'
import inquirer from 'inquirer'
import fs from 'fs'

inquirer.registerPrompt('file-tree-selection', require('inquirer-file-tree-selection-prompt'))

export default {

    async run(){
        let menu = await inquirer.prompt([
            {
                type: 'list',
                name: "run",
                message: "## Menu ## HB-Store CDN CLI Server",
                choices: [
                    {
                        value: "start",
                        name: "Start the server as pre-configured"
                    },
                    new inquirer.Separator(),
                    {
                        value: "loadConfig",
                        name: "Show me the current Configuration"
                    },
                    {
                        value: "setup",
                        name: "Generate new Config file for Server"
                    },
                    new inquirer.Separator(),
                    {
                        value: "check-server-binaries",
                        name: "Check Server Binaries"
                    },
                    {
                        value: "download-bin",
                        name: "Force re-download server binaries"
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
              console.log("Final config file", config)

              helper.saveConfig(config)
          }

          if(menu.run == 'loadConfig'){
              this.showCurrentConfig()
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
                      type: 'file-tree-selection',
                      name: 'basePath',
                      message: "Select your basePath?",
                      onlyShowDir: true,
                      enableGoUpperDirector: true,
                  }
              ])
              .catch((error) => {
                  console.log(error)
              });


          if(config.host == 'custom'){
              config.host = config.custom
          }

          let finalConfig = {
              host: config.host,
              port: config.port,
              basePath: config.basePath,
          }

          return finalConfig
    },



    showCurrentConfig(){
        let config = helper.loadConfig()
        console.log("Loaded Config", config)
    }

}
