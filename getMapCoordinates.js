import { convertCoordinates } from './convertCoordinates.js'
// const convertCoordinates = require('./convertCoordinates.js');

import { mapData } from './map-data.js'
// const mapData = require ('./map-data.js');

const data = mapData.features

export function getMapCoordinates (BL_ID = 0, resulution = 'low', zoom = 6, windowsizeX = 1000, windowsizeY = 1000) {
  let coords = getCoordsInBL_ID(BL_ID, resulution)

  coords = getMercatorCoordinates(coords, zoom)

  coords = fitCoordsToPanel(coords, windowsizeX, windowsizeY)

  // drawpath(coords)

  return coords
}

export function getCountys () {
  const stateList = []
  let state
  /* eslint-disable */  
  data.forEach(element => {
    stateList.push(state = { name: element.attributes.BL, id: element.attributes.BL_ID })
  })
  const uniqueStateList = []
  const map = new Map()
  for (const item of stateList) {
    if (!map.has(item.name)) {
      map.set(item.name, true) // set any value to Map
      uniqueStateList.push({
        name: item.name,
        id: item.id
      })
    }
  }

  uniqueStateList.push(state = { id: 0, name: 'Alle' })
  uniqueStateList.sort((a, b) => (a.name > b.name) ? 1 : -1)
  return uniqueStateList
}
// main(10);

/**
 * @param{number} BL_ID The Bl that was specified (0 if none is specified)
 */
/* eslint-disable */
function getCoordsInBL_ID (BL_ID, resolution) {
/* eslint-enable */

  const coords = []

  data.forEach(element => {
    // Only the BL that were selected
    if (BL_ID === '0' || element.attributes.BL_ID === BL_ID) {
      // console.log(element.geometry.rings)
      // Every Area of the BEZ
      element.geometry.rings.forEach((value, BEZIndex) => {
        coords.push([])
        value.forEach((coord, coordIndex) => {
          // console.log([coord[0], coord[1]])
          switch (resolution) {
            case 'low':
              if (Number.isInteger(coordIndex / 50)) {
                (coords[coords.length - 1]).push([coord[0], coord[1]])
              }
              break
            case 'medium':
              if (Number.isInteger(coordIndex / 10)) {
                (coords[coords.length - 1]).push([coord[0], coord[1]])
              }
              break
            case 'high':
              (coords[coords.length - 1]).push([coord[0], coord[1]])
              break
            default:
              break
          }
        })
      })
    }
  })
  return coords
}

function getMercatorCoordinates (coordsDec, zoom) {
  const webMercatorCoords = convertCoordinates(coordsDec, zoom)

  return webMercatorCoords
}

/**
 * TODO Nur unteres rechtes viertel wird angezeigt. Mit Windowsize verrechnen
 * Fits the cords to the panel size. The shown data should be in the centered.
 *
 * @param {number[][]} coords The Web Mercator coords retuned by the convertCoordinates function
 * @return {number[][]} The coords, but centered.
 */
function fitCoordsToPanel (coords, windowsizeX, windowsizeY) {
  let maxX, maxY
  maxX = Number.MIN_SAFE_INTEGER
  maxY = Number.MIN_SAFE_INTEGER
  let minX, minY
  minY = Number.MAX_SAFE_INTEGER
  minX = Number.MAX_SAFE_INTEGER

  // Find Min/Max
  coords.forEach(ringsElement => {
    ringsElement.forEach(coordElement => {
      if (maxX < coordElement[0]) {
        maxX = coordElement[0]
      } else if (minX > coordElement[0]) {
        minX = coordElement[0]
      }

      if (maxY < coordElement[1]) {
        maxY = coordElement[1]
      } else if (minY > coordElement[1]) {
        minY = coordElement[1]
      }
    })
  })

  const middleX = (minX + maxX) / 2
  const middleY = (minY + maxY) / 2

  const outputArray = [[]]
  const zeroMinusFourthOfWindowX = -(0.25 * windowsizeX)
  const zeroMinusFourthOfWindowY = -(0.25 * windowsizeY)
  const windowsizeXPlusFourth = 1.25 * windowsizeX
  const windowsizeYPlusFourth = 1.25 * windowsizeY

  coords.forEach((item, index, array) => {
    item.forEach((item2, index2, array2) => {
      array[index][index2][0] = item2[0] - middleX + windowsizeX / 2
      array[index][index2][1] = item2[1] - middleY + windowsizeY / 2
    })

    outputArray.push([])
    // console.log(outputArray);

    item.forEach((item2, index2, array2) => {
      // for less Network traffic
      // removes hidden coordinates

      if (array2[index2][0] > zeroMinusFourthOfWindowX && array2[index2][0] < windowsizeXPlusFourth && array2[index2][1] > zeroMinusFourthOfWindowY && array2[index2][1] < windowsizeYPlusFourth) {
        // console.log(array[index][index2]);
        outputArray[index].push(array2[index2])
        // console.log(array[index][index2]);
      }
    })
  })

  // console.log(coords)

  return outputArray
}

/**
 *
 * @param {number[][]} coords The Web Mercator coords that schould be shown
 */
// function drawpath (coords) {
//   const pathString = `M ${coords[0][0]} ${coords[0][1]}`

//   // Normal for loop, so we can start a the second element
//   for (let i = 1; i < coords.length; i++) {
//         `L ${coords[i][0]} ${coords[i][1]}`
//   }
// }
