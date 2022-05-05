console.log("START CLI Server Application")

import path from 'path'
import fs from 'fs'
import helper from './helper'
import db from './db'
import server from './server'
import cli from './cli'
import clc from 'cli-color'

var state = {
  server: 'stopped'
}
global.state = state

let args = process.argv.slice(2)
console.log("Params", args)

if(args.includes('setup'))
  cli.run()

if(args.length == 0)
  console.log("[Info] No input specified. Running setup command")
  cli.run()



// import { getPs4PkgInfo } from "./pkg-tool/node"
// console.log(getPs4PkgInfo)
