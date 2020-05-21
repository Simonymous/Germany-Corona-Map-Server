/**
 * _______________                        |*\_/*|________
  |  ___________  |     .-.     .-.      ||_/-\_|______  |
  | |           | |    .****. .****.     | |           | |
  | |   0   0   | |    .*****.*****.     | |   0   0   | |
  | |     -     | |     .*********.      | |     -     | |
  | |   \___/   | |      .*******.       | |   \___/   | |
  | |___     ___| |       .*****.        | |___________| |
  |_____|\_/|_____|        .***.         |_______________|
    _|__|/ \|_|_.............*.............._|________|_
   / ********** \      A Node Server       / ********** \
 /  ***Client***  \      Application     /  **Server***  \
--------------------      made by       --------------------
                    Philip, Pascal & Simon
 */

import { createServer } from 'http'
import { extname as _extname } from 'path'
import { parse } from 'querystring'
import { readdirSync, readFileSync } from 'fs'

// import {getMapCoordinates} from './getMapCoordinates.js'
import { getMapCoordinates } from './getMapCoordinates.js'

const PORT = 8080
const server = createServer()

let listOfFiles = []
const dir = './'

const files = readdirSync(dir)

files.forEach(file => {
  if (((file.includes('.js') || file.includes('.html') || file.includes('.css')) & !file.includes('.json'))) {
    const fileType = readFileSync('./' + file)

    /*

      FRAGEN: Warum wird das gebraucht?

      */

    /* eslint-disable */
    let File = {
      biteStream: null,
      fileName: null
    }
    /* eslint-enable */

    File.fileName = file
    File.biteStream = fileType

    listOfFiles.push(File)
  }
})

startServer(listOfFiles)

function startServer (listOfFiless) {
  listOfFiles = listOfFiless
  server.on('request', (request, response) => {
    console.log(`method:     ${request.method}`)
    console.log(`url:        ${request.url}`)
    console.log(`headers:    ${JSON.stringify(request.headers)}`)
    var userAgent = request.headers['user-agent']
    console.log(`user-agent: ${userAgent}\n`)

    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'OPTIONS, POST, GET',
      'Access-Control-Max-Age': 2592000 // 30 days
      /** add other headers as per requirement */
    }
    let newURL = ''
    response.writeHead(200, headers)
    let extname = _extname(request.url)
    if (request.url.startsWith('/mapdata')) {
      extname = 'mapdata'
      newURL = request.url.replace('/mapdata?', '')
    }

    // console.log( "Url Split: -"+ extname+"-")

    let data
    switch (extname) {
      case '.css' :
        // console.log("return css")
        response.writeHead(200, { 'Content-Type': 'text/css' })
        listOfFiles.forEach(file => {
          if ('/' + file.fileName === request.url) {
            response.write(file.biteStream)
          }
        })

        break

      case '.js' :
        // console.log("return js")
        response.writeHead(200, { 'Content-Type': 'application/javascript' })
        listOfFiles.forEach(file => {
          // console.log("JS!!! /"+file.fileName+" "+request.url)
          if ('/' + file.fileName === request.url) {
            // console.log("IN IF")
            response.write(file.biteStream)
          }
        })
        break

      case '.ico' :
        // console.log("return ico")
        break
      case 'mapdata':
        // console.log("IM MAPDATA")
        data = parse(newURL)
        console.log(data)
        response.write(getDataFromQuery(data.BL_ID, data.resolution, data.zoom))
        break

      default :
        // console.log("Return default")
        response.writeHead(200, { 'Content-Type': 'text/html' })
        listOfFiles.forEach(file => {
          console.log(file.fileName)
          if (file.fileName === 'index.html') {
            response.write(file.biteStream)
          }
        })
        break
    }
    response.end()
  })

  function getDataFromQuery (id, resolution, zoom) {
    const coords = getMapCoordinates(id, resolution, zoom)
    const jsonCoords = JSON.stringify(coords)

    return jsonCoords
    // Map Zeichnen
    // coords in json an client schicken
    // console.log(coords)
  }

  server.listen(PORT, 'localhost', () => {
    // called when server is successfully listening.
    console.log(`Server listening on: http://localhost:${PORT}`)
  })
}
