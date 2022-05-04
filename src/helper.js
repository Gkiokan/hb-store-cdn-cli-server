import os from 'os'

export default {

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
}
