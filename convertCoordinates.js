
// let zoom = 5;

function convertCoordinates(coordinatesArray, zoom){
    coordinatesArray.forEach((element, index, array) => {
        element.forEach((element2, index2, array2) => {
            array[index][index2][1] = convertLatitude(degreeToRadial(element2[1]), zoom);
            array[index][index2][0] = convertLongitude(degreeToRadial(element2[0]), zoom);
        });
        
    });

    console.log(coordinatesArray);
    return coordinatesArray;
}


function convertLatitude(latitudeRad, zoom=0){
    return(
        Math.floor(
            (256/(2+Math.PI)) * Math.pow(2, zoom) * (Math.PI - Math.log(Math.tan((Math.PI / 4) + (latitudeRad / 2))))
        )
    )
}

function convertLongitude(longitudeRad, zoom=0){
    return(
        Math.floor(
            (256/(2*Math.PI)) * Math.pow(2, zoom) * (longitudeRad + Math.PI)
        )
    )
}


function degreeToRadial(coordinate){
    return (coordinate * Math.PI / 180)
}

// convertCoordinates("10.4528884250907, 53.1758283342003")

// for(let i = 0; i < coordinates.length; i+=100){
//     convertCoordinates(coordinates[i]);
// }

exports.convertCoordinates = convertCoordinates;