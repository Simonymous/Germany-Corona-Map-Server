import { convertCoordinates } from './convertCoordinates.js'
// const convertCoordinates = require('./convertCoordinates.js');

import { mapData } from './map-data.js'
// const mapData = require ('./map-data.js');

const data = mapData.features

export function getMapCoordinates (BL_ID = 0, resulution = 'low', zoom = 10, windowsizeX = 100, windowsizeY = 100) {
  let coords = getCoordsInBL_ID(BL_ID, resulution)

  coords = getMercatorCoordinates(coords, zoom)

  coords = fitCoordsToPanel(coords, windowsizeX, windowsizeY)

  // drawpath(coords)

  return coords
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
    if (BL_ID === 0 || element.attributes.BL_ID === BL_ID) {
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
function fitCoordsToPanel (coords) {
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
  const middleY = (minY + minY) / 2

  console.log(minX + ' | ' + maxX)

  coords.forEach((item, index, array) => {
    item.forEach((item2, index2, array2) => {
      array[index][index2][0] = item2[0] - middleX + 500
      array[index][index2][1] = item2[1] - middleY + 500
    })

    // console.log(coords)

    // for Performance
    // removes hidden coordinates

    // if(item[0] < 0 || item[0] > windowsizeX || item[1] < 0 || item[1] > windowsizeY){
    //     object.slice(index, 1);
    // }
  })

  return coords
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
