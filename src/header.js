import clear from 'clear'
import figlet from 'figlet'
import packageJSON from './../package.json'

let pkg = packageJSON

export default {
    start(){
        clear()
        this.header()
    },

    header(){
        console.log("------------------------------------------------------")
        this.text("HB-Store")
        this.text("CDN Server")
        console.log("------------------------------------------------------")
        console.log(" Version: " + pkg.version)
        console.log(" HB-Store CDN Server [CLI version] Made by Gkiokan.NET")
        // console.log(" Hb-Store (PS4) made by LightningMods")
        // console.log(" Required: HB-Store R2 on your PS4 from https://pkg-zone.com")
        console.log("------------------------------------------------------")
    },

    text(msg){
        console.log(figlet.textSync(msg, {
            // font: 'Ghost',
            horizontalLayout: 'default',
            verticalLayout: 'default',
            width: 200,
            whitespaceBreak: true
        }))
    }
}
