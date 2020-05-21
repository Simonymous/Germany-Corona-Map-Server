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


const http = require('http')
const path = require('path')
const querystring = require('querystring')
const fs = require('fs')
const PORT = 8080
const server = http.createServer()

// import {getMapCoordinates} from './getMapCoordinates.js'
const getMapCoordinates = require('./getMapCoordinates.js')

let listOfFiles = []
let dir = './'
let File = {
  biteStream: null,
  fileName: null
}

files = fs.readdirSync("./");

files.forEach(file => {
  if(((file.includes('.js') || file.includes('.html') || file.includes('.css') )&!file.includes('.json'))){
    fileType = fs.readFileSync('./'+ file);

   
      /*

       FRAGEN: Warum wird das gebraucht? 

       */

    let File = {
      biteStream: null,
      fileName: null
    }
    File.fileName = file
    File.biteStream = fileType

    listOfFiles.push(File)
  }

})

startServer(listOfFiles) 

function startServer(listOfFiles){
  this.listOfFiles = listOfFiles
  server.on('request', (request, response) => {
    console.log(`method:     ${request.method}`)
    console.log(`url:        ${request.url}`)
    console.log(`headers:    ${JSON.stringify(request.headers)}`)
    var userAgent = request.headers['user-agent']
    console.log(`user-agent: ${userAgent}\n`)
  
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'OPTIONS, POST, GET',
      'Access-Control-Max-Age': 2592000, // 30 days
      /** add other headers as per requirement */
    };
    let newURL = ""
    response.writeHead(200, headers)
    let extname = path.extname(request.url)
    if(request.url.startsWith("/mapdata")){
       extname = "mapdata"
        newURL = request.url.replace("/mapdata?","");
    }

    //console.log( "Url Split: -"+ extname+"-")
    switch (extname) {

      case '.css' :
        //console.log("return css")
        response.writeHead(200, {"Content-Type": "text/css"})
       
        listOfFiles.forEach(file => {
           if("/"+file.fileName === request.url) {
            response.write(file.biteStream)
           }

         })

        break

      case ".js" :
        //console.log("return js")
        response.writeHead(200, {"Content-Type": "application/javascript"})
        listOfFiles.forEach(file => {
          //console.log("JS!!! /"+file.fileName+" "+request.url)
          if("/"+file.fileName === request.url) {
            //console.log("IN IF")
            response.write(file.biteStream)
          }

        })
        break 

      case '.ico' :
        //console.log("return ico")  
        break
       case 'mapdata':
         //console.log("IM MAPDATA")
        let data = querystring.parse(newURL)
        console.log(data)
        getDataFromQuery(data.BL_ID, data.resolution, data.zoom)
        break 

      default :
         //console.log("Return default")
         response.writeHead(200, {"Content-Type": "text/html"})
         
         listOfFiles.forEach(file => {
          console.log(file.fileName)
           if(file.fileName === "index.html") {
            response.write(file.biteStream)
           }
         })
         break
    }

    response.end()
  })

  function getDataFromQuery(id,resolution,zoom) {
    let coo = getMapCoordinates(id,resolution,zoom)
    console.log(coo)
  }

  server.listen(PORT, 'localhost', () => {
    // called when server is successfully listening.
    console.log(`Server listening on: http://localhost:${PORT}`)
  })
  
}
