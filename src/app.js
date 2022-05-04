console.log("START CLI Server Application")

import path from 'path'
import fs from 'fs'
import helper from './helper'
import db from './db'
import server from './server'
import cli from './cli'

let args = process.argv.slice(2)
console.log("Params", args)

if(args["--path"])
  console.log("we have a base path")


if(args.includes('setup'))
  cli.run()

// server.start({
//     ip: "127.0.0.1",
//     port: 6449,
//     basePath: '.'
// })



// import { getPs4PkgInfo } from "./pkg-tool/node"
// console.log(getPs4PkgInfo)
