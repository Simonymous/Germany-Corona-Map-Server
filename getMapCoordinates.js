import { convertCoordinates } from './convertCoordinates.js'

import { mapData } from './map-data.js'
const data = mapData.features

/**
 * Controls the calculation of the coordinates
 *
 * @param{number} BL_ID The ID of the BL that should be shown. 0 if all should be shown
 * @param{string} resolution how many details should be shown in the details.
 * @param{number} zoom For the web mercator function. How far in should be zoomed into the map
 * @param{number} windowsizeX The X windowsize in the client
 * @param{number} windowsizeY The Y windowsize in the client
 */
export function getMapCoordinates (BL_ID = 0, resolution = 'low', zoom = 6, windowsizeX = 1000, windowsizeY = 1000) {
  let coords = getCoordsInBL_ID(BL_ID)

  // console.log("coords" + coords)
  coords = getMercatorCoordinates(coords, zoom)

  coords = pointReduction(coords, resolution)

  coords = fitCoordsToPanel(coords, windowsizeX, windowsizeY)

  return coords
}

/**
 * Return the coordinates of the BL that is selected
 *
 * @param{number} BL_ID The ID of the BL that is selected (0 if none is specified)
 */
/* eslint-disable */
function getCoordsInBL_ID (BL_ID) {
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
          // Needs to be done, so no object is given to the array
          (coords[coords.length - 1]).push([coord[0], coord[1]])
        })
      })
    }
  })
  return coords
}

/**
 * Initiates the decimation of the points
 *
 * @param{number[][]} coords The Coordinates
 * @param{string} resolution How good the resolution should be
 */
function pointReduction (coords, resolution) {
  let epsilon
  switch (resolution) {
    case 'low':
      epsilon = 10
      break
    case 'medium':
      epsilon = 3
      break
    case 'high':
    default:
      return coords
      break
  }

  const result = []
  coords.forEach(element => {
    const result1 = douglasPeucker(element.slice(0, element.length / 2), epsilon)
    const result2 = douglasPeucker(element.slice(element.length / 2), epsilon)

    result.push(result1.concat(result2))
  })

  return result
}

/**
 * Computes the Douglas Peucker algorithm for decimating curves
 *
 * @param{number[][]} coords The coordinates in a array
 * @param{number} epsilon The epsilon value, for how exact the result graph should be
 */
function douglasPeucker (coords, epsilon) {
  let maxDistance = 0
  let indexMaxDistance = 0

  for (let i = 1; i < coords.length - 1; i++) {
    const distance = perpDistance(coords[i], coords[0], coords[coords.length - 1])

    if (distance > maxDistance) {
      indexMaxDistance = i
      maxDistance = distance
    }
  }

  let results

  if (maxDistance > epsilon) {
    // Continue simplifying
    const results1 = douglasPeucker(coords.slice(0, indexMaxDistance), epsilon)
    const results2 = douglasPeucker(coords.slice(indexMaxDistance), epsilon)

    results = results1.concat(results2)
  } else {
    // Finished simplifying
    results = [coords[0], coords[coords.length - 1]]
  }

  return results
}

/**
 * Computes the distance between a point and the line betwenn two other points
 *
 * @param {number[]} point The Point, the distance toe the line should calculated to
 * @param {number[]} start The starting point of the line
 * @param {number[]} end The endpoint of the line
 */
function perpDistance (point, start, end) {
  const pointStartX = (point[0] - start[0])
  const pointStartY = (point[1] - start[1])
  const startEndX = (end[0] - start[0])
  const startEndY = (end[1] - start[1])

  const crossStartEndX = (pointStartX * startEndY) - (pointStartY * startEndX)

  const sqrtCross = Math.abs(crossStartEndX, 2)
  const sqrtStartEnd = Math.sqrt(Math.pow(startEndX, 2) + Math.pow(startEndY, 2))

  const distance = sqrtCross / sqrtStartEnd

  return distance
}

function absCoordinate (coord) {
  return (Math.sqrt(Math.pow(coord[0], 2) + Math.pow(coord[1], 2)))
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
      // For less Network traffic
      // removes not shown coordinates

      if (
        array2[index2][0] > zeroMinusFourthOfWindowX &&
          array2[index2][0] < windowsizeXPlusFourth &&
          array2[index2][1] > zeroMinusFourthOfWindowY &&
          array2[index2][1] < windowsizeYPlusFourth
      ) {
        outputArray[index].push(array2[index2])
      }
    })
  })

  return outputArray
}

/**
 * Return all available counties (BL)
 */
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
