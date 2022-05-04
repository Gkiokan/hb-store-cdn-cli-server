import helper from './helper'
import server from './server'
import inquirer from 'inquirer'

inquirer.registerPrompt('file-tree-selection', require('inquirer-file-tree-selection-prompt'))

export default {

    async run(){
        let menu = await inquirer.prompt([
            {
                type: 'list',
                name: "run",
                message: "Setup HB-Store CDN Server",
                choices: [
                    {
                        value: "start",
                        name: "Start the server as preconfigured"
                    },
                    new inquirer.Separator(),
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
                    }
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
          }

          if(menu.run == 'start'){
              server.start({
                    ip: "127.0.0.1",
                    port: 6449,
                    basePath: '.'
                })
          }
    },

    async configure(){
          let interfaceChoices = helper.getInterfaceChoices(true)
          let defaultHost = interfaceChoices[0].value

          let basePath = await inquirer
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


          if(basePath.host == 'custom'){
              basePath.host = basePath.custom
              delete basePath.custom
          }

          return basePath
    }

}
