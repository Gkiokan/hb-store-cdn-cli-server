console.log("START CLI Server Application")

import path from 'path'
import fs from 'fs'
import helper from './helper'
import db from './db'


let interfaces = helper.getInterfaces()
console.log(interfaces)

let cleanStorePath = db.getCleanStorePath()
console.log("Clean store path", cleanStorePath)

try {
  const data = fs.readFileSync(cleanStorePath, 'utf8')
  console.log("Clean store.db found")
} catch (err) {
  console.error(err)
}


let storePath = db.getStorePath()
console.log("Public store path", storePath)

db.renewDB()

console.log("END")
