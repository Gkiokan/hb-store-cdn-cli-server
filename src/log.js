import clc from 'cli-color'

export default {
    module: 'Log',

    error(err=null){
        this.log(clc.red(err))
    },

    notify(msg=null){
        this.log(clc.green(msg))
    },

    log(msg=null){
        console.log(""+this.module + " " + msg)
    },

}
