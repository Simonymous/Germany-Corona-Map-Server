import { mapData } from './map-data.js'
import init from './eventListener.js'
import { getMax, getKindOfCase } from './helper.js'
const data = mapData.features

const mapContainer = document.getElementById('map')
const MapWidth = mapContainer.width.baseVal.value / 2

preDrawMap()
init()

/**
 * Gets all the needed data for the Map
 */
function preDrawMap() {
  const kindOfCase = getKindOfCase()

  const color = document.getElementById('colorpicker').value

  const strokecolor = document.getElementById('colorOutline').value

  const max = getMax(data, kindOfCase)

  drawMap(kindOfCase, color, strokecolor, max)
}

/**
 * Composes the Map Coordinates and let them draws it
 * @param {"cases_per_100k" | "cases7_per_100k" | "cases"} kindOfCase - What datapoints should be chosen
 * @param {number} color - The colour, the map should be filled
 * @param {string} strokecolor - The clour, the OUtlines are drawn with
 * @param {number} max - The maximum, a value of the chosen case can get
 */
function drawMap(kindOfCase, color, strokecolor, max) {
  // Run through the data points one by one
  for (let id = 0; id < data.length; id++) {
    // The definition path for the svg element
    // The coordinates of the path
    let output = ''

    // Every part of the state (islands...)
    data[id].geometry.rings.forEach(rings => {
      // Every data point inside these Parts
      for (let i = 0; i < rings.length; i++) {
        // The X value (normalized value * window size)
        const x = (minMax(rings[i][0], 'X')) * mapContainer.width.baseVal.value
        const y = (minMax(rings[i][1], 'Y')) * mapContainer.height.baseVal.value

        // Only in the first case, you have to move to the Point (M), otherwise you draw a Line (L)
        if (i === 0) {
          output += ` M ${x} ${y}`
        } else {
          output += ` L ${x} ${y}`
        }
      }
    })

    // Create the Path
    const path = createPath(output, id, kindOfCase, color, strokecolor, max)

    // Draw the Path on the Map
    mapContainer.appendChild(path)
  };

  // Trigger an change event for the BarChart to update
  document.getElementById('state').dispatchEvent(new Event('change'))
}

/**
 * Creates the Path, that shows the Map
 * @param {number} output - The definition string, what the path should show
 * @param {number} id - The ID of the stat that is currently painted
 * @param {number} kindOfCase - Needed for the brightness
 * @param {number} color - What should be the colour for the map
 * @param {number} strokecolor -  The colour of the state outlines
 * @param {number} max - The max value, needed fpor the brightness
 */
function createPath(output, id, kindOfCase, color, strokecolor, max) {
  const brightnessPercentage = getBrightnessPercent(id, kindOfCase, max)

  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
  path.setAttribute('d', output)
  path.setAttribute('stroke', strokecolor)
  path.setAttribute('fill', `hsl(${color}, 100%, ${brightnessPercentage}%)`)
  path.setAttribute('id', id)
  path.setAttribute('data-tooltip', data[id].attributes.county)
  return path
}

/**
 * Resetting the map and creating a new one with the actual value;
 */
export function resetMap() {
  document.getElementById('map').innerHTML = ''
  preDrawMap()
}

export function displayTooltip(id, x, y) {
  const tooltip = document.getElementById('nametooltip')
  tooltip.innerHTML = data[id].attributes.county
  if (y < MapWidth) {
    tooltip.style.top = (y) - 30 + 'px' // Upper
  } else {
    tooltip.style.top = (y) - 50 + 'px' // Lower
  }

  if (x < MapWidth) {
    tooltip.style.left = (x + 30) + 'px' // Left
  } else {
    tooltip.style.left = (x - 180) + 'px' // Right
  }
  tooltip.style.visibility = 'visible'
}

/**
 * Shows a Modal for further infomation to the selected state
 * @param {string} id - The id of the selected State
 * @param {number} x - The X Position of the Mouse
 * @param {number} y - The Y Position of the Mouse
 */
export function displayModal(id, x, y) {
  const tooltip = document.getElementById('nametooltip')
  tooltip.style.visibility = 'hidden'
  // The id can be "map", if a position outside of germany is clicked -> cancel
  if (id !== 'map') {
    const modal = document.getElementById('countyInfos')
    const modalContent = document.getElementById('modalText')

    // reset the modal content
    modalContent.innerHTML = ''

    // The X Button to close the modal
    const span = document.getElementsByClassName('close')[0]
    span.onclick = function () {
      modal.style.display = 'none'
    }

    const dataAtribute = data[+id].attributes

    // Adding the content for the Modal
    modalCompet('Landkreis: ' + dataAtribute.county, modalContent)
    modalCompet('Bundesland: ' + dataAtribute.BL, modalContent)
    modalCompet('Einwohnerzahl: ' + dataAtribute.EWZ, modalContent)
    modalCompet('Anzahl Infizierte: ' + dataAtribute.cases, modalContent)
    modalCompet('Infizierte pro 100k: ' + dataAtribute.cases_per_100k, modalContent)
    modalCompet('Infizierte pro 100k in den letzten 7 Tagen: ' + dataAtribute.cases7_per_100k, modalContent)
    modalCompet('Anzahl Verstorbene: ' + dataAtribute.deaths, modalContent)

    // Set Modal To Mouse with Offset
    // Offset makes Shure Modal is displayed in Map
    if (y < MapWidth) {
      modal.style.top = (y) + 'px'
    } else {
      modal.style.top = (y) - 380 + 'px'
    }

    if (x < MapWidth) {
      modal.style.left = (x) + 'px'
    } else {
      modal.style.left = (x - 200) + 'px'
    }

    // Show Modal
    modal.style.display = 'block'
  }
}

/**
 * Composing and adding content to the Modal
 * @param {string} text - The content, that should be added
 * @param {string} div - Where to add the content
 */
function modalCompet(text, div) {
  const tag = document.createElement('p')
  tag.appendChild(document.createTextNode(text))
  div.appendChild(tag)
}

/**
 * Returns the Percentage to the data point in relation to the max value.
 *
 * @param {number} id - The id of the current stet that is checked
 * @param {"cases_per_100k" | "cases7_per_100k" | "cases"} kindOfCase -
 * @param {number} max - get the maximum value of the specified kind of case
 */
function getBrightnessPercent(id, kindOfCase, max) {
  return Math.floor(100 - ((data[id].attributes[kindOfCase] / max) * 50))
}

/**
 * For the Germany Card.
 * In the original data, the coordinates dont start at 0,0.
 * Does MinMax Normalization to coordinates.
 *
 * @param {number} value - The value that should be normalized.
 * @param {"X" | "Y"} XY - Whether the value is from the X or Y axis.
 */
function minMax(value, XY) {
  let min; let max = 0

  // The values for Germany
  if (XY === 'X') {
    min = 5.8
    max = 15.1
  } else if (XY === 'Y') {
    min = 47.2
    max = 55.1
  }

  return ((value - min) / (max - min))
}
