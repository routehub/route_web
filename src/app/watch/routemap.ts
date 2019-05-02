import * as L from 'leaflet';
//import * as Elevation from 'leaflet.elevation/src/L.Control.Elevation.js';

export class Routemap {

    public gpsIcon = new L.icon({
        iconUrl: '/assets/icon/gps_icon.png',
        iconSize: [20, 20], // size of the icon
        iconAnchor: [10, 10], // point of the icon which will correspond to marker's location
        popupAnchor: [0, 0] // point from which the popup should open relative to the iconAnchor    
    });
    public startIcon = new L.icon({
        iconUrl: '/assets/icon/start_icon.png',
        iconSize: [50, 27], // size of the icon
        iconAnchor: [52, 27], // point of the icon which will correspond to marker's location
        popupAnchor: [0, 0] // point from which the popup should open relative to the iconAnchor    
    });
    goalIcon = new L.icon({
        iconUrl: '/assets/icon/goal_icon.png',
        iconSize: [50, 27], // size of the icon
        iconAnchor: [-2, 27], // point of the icon which will correspond to marker's location
        popupAnchor: [0, 0] // point from which the popup should open relative to the iconAnchor    
    });
    commentIcon = new L.icon({
        iconUrl: '/assets/icon/comment_icon.png',
        iconSize: [20, 20], // size of the icon
        iconAnchor: [10, 10], // point of the icon which will correspond to marker's location
        popupAnchor: [0, 0] // point from which the popup should open relative to the iconAnchor    
    });
    editIcon = new L.icon({
        iconUrl: '/assets/icon/edit_icon.png',
        iconSize: [14, 14], // size of the icon
        iconAnchor: [7, 7], // point of the icon which will correspond to marker's location
        popupAnchor: [0, 0], // point from which the popup should open relative to the iconAnchor    
        className: 'map-editIcon',
    });

}

