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
import { getMapCoordinates, getCountys } from './getMapCoordinates.js'

const PORT = 8080
const server = createServer()
let dir = './' // Default
let files
let listOfFiles = []
// Argument auslesen
const args = process.argv.slice(2)
if (args[0]) {
  dir = args[0]
}

try {
  console.log('Server wird gestartet mit root: ' + dir)
  files = readdirSync(dir)

  populateDir()
} catch (err) {
  if (err.code === 'ENOENT') {
    console.log('dir doesnt exist!')
  } else {
    throw err
  }
}

function populateDir () {
  files.forEach(file => {
    if (((file.includes('.js') || file.includes('.html') || file.includes('.css')) & !file.includes('.json'))) {
      try {
        const fileType = readFileSync(dir + file)
        /*

        FRAGEN: Warum wird das gebraucht?

        */

        const File = {
          biteStream: null,
          fileName: null
        }

        File.fileName = file
        File.biteStream = fileType

        listOfFiles.push(File)
      } catch (err) {
        throw err
      }
    }
  })
}

startServer(listOfFiles)

function startServer (listOfFiless) {
  listOfFiles = listOfFiless
  server.on('request', (request, response) => {
    console.log(`method:     ${request.method}`)
    console.log(`url:        ${request.url}`)
    console.log(`headers:    ${JSON.stringify(request.headers)}`)
    var userAgent = request.headers['user-agent']
    console.log(`user-agent: ${userAgent}\n`)

    // CORS aktivieren
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'OPTIONS, POST, GET',
      'Access-Control-Max-Age': 2592000 // 30 days
    }
    let newURL = ''
    response.writeHead(200, headers)
    let extname = _extname(request.url)
    if (request.url.startsWith('/mapdata')) {
      extname = 'mapdata'
      newURL = request.url.replace('/mapdata?', '')
    }
    if (request.url.startsWith('/county')) {
      extname = 'county'
    }

    let data
    switch (extname) {
      case '.css' :
        response.writeHead(200, { 'Content-Type': 'text/css' })
        listOfFiles.forEach(file => {
          if ('/' + file.fileName === request.url) {
            response.write(file.biteStream)
          }
        })

        break

      case '.js' :
        response.writeHead(200, { 'Content-Type': 'application/javascript' })
        listOfFiles.forEach(file => {
          if ('/' + file.fileName === request.url) {
            response.write(file.biteStream)
          }
        })
        break

      case '.ico' :
        break
      case 'mapdata':
        data = parse(newURL)
        if (data.windowSizeX && data.windowSizeY) {
          response.write(getDataFromQuery(data.BL_ID, data.resolution, data.zoom, data.windowSizeX, data.windowSizeY))
        } else {
          response.write(getDataFromQuery(data.BL_ID, data.resolution, data.zoom))
        }
        break

      case 'county':
        const jsonCountys = JSON.stringify(getCountys())
        response.write(jsonCountys)
        break

      default :
        response.writeHead(200, { 'Content-Type': 'text/html' })
        listOfFiles.forEach(file => {
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
    if (jsonCoords) {
      return jsonCoords
    } else {
      throw 'Coords undefined!'
    }
  }

  server.listen(PORT, 'localhost', () => {
    // called when server is successfully listening.
    console.log(`Server listening on: http://localhost:${PORT}`)
  })
}
