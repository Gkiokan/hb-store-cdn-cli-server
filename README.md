# HB-Store CDN CLI Server
[![ko-fi](https://img.shields.io/badge/Buy%20me%20a%20Shisha%20on-Ko--fi-red)](https://ko-fi.com/M4M082WK8)
[![os](https://img.shields.io/badge/platform-windows%20%7C%20macos%20%7C%20linux-lightgrey)](#)
[![commits_since_release](https://img.shields.io/github/commits-since/gkiokan/hb-store-cdn-cli-server/v1.3.0)](#)
[![version](https://img.shields.io/github/package-json/v/gkiokan/hb-store-cdn-cli-server)](#)  
[![downloads](https://img.shields.io/github/downloads/gkiokan/hb-store-cdn-cli-server/total)](#)
[![last_commit](https://img.shields.io/github/last-commit/gkiokan/hb-store-cdn-cli-server)](#)

This is the new HB-Store CDN Server [cli-version].

![HB-Store CDN CLI Server](https://user-images.githubusercontent.com/7249224/170506615-8d6ddabd-77f8-44c4-9f9f-57cbc8b4cb5e.png)


## Features  
- [x] Interactive CLI Usage
- [x] Show, Edit and Modify Configuration though cli
- [x] Custom Network Interface and Port  
- [x] Select base path to scan all pkgs (deep scan)  
- [x] Integrated node express server  
- [x] Maps file paths correctly, even with special character and empty spaces  
- [x] Public Domain Host support  
- [x] Auto check Server Binaries on Server Start 
- [x] Added [retroNAS](https://github.com/danmons/retronas) Support (v1.3.0+)
- [x] Added PS5 Support (v1.4.1+)  

## ToDo  
- [ ] More Tweaks  
- [ ] Add integrated cluster Support  
- [ ] Supercharge application with pm2  
- [ ] Add Server Ressource overview   
- [ ] Add dedicated logging  


## How To  
Run the binary from your command line and follow the steps.  
1.) You should first download the Server Binaries  
1.1) ***`[hint]`**: Server Binaries will be loaded automatically when started with parameter `start`*   
2.) Use the `Generate configuration` menu to create the config  
3.) Start the server or run the start command


## How to configure HB-Store  
1.) Open HB-Store app on your PS4  
2.) Set the given CDN Address as your CDN  
3.) Save Settings  
4.) Close the HB-Store on PS4 by pressing options button and open it again  
-- settings needs to be done once --  
5.) Open HB-Store on PS4. You should see the content from your Server now.  
  
  
## Command reference  
Command | Description 
--- | ---
`./hb-store-cli-server` | Starts the Default Server with Interactive Menu
`./hb-store-cli-server start` | Starts the Server with the pre-configured config.ini
`./hb-store-cli-server init` | Creates a empty basic config.ini file
`./hb-store-cli-server setup` | Starts the Interactive Menu, equal to no params 
`./hb-store-cli-server check-bin` | Checks Binaries for update and downloads them  
`./hb-store-cli-server download-bin` | Force Download Binaries and update


## Development flow
If you want to develop this without building you need to call `npm run dev`.  
This starts a dev watcher, which compiles your code to `/build`.   
Then you can run `node apps.js` to start the application which is equal to `./hb-store-cli-server`.  
For params you do the same `node apps.js init` which is equal to `./hb-store-cli-server init`.  


## Support  
If you want to Support me and my development, you can do this here.  

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/M4M082WK8)
