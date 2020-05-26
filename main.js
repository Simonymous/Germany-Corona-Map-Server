// import {mapData} from './map-data.js';
// const mapData = require ('./map-data.js');
// const data = mapData.features
const mapContainer = document.getElementById('map')

// --------------------------------
// CLIENT
// --------------------------------

/* Wählt alle Bundesländer aus */

function initListener () {
  document.getElementById('state').addEventListener('change', function (e) {
    generateMapDataQueryString()
  })
  document.getElementById('resolution').addEventListener('change', function (e) {
    generateMapDataQueryString()
  })
  document.getElementById('zoom').addEventListener('change', function (e) {
    generateMapDataQueryString()
  })
}

const serverURL = 'http://localhost:8080'
function generateMapDataQueryString () {
  const BL_ID = document.getElementById('state').value
  const resolution = document.getElementById('resolution').value
  const zoom = document.getElementById('zoom').value

  const queryString = serverURL + '/mapdata' + '?BL_ID=' + BL_ID + '&resolution=' + resolution + '&zoom=' + zoom
  const responsePromise = fetchAsync(queryString)

  responsePromise.then(
    function (result) {
      drawSVG(result)
    },
    function (error) {
      console.log(error)
    }
  )

  return queryString
}

async function fetchAsync (url) {
  document.getElementById('overlay').style.display = 'block'
  const response = await fetch(url)
  const responsePromise = await response.json()
  return responsePromise
}

/* Schreibt die Bundesländer in die select Liste */
function stateInselct () {
  const select = document.getElementById('state')
  select.innerHTML = ''
  const countyQuery = serverURL + '/county'
  const responsePromise = fetchAsync(countyQuery)

  responsePromise.then(
    function (result) {
      result.forEach(element => {
        select.options[select.options.length] = new Option(element.name, element.id)
      })
      document.getElementById('state').dispatchEvent(new Event('change'))
    },
    function (error) {
      console.log(error)
    }
  )
}

function drawSVG (coords) {
  let output = ''

  coords.forEach(rings => {
    rings.forEach((coords, index) => {
      const x = coords[0]
      const y = coords[1]

      if (index === 0) {
        output += ` M ${x} ${y}`
      } else {
        output += ` L ${x} ${y}`
      }
    })
  })
  const path = createPath(output)

  mapContainer.appendChild(path)
  document.getElementById('overlay').style.display = 'none'
}

/**
 * Creates the Path, that shows the Map
 * @param {number} output - The definition string, what the path should show
 */
function createPath (output) {
  document.getElementById('map').innerHTML = ''
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
  path.setAttribute('d', output)
  return path
}

stateInselct()
initListener()
