
// cookie management

cookies = {};

cookies.get_cookie = function()
{
    names = {};
    other_names = $.cookie('other_names', {path:"/"});
    if (typeof(other_names) == "string")
        names = JSON.parse(other_names);
    return names;
}

cookies.set_cookie = function(name)
{
    other_names = $.cookie('other_names', {path:"/"});
//     console.log("set_cookie other_names1", other_names, name);
    if (typeof(other_names) != "string") 
        other_names = "{}";
    
    names = JSON.parse(other_names);
    names[name] = 1;    
    other_names = JSON.stringify(names);
    $.cookie('other_names', other_names, {expires:7, path:"/"});
}

cookies.del_cookie = function(name)
{
    names = {};
    other_names = $.cookie('other_names', {path:"/"});
//     console.log("delete: other_names is:", other_names);
    if (typeof(other_names) == "string")
        names = JSON.parse(other_names);
//     console.log("names before", names);
    delete names[name];
//     console.log("names after", names);
    other_names = JSON.stringify(names);
    $.cookie('other_names', other_names, {expires:7, path:"/"});
}




mapman = {};
mapman.markers = [];
mapman.initialize = function() {
    mapman.infowindow = new google.maps.InfoWindow({content:""});
    
    lat = 42.360367;
    lon = -71.087294;
    latlng = new google.maps.LatLng(lat, lon);
    myOptions = {
        zoom: 14,
        center: latlng,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    }

    mapman.map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
    mapman.mgr = new MarkerManager(mapman.map);
}

mapman.addMarker = function(aid, location) {
    if (aid in mapman.markers) {
//         console.log("enabling marker", aid);
        mapman.markers[aid].setVisible(true);
//         mapman.markers[aid].setMap(mapman.map);
        return true;
    }
    marker = new google.maps.Marker({
        position: location,
        map: mapman.map,
        aid: aid,
        valid: true,
    });
    google.maps.event.addListener(marker, 'click', function(event){
        mapman.infowindow.setContent(this.aid);
        mapman.infowindow.setPosition(event.latLng);
        mapman.infowindow.open(mapman.map, this);
    });
    mapman.markers[aid] = marker;
}

mapman.highlightMarker = function(aid) {
    if (mapman.markers[aid]) {
        marker = mapman.markers[aid];
        latlng = marker.getPosition();
        mapman.infowindow.setContent(aid);
        mapman.infowindow.setPosition(latlng);
        mapman.infowindow.open(mapman.map, marker);
    }
}

mapman.hideInvalidMarkers = function() {
    if (mapman.markers) {
        for (aid in mapman.markers) {
//             console.log("checking marker", aid, mapman.markers[aid].valid);
            if (mapman.markers[aid].valid == false) {
//                 console.log("hiding marker", aid);
                mapman.markers[aid].setVisible(false);
                mapman.markers[aid].setMap(null);
                delete mapman.markers[aid];
            }
        }
    }
}

mapman.invalidateMarkers = function() {
    if (mapman.markers) {
        for (aid in mapman.markers)
            mapman.markers[aid].valid = false;
    }
}

mapman.validateMarker = function(aid) {
//     console.log("validating marker", aid, mapman.markers[aid]);
    if (mapman.markers && mapman.markers[aid]) {
        mapman.markers[aid].valid = true;
        return true;
    } else
        return false;
}

// Removes the overlays from the map, but keeps them in the array
mapman.clearOverlays = function() {
    if (mapman.markers) {
        for (aid in mapman.markers)
            mapman.markers[aid].setMap(null);
    }
}

// Shows any overlays currently in the array
mapman.showOverlays = function() {
    if (mapman.markers) {
        for (aid in mapman.markers)
            mapman.markers[aid].setMap(mapman.map);
    }
}

// Deletes all markers in the array by removing references to them
mapman.deleteOverlays = function() {
    if (mapman.markers) {
        for (aid in mapman.markers)
            if (mapman.markers[aid]) {
                mapman.markers[aid].setMap(null);
                delete mapman.markers[aid];
            }
//         delete mapman.markers;
    }
}



