console.log("START CLI Server Application")

import path from 'path'
import fs from 'fs'
import helper from './helper'
import db from './db'
import server from './server'

server.start({
    ip: "127.0.0.1",
    port: 6449,
    basePath: '.'
})



// import { getPs4PkgInfo } from "./pkg-tool/node"
// console.log(getPs4PkgInfo)


console.log("END")
