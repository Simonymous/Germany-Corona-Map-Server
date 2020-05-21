import { mapData } from './map-data.js'

import { getPathFromCounty } from './helper.js'

const data = mapData.features

const diagrammContainer = document.getElementById('barchart')
function go() {
    const maxValue = getMax(data)
    // console.log(maxValue);
    // Add the States and add the "Alle" function
    const states = ['Alle']
    data.forEach(element => {
        states.push(element.attributes.BL)
    })

    const uniq = [...new Set(states)].sort()

    // The slect field
    const state = document.getElementById('state')

    // Add the States as Options to the select field
    uniq.forEach(element => {
        state.options[state.options.length] = new Option(element, element)
    })

    let select = 'Alle'
    let howMany = 5
    // The event listener of the select field
    // For actualizing the graphs (svg)
    state.addEventListener('change', function () {
        select = this.value
        showGraphs(select, howMany, maxValue)
    })

    const howManyAreShown = document.getElementById('howMany')
    howManyAreShown.addEventListener('change', function () {
        howMany = this.value
        showGraphs(select, howMany, maxValue)
    })

    const scale = document.getElementById('scale')
    scale.addEventListener('change', function () {
        showGraphs(select, howMany, maxValue)
    })
}

/**
 * Showing the Graphs+Description in the SVG
 * @param {any} state
 */
function showGraphs(state, howMany, shrinkBy) {
    const topCases = []
    const topCountries = []
    const topState = []

    // console.log(shrinkBy);

    resetOutline()
    // clean previous svg
    while (diagrammContainer.lastChild) {
        diagrammContainer.removeChild(diagrammContainer.lastChild)
    }

    // Y placement for the elements
    let y1 = 8
    let y2 = 7

    shrinkBy = 89 / shrinkBy

    for (var x = 0; x < howMany; x++) {
        data.forEach(element => {
            const currentCases = getSelectedCases(element)

            // Only data out of the right State/every State if "Alle" is selected
            if (state === 'Alle' || element.attributes.BL === state) {
                // No Double entries
                if (topCountries.indexOf(element.attributes.county) === -1) {
                    // Replace the value, if the new value is larger, the front condition is for the first entry
                    if (!topCases[x] || currentCases > topCases[x]) {
                        topCases[x] = currentCases
                        topCountries[x] = element.attributes.county
                        topState[x] = element.attributes.BL

                        if (x === 0 && !document.getElementById('scale').checked) {
                            // Max width is 89
                            shrinkBy = 89 / currentCases
                        }
                    }
                }
            }
        })

        // break, if there is no new Data(so non undefined data is shown)
        // TODO: Schönere Lösung !
        if (!topCases[x]) {
            break
        }

        setSvgElement(10, y1, diagrammContainer, 'rect', topCases[x] * shrinkBy, x, topCountries[x])
        setSvgElement(10, y2, diagrammContainer, 'text', topCountries[x] + ' (' + topState[x] + ')')
        setSvgElement(0, y1, diagrammContainer, 'text', Math.round(topCases[x] * 10) / 10)

        y1 += 7
        y2 += 7

        //     x++
        // }, 1000)
        startOutlineAnimation(topCountries[x])
    }
}

// Alle Outlines wieder schwarz
function resetOutline() {
    const paths = document.getElementsByTagName('path')
    const strokecolor = document.getElementById('colorOutline').value
    for (var i = 0; i < paths.length; i++) {
        paths[i].style.stroke = strokecolor
        paths[i].style.strokeWidth = 0.5
    }
}

function startOutlineAnimation(county) {
    // TODO: Letzter LK
    var pathToAnimate = getPathFromCounty(county)
    const animColor = document.getElementById('colorOutlineAnim').value
    const animStrokeWith = document.getElementById('outlineAnim').value
    pathToAnimate.style.stroke = animColor
    pathToAnimate.style.strokeWidth = animStrokeWith
}

/**
 * Add Elements to the SVG
 * @param {number} x
 * @param {number} y
 * @param {SVGElement} svg
 * @param {"rect"|"text"} elementType
 * @param {any} attribute
 */
function setSvgElement(x, y, svg, elementType, attribute, id, county) {
    const element = document.createElementNS('http://www.w3.org/2000/svg', elementType)
    element.setAttribute('x', x)
    element.setAttribute('y', y)
    if (elementType === 'rect') {
        element.setAttribute('height', 3)
        element.setAttribute('width', attribute)
        const color = getPathFromCounty(county).getAttribute('fill')
        element.setAttribute('fill', color)
        element.setAttribute('class', 'bar')
        element.setAttribute('id', id)
        element.style.animationDelay = 0.5 * id + 's'
        element.style.visibility = 'hidden'
    } else {
        element.setAttribute('class', 'text')
        element.setAttribute('text-anchor', 'start')
        element.innerHTML = attribute
    }
    diagrammContainer.appendChild(element)
};

function getMax(data) {
    let max = 0

    data.forEach(element => {
        if (element.attributes.cases_per_100k >= max) {
            max = element.attributes.cases_per_100k
        }
    })
    return max
}

go()
// initially showing the data
showGraphs('Alle', 5, 0)

function getSelectedCases(element) {
    const kindeOfCase = document.getElementsByName('whatIsShown')

    if (kindeOfCase[0].checked) {
        return element.attributes.cases_per_100k
    } else if (kindeOfCase[1].checked) {
        return element.attributes.cases7_per_100k
    } else if (kindeOfCase[2].checked) {
        return element.attributes.cases
    }
}

// let elem = document.getElementsByClassName("bar")[3];
// let ht = window.getComputedStyle(elem, null).getPropertyValue("animation-delay");
// console.log(ht)
