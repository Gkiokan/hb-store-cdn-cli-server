import header from './header'
import path from 'path'
import fs from 'fs'
import helper from './helper'
import db from './db'
import server from './server'
import cli from './cli'
import clc from 'cli-color'

header.start()

var state = {
  server: 'stopped'
}
global.state = state

let args = process.argv.slice(2)
// console.log("Params", args)

// #todo to be done https://www.npmjs.com/package/clui

if(args.includes('setup'))
  cli.run()

if(args.length == 0)
  console.log("[Info] No input specified. Running setup command")
  console.log(" ")
  cli.run()



// import { getPs4PkgInfo } from "./pkg-tool/node"
// console.log(getPs4PkgInfo)
