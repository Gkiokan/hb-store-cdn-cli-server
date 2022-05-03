console.log("START CLI Server Application")

import path from 'path'
import fs from 'fs'
import helper from './helper'
import db from './db'
import server from './server'

server.start()


console.log("END")
