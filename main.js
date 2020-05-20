
// import {mapData} from './map-data.js';
// const mapData = require ('./map-data.js');
// const data = mapData.features

const data = [{
    attributes: {
      OBJECTID: 260,
      ADE: 4,
      GF: 4,
      BSG: 1,
      RS: "09363",
      AGS: "09363",
      SDV_RS: "093630000000",
      GEN: "Weiden i.d. OPf.",
      BEZ: "Kreisfreie Stadt",
      IBZ: 40,
      BEM: "--",
      NBD: "ja",
      SN_L: "09",
      SN_R: "3",
      SN_K: "63",
      SN_V1: "00",
      SN_V2: "00",
      SN_G: "000",
      FK_S3: "R",
      NUTS: "DE233",
      RS_0: "093630000000",
      AGS_0: "09363000",
      WSK: "2011/06/01 00:00:00.000",
      EWZ: 42520,
      KFL: 70.57,
      DEBKG_ID: "DEBKGDL20000E0QG",
      Shape__Area: 70626636.8156738,
      Shape__Length: 71580.49607382,
      death_rate: 2.22222222222222,
      cases: 270,
      deaths: 6,
      cases_per_100k: 634.995296331138,
      cases_per_population: 0.634995296331138,
      BL: "Bayern",
      BL_ID: "9",
      county: "SK Weiden i.d.OPf.",
      last_update: "23.04.2020, 00:00 Uhr",
      cases7_per_100k: 103.480714957667,
      recovered: null
    }},
    {attributes: {
        OBJECTID: 163,
        ADE: 4,
        GF: 4,
        BSG: 1,
        RS: "07315",
        AGS: "07315",
        SDV_RS: "073150000000",
        GEN: "Mainz",
        BEZ: "Kreisfreie Stadt",
        IBZ: 40,
        BEM: "--",
        NBD: "ja",
        SN_L: "07",
        SN_R: "3",
        SN_K: "15",
        SN_V1: "00",
        SN_V2: "00",
        SN_G: "000",
        FK_S3: "K",
        NUTS: "DEB35",
        RS_0: "073150000000",
        AGS_0: "07315000",
        WSK: "1969/06/07 00:00:00.000",
        EWZ: 217118,
        KFL: 97.73,
        DEBKG_ID: "DEBKGDL20000E1IM",
        Shape__Area: 97627249.550293,
        Shape__Length: 62216.6048126733,
        death_rate: 3.125,
        cases: 448,
        deaths: 14,
        cases_per_100k: 206.339409906134,
        cases_per_population: 0.206339409906134,
        BL: "Rheinland-Pfalz",
        BL_ID: "7",
        county: "SK Mainz",
        last_update: "23.04.2020, 00:00 Uhr",
        cases7_per_100k: 31.7799537578644,
        recovered: null
      }}
    ]

//--------------------------------
//CLIENT
//--------------------------------

/* Wählt alle Bundesländer aus */
function selectState () {
    let stateList = []
    let state;
    data.forEach(element => {
        stateList.push(state={name:element.attributes.BL, id:element.attributes.BL_ID})
    })

    const uniqueStateList = [];
    const map = new Map();
    for (const item of stateList) {
        if(!map.has(item.name)){
            map.set(item.name, true);    // set any value to Map
            uniqueStateList.push({
                
                name: item.name,
                id: item.id
            });
        }
    }

    uniqueStateList.push(state={id:0,name:"Alle" })
    uniqueStateList.sort((a, b) => (a.name > b.name) ? 1 : -1)
    stateInselct(uniqueStateList)
  }

function initListener() {
    
    document.getElementById('state').addEventListener('change', function (e) {
        console.log("State changed")
        console.log(generateMapDataQueryString())
        
    })
    document.getElementById('resolution').addEventListener('change', function (e) {
        console.log("Resolution changed")
        console.log(generateMapDataQueryString())
    })
    document.getElementById('zoom').addEventListener('change', function (e) {
        console.log("Zoom changed")
        console.log(generateMapDataQueryString())
    })
}  

const serverURL = "http://localhost:8080"
function generateMapDataQueryString() {
    const BL_ID = document.getElementById('state').value;
    const resolution = document.getElementById('resolution').value;
    const zoom = document.getElementById('zoom').value;

    
    let queryString = serverURL+"/mapdata" +"?BL_ID="+BL_ID+"&resolution="+resolution+"&zoom="+zoom 
    console.log("Generierter Query: "+queryString)
    console.log(fetchAsync(queryString))
    return queryString
}


async function fetchAsync (url) {
    console.log("FETCH!!!")
    let response = await fetch(url);
    let data = await response.json();
    data = "LEER"
    return data;
  }

/**function getRequest(queryString) {
    var xmlHttp = new XMLHttpRequest()
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            aCallback(xmlHttp.responseText);
    }
    xmlHttp.open( "GET", queryString, true );    
    xmlHttp.send(null)
}**/

/* Schreibt die Bundesländer in die select Liste */
function stateInselct (uniqueStateList) {
    let select = document.getElementById('state')
    select.innerHTML = ''
  
    uniqueStateList.forEach(element => {
      select.options[select.options.length] = new Option(element.name, element.id)
    })
  }

  selectState();
  initListener();