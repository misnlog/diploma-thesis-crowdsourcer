var $$ = Dom7;
var serverAddress = "http://147.32.81.90:8090";
var imageServer = "http://147.32.81.90:8080"

var P1 = {username:"liska", pswd:"0z3"};
var P2 = {username:"jelen", pswd:"3b1"};
var P3 = {username:"panda", pswd:"u5a"};
var P4 = {username:"opice", pswd:"9o1"};
var P5 = {username:"myval", pswd:"8e2"};
var P6 = {username:"zajic", pswd:"4t5"};
var P7 = {username:"slon", pswd:"i3d"};

var participants = [];
participants.push(P1);
participants.push(P2);
participants.push(P3);
participants.push(P4);
participants.push(P5);
participants.push(P6);
participants.push(P7);

var cornerMarkers = new L.MarkerClusterGroup();
var crosswalkMarkers = new L.MarkerClusterGroup();
var sidewalkMarkers = new L.MarkerClusterGroup();

var app = new Framework7({
root: '#app',
id: 'io.framework7.myapp',
name: 'CrowdsourcerApp',
theme: 'auto',

data: function () {
  return {};
},
sheet: {
  backdrop: false,
},

methods: {
  helloWorld: function () {
    app.dialog.alert('Hello World!');
  },
},

routes: routes,


input: {
  scrollIntoViewOnFocus: Framework7.device.cordova && !Framework7.device.electron,
  scrollIntoViewCentered: Framework7.device.cordova && !Framework7.device.electron,
},

statusbar: {
  overlay: Framework7.device.cordova && Framework7.device.ios || 'auto',
  iosOverlaysWebView: true,
  androidOverlaysWebView: false,
},
on: {
  init: function () {
      var f7 = this;
      if (f7.device.cordova) {
      cordovaApp.init(f7);
      }


      if(localStorage.ninethNotificationClicked == "true"){
        if(document.getElementById("notification-badge-person") != null) {
          document.getElementById("notification-badge-person").remove();
        }
      }

      if(localStorage.eightNotificationClicked == "true"){
        if(document.getElementById("notification-badge-group") != null) {
          document.getElementById("notification-badge-group").remove();
        }
      }

      codePush.sync(null, {installMode: InstallMode.IMMEDIATE});
    },
    
  },
});

document.addEventListener("resume", function () {
    codePush.sync(null, {installMode: InstallMode.IMMEDIATE});
});


var mainView = app.views.create('.view-main');

if (localStorage.username == null) {
    app.loginScreen.open(".login-screen", true);
} else {
  initMap();
}

var mymap;
var mymapObstacle;
let data;
let cornersDATA;
let sidewalksDATA;
let crosswalksDATA;

var taskIcon = L.icon({
iconUrl: './img/task_marker.png',
iconSize:     [32, 36],
iconAnchor:   [16, 36],
popupAnchor: [1, -34]
});

var taskIconClicked = L.icon({
iconUrl: './img/task_marker_clicked.png',
iconSize:     [64, 74], 
iconAnchor:   [32, 74],
popupAnchor: [1, -34]
});

var obstacleIcon = L.icon({
iconUrl: './img/obstacle_pin.png',
iconSize:     [43, 68],
iconAnchor:   [21.5, 68],
popupAnchor: [1, -34]
});

var cornerIcon = L.icon({
iconUrl: './img/pin_corner.png',
iconSize:     [45, 55],
iconAnchor:   [22.5, 55],
popupAnchor: [1, -34]
});

var crosswalkIcon = L.icon({
iconUrl: './img/pin_crosswalk.png',
iconSize:     [45, 55],
iconAnchor:   [22.5, 55],
popupAnchor: [1, -34]
});

var sidewalkIcon = L.icon({
iconUrl: './img/pin_sidewalk.png',
iconSize:     [45, 55],
iconAnchor:   [22.5, 55],
popupAnchor: [1, -34]
});

var platformIcon = L.icon({
iconUrl: './img/pin_platform.png',
iconSize:     [45, 55],
iconAnchor:   [22.5, 55],
popupAnchor: [1, -34]
});

function logUser() {
  var username = document.getElementById("login-screen-input-username").value;
  var pswd = document.getElementById("login-screen-input-pswd").value;

  for (var i = 0; i < participants.length; i++) {
    var object = participants[i];
    if (object.username == username.toLowerCase() && object.pswd == pswd.toLowerCase()){
      localStorage.setItem("username", username.toLowerCase());
      app.loginScreen.close(".login-screen", true);
      initMap();
      loadPhotoBadges();
      return;
    }
  }
  alert("Zadejte prosím platné uživatelské jméno a heslo");
}

function initMap() {

mymap = L.map('mapid').setView([50.076672,14.420254], 13);

L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
  attribution: '',
  id: 'mapbox.streets',
  maxZoom: 24,
  accessToken: 'pk.eyJ1IjoicmlnYW5taWMiLCJhIjoiY2p4ZnVjejIyMTBoYzNvczg3Z3kxYmRzeSJ9.CnlRm-rx92Bi7UxUDVZ--A'
}).addTo(mymap);

mymap.locate({watch: true, setView: false, maxZoom: 16});
mymap.on('locationfound', onLocationFound_watch);
mymap.on('locationerror', onLocationError);

fetch(serverAddress + "/api/participant/" + localStorage.username + "?mapped=false")
.then(response => response.json())
.then(data => {
    cornersDATA = data.corners;
    sidewalksDATA = data.sidewalks;
    crosswalksDATA = data.crosswalks;
    setCorners();
    setSidewalks();
    setStartPlatforms();
    setEndPlatforms();
    setZebras();
    mymap.addLayer(cornerMarkers);
    mymap.addLayer(crosswalkMarkers);
    mymap.addLayer(sidewalkMarkers);
});      

}


function locateUser() {
  mymap.setView([userLat, userLon], 16);
}

function manageCornerLayer(){
  var checkbox = document.getElementById("layers-corners-checkbox");
  if (mymap.hasLayer(cornerMarkers)){
    mymap.removeLayer(cornerMarkers);
  }else{
    mymap.addLayer(cornerMarkers);
  }
}

function manageSidewalkLayer(){
  var checkbox = document.getElementById("layers-sidewalks-checkbox");
  if (mymap.hasLayer(sidewalkMarkers)){
    mymap.removeLayer(sidewalkMarkers);
  }else{
    mymap.addLayer(sidewalkMarkers);
  }
}

function manageCrosswalkLayer(){
  var checkbox = document.getElementById("layers-crosswalks-checkbox");
  if (mymap.hasLayer(crosswalkMarkers)){
    mymap.removeLayer(crosswalkMarkers);
  }else{
    mymap.addLayer(crosswalkMarkers);
  }
}

function showChatTab(){
  app.tab.show("#tab-chat", false);
  auditPage("Chat with Navi");
}

function showActivityTab(){
  app.tab.show("#tab-community-activity", false);
  auditPage("Community Activity");
}

function showArticlesTab(){
  app.tab.show("#tab-life-articles", false);
  auditPage("Life Articles");
}

function showGamesPageFromLink(){
  app.tab.show("#view-games", "#link-games", false);
  auditPage("Games");
}

function showStatsFromLink(){
  app.tab.show("#tab-statistics", "#link-stats", false);
  updateGauges();
}



function auditPage(pageName){

  var text = '{ "username": "' + localStorage.username + '" , "auditString": "' + pageName + ' v10' + '" }';

  fetch(serverAddress + "/api/audit/add", {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json'
  },
    body: text
  })
  .then((res) => res.json())
  .then((data) => console.log(data))
}


var toast;
function showObstacleMarker() {
  document.getElementById("obstacle-pin").style.visibility = "visible";
  document.getElementById("main-toolbar").style.visibility = "hidden";
  document.getElementById("submenu-home").style.visibility = "hidden";
  mymap.removeLayer(sidewalkMarkers);
  mymap.removeLayer(crosswalkMarkers);
  mymap.removeLayer(cornerMarkers);

  toast = app.toast.create({
    text: 'Tahem mapy umístěte překážku',
    position: 'top',
    closeButton: true,
  });
  
  toast.open();

}

function hideObstacleMarker() {
  document.getElementById("obstacle-pin").style.visibility = "hidden";
  document.getElementById("main-toolbar").style.visibility = "visible";
  toast.close();
  document.getElementById("submenu-home").style.visibility = "visible";
  mymap.addLayer(sidewalkMarkers);
  mymap.addLayer(crosswalkMarkers);
  mymap.addLayer(cornerMarkers);
}


function setCorners() {
  for (var i = 0; i < cornersDATA.length; i++) {
    var corner = cornersDATA[i];

    if(corner.imageName == null){
        var marker = L.marker([corner.gps.lat, corner.gps.lon], {
        icon: cornerIcon, 
        backendID: corner.id,
        shape: corner.shape,
        object: corner
      });

      marker.on('click', function (){
        localStorage.setItem("currentClickedCornerId", this.options.backendID);
        app.sheet.open(".sheet-corner", true);
        var markerLat = this.options.object.gps.lat;
        var markerLon = this.options.object.gps.lon;

        if (mymap.hasLayer(cornerMarkers)){
          mymap.removeLayer(cornerMarkers);
        }
         if (mymap.hasLayer(crosswalkMarkers)){
          mymap.removeLayer(crosswalkMarkers);
        }
         if (mymap.hasLayer(sidewalkMarkers)){
          mymap.removeLayer(sidewalkMarkers);
        }

        this.addTo(mymap);
        
        mymap.setView([markerLat, markerLon], 18);

        document.getElementById("submenu-home").style.visibility = "hidden";
      });

      cornerMarkers.addLayer(marker);
    }

    
  }
}


function setZebras() {

  for (var i = 0; i < crosswalksDATA.length; i++) {
    var crosswalk = crosswalksDATA[i];
    var zebra = crosswalk.zebra;
    if(zebra.mapped == false && crosswalk.imageName == null) {
      let attributesArray = [];

      if (zebra.zebraType == null){
        attributesArray.push(".sheet-zebra-type");
      }
      if (zebra.numberOfStripes == null){
        attributesArray.push(".sheet-zebra-lines");
      }
      if (zebra.guidingStripe == null){
        attributesArray.push(".sheet-zebra-attributes");
      }
      if (zebra.surfaceType == null){
        attributesArray.push(".sheet-zebra-surface-type");
      } 
      if (zebra.surfaceQuality == null){
        attributesArray.push(".sheet-zebra-surface-quality");
      }

      var marker = L.marker([zebra.mid.lat, zebra.mid.lon], {
        icon: crosswalkIcon, 
        backendID: zebra.id,
        numberOfStripes: zebra.numberOfStripes,
        guidingStripe: zebra.guidingStripe,
        lightSignal: zebra.lightSignal,
        audioSignal: zebra.audioSignal,
        button: zebra.button,
        surfaceType: zebra.surfaceType,
        zebraType: zebra.zebraType,
        surfaceQuality: zebra.surfaceQuality,
        sheetModalsTBD: attributesArray,
        object: crosswalk
      });

      marker.on('click', function (){
        localStorage.setItem("currentClickedZebraId", this.options.backendID);
        localStorage.setItem("currentCrosswalkPoints", 0);
        var sheetModal = this.options.sheetModalsTBD[0];
        var markerLat = this.options.object.zebra.mid.lat;
        var markerLon = this.options.object.zebra.mid.lon;

         var polylinePoints = [];

        var startPlatform = [this.options.object.startPlatform.gps.lat, this.options.object.startPlatform.gps.lon];
        polylinePoints.push(startPlatform);

        var endPlatform = [this.options.object.endPlatform.gps.lat, this.options.object.endPlatform.gps.lon];
        polylinePoints.push(endPlatform);
        

        localStorage.setItem("currentZebraPolyline", polylinePoints[0]);
        var polyline = L.polyline(polylinePoints, {color: '#FF8C52', weight: 10, id: polylinePoints[0]}).addTo(mymap);

        if (mymap.hasLayer(cornerMarkers)){
          mymap.removeLayer(cornerMarkers);
        }
         if (mymap.hasLayer(crosswalkMarkers)){
          mymap.removeLayer(crosswalkMarkers);
        }
         if (mymap.hasLayer(sidewalkMarkers)){
          mymap.removeLayer(sidewalkMarkers);
        }

        this.addTo(mymap);
        
        mymap.setView([markerLat, markerLon], 18);

        document.getElementById("submenu-home").style.visibility = "hidden";

        app.sheet.open(sheetModal, true);
      });

      crosswalkMarkers.addLayer(marker);
    }
  }

}

function setStartPlatforms() {

  for (var i = 0; i < crosswalksDATA.length; i++) {
    var crosswalk = crosswalksDATA[i];
    var platform = crosswalk.startPlatform;

    if(platform.mapped == false && crosswalk.imageName == null) {
      let attributesArray = [];

      if (platform.platformType == null){
        attributesArray.push(".sheet-platform-tactile");
      }
      if (platform.signalStripe == null){
        attributesArray.push(".sheet-platform-type");
      }
      if (platform.surfaceType == null){
        attributesArray.push(".sheet-platform-surface-type");
      }
      if (platform.surfaceQuality == null){
        attributesArray.push(".sheet-platform-surface-quality");
      } 

      var marker = L.marker([platform.gps.lat, platform.gps.lon], {
        icon: platformIcon, 
        backendID: platform.id,
        label: "startPlatform",
        surfaceType: platform.surfaceType,
        surfaceQuality: platform.surfaceQuality,
        platformType: platform.platformType,
        signalStripe: platform.signalStripe,
        warningStripe: platform.warningStripe,
        sheetModalsTBD: attributesArray,
        object: crosswalk
      });


      marker.on('click', function (){
        localStorage.setItem("currentClickedPlatformId", this.options.backendID);
        localStorage.setItem("currentCrosswalkPoints", 0);
        var sheetModal = this.options.sheetModalsTBD[0];
        var markerLat = this.options.object.startPlatform.gps.lat;
        var markerLon = this.options.object.startPlatform.gps.lon;

        if (mymap.hasLayer(cornerMarkers)){
          mymap.removeLayer(cornerMarkers);
        }
         if (mymap.hasLayer(crosswalkMarkers)){
          mymap.removeLayer(crosswalkMarkers);
        }
         if (mymap.hasLayer(sidewalkMarkers)){
          mymap.removeLayer(sidewalkMarkers);
        }

        this.addTo(mymap);
        
        mymap.setView([markerLat, markerLon], 18);

        document.getElementById("submenu-home").style.visibility = "hidden";
        app.sheet.open(sheetModal, true);
      });

      crosswalkMarkers.addLayer(marker);

    }
    

  }
}

function setEndPlatforms() {

  for (var i = 0; i < crosswalksDATA.length; i++) {
    var crosswalk = crosswalksDATA[i];
    var platform = crosswalk.endPlatform;

    if(platform.mapped == false && crosswalk.imageName == null) {
      let attributesArray = [];

      if (platform.platformType == null){
        attributesArray.push(".sheet-platform-tactile");
      }
      if (platform.signalStripe == null){
        attributesArray.push(".sheet-platform-type");
      }
      if (platform.surfaceType == null){
        attributesArray.push(".sheet-platform-surface-type");
      }
      if (platform.surfaceQuality == null){
        attributesArray.push(".sheet-platform-surface-quality");
      } 

      var marker = L.marker([platform.gps.lat, platform.gps.lon], {
        icon: platformIcon, 
        backendID: platform.id,
        label: "endPlatform",
        surfaceType: platform.surfaceType,
        surfaceQuality: platform.surfaceQuality,
        platformType: platform.platformType,
        signalStripe: platform.signalStripe,
        warningStripe: platform.warningStripe,
        sheetModalsTBD: attributesArray,
        object: crosswalk
      });


      marker.on('click', function (){
        localStorage.setItem("currentClickedPlatformId", this.options.backendID);
        localStorage.setItem("currentCrosswalkPoints", 0);
        var sheetModal = this.options.sheetModalsTBD[0];
        var markerLat = this.options.object.endPlatform.gps.lat;
        var markerLon = this.options.object.endPlatform.gps.lon;

        if (mymap.hasLayer(cornerMarkers)){
          mymap.removeLayer(cornerMarkers);
        }
         if (mymap.hasLayer(crosswalkMarkers)){
          mymap.removeLayer(crosswalkMarkers);
        }
         if (mymap.hasLayer(sidewalkMarkers)){
          mymap.removeLayer(sidewalkMarkers);
        }

        this.addTo(mymap);
        
        mymap.setView([markerLat, markerLon], 18);

        document.getElementById("submenu-home").style.visibility = "hidden";

        app.sheet.open(sheetModal, true);
      });

      crosswalkMarkers.addLayer(marker);

    }

  }
}

function setSidewalks() {

  for (var i = 0; i < sidewalksDATA.length; i++) {
    var sidewalk = sidewalksDATA[i];

    if (sidewalk.imageName == null) {
      let attributesArray = [];

      if (sidewalk.rightSurroundings == null){
        attributesArray.push(".sheet-sidewalk-slope");
      }
      if (sidewalk.leftSurroundings == null){
        attributesArray.push(".sheet-sidewalk-width");
      }
      if (sidewalk.passableWidth == null){
        attributesArray.push(".sheet-sidewalk-vicinity-right");
      }
      if (sidewalk.slope == null){
        attributesArray.push(".sheet-sidewalk-vicinity-left");
      } 
      if (sidewalk.type == null){
        attributesArray.push(".sheet-sidewalk-surface-type");
      }
      if (sidewalk.type == null){
        attributesArray.push(".sheet-sidewalk-surface-quality");
      }

      var marker = L.marker([sidewalk.mid.lat, sidewalk.mid.lon], {
        icon: sidewalkIcon, 
        backendID: sidewalk.id,
        leftSurroundings: sidewalk.leftSurroundings,
        rightSurroundings: sidewalk.rightSurroundings,
        passableWidth: sidewalk.passableWidth,
        surfaceQuality: sidewalk.quality,
        slope: sidewalk.slope,
        surfaceType: sidewalk.type,
        sheetModalsTBD: attributesArray,
        points: sidewalk.points,
        object: sidewalk
      });


      marker.on('click', function (){
        localStorage.setItem("currentClickedSidewalkId", this.options.backendID);
        localStorage.setItem("currentSidewalkPoints", 0);
        var sheetModal = this.options.sheetModalsTBD[0];
        var markerLat = this.options.object.mid.lat;
        var markerLon = this.options.object.mid.lon;
        var points = this.options.points;
        
        var polylinePoints = [];
        for (var i = points.length - 1; i >= 0; i--) {
          var latlon = [points[i].lat,points[i].lon];
          polylinePoints.push(latlon);
        };

        localStorage.setItem("currentSidewalkPolyline", polylinePoints[0]);
        var polyline = L.polyline(polylinePoints, {color: '#9263BE', weight: 10, id: polylinePoints[0]}).addTo(mymap);
        
        if (mymap.hasLayer(cornerMarkers)){
          mymap.removeLayer(cornerMarkers);
        }
         if (mymap.hasLayer(crosswalkMarkers)){
          mymap.removeLayer(crosswalkMarkers);
        }
         if (mymap.hasLayer(sidewalkMarkers)){
          mymap.removeLayer(sidewalkMarkers);
        }

        this.addTo(mymap);
        
        mymap.setView([markerLat, markerLon], 18);

        document.getElementById("submenu-home").style.visibility = "hidden";

        app.sheet.open(sheetModal, true);
      });

      sidewalkMarkers.addLayer(marker);

    }
    

  }
}



// LEAFLET MAPS - START
var userLat;
var userLon;

function onLocationFound_watch(e) {
  if (!this.marker) {
    mymap.setView([e.latitude, e.longitude], 16);
    this.marker =  L.circleMarker(e.latlng, {radius: 10, 
      fillOpacity: 1,
      color: 'rgb(173,216,230, 0.8)',
      fillColor: 'blue', 
      weight: 8,}).addTo(mymap);
    userLat = e.latitude;
    userLon = e.longitude;
  } else {
    this.marker.setLatLng([e.latitude, e.longitude]);
    userLat = e.latitude;
    userLon = e.longitude;
  }
}

function onLocationError(e) {
  alert(e.message);
}

function gpsRetry(gpsOptions) {
  navigator.geolocation.getCurrentPosition(gpsSuccess, gpsError, gpsOptions);
}

function gpsError(error, gpsOptions) {
  alert('code: '    + error.code    + "\n" +
    'message: ' + error.message + "\n");
  gpsRetry(gpsOptions);
}

function gpsSuccess(position) {
// alert('Latitude: '          + position.coords.latitude          + "\n" +
//       'Longitude: '         + position.coords.longitude         + "\n" +
//       'Altitude: '          + position.coords.altitude          + "\n" +
//       'Accuracy: '          + position.coords.accuracy          + "\n" +
//       'Altitude Accuracy: ' + position.coords.altitudeAccuracy  + "\n" +
//       'Heading: '           + position.coords.heading           + "\n" +
//       'Speed: '             + position.coords.speed             + "\n" +
//       'Timestamp: '         + position.timestamp                + "\n");
}

let gpsOptions = {maximumAge: 300000, timeout: 5000, enableHighAccuracy: true};

navigator.geolocation.getCurrentPosition(gpsSuccess, gpsError, gpsOptions);


//OBSTACLES
function setObstacleLocation(){
  var mapCenter = mymap.getCenter();

  var gps = {
    lat: mapCenter.lat,
    lon: mapCenter.lng
  }
  var obstacle = {
    point: gps,
    type: null,
    sidewalkPosition: null,
    passableWidth: null
  };

  localStorage.setItem("currentClickedObstacleObject", JSON.stringify(obstacle));
  var points = 1;
  localStorage.setItem("currentObstaclePoints", points);
  document.getElementById("obstacle-pin").style.visibility = "hidden";
  document.getElementById("main-toolbar").style.visibility = "visible";
  toast.close();
  app.sheet.open(".sheet-obstacle-type", true);

}

function setObstacleType() {

  var obstacle = JSON.parse(localStorage.currentClickedObstacleObject);
  var radioButtons = document.getElementsByName("obstacle-type-radio");
  var inputOther = document.getElementById("obstacle-type-input-other");
  var points = localStorage.currentObstaclePoints;
  if (inputOther != null || inputOther != ""){
    obstacle.type = inputOther.value;
    inputOther.value = "";
    document.getElementById("obstacle-type-radio-1").checked = false;
        document.getElementById("obstacle-type-radio-2").checked = false;
        document.getElementById("obstacle-type-radio-3").checked = false;
        document.getElementById("obstacle-type-radio-4").checked = false;
        document.getElementById("obstacle-type-radio-5").checked = false;
        document.getElementById("obstacle-type-radio-6").checked = false;
        document.getElementById("obstacle-type-radio-7").checked = false;
        document.getElementById("obstacle-type-radio-8").checked = false;
        document.getElementById("obstacle-type-radio-9").checked = false;
    points = parseInt(points) + 1;
    localStorage.setItem("currentClickedObstacleObject", JSON.stringify(obstacle));
    localStorage.setItem("currentObstaclePoints", points);
    app.sheet.close(".sheet-obstacle-type", false);
    app.sheet.open(".sheet-obstacle-position", false);
    return;
  }
  else {
    for (var i = 0; i < radioButtons.length; i++){
      if(radioButtons[i].checked) {             
        obstacle.type = radioButtons[i].value;
        points = parseInt(points) + 1;
        document.getElementById("obstacle-type-radio-1").checked = false;
        document.getElementById("obstacle-type-radio-2").checked = false;
        document.getElementById("obstacle-type-radio-3").checked = false;
        document.getElementById("obstacle-type-radio-4").checked = false;
        document.getElementById("obstacle-type-radio-5").checked = false;
        document.getElementById("obstacle-type-radio-6").checked = false;
        document.getElementById("obstacle-type-radio-7").checked = false;
        document.getElementById("obstacle-type-radio-8").checked = false;
        document.getElementById("obstacle-type-radio-9").checked = false;
        localStorage.setItem("currentClickedObstacleObject", JSON.stringify(obstacle));
        localStorage.setItem("currentObstaclePoints", points);
        app.sheet.close(".sheet-obstacle-type", false);
        app.sheet.open(".sheet-obstacle-position", false);
        return;
      }
    }

  }
  
  alert("Vyberte prosím typ překážky.");
 
}

function setObstaclePosition() {

  var obstacle = JSON.parse(localStorage.currentClickedObstacleObject);
  var radioButtons = document.getElementsByName("obstacle-position-radio");
  var points = localStorage.currentObstaclePoints;
    for (var i = 0; i < radioButtons.length; i++){
      if(radioButtons[i].checked) {             
        obstacle.sidewalkPosition = radioButtons[i].value;
        points = parseInt(points) + 1;
        radioButtons[i].checked = false;
        localStorage.setItem("currentClickedObstacleObject", JSON.stringify(obstacle));
        localStorage.setItem("currentObstaclePoints", points);
        app.sheet.close(".sheet-obstacle-position", false);
        app.sheet.open(".sheet-obstacle-passable-width", false);
        return;
      }
    }
  
  alert("Vyberte prosím umístění překážky na chodníku.");
 
}

function setObstaclePassableWidth() {

  var obstacle = JSON.parse(localStorage.currentClickedObstacleObject);
  var inputRange = document.getElementById("obstacle-passable-width-input");
  var points = localStorage.currentObstaclePoints;
  obstacle.passableWidth = inputRange.value;
  document.getElementById("obstacle-passable-width-input").value = 0;
  points = parseInt(points) + 1;
  localStorage.setItem("currentClickedObstacleObject", JSON.stringify(obstacle));
  localStorage.setItem("currentObstaclePoints", points);
  app.sheet.close(".sheet-obstacle-passable-width", false);
  saveObstacleDataToDB();

}

function saveObstacleDataToDB() {

  document.getElementById("submenu-home").style.visibility = "visible";
  mymap.addLayer(sidewalkMarkers);
  mymap.addLayer(crosswalkMarkers);
  mymap.addLayer(cornerMarkers);

  var obstacle = localStorage.currentClickedObstacleObject;
  fetch(serverAddress + "/api/obstacle/" + localStorage.username + "/add" + "?count=" + localStorage.currentObstaclePoints, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json'
  },
    body: obstacle
  })
  .then((res) => res.json())
  .then((data) => console.log(data))

  showAlertObstacleSaved();
}

function showAlertDone(){
  app.dialog.create({
    title: 'Výborně!',
    text: 'Tady je už vše sesbíráno.',
    buttons: [
      {
        text: 'Zpět na mapu',
      },
    ],
    verticalButtons: false,
  }).open();
}

function showAlertPhotoDone(){
  app.dialog.create({
    title: 'Výborně!',
    text: 'Tady je už vše sesbíráno.',
    buttons: [
      {
        text: 'Zpět do galerie fotek',
      },
    ],
    verticalButtons: false,
  }).open();
}

function showAlertObstacleSaved(){
  app.dialog.create({
    title: 'Výborně!',
    text: 'Překážka byla uložena.',
    buttons: [
      {
        text: 'Zpět na mapu',
      },
    ],
    verticalButtons: false,
  }).open();
}



//CORNERS
function setCornerShape() {
  mymap.eachLayer(function (layer) { 
    if (layer.options.backendID == localStorage.currentClickedCornerId) {
      var radioButtons = document.getElementsByName("corner-shape-radio");
      for (var i = 0; i < radioButtons.length; i++){
        if(radioButtons[i].checked) {             
          layer.options.shape = radioButtons[i].value;
          radioButtons[i].checked = false;
         
          //save to DB
          var object = layer.options.object;
          object.shape = layer.options.shape;
          var id = object.id;

          mymap.removeLayer(layer);

          if(document.getElementById("layers-corners-checkbox").checked){
            mymap.addLayer(cornerMarkers);
          }
          if(document.getElementById("layers-sidewalks-checkbox").checked){
            mymap.addLayer(sidewalkMarkers);
          }
          if (document.getElementById("layers-crosswalks-checkbox").checked){
            mymap.addLayer(crosswalkMarkers);
          }

          document.getElementById("submenu-home").style.visibility = "visible";

          fetch(serverAddress + "/api/corner/" + id + "/" + localStorage.username + "?count=1", {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(object)
          })
          .then((res) => res.json())
          .then((data) => console.log(data))
          //mymap.removeLayer(layer);
          cornerMarkers.removeLayer(layer);

          app.sheet.close(".sheet-corner", true);
          showAlertDone();
          return;
          }
          }
          alert("Vyberte prosím tvar rohu.");
          } 
          });
}

//PLATFORMS - tactile, type, quality
function setPlatformType() {
  mymap.eachLayer(function (layer) { 
    if (layer.options.backendID == localStorage.currentClickedPlatformId) {
      var radioButtons = document.getElementsByName("platform-type-radio");
      for (var i = 0; i < radioButtons.length; i++){
        if(radioButtons[i].checked) {             
          layer.options.platformType = radioButtons[i].value;
          var modals = layer.options.sheetModalsTBD;
          modals.shift();
          layer.options.sheetModalsTBD = modals;

          document.getElementById("platform-type-radio-1").checked = false;
          document.getElementById("platform-type-radio-2").checked = false;
          

          var points = localStorage.currentCrosswalkPoints;
          points = parseInt(points) + 1;
          localStorage.setItem("currentCrosswalkPoints", points);

          app.sheet.close(".sheet-platform-type", false);
          app.sheet.open(".sheet-platform-surface-type", false);
          return;
        }
      }
      alert("Vyberte prosím typ nájezdové plošiny přechodu.");
    } 
  });
}

function skipPlatformType() {
  mymap.eachLayer(function (layer) { 
    if (layer.options.backendID == localStorage.currentClickedPlatformId) {
      layer.options.platformType = "nezadano";
      var modals = layer.options.sheetModalsTBD;
      modals.shift();
      layer.options.sheetModalsTBD = modals;

      document.getElementById("platform-type-radio-1").checked = false;
      document.getElementById("platform-type-radio-2").checked = false;
    } 
  });
}

function setPlatformTactile() {
  mymap.eachLayer(function (layer) { 
    if (layer.options.backendID == localStorage.currentClickedPlatformId) {

      var checkboxWarning = document.getElementById("platform-input-warning");
      var checkboxSignal = document.getElementById("platform-input-signal");
      var checkboxNoStrips = document.getElementById("platform-input-no-strips");

      if(checkboxWarning.checked || checkboxSignal.checked || checkboxNoStrips.checked) {
        layer.options.warningStripe = "false";
        layer.options.signalStripe = "false";

        if (checkboxWarning.checked) {    
          layer.options.warningStripe = "true";
        }
        if (checkboxSignal.checked) {
          layer.options.signalStripe = "true";
        }

        var modals = layer.options.sheetModalsTBD;
        modals.shift();
        layer.options.sheetModalsTBD = modals;

        document.getElementById("platform-input-signal").checked = false;
        document.getElementById("platform-input-warning").checked = false;

        var points = localStorage.currentCrosswalkPoints;
            points = parseInt(points) + 1;
            localStorage.setItem("currentCrosswalkPoints", points);

        app.sheet.close(".sheet-platform-tactile", false);
        app.sheet.open(".sheet-platform-type", false);
        return;
      }

      alert("Vyberte prosím typ značení na nájezdové plošine.");
    } 
  });
}

function skipPlatformTactile() {
  mymap.eachLayer(function (layer) { 
    if (layer.options.backendID == localStorage.currentClickedPlatformId) {
      layer.options.warningStripe = "nezadano";
      layer.options.signalStripe = "nezadano";
      var modals = layer.options.sheetModalsTBD;
      modals.shift();
      layer.options.sheetModalsTBD = modals;
      document.getElementById("platform-input-signal").checked = false;
      document.getElementById("platform-input-warning").checked = false;
    } 
  });
}


function setPlatformSurfaceType() {
  mymap.eachLayer(function (layer) { 
    if (layer.options.backendID == localStorage.currentClickedPlatformId) {
      var radioButtons = document.getElementsByName("platform-surface-type-radio");
      for (var i = 0; i < radioButtons.length; i++){
        if(radioButtons[i].checked) {             
          layer.options.surfaceType = radioButtons[i].value;
          var modals = layer.options.sheetModalsTBD;
          modals.shift();
          layer.options.sheetModalsTBD = modals;
          var points = localStorage.currentCrosswalkPoints;
          points = parseInt(points) + 1;

          document.getElementById("platform-surface-type-radio-1").checked = false;
          document.getElementById("platform-surface-type-radio-2").checked = false;
          document.getElementById("platform-surface-type-radio-3").checked = false;
          document.getElementById("platform-surface-type-radio-4").checked = false;
          document.getElementById("platform-surface-type-radio-5").checked = false;

          localStorage.setItem("currentCrosswalkPoints", points);
          app.sheet.close(".sheet-platform-surface-type", false);
          app.sheet.open(".sheet-platform-surface-quality", false);
          return;
        }
      }
      alert("Vyberte prosím typ povrchu nájezdové plošiny přechodu.");
    } 
  });
}

function skipPlatformSurfaceType() {
  mymap.eachLayer(function (layer) { 
    if (layer.options.backendID == localStorage.currentClickedPlatformId) {
      layer.options.surfaceType = "nezadano";
      var modals = layer.options.sheetModalsTBD;
      modals.shift();
      layer.options.sheetModalsTBD = modals;
      document.getElementById("platform-surface-type-radio-1").checked = false;
      document.getElementById("platform-surface-type-radio-2").checked = false;
      document.getElementById("platform-surface-type-radio-3").checked = false;
      document.getElementById("platform-surface-type-radio-4").checked = false;
      document.getElementById("platform-surface-type-radio-5").checked = false;
    } 
  });
}

function setPlatformSurfaceQuality() {
  mymap.eachLayer(function (layer) { 
    if (layer.options.backendID == localStorage.currentClickedPlatformId) {
      var radioButtons = document.getElementsByName("platform-surface-quality-radio");
      for (var i = 0; i < radioButtons.length; i++){
        if(radioButtons[i].checked) {            
          layer.options.surfaceQuality = radioButtons[i].value;
          var modals = layer.options.sheetModalsTBD;
          modals.shift();
          layer.options.sheetModalsTBD = modals;
          var points = localStorage.currentCrosswalkPoints;
          points = parseInt(points) + 1;

          document.getElementById("platform-surface-quality-radio-1").checked = false;
          document.getElementById("platform-surface-quality-radio-2").checked = false;
          document.getElementById("platform-surface-quality-radio-3").checked = false;
          document.getElementById("platform-surface-quality-radio-4").checked = false;

          localStorage.setItem("currentCrosswalkPoints", points);
          //TBD funkcia save sidewalk data
          savePlatformDataToDB();
          app.sheet.close(".sheet-platform-surface-quality", false);
          showAlertDone();
          return;
  }
}
    alert("Vyberte prosím kvalitu povrchu chodníku.");
} 
});
}

function skipPlatformSurfaceQuality() {
  mymap.eachLayer(function (layer) { 
    if (layer.options.backendID == localStorage.currentClickedPlatformId) {

      layer.options.surfaceQuality = "nezadano";
      var modals = layer.options.sheetModalsTBD;
      modals.shift();
      layer.options.sheetModalsTBD = modals;
      document.getElementById("platform-surface-quality-radio-1").checked = false;
      document.getElementById("platform-surface-quality-radio-2").checked = false;
      document.getElementById("platform-surface-quality-radio-3").checked = false;
      document.getElementById("platform-surface-quality-radio-4").checked = false;
      savePlatformDataToDB();
      showAlertDone();
    } 
  });
}

function savePlatformDataToDB() {

//save to DB
mymap.eachLayer(function (layer) { 
  if (layer.options.backendID == localStorage.currentClickedPlatformId) {
    var object = layer.options.object;

    if (layer.options.label == "endPlatform"){
      object.endPlatform.surfaceType = layer.options.surfaceType;
      object.endPlatform.surfaceQuality = layer.options.surfaceQuality;
      object.endPlatform.platformType = layer.options.platformType;
      object.endPlatform.signalStripe = layer.options.signalStripe;
      object.endPlatform.warningStripe = layer.options.warningStripe;
    } else if (layer.options.label == "startPlatform"){
      object.startPlatform.surfaceType = layer.options.surfaceType;
      object.startPlatform.surfaceQuality = layer.options.surfaceQuality;
      object.startPlatform.platformType = layer.options.platformType;
      object.startPlatform.signalStripe = layer.options.signalStripe;
      object.startPlatform.warningStripe = layer.options.warningStripe;
    }

    var modals = layer.options.sheetModalsTBD;
    var id = object.id;
    
    mymap.removeLayer(layer);

    if(document.getElementById("layers-corners-checkbox").checked){
      mymap.addLayer(cornerMarkers);
    }
    if(document.getElementById("layers-sidewalks-checkbox").checked){
      mymap.addLayer(sidewalkMarkers);
    }
    if (document.getElementById("layers-crosswalks-checkbox").checked){
      mymap.addLayer(crosswalkMarkers);
    }

    document.getElementById("submenu-home").style.visibility = "visible";

    fetch(serverAddress + "/api/crosswalk/" + id + "/" + localStorage.username + "?count=" + localStorage.currentCrosswalkPoints, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(object)
    })
    .then((res) => res.json())
    .then((data) => console.log(data))


    if (modals.length == 0){
      crosswalkMarkers.removeLayer(layer);
    }
  } 
});

}

//ZEBRA - type, number of lines, atributtes, surface and its quality
function setZebraType() {
  mymap.eachLayer(function (layer) { 
    if (layer.options.backendID == localStorage.currentClickedZebraId) {
      var radioButtons = document.getElementsByName("zebra-type-radio");
      for (var i = 0; i < radioButtons.length; i++){
        if(radioButtons[i].checked) {             
          layer.options.zebraType = radioButtons[i].value;
          var modals = layer.options.sheetModalsTBD;
          modals.shift();
          layer.options.sheetModalsTBD = modals;
          var points = localStorage.currentCrosswalkPoints;
          points = parseInt(points) + 1;
          document.getElementById("zebra-type-radio-1").checked = false;
          document.getElementById("zebra-type-radio-2").checked = false;
          document.getElementById("zebra-type-radio-3").checked = false;
          
          localStorage.setItem("currentCrosswalkPoints", points);
          app.sheet.close(".sheet-zebra-type", false);
          app.sheet.open(".sheet-zebra-lines", false);
          return;
        }
      }
      alert("Vyberte prosím typ přechodu.");
    } 
  });
}

function skipZebraType() {
  mymap.eachLayer(function (layer) { 
    if (layer.options.backendID == localStorage.currentClickedZebraId) {
      layer.options.zebraType = "nezadano";
      var modals = layer.options.sheetModalsTBD;
      modals.shift();
      layer.options.sheetModalsTBD = modals;
      document.getElementById("zebra-type-radio-1").checked = false;
      document.getElementById("zebra-type-radio-2").checked = false;
      document.getElementById("zebra-type-radio-3").checked = false;
    } 
  });
}

function setZebraLines() {
  mymap.eachLayer(function (layer) { 
    if (layer.options.backendID == localStorage.currentClickedZebraId) {

      var optionsNumbers = document.getElementsByClassName("zebra-lines-number");
      for (var i = 0; i < optionsNumbers.length; i++){
        if(optionsNumbers[i].selected){
          layer.options.numberOfStripes = optionsNumbers[i].value;
          var modals = layer.options.sheetModalsTBD;
          modals.shift();
          layer.options.sheetModalsTBD = modals;
          var points = localStorage.currentCrosswalkPoints;
          points = parseInt(points) + 1;
          localStorage.setItem("currentCrosswalkPoints", points);
          app.sheet.close(".sheet-zebra-lines", false);
          app.sheet.open(".sheet-zebra-attributes", false);
          return;
        }
      }
      alert("Vyberte prosím počet jízdních pruhů.")
    } 
  });
}

function skipZebraLines() {
  mymap.eachLayer(function (layer) { 
    if (layer.options.backendID == localStorage.currentClickedZebraId) {
      layer.options.numberOfStripes = -1;

      var modals = layer.options.sheetModalsTBD;
      modals.shift();
      layer.options.sheetModalsTBD = modals;
    } 
  });
}

function setZebraAttributes() {
  mymap.eachLayer(function (layer) { 
    if (layer.options.backendID == localStorage.currentClickedZebraId) {

      var checkboxLeading = document.getElementById("zebra-input-leading");
      var checkboxSemafor = document.getElementById("zebra-input-semafor");
      var checkboxAudio = document.getElementById("zebra-input-audio");
      var checkboxSignal = document.getElementById("zebra-input-signal");

      layer.options.guidingStripe = "false";
      layer.options.lightSignal = "false";
      layer.options.audioSignal = "false";
      layer.options.button = "false";

      if (checkboxLeading.checked) {    
        layer.options.guidingStripe = "true";
      }
      if (checkboxSemafor.checked) {
        layer.options.lightSignal = "true";
      }
      if (checkboxAudio.checked) {
        layer.options.audioSignal = "true";
      }
      if (checkboxSignal.checked) {
        layer.options.button = "true";
      }

      
      var modals = layer.options.sheetModalsTBD;
      modals.shift();
      layer.options.sheetModalsTBD = modals;
      var points = localStorage.currentCrosswalkPoints;
          points = parseInt(points) + 1;
          localStorage.setItem("currentCrosswalkPoints", points);

      document.getElementById("zebra-input-leading").checked = false;
      document.getElementById("zebra-input-semafor").checked = false;
      document.getElementById("zebra-input-audio").checked = false;
      document.getElementById("zebra-input-signal").checked = false;

      app.sheet.close(".sheet-zebra-attributes", false);
      app.sheet.open(".sheet-zebra-surface-type", false);
    } 
  });
}

function skipZebraAttributes() {
  mymap.eachLayer(function (layer) { 
    if (layer.options.backendID == localStorage.currentClickedZebraId) {
      layer.options.guidingStripe = "nezadano";
      layer.options.lightSignal = "nezadano";
      layer.options.audioSignal = "nezadano";
      layer.options.button = "nezadano";
      var modals = layer.options.sheetModalsTBD;
      modals.shift();
      layer.options.sheetModalsTBD = modals;
      document.getElementById("zebra-input-leading").checked = false;
      document.getElementById("zebra-input-semafor").checked = false;
      document.getElementById("zebra-input-audio").checked = false;
      document.getElementById("zebra-input-signal").checked = false;
    } 
  });
}


function setZebraSurfaceType() {
  mymap.eachLayer(function (layer) { 
    if (layer.options.backendID == localStorage.currentClickedZebraId) {
      var radioButtons = document.getElementsByName("zebra-surface-type-radio");
      for (var i = 0; i < radioButtons.length; i++){
        if(radioButtons[i].checked) {             
          layer.options.surfaceType = radioButtons[i].value;
          var modals = layer.options.sheetModalsTBD;
          modals.shift();
          layer.options.sheetModalsTBD = modals;
          var points = localStorage.currentCrosswalkPoints;
          points = parseInt(points) + 1;

          document.getElementById("zebra-surface-type-radio-1").checked = false;
          document.getElementById("zebra-surface-type-radio-2").checked = false;
          document.getElementById("zebra-surface-type-radio-3").checked = false;
          document.getElementById("zebra-surface-type-radio-4").checked = false;
          document.getElementById("zebra-surface-type-radio-5").checked = false;

          localStorage.setItem("currentCrosswalkPoints", points);
          app.sheet.close(".sheet-zebra-surface-type", false);
          app.sheet.open(".sheet-zebra-surface-quality", false);
          return;
        }
      }
      alert("Vyberte prosím typ povrchu zebry.");
    } 
  });
}

function skipZebraSurfaceType() {
  mymap.eachLayer(function (layer) { 
    if (layer.options.backendID == localStorage.currentClickedZebraId) {

      layer.options.surfaceType = "nezadano";
      var modals = layer.options.sheetModalsTBD;
      modals.shift();
      layer.options.sheetModalsTBD = modals;

      document.getElementById("zebra-surface-type-radio-1").checked = false;
      document.getElementById("zebra-surface-type-radio-2").checked = false;
      document.getElementById("zebra-surface-type-radio-3").checked = false;
      document.getElementById("zebra-surface-type-radio-4").checked = false;
      document.getElementById("zebra-surface-type-radio-5").checked = false;
    } 
  });
}

function setZebraSurfaceQuality() {
  mymap.eachLayer(function (layer) { 
    if (layer.options.backendID == localStorage.currentClickedZebraId) {
      var radioButtons = document.getElementsByName("zebra-surface-quality-radio");
      for (var i = 0; i < radioButtons.length; i++){
        if(radioButtons[i].checked) {             
          layer.options.surfaceQuality = radioButtons[i].value;
          var modals = layer.options.sheetModalsTBD;
          modals.shift();
          layer.options.sheetModalsTBD = modals;
          var points = localStorage.currentCrosswalkPoints;
          points = parseInt(points) + 1;

          document.getElementById("zebra-surface-quality-radio-1").checked = false;
          document.getElementById("zebra-surface-quality-radio-2").checked = false;
          document.getElementById("zebra-surface-quality-radio-3").checked = false;
          document.getElementById("zebra-surface-quality-radio-4").checked = false;

          localStorage.setItem("currentCrosswalkPoints", points);
          //TBD funkcia save sidewalk data
          saveZebraDataToDB();
          showAlertDone();
          app.sheet.close(".sheet-zebra-surface-quality", false);
          return;
}
}
alert("Vyberte prosím kvalitu povrchu chodníku.");
} 
});
}

function skipZebraSurfaceQuality() {
  mymap.eachLayer(function (layer) { 
    if (layer.options.backendID == localStorage.currentClickedZebraId) {

      layer.options.surfaceQuality = "nezadano";
      var modals = layer.options.sheetModalsTBD;
      modals.shift();
      layer.options.sheetModalsTBD = modals;
      document.getElementById("zebra-surface-quality-radio-1").checked = false;
      document.getElementById("zebra-surface-quality-radio-2").checked = false;
      document.getElementById("zebra-surface-quality-radio-3").checked = false;
      document.getElementById("zebra-surface-quality-radio-4").checked = false;
      saveZebraDataToDB();
      showAlertDone();
    } 
  });
}

function saveZebraDataToDB() {

//save to DB
mymap.eachLayer(function (layer) { 
  if (layer.options.backendID == localStorage.currentClickedZebraId) {
    var object = layer.options.object;
    object.zebra.numberOfStripes = layer.options.numberOfStripes;
    object.zebra.guidingStripe = layer.options.guidingStripe;
    object.zebra.lightSignal = layer.options.lightSignal;
    object.zebra.audioSignal = layer.options.audioSignal;
    object.zebra.button = layer.options.button;
    object.zebra.surfaceType = layer.options.surfaceType;
    object.zebra.zebraType = layer.options.zebraType;
    object.zebra.surfaceQuality = layer.options.surfaceQuality;
    
    var modals = layer.options.sheetModalsTBD;
    var id = object.id;

    mymap.removeLayer(layer);

    if(document.getElementById("layers-corners-checkbox").checked){
      mymap.addLayer(cornerMarkers);
    }
    if(document.getElementById("layers-sidewalks-checkbox").checked){
      mymap.addLayer(sidewalkMarkers);
    }
    if (document.getElementById("layers-crosswalks-checkbox").checked){
      mymap.addLayer(crosswalkMarkers);
    }

    document.getElementById("submenu-home").style.visibility = "visible";

    fetch(serverAddress + "/api/crosswalk/" + id + "/" + localStorage.username + "?count=" + localStorage.currentCrosswalkPoints, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(object)
    })
    .then((res) => res.json())
    .then((data) => console.log(data))


    if (modals.length == 0){
      crosswalkMarkers.removeLayer(layer);
    }
  } else if (layer.options.id == localStorage.currentZebraPolyline){
      mymap.removeLayer(layer);
  } 
});

}

//SIDEWALKS
function setVicinityLeft() {
  mymap.eachLayer(function (layer) { 
    if (layer.options.backendID == localStorage.currentClickedSidewalkId) {
      var radioButtons = document.getElementsByName("sidewalk-vicinity-left-radio");
      for (var i = 0; i < radioButtons.length; i++){
        if(radioButtons[i].checked) {             
          layer.options.leftSurroundings = radioButtons[i].value;
          var modals = layer.options.sheetModalsTBD;
          modals.shift();
          layer.options.sheetModalsTBD = modals;
          var points = localStorage.currentSidewalkPoints;
          points = parseInt(points) + 1;
          document.getElementById("sidewalk-vicinity-left-radio-1").checked = false;
          document.getElementById("sidewalk-vicinity-left-radio-2").checked = false;
          document.getElementById("sidewalk-vicinity-left-radio-3").checked = false;
          document.getElementById("sidewalk-vicinity-left-radio-4").checked = false;
          localStorage.setItem("currentSidewalkPoints", points);
          app.sheet.close(".sheet-sidewalk-vicinity-left", false);
          app.sheet.open(".sheet-sidewalk-surface-type", false);
          return;
        }
      }
      alert("Vyplnte prosím okolí chodníku.");
    } 
  });
}

function skipVicinityLeft() {
  mymap.eachLayer(function (layer) { 
    if (layer.options.backendID == localStorage.currentClickedSidewalkId) {
      layer.options.leftSurroundings = "nezadano";
      var modals = layer.options.sheetModalsTBD;
      modals.shift();
      layer.options.sheetModalsTBD = modals;
      document.getElementById("sidewalk-vicinity-left-radio-1").checked = false;
      document.getElementById("sidewalk-vicinity-left-radio-2").checked = false;
      document.getElementById("sidewalk-vicinity-left-radio-3").checked = false;
      document.getElementById("sidewalk-vicinity-left-radio-4").checked = false;
    } 
  });
}

function setVicinityRight() {
  mymap.eachLayer(function (layer) { 
    if (layer.options.backendID == localStorage.currentClickedSidewalkId) {
      var radioButtons = document.getElementsByName("sidewalk-vicinity-right-radio");
      for (var i = 0; i < radioButtons.length; i++){
        if(radioButtons[i].checked) {             
          layer.options.rightSurroundings = radioButtons[i].value;
          var modals = layer.options.sheetModalsTBD;
          modals.shift();
          layer.options.sheetModalsTBD = modals;
          var points = localStorage.currentSidewalkPoints;
          points = parseInt(points) + 1;
          document.getElementById("sidewalk-vicinity-right-radio-1").checked = false;
          document.getElementById("sidewalk-vicinity-right-radio-2").checked = false;
          document.getElementById("sidewalk-vicinity-right-radio-3").checked = false;
          document.getElementById("sidewalk-vicinity-right-radio-4").checked = false;
          localStorage.setItem("currentSidewalkPoints", points);
          app.sheet.close(".sheet-sidewalk-vicinity-right", false);
          app.sheet.open(".sheet-sidewalk-vicinity-left", false);
          return;
        }
      }
      alert("Vyberte prosím okolí chodníku.");
    } 
  });
}

function skipVicinityRight() {
  mymap.eachLayer(function (layer) { 
    if (layer.options.backendID == localStorage.currentClickedSidewalkId) {           
      layer.options.rightSurroundings = "nezadano";
      var modals = layer.options.sheetModalsTBD;
      modals.shift();
      layer.options.sheetModalsTBD = modals;
      document.getElementById("sidewalk-vicinity-right-radio-1").checked = false;
      document.getElementById("sidewalk-vicinity-right-radio-2").checked = false;
      document.getElementById("sidewalk-vicinity-right-radio-3").checked = false;
      document.getElementById("sidewalk-vicinity-right-radio-4").checked = false;
    } 
  });
}

function setPassableWidth() {
  mymap.eachLayer(function (layer) { 
    if (layer.options.backendID == localStorage.currentClickedSidewalkId) {
      var radioButtons = document.getElementsByName("sidewalk-width-radio");
      for (var i = 0; i < radioButtons.length; i++){
        if(radioButtons[i].checked) {             
          var type = radioButtons[i].value;
          if (type == "meter"){
            var optionsMeter = document.getElementsByClassName("meter-units");
            var inputMeter = document.getElementById("sidewalk-width-input-meter").value;
            for (var i = 0; i < optionsMeter.length; i++){
              if(optionsMeter[i].selected){
                if(inputMeter != null && inputMeter != ""){
                  var value = optionsMeter[i].value * inputMeter;
                  layer.options.passableWidth = value;
                  var modals = layer.options.sheetModalsTBD;
                  modals.shift();
                  layer.options.sheetModalsTBD = modals;
                  var points = localStorage.currentSidewalkPoints;
                  points = parseInt(points) + 1;
                  document.getElementById("sidewalk-width-radio-1").checked = false;
                  document.getElementById("sidewalk-width-radio-2").checked = false;
                  document.getElementById("sidewalk-width-radio-3").checked = false;
                  document.getElementById("sidewalk-width-input-meter").value = "";
                  var inputdiv = document.getElementById("sidewalk-width-div-meter");
                  inputdiv.style.display = 'none';
                  localStorage.setItem("currentSidewalkPoints", points);
                  app.sheet.close(".sheet-sidewalk-width", false);
                  app.sheet.open(".sheet-sidewalk-vicinity-right", false);
                  return;
                }
              }
            }


          } else if (type == "card"){
            var optionsCard = document.getElementsByClassName("card-units");
            var inputCard = document.getElementById("sidewalk-width-input-card").value;
            for (var i = 0; i < optionsCard.length; i++){
              if(optionsCard[i].selected){
                if(inputCard != null && inputCard != ""){
                  var value = optionsCard[i].value * inputCard;
                  layer.options.passableWidth = value;
                  var modals = layer.options.sheetModalsTBD;
                  modals.shift();
                  layer.options.sheetModalsTBD = modals;
                  var points = localStorage.currentSidewalkPoints;
                  points = parseInt(points) + 1;
                  document.getElementById("sidewalk-width-radio-1").checked = false;
                  document.getElementById("sidewalk-width-radio-2").checked = false;
                  document.getElementById("sidewalk-width-radio-3").checked = false;
                  document.getElementById("sidewalk-width-input-card").value = "";
                  var inputdiv = document.getElementById("sidewalk-width-div-creditcard");
                  inputdiv.style.display = 'none';
                  localStorage.setItem("currentSidewalkPoints", points);
                  app.sheet.close(".sheet-sidewalk-width", false);
                  app.sheet.open(".sheet-sidewalk-vicinity-right", false);
                  return;
                }
              }
            }

          } else if (type == "feet"){
            var optionsFeet = document.getElementsByClassName("feet-units");
            var inputFeet = document.getElementById("sidewalk-width-input-feet").value;
            for (var i = 0; i < optionsFeet.length; i++){
              if(optionsFeet[i].selected){
                if(inputFeet != null && inputFeet != ""){
                  var value = optionsFeet[i].value * inputFeet;
                  layer.options.passableWidth = value;
                  var modals = layer.options.sheetModalsTBD;
                  modals.shift();
                  layer.options.sheetModalsTBD = modals;
                  var points = localStorage.currentSidewalkPoints;
                  points = parseInt(points) + 1;
                  document.getElementById("sidewalk-width-radio-1").checked = false;
                  document.getElementById("sidewalk-width-radio-2").checked = false;
                  document.getElementById("sidewalk-width-radio-3").checked = false;
                  document.getElementById("sidewalk-width-input-feet").value = "";
                  var inputdiv = document.getElementById("sidewalk-width-div-feet");
                  inputdiv.style.display = 'none';
                  localStorage.setItem("currentSidewalkPoints", points);
                  app.sheet.close(".sheet-sidewalk-width", false);
                  app.sheet.open(".sheet-sidewalk-vicinity-right", false);
                  return;
                }
              }
            }

          }

        }
        
      }
      alert("Zadejte prosím přechodnou šířku.");
    } 
  });
}

function skipPassableWidth() {
  mymap.eachLayer(function (layer) { 
    if (layer.options.backendID == localStorage.currentClickedSidewalkId) {

      layer.options.passableWidth = -1;
      var modals = layer.options.sheetModalsTBD;
      modals.shift();
      layer.options.sheetModalsTBD = modals;
      document.getElementById("sidewalk-width-radio-1").checked = false;
      document.getElementById("sidewalk-width-radio-2").checked = false;
      document.getElementById("sidewalk-width-radio-3").checked = false;
      document.getElementById("sidewalk-width-input-feet").value = "";
      document.getElementById("sidewalk-width-input-card").value = "";
      document.getElementById("sidewalk-width-input-meter").value = "";
      var div1 = document.getElementById("sidewalk-width-div-meter");
      var div2 = document.getElementById("sidewalk-width-div-creditcard");
      var div3 = document.getElementById("sidewalk-width-div-feet");
      div1.style.display = 'none';
      div2.style.display = 'none';
      div3.style.display = 'none';
    } 
  });
}

function setSlope() {
  mymap.eachLayer(function (layer) { 
    if (layer.options.backendID == localStorage.currentClickedSidewalkId) {

      var buttonYES = document.getElementById("sidewalk-slope-yes");
      var buttonNO = document.getElementById("sidewalk-slope-no");

      if(buttonYES.classList.contains("toggle-button-active")){
        var checkboxUpSlope = document.getElementById("sidewalk-input-up-slope");
        var checkboxDownSlope = document.getElementById("sidewalk-input-down-slope");
        var checkboxSideSlope = document.getElementById("sidewalk-input-side-slope");
        var isUp = false;
        var isDown = false;
        var isSide = false;

        if (checkboxUpSlope.checked) {    
          isUp = true;
        }
        if (checkboxDownSlope.checked) {
          isDown = true;
        }
        if (checkboxSideSlope.checked) {
          isSide = true;
        }

        if(isUp==true || isDown==true || isSide==true){
          layer.options.slope = "isUp:" + isUp + ", isDown:" + isDown + ", isSide:" + isSide;
         
          var modals = layer.options.sheetModalsTBD;
          modals.shift();
          layer.options.sheetModalsTBD = modals;
          var points = localStorage.currentSidewalkPoints;
          points = parseInt(points) + 1;
          checkboxUpSlope.checked = false;
          checkboxDownSlope.checked = false;
          checkboxSideSlope.checked = false;
          
          document.getElementById("sidewalk-slope-no").style = "background-color: #fff; color: #007aff;"
          document.getElementById("sidewalk-slope-yes").style = "background-color: #fff; color: #007aff;"
          var div = document.getElementById("sidewalk-slope-div");
          var title = document.getElementById("sidewalk-slope-div-title");
          div.style.display = 'none';
          title.style.display = "none";
          document.getElementById("sidewalk-slope-yes").classList.remove("toggle-button-active");
          document.getElementById("sidewalk-slope-no").classList.remove("toggle-button-active");

          localStorage.setItem("currentSidewalkPoints", points);
          app.sheet.close(".sheet-sidewalk-slope", false);
          app.sheet.open(".sheet-sidewalk-width", false);
          return;
        }
        alert("Vyberte prosím typ sklonu.");

      } else if (buttonNO.classList.contains("toggle-button-active")){
        layer.options.slope = "isUp:false, isDown:false, isSide:false";
        var modals = layer.options.sheetModalsTBD;
        modals.shift();
        layer.options.sheetModalsTBD = modals;
        var points = localStorage.currentSidewalkPoints;
        points = parseInt(points) + 1;
        
        document.getElementById("sidewalk-slope-no").style = "background-color: #fff; color: #007aff;"
        document.getElementById("sidewalk-slope-yes").style = "background-color: #fff; color: #007aff;"
        var div = document.getElementById("sidewalk-slope-div");
        var title = document.getElementById("sidewalk-slope-div-title");
        div.style.display = 'none';
        title.style.display = "none";
        document.getElementById("sidewalk-slope-yes").classList.remove("toggle-button-active");
        document.getElementById("sidewalk-slope-no").classList.remove("toggle-button-active");

        localStorage.setItem("currentSidewalkPoints", points);
        app.sheet.close(".sheet-sidewalk-slope", false);
        app.sheet.open(".sheet-sidewalk-width", false);
        return;
      } else {
        alert("Zadejte prosím, zda se na chodníku náchází sklon.");
      }
    } 
  });
}

function skipSlope() {
  mymap.eachLayer(function (layer) { 
    if (layer.options.backendID == localStorage.currentClickedSidewalkId) {
      layer.options.slope = "nezadano";
      var modals = layer.options.sheetModalsTBD;
      modals.shift();
      layer.options.sheetModalsTBD = modals;
      document.getElementById("sidewalk-input-up-slope").checked = false;
      document.getElementById("sidewalk-input-down-slope").checked = false;
      document.getElementById("sidewalk-input-side-slope").checked = false;
      document.getElementById("sidewalk-slope-no").style = "background-color: #fff; color: #007aff;"
      document.getElementById("sidewalk-slope-yes").style = "background-color: #fff; color: #007aff;"
      var div = document.getElementById("sidewalk-slope-div");
      var title = document.getElementById("sidewalk-slope-div-title");
      div.style.display = 'none';
      title.style.display = "none";
      document.getElementById("sidewalk-slope-yes").classList.remove("toggle-button-active");
      document.getElementById("sidewalk-slope-no").classList.remove("toggle-button-active");
    } 
  });
}

function setSidewalkSurfaceType() {
  mymap.eachLayer(function (layer) { 
    if (layer.options.backendID == localStorage.currentClickedSidewalkId) {
      var radioButtons = document.getElementsByName("sidewalk-surface-type-radio");
      for (var i = 0; i < radioButtons.length; i++){
        if(radioButtons[i].checked) {             
          layer.options.surfaceType = radioButtons[i].value;
          var modals = layer.options.sheetModalsTBD;
          modals.shift();
          layer.options.sheetModalsTBD = modals;
          var points = localStorage.currentSidewalkPoints;
          points = parseInt(points) + 1;

          document.getElementById("sidewalk-surface-type-radio-1").checked = false;
          document.getElementById("sidewalk-surface-type-radio-2").checked = false;
          document.getElementById("sidewalk-surface-type-radio-3").checked = false;
          document.getElementById("sidewalk-surface-type-radio-4").checked = false;
          document.getElementById("sidewalk-surface-type-radio-5").checked = false;

          localStorage.setItem("currentSidewalkPoints", points);
          app.sheet.close(".sheet-sidewalk-surface-type", false);
          app.sheet.open(".sheet-sidewalk-surface-quality", false);
          return;
        }
      }
      alert("Vyberte prosím typ povrchu chodníku.");
    } 
  });
}

function skipSidewalkSurfaceType() {
  mymap.eachLayer(function (layer) { 
    if (layer.options.backendID == localStorage.currentClickedSidewalkId) {

      layer.options.surfaceType = "nezadano";
      var modals = layer.options.sheetModalsTBD;
      modals.shift();
      layer.options.sheetModalsTBD = modals;

      document.getElementById("sidewalk-surface-type-radio-1").checked = false;
      document.getElementById("sidewalk-surface-type-radio-2").checked = false;
      document.getElementById("sidewalk-surface-type-radio-3").checked = false;
      document.getElementById("sidewalk-surface-type-radio-4").checked = false;
      document.getElementById("sidewalk-surface-type-radio-5").checked = false;

    } 
  });
}

function setSidewalkSurfaceQuality() {
  mymap.eachLayer(function (layer) { 
    if (layer.options.backendID == localStorage.currentClickedSidewalkId) {
      var radioButtons = document.getElementsByName("sidewalk-surface-quality-radio");
      for (var i = 0; i < radioButtons.length; i++){
        if(radioButtons[i].checked) {             
          layer.options.surfaceQuality = radioButtons[i].value;
          var modals = layer.options.sheetModalsTBD;
          modals.shift();
          layer.options.sheetModalsTBD = modals;
          var points = localStorage.currentSidewalkPoints;
          points = parseInt(points) + 1;
          document.getElementById("sidewalk-surface-quality-radio-1").checked = false;
          document.getElementById("sidewalk-surface-quality-radio-2").checked = false;
          document.getElementById("sidewalk-surface-quality-radio-3").checked = false;
          document.getElementById("sidewalk-surface-quality-radio-4").checked = false;
          localStorage.setItem("currentSidewalkPoints", points);
          saveSidewalkDataToDB();
          app.sheet.close(".sheet-sidewalk-surface-quality", false);
          showAlertDone();
          return;
        }
      }
      alert("Vyberte prosím kvalitu povrchu chodníku.");
    } 
  });
}

function skipSidewalkSurfaceQuality() {
  mymap.eachLayer(function (layer) { 
    if (layer.options.backendID == localStorage.currentClickedSidewalkId) {
      layer.options.surfaceQuality = "nezadano";
      var modals = layer.options.sheetModalsTBD;
      modals.shift();
      layer.options.sheetModalsTBD = modals;
      document.getElementById("sidewalk-surface-quality-radio-1").checked = false;
      document.getElementById("sidewalk-surface-quality-radio-2").checked = false;
      document.getElementById("sidewalk-surface-quality-radio-3").checked = false;
      document.getElementById("sidewalk-surface-quality-radio-4").checked = false;
      saveSidewalkDataToDB();
      showAlertDone();
    } 
  });
}

function exitCornerShape(){

  document.getElementById("submenu-home").style.visibility = "visible";

  mymap.eachLayer(function (layer) { 
    
  if (layer.options.backendID == localStorage.currentClickedCornerId){

      mymap.removeLayer(layer);

      if(document.getElementById("layers-corners-checkbox").checked){
        mymap.addLayer(cornerMarkers);
      }
      if(document.getElementById("layers-sidewalks-checkbox").checked){
        mymap.addLayer(sidewalkMarkers);
      }
      if (document.getElementById("layers-crosswalks-checkbox").checked){
        mymap.addLayer(crosswalkMarkers);
      }
    }
    
  });
}

function saveSidewalkDataToDB(){

mymap.eachLayer(function (layer) { 
  if (layer.options.backendID == localStorage.currentClickedSidewalkId) {
    var object = layer.options.object;
    object.type = layer.options.surfaceType;
    object.quality = layer.options.surfaceQuality;
    object.leftSurroundings = layer.options.leftSurroundings;
    object.rightSurroundings = layer.options.rightSurroundings;
    object.passableWidth = layer.options.passableWidth;
    object.slope = layer.options.slope;
    var modals = layer.options.sheetModalsTBD;
    var id = object.id;

    mymap.removeLayer(layer);

    if(document.getElementById("layers-corners-checkbox").checked){
      mymap.addLayer(cornerMarkers);
    }
    if(document.getElementById("layers-sidewalks-checkbox").checked){
      mymap.addLayer(sidewalkMarkers);
    }
    if (document.getElementById("layers-crosswalks-checkbox").checked){
      mymap.addLayer(crosswalkMarkers);
    }

    document.getElementById("submenu-home").style.visibility = "visible";
   
    fetch(serverAddress + "/api/sidewalk/" + id + "/" + localStorage.username + "?count=" + localStorage.currentSidewalkPoints, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(object)
    })
    .then((res) => res.json())
    .then((data) => console.log(data))


    if (modals.length == 0){
      sidewalkMarkers.removeLayer(layer);
    }
  } else if (layer.options.id == localStorage.currentSidewalkPolyline){
      mymap.removeLayer(layer);
  }
});
}


/// SIDEWALK FORM - START

var SidewalkHandler = function (){

  var radioButtonMeter = document.getElementById("sidewalk-card-meter");
  var radioButtonCreditcard = document.getElementById("sidewalk-card-creditcard");
  var radioButtonFeet = document.getElementById("sidewalk-card-feet");
  var toggleButtonSlopeYes = document.getElementById("sidewalk-slope-yes");
  var toggleButtonSlopeNo = document.getElementById("sidewalk-slope-no");

  if (radioButtonMeter != null) {
    radioButtonMeter.addEventListener('change', this._showMeterDiv, false);
  }

  if (radioButtonCreditcard != null) {
    radioButtonCreditcard.addEventListener('change', this._showCreditcardDiv, false);
  }

  if (radioButtonFeet != null) {
    radioButtonFeet.addEventListener('change', this._showFeetDiv, false);
  }

  if (toggleButtonSlopeYes != null) {
    toggleButtonSlopeYes.addEventListener('click', this._showSlopeDiv, false);
  }

  if (toggleButtonSlopeNo != null) {
    toggleButtonSlopeNo.addEventListener('click', this._hideSlopeDiv, false);
  }
}

SidewalkHandler.prototype._showMeterDiv = function() {
  var div1 = document.getElementById("sidewalk-width-div-meter");
  var div2 = document.getElementById("sidewalk-width-div-creditcard");
  var div3 = document.getElementById("sidewalk-width-div-feet");
  div1.style.display = 'flex';
  div2.style.display = 'none';
  div3.style.display = 'none';
}

SidewalkHandler.prototype._showCreditcardDiv = function() {
  var div1 = document.getElementById("sidewalk-width-div-meter");
  var div2 = document.getElementById("sidewalk-width-div-creditcard");
  var div3 = document.getElementById("sidewalk-width-div-feet");
  div1.style.display = 'none';
  div2.style.display = 'flex';
  div3.style.display = 'none';
}

SidewalkHandler.prototype._showFeetDiv = function() {
  var div1 = document.getElementById("sidewalk-width-div-meter");
  var div2 = document.getElementById("sidewalk-width-div-creditcard");
  var div3 = document.getElementById("sidewalk-width-div-feet");
  div1.style.display = 'none';
  div2.style.display = 'none';
  div3.style.display = 'flex';
}

SidewalkHandler.prototype._showSlopeDiv = function() {
  this.style = "background-color: #007aff; color: #fff;"
  document.getElementById("sidewalk-slope-no").style = "background-color: #fff; color: #007aff;"
  var div = document.getElementById("sidewalk-slope-div");
  var title = document.getElementById("sidewalk-slope-div-title");
  div.style.display = 'flex';
  title.style.display = "flex";
  document.getElementById("sidewalk-slope-yes").classList.add("toggle-button-active");
  document.getElementById("sidewalk-slope-no").classList.remove("toggle-button-active");
}

SidewalkHandler.prototype._hideSlopeDiv = function() {
  this.style = "background-color: #007aff; color: #fff;"
  document.getElementById("sidewalk-slope-yes").style = "background-color: #fff; color: #007aff;"
  var div = document.getElementById("sidewalk-slope-div");
  var title = document.getElementById("sidewalk-slope-div-title");
  div.style.display = 'none';
  title.style.display = "none";
  document.getElementById("sidewalk-slope-yes").classList.remove("toggle-button-active");
  document.getElementById("sidewalk-slope-no").classList.add("toggle-button-active");
}

sidewalkH = new SidewalkHandler();


/////PHOTOS BADGES
$$(document).on('page:init', '.page[data-name="photos"]', function () {
  loadPhotoBadges(); 
})

function loadPhotoBadges(){
  fetch(serverAddress + "/api/count/" + localStorage.username + "/all?fromImage=true")
  .then(response => response.json())
  .then(data => {
    var numbers = data;

    var cornerShapeNum = numbers.corners;
    var sidewalkSurfaceTypeNum = numbers.sidewalkType;
    var sidewalkSurfaceQualityNum = numbers.sidewalkQuality;
    var crosswalkLinesNum = numbers.numberOfStripes;
    var crosswalkSurfaceQualityNum = numbers.zebraSurfaceQuality;
    var crosswalkSurfaceTypeNum = numbers.zebraSurfaceType;
    var crosswalkTypeNum = numbers.zebraType;
    var crosswalkSemaforNum = numbers.semaphore;
    var crosswalkCurbNum = numbers.platformType;
    var crosswalkTactileNum = numbers.tactile;

    var cornerShapeBadge = document.getElementById("photo-corner-shape-badge")
    cornerShapeBadge.innerHTML = cornerShapeNum;
    if(cornerShapeNum == 0){
      document.getElementById("photo-corner-shape-link").href= "#";    
    } else {
      cornerShapeBadge.classList.add("color-red");
    }

    var crosswalkCurbBadge = document.getElementById("photo-crosswalk-curb-badge")
    crosswalkCurbBadge.innerHTML = crosswalkCurbNum;
    if(crosswalkCurbNum == 0){
      document.getElementById("photo-crosswalk-curb-link").href= "#";    
    } else {
      crosswalkCurbBadge.classList.add("color-red");
    }

    var crosswalkTactileBadge = document.getElementById("photo-crosswalk-tactile-badge")
    crosswalkTactileBadge.innerHTML = crosswalkTactileNum;
    if(crosswalkTactileNum == 0){
      document.getElementById("photo-crosswalk-tactile-link").href= "#";    
    } else {
      crosswalkTactileBadge.classList.add("color-red");
    }

    var crosswalkLinesBadge = document.getElementById("photo-crosswalk-lines-badge")
    crosswalkLinesBadge.innerHTML = crosswalkLinesNum;
    if(crosswalkLinesNum == 0){
      document.getElementById("photo-crosswalk-lines-link").href= "#";    
    } else {
      crosswalkLinesBadge.classList.add("color-red");
    }

    var crosswalkTypeBadge = document.getElementById("photo-crosswalk-type-badge")
    crosswalkTypeBadge.innerHTML = crosswalkTypeNum;
    if(crosswalkTypeNum == 0){
      document.getElementById("photo-crosswalk-type-link").href= "#";    
    } else {
      crosswalkTypeBadge.classList.add("color-red");
    }

    var crosswalkSemaforBadge = document.getElementById("photo-crosswalk-semafor-badge")
    crosswalkSemaforBadge.innerHTML = crosswalkSemaforNum;
    if(crosswalkSemaforNum == 0){
      document.getElementById("photo-crosswalk-semafor-link").href= "#";    
    } else {
      crosswalkSemaforBadge.classList.add("color-red");
    }

    var crosswalkSurfaceTypeBadge = document.getElementById("photo-crosswalk-surface-type-badge")
    crosswalkSurfaceTypeBadge.innerHTML = crosswalkSurfaceTypeNum;
    if(crosswalkSurfaceTypeNum == 0){
      document.getElementById("photo-crosswalk-surface-type-link").href= "#";    
    } else {
      crosswalkSurfaceTypeBadge.classList.add("color-red");
    }

    var crosswalkSurfaceQualityBadge = document.getElementById("photo-crosswalk-surface-quality-badge")
    crosswalkSurfaceQualityBadge.innerHTML = crosswalkSurfaceQualityNum;
    if(crosswalkSurfaceQualityNum == 0){
      document.getElementById("photo-crosswalk-surface-quality-link").href= "#";    
    } else {
      crosswalkSurfaceQualityBadge.classList.add("color-red");
    }

    var sidewalkSurfaceTypeBadge = document.getElementById("photo-sidewalk-surface-type-badge")
    sidewalkSurfaceTypeBadge.innerHTML = sidewalkSurfaceTypeNum;
    if(sidewalkSurfaceTypeNum == 0){
      document.getElementById("photo-sidewalk-surface-type-link").href= "#";    
    } else {
      sidewalkSurfaceTypeBadge.classList.add("color-red");
    }

    var sidewalkSurfaceQualityBadge = document.getElementById("photo-sidewalk-surface-quality-badge")
    sidewalkSurfaceQualityBadge.innerHTML = sidewalkSurfaceQualityNum;
    if(sidewalkSurfaceQualityNum == 0){
      document.getElementById("photo-sidewalk-surface-quality-link").href= "#";    
    } else {
      sidewalkSurfaceQualityBadge.classList.add("color-red");
    }

  }); 
}


/////PHOTOS CORNER SHAPE START
var cornerShapePhotosArray = [];
var cornerPhotosDATA;
var cornerShapeIndex = 0;

function getCornerShapePhotos() {
  //get data where cornerSource == photo && mapped==false
  fetch(serverAddress + "/api/corner/" + localStorage.username + "?fromImage=true")
  .then(response => response.json())
  .then(data => {
    cornerPhotosDATA = data;
    //localStorage.setItem("currentClickedPhotoCornerObject", JSON.stringify(cornerPhotosDATA[0]));
    
    for (var i = 0; i < cornerPhotosDATA.length; i++) {
        var corner = cornerPhotosDATA[i];
        var imageName = corner.imageName;
        cornerShapePhotosArray.push(imageName);
    }
    var img = document.getElementById("photos-corner-shape-img");
    if (img != null) {
      img.src = imageServer + "/images/corners/" + cornerShapePhotosArray[0];
    }
    cornerShapePhotosArray.shift();
  });  

}


function submitPhotoCornerType() {
  
  var object = cornerPhotosDATA[cornerShapeIndex];  
  var radioButtons = document.getElementsByName("corner-photo-shape-radio");
  for (var i = 0; i < radioButtons.length; i++){
    if(radioButtons[i].checked) {             
      object.shape = radioButtons[i].value;
      var id = object.id;

      fetch(serverAddress + "/api/corner/" + id + "/" + localStorage.username + "?count=1", {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
          },
        body: JSON.stringify(object)
      })
      .then((res) => res.json())
      .then((data) => console.log(data))

  if (cornerShapePhotosArray.length == 0) {
    var a = document.getElementById('photos-corner-shape-submit-button');
    a.href = "/photos/";
    a.removeAttribute("onclick");
    a.click();
    showAlertPhotoDone();
    return;

  } else {
      document.getElementById("corner-photo-type-radio-1").checked = false;
      document.getElementById("corner-photo-type-radio-2").checked = false;
      document.getElementById("corner-photo-type-radio-3").checked = false;
    var img = document.getElementById("photos-corner-shape-img");
    if (img != null) {
      img.src = imageServer + "/images/corners/" + cornerShapePhotosArray[0];
    }
    cornerShapePhotosArray.shift();
    cornerShapeIndex = cornerShapeIndex + 1;
    return;
  }

      
    }
  }
  alert("Vyberte prosím tvar rohu."); 
}

function skipPhotoCornerType() {
    var object = cornerPhotosDATA[cornerShapeIndex];            
    object.shape = "nezadano";
    var id = object.id;

    fetch(serverAddress + "/api/corner/" + id + "/" + localStorage.username + "?count=0", {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
        },
      body: JSON.stringify(object)
    })
    .then((res) => res.json())
    .then((data) => console.log(data))



  if (cornerShapePhotosArray.length == 0) {
   var a = document.getElementById('photos-corner-shape-skip-button');
    a.href = "/photos/";
    a.removeAttribute("onclick");
    a.click();
    showAlertPhotoDone();
  return;

  } else {
    document.getElementById("corner-photo-type-radio-1").checked = false;
    document.getElementById("corner-photo-type-radio-2").checked = false;
    document.getElementById("corner-photo-type-radio-3").checked = false;
    var img = document.getElementById("photos-corner-shape-img");
    if (img != null) {
      img.src = imageServer + "/images/corners/" + cornerShapePhotosArray[0];
    }
    cornerShapePhotosArray.shift();
    cornerShapeIndex = cornerShapeIndex + 1;
  }

}

/////PHOTOS CROSSWALK CURB
var crosswalkCurbPhotosArray = [];
var crosswalkCurbPhotosDATA;
var crosswalkCurbIndex = 0;

function getCrosswalkCurbPhotos() {
//get data where cornerSource == photo && mapped==false
fetch(serverAddress + "/api/crosswalk/" + localStorage.username + "?attribute=platformType&fromImage=true")
.then(response => response.json())
.then(data => {
  crosswalkCurbPhotosDATA = data;
  
  for (var i = 0; i < crosswalkCurbPhotosDATA.length; i++) {
    var crosswalk = crosswalkCurbPhotosDATA[i];
    var imageName = crosswalk.imageName;
    crosswalkCurbPhotosArray.push(imageName);
  }

  var img = document.getElementById("photos-crosswalk-curb-img");
  if (img != null) {
    img.src = imageServer + "/images/crosswalks/" + crosswalkCurbPhotosArray[0];
  }
    crosswalkCurbPhotosArray.shift();
});  

}


function submitPhotoCrosswalkCurb() {
  var object = crosswalkCurbPhotosDATA[crosswalkCurbIndex];
  var radioButtons = document.getElementsByName("photos-crosswalk-curb-radio");
  for (var i = 0; i < radioButtons.length; i++){
    if(radioButtons[i].checked) {             
      object.endPlatform.platformType = radioButtons[i].value;
      object.startPlatform.platformType = radioButtons[i].value;
      var id = object.id;

      fetch(serverAddress + "/api/crosswalk/" + id + "/" + localStorage.username + "?count=1", {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(object)
      })
      .then((res) => res.json())
      .then((data) => console.log(data))

      if (crosswalkCurbPhotosArray.length == 0) {
         var a = document.getElementById('photos-crosswalk-curb-submit-button');
          a.href = "/photos/";
          a.removeAttribute("onclick");
          a.click();
          showAlertPhotoDone();
        return;

      } else {
        document.getElementById("crosswalk-photo-curb-radio-1").checked = false;
        document.getElementById("crosswalk-photo-curb-radio-2").checked = false;
        var img = document.getElementById("photos-crosswalk-curb-img");
        if (img != null) {
          img.src = imageServer + "/images/crosswalks/" + crosswalkCurbPhotosArray[0];
        }
        crosswalkCurbPhotosArray.shift();
        crosswalkCurbIndex = crosswalkCurbIndex + 1;
        return;
      }
    }
  }
  alert("Vyberte prosím typ nájezdu na přechod."); 
}

function skipPhotoCrosswalkCurb() {
  var object = crosswalkCurbPhotosDATA[crosswalkCurbIndex];          
  object.endPlatform.platformType = "nezadano";
  object.startPlatform.platformType = "nezadano";
  var id = object.id;

  fetch(serverAddress + "/api/crosswalk/" + id + "/" + localStorage.username + "?count=0", {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(object)
  })
  .then((res) => res.json())
  .then((data) => console.log(data))

  if (crosswalkCurbPhotosArray.length == 0) {
    var a = document.getElementById('photos-crosswalk-curb-skip-button');
     a.href = "/photos/";
     a.removeAttribute("onclick");
     a.click();
     showAlertPhotoDone();
    return;

  } else {
    document.getElementById("crosswalk-photo-curb-radio-1").checked = false;
    document.getElementById("crosswalk-photo-curb-radio-2").checked = false;
    var img = document.getElementById("photos-crosswalk-curb-img");
    if (img != null) {
      img.src = imageServer + "/images/crosswalks/" + crosswalkCurbPhotosArray[0];
    }
    crosswalkCurbPhotosArray.shift();
    crosswalkCurbIndex = crosswalkCurbIndex + 1;
  }
}

/////PHOTOS CROSSWALK SEMAFOR
var crosswalkSemaforPhotosArray = [];
var crosswalkSemaforPhotosDATA;
var crosswalkSemaforIndex = 0;

function getCrosswalkSemaforPhotos() {
//get data where cornerSource == photo && mapped==false
fetch(serverAddress + "/api/crosswalk/" + localStorage.username + "?attribute=semaphore&fromImage=true")
.then(response => response.json())
.then(data => {
  crosswalkSemaforPhotosDATA = data;
  for (var i = 0; i < crosswalkSemaforPhotosDATA.length; i++) {
    var crosswalk = crosswalkSemaforPhotosDATA[i];
    var imageName = crosswalk.imageName;
    crosswalkSemaforPhotosArray.push(imageName);
  }
  var img = document.getElementById("photos-crosswalk-semafor-img");
  if (img != null) {
    img.src = imageServer + "/images/crosswalks/" + crosswalkSemaforPhotosArray[0];
  }
  crosswalkSemaforPhotosArray.shift();

});  

}

function submitPhotoCrosswalkSemafor() {
      var object = crosswalkSemaforPhotosDATA[crosswalkSemaforIndex];
  
      var checkboxSemafor = document.getElementById("crosswalk-photo-semafor-checkbox-semafor");
      var checkboxAudio= document.getElementById("crosswalk-photo-semafor-checkbox-audio");
      var checkboxSignal = document.getElementById("crosswalk-photo-semafor-checkbox-signal");

      object.zebra.lightSignal = "false";
      object.zebra.audioSignal = "false";
      object.zebra.button = "false";

      if (checkboxSemafor.checked) {
        object.zebra.lightSignal = "true";
      }
      if (checkboxAudio.checked) {
        object.zebra.audioSignal = "true";
      }
      if (checkboxSignal.checked) {
        object.zebra.button = "true";
      }

      var id = object.id;

      fetch(serverAddress + "/api/crosswalk/" + id + "/" + localStorage.username + "?count=1", {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(object)
      })
      .then((res) => res.json())
      .then((data) => console.log(data))

      if (crosswalkSemaforPhotosArray.length == 0) {
        var a = document.getElementById('photos-crosswalk-semafor-submit-button');
        a.href = "/photos/";
        a.removeAttribute("onclick");
        a.click();
        showAlertPhotoDone();
        return;

      } else {
        document.getElementById("crosswalk-photo-semafor-checkbox-semafor").checked = false;
        document.getElementById("crosswalk-photo-semafor-checkbox-audio").checked = false;
        document.getElementById("crosswalk-photo-semafor-checkbox-signal").checked = false;
        var img = document.getElementById("photos-crosswalk-semafor-img");
        if (img != null) {
          img.src = imageServer + "/images/crosswalks/" + crosswalkSemaforPhotosArray[0];
        }
        crosswalkSemaforPhotosArray.shift();
        crosswalkSemaforIndex = crosswalkSemaforIndex + 1;
        return;
      }
     
}

function skipPhotoCrosswalkSemafor() {
  var object = crosswalkSemaforPhotosDATA[crosswalkSemaforIndex];           
  object.zebra.lightSignal = "nezadano";
  object.zebra.audioSignal = "nezadano";
  object.zebra.button = "nezadano";
  var id = object.id;

  fetch(serverAddress + "/api/crosswalk/" + id + "/" + localStorage.username + "?count=0", {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(object)
  })
  .then((res) => res.json())
  .then((data) => console.log(data))

  if (crosswalkSemaforPhotosArray.length == 0) {
    var a = document.getElementById('photos-crosswalk-semafor-skip-button');
    a.href = "/photos/";
    a.removeAttribute("onclick");
    a.click();
    showAlertPhotoDone();
    return;

  } else {
    document.getElementById("crosswalk-photo-semafor-checkbox-semafor").checked = false;
    document.getElementById("crosswalk-photo-semafor-checkbox-audio").checked = false;
    document.getElementById("crosswalk-photo-semafor-checkbox-signal").checked = false;
    var img = document.getElementById("photos-crosswalk-semafor-img");
    if (img != null) {
      img.src = imageServer + "/images/crosswalks/" + crosswalkSemaforPhotosArray[0];
    }
    crosswalkSemaforPhotosArray.shift();
    crosswalkSemaforIndex = crosswalkSemaforIndex + 1;
  }
}


/////PHOTOS CROSSWALK SURFACE QUALITY
var crosswalkQualityPhotosArray = [];
var crosswalkQualityPhotosDATA;
var crosswalkQualityIndex = 0;

function getCrosswalkQualityPhotos() {
//get data where cornerSource == photo && mapped==false
fetch(serverAddress + "/api/crosswalk/" + localStorage.username + "?attribute=surfaceQuality&fromImage=true")
.then(response => response.json())
.then(data => {
  crosswalkQualityPhotosDATA = data;
  for (var i = 0; i < crosswalkQualityPhotosDATA.length; i++) {
    var crosswalk = crosswalkQualityPhotosDATA[i];
    var imageName = crosswalk.imageName;
    crosswalkQualityPhotosArray.push(imageName);
  }
  var img = document.getElementById("photos-crosswalk-surface-quality-img");
  if (img != null) {
    img.src = imageServer + "/images/crosswalks/" + crosswalkQualityPhotosArray[0];
  }
  crosswalkQualityPhotosArray.shift();
});  
}


function submitPhotoCrosswalkQuality() {
  var object = crosswalkQualityPhotosDATA[crosswalkQualityIndex]; 
  var radioButtons = document.getElementsByName("photos-crosswalk-surface-quality-radio");
  for (var i = 0; i < radioButtons.length; i++){
    if(radioButtons[i].checked) {             
      object.zebra.surfaceQuality = radioButtons[i].value;
      var id = object.id;

      fetch(serverAddress + "/api/crosswalk/" + id + "/" + localStorage.username + "?count=1", {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(object)
      })
      .then((res) => res.json())
      .then((data) => console.log(data))

      if (crosswalkQualityPhotosArray.length == 0) {
        var a = document.getElementById('photos-crosswalk-surface-quality-submit-button');
        a.href = "/photos/";
        a.removeAttribute("onclick");
        a.click();
        showAlertPhotoDone();
        return;

      } else {
        document.getElementById("crosswalk-photo-quality-radio-1").checked = false;
        document.getElementById("crosswalk-photo-quality-radio-2").checked = false;
        document.getElementById("crosswalk-photo-quality-radio-3").checked = false;
        document.getElementById("crosswalk-photo-quality-radio-4").checked = false;
        var img = document.getElementById("photos-crosswalk-surface-quality-img");
        if (img != null) {
          img.src = imageServer + "/images/crosswalks/" + crosswalkQualityPhotosArray[0];
        }
        crosswalkQualityPhotosArray.shift();
        crosswalkQualityIndex = crosswalkQualityIndex + 1;
        return;
      }
    }
  }
  alert("Vyberte prosím kvalitu zebry přechodu."); 
}

function skipPhotoCrosswalkQuality() {
  var object = crosswalkQualityPhotosDATA[crosswalkQualityIndex];;            
  object.zebra.surfaceQuality = "nezadano";
  var id = object.id;

  fetch(serverAddress + "/api/crosswalk/" + id + "/" + localStorage.username + "?count=0", {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(object)
  })
  .then((res) => res.json())
  .then((data) => console.log(data))

  if (crosswalkQualityPhotosArray.length == 0) {
    var a = document.getElementById('photos-crosswalk-surface-quality-skip-button');
        a.href = "/photos/";
        a.removeAttribute("onclick");
        a.click();
        showAlertPhotoDone();
    return;

  } else {
        document.getElementById("crosswalk-photo-quality-radio-1").checked = false;
        document.getElementById("crosswalk-photo-quality-radio-2").checked = false;
        document.getElementById("crosswalk-photo-quality-radio-3").checked = false;
        document.getElementById("crosswalk-photo-quality-radio-4").checked = false;
    var img = document.getElementById("photos-crosswalk-surface-quality-img");
    if (img != null) {
      img.src = imageServer + "/images/crosswalks/" + crosswalkQualityPhotosArray[0];
    }
    crosswalkQualityPhotosArray.shift();
    crosswalkQualityIndex = crosswalkQualityIndex + 1;
  }
}

/////PHOTOS CROSSWALK SURFACE TYPE
var crosswalkSurfTypePhotosArray = [];
var crosswalkSurfTypePhotosDATA;
var crosswalkSurfTypeIndex = 0;

function getCrosswalkSurfTypePhotos() {
//get data where cornerSource == photo && mapped==false
fetch(serverAddress + "/api/crosswalk/" + localStorage.username + "?attribute=surfaceType&fromImage=true")
.then(response => response.json())
.then(data => {
  crosswalkSurfTypePhotosDATA = data;
  for (var i = 0; i < crosswalkSurfTypePhotosDATA.length; i++) {
    var crosswalk = crosswalkSurfTypePhotosDATA[i];
    var imageName = crosswalk.imageName;
    crosswalkSurfTypePhotosArray.push(imageName);
  }
  var img = document.getElementById("photos-crosswalk-surface-type-img");
  if (img != null) {
    img.src = imageServer + "/images/crosswalks/" + crosswalkSurfTypePhotosArray[0];
  }
  crosswalkSurfTypePhotosArray.shift();
});  
}


function submitPhotoCrosswalkSurfType() {
  var object = crosswalkSurfTypePhotosDATA[crosswalkSurfTypeIndex];
  var radioButtons = document.getElementsByName("photos-crosswalk-surface-type-radio");
  for (var i = 0; i < radioButtons.length; i++){
    if(radioButtons[i].checked) {             
      object.zebra.surfaceType = radioButtons[i].value;
      var id = object.id;

      fetch(serverAddress + "/api/crosswalk/" + id + "/" + localStorage.username + "?count=1", {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(object)
      })
      .then((res) => res.json())
      .then((data) => console.log(data))

      if (crosswalkSurfTypePhotosArray.length == 0) {
        var a = document.getElementById('photos-crosswalk-surface-type-submit-button');
        a.href = "/photos/";
        a.removeAttribute("onclick");
        a.click();
        showAlertPhotoDone();
        return;

      } else {
        document.getElementById("crosswalk-photo-surface-type-radio-1").checked = false;
        document.getElementById("crosswalk-photo-surface-type-radio-2").checked = false;
        document.getElementById("crosswalk-photo-surface-type-radio-3").checked = false;
        document.getElementById("crosswalk-photo-surface-type-radio-4").checked = false;
        document.getElementById("crosswalk-photo-surface-type-radio-5").checked = false;
        var img = document.getElementById("photos-crosswalk-surface-type-img");
        if (img != null) {
          img.src = imageServer + "/images/crosswalks/" + crosswalkSurfTypePhotosArray[0];
        }
        crosswalkSurfTypePhotosArray.shift();
        crosswalkSurfTypeIndex = crosswalkSurfTypeIndex + 1;
        return;
      }
    }
  }
  alert("Vyberte prosím typ povrchu zebry přechodu."); 
}

function skipPhotoCrosswalkSurfType() {
  var object = crosswalkSurfTypePhotosDATA[crosswalkSurfTypeIndex];            
  object.zebra.surfaceType = "nezadano";
  var id = object.id;

  fetch(serverAddress + "/api/crosswalk/" + id + "/" + localStorage.username + "?count=1", {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(object)
  })
  .then((res) => res.json())
  .then((data) => console.log(data))

  if (crosswalkSurfTypePhotosArray.length == 0) {
    var a = document.getElementById('photos-crosswalk-surface-type-skip-button');
    a.href = "/photos/";
    a.removeAttribute("onclick");
    a.click();
    showAlertPhotoDone();
    return;

  } else {
        document.getElementById("crosswalk-photo-surface-type-radio-1").checked = false;
        document.getElementById("crosswalk-photo-surface-type-radio-2").checked = false;
        document.getElementById("crosswalk-photo-surface-type-radio-3").checked = false;
        document.getElementById("crosswalk-photo-surface-type-radio-4").checked = false;
        document.getElementById("crosswalk-photo-surface-type-radio-5").checked = false;
    var img = document.getElementById("photos-crosswalk-surface-type-img");
    if (img != null) {
      img.src = imageServer + "/images/crosswalks/" + crosswalkSurfTypePhotosArray[0];
    }
    crosswalkSurfTypePhotosArray.shift();
    crosswalkSurfTypeIndex = crosswalkSurfTypeIndex + 1;
  }
}

/////PHOTOS CROSSWALK TYPE
var crosswalkTypePhotosArray = [];
var crosswalkTypePhotosDATA;
var crosswalkTypeIndex = 0;

function getCrosswalkTypePhotos() {
//get data where cornerSource == photo && mapped==false
fetch(serverAddress + "/api/crosswalk/" + localStorage.username + "?attribute=zebraType&fromImage=true")
.then(response => response.json())
.then(data => {
  crosswalkTypePhotosDATA = data;
  for (var i = 0; i < crosswalkTypePhotosDATA.length; i++) {
    var crosswalk = crosswalkTypePhotosDATA[i];
    var imageName = crosswalk.imageName;
    crosswalkTypePhotosArray.push(imageName);
  }
  var img = document.getElementById("photos-crosswalk-type-img");
  if (img != null) {
    img.src = imageServer + "/images/crosswalks/" + crosswalkTypePhotosArray[0];
  }
  crosswalkTypePhotosArray.shift();
});  
}


function submitPhotoCrosswalkType() {
  var object = crosswalkTypePhotosDATA[crosswalkTypeIndex];
  var radioButtons = document.getElementsByName("photos-crosswalk-type-radio");
  for (var i = 0; i < radioButtons.length; i++){
    if(radioButtons[i].checked) {             
      object.zebra.zebraType = radioButtons[i].value;
      var id = object.id;

      fetch(serverAddress + "/api/crosswalk/" + id + "/" + localStorage.username + "?count=1", {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(object)
      })
      .then((res) => res.json())
      .then((data) => console.log(data))

      if (crosswalkTypePhotosArray.length == 0) {
        var a = document.getElementById('photos-crosswalk-type-submit-button');
        a.href = "/photos/";
        a.removeAttribute("onclick");
        a.click();
        showAlertPhotoDone();
        return;

      } else {
        document.getElementById("crosswalk-photo-type-radio-1").checked = false;
        document.getElementById("crosswalk-photo-type-radio-2").checked = false;
        document.getElementById("crosswalk-photo-type-radio-3").checked = false;
        var img = document.getElementById("photos-crosswalk-type-img");
        if (img != null) {
          img.src = imageServer + "/images/crosswalks/" + crosswalkTypePhotosArray[0];
        }
        crosswalkTypePhotosArray.shift();
        crosswalkTypeIndex = crosswalkTypeIndex + 1;
        return;
      }
    }
  }
  alert("Vyberte prosím typ povrchu zebry přechodu."); 
}

function skipPhotoCrosswalkType() {
  var object = crosswalkTypePhotosDATA[crosswalkTypeIndex];            
  object.zebra.zebraType = "nezadano";
  var id = object.id;

  fetch(serverAddress + "/api/crosswalk/" + id + "/" + localStorage.username + "?count=0", {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(object)
  })
  .then((res) => res.json())
  .then((data) => console.log(data))

  if (crosswalkTypePhotosArray.length == 0) {
    var a = document.getElementById('photos-crosswalk-type-skip-button');
    a.href = "/photos/";
    a.removeAttribute("onclick");
    a.click();
    showAlertPhotoDone();
    return;

  } else {
        document.getElementById("crosswalk-photo-type-radio-1").checked = false;
        document.getElementById("crosswalk-photo-type-radio-2").checked = false;
        document.getElementById("crosswalk-photo-type-radio-3").checked = false;
    var img = document.getElementById("photos-crosswalk-type-img");
    if (img != null) {
      img.src = imageServer + "/images/crosswalks/" + crosswalkTypePhotosArray[0];
    }
    crosswalkTypePhotosArray.shift();
    crosswalkTypeIndex = crosswalkTypeIndex + 1;
  }
}

////PHOTOS CROSSWALK TACTILE
var crosswalkTactilePhotosArray = [];
var crosswalkTactilePhotosDATA;
var crosswalkTactileIndex = 0;


function getCrosswalkTactilePhotos() {
//get data where cornerSource == photo && mapped==false
fetch(serverAddress + "/api/crosswalk/" + localStorage.username +"?attribute=tactile&fromImage=true")
.then(response => response.json())
.then(data => {
  crosswalkTactilePhotosDATA = data;
  for (var i = 0; i < crosswalkTactilePhotosDATA.length; i++) {
    var crosswalk = crosswalkTactilePhotosDATA[i];
    var imageName = crosswalk.imageName;
    crosswalkTactilePhotosArray.push(imageName);
  }

  var img = document.getElementById("photos-crosswalk-tactile-img");
  if (img != null) {
    img.src = imageServer + "/images/crosswalks/" + crosswalkTactilePhotosArray[0];
  }
  crosswalkTactilePhotosArray.shift();
});  
}

function submitPhotoCrosswalkTactile() {
  var object = crosswalkTactilePhotosDATA[crosswalkTactileIndex];
  
      var checkboxWarning = document.getElementById("crosswalk-photo-tactile-checkbox-warning");
      var checkboxSignal = document.getElementById("crosswalk-photo-tactile-checkbox-signal");
      var checkboxLeading = document.getElementById("crosswalk-photo-tactile-checkbox-leading");

      object.endPlatform.warningStripe = "false";
      object.startPlatform.warningStripe = "false";
      object.endPlatform.signalStripe = "false";
      object.startPlatform.signalStripe = "false";
      object.zebra.guidingStripe = "false";

      if (checkboxWarning.checked) {
        object.endPlatform.warningStripe = "true";
        object.startPlatform.warningStripe = "true";
      }
      if (checkboxSignal.checked) {
        object.endPlatform.signalStripe = "true";
        object.startPlatform.signalStripe = "true";
      }
      if (checkboxLeading.checked) {
         object.zebra.guidingStripe = "true";
      }

      var id = object.id;

      fetch(serverAddress + "/api/crosswalk/" + id + "/" + localStorage.username + "?count=1", {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(object)
      })
      .then((res) => res.json())
      .then((data) => console.log(data))

      if (crosswalkTactilePhotosArray.length == 0) {
        var a = document.getElementById('photos-crosswalk-tactile-submit-button');
        a.href = "/photos/";
        a.removeAttribute("onclick");
        a.click();
        showAlertPhotoDone();
        return;

      } else {
        document.getElementById("crosswalk-photo-tactile-checkbox-warning").checked = false;
        document.getElementById("crosswalk-photo-tactile-checkbox-signal").checked = false;
        document.getElementById("crosswalk-photo-tactile-checkbox-leading").checked = false;
        var img = document.getElementById("photos-crosswalk-tactile-img");
        if (img != null) {
          img.src = imageServer + "/images/crosswalks/" + crosswalkTactilePhotosArray[0];
        }
        crosswalkTactilePhotosArray.shift();
        crosswalkTactileIndex = crosswalkTactileIndex + 1;
        return;
      }
     
}

function skipPhotoCrosswalkTactile() {
  var object = crosswalkTactilePhotosDATA[crosswalkTactileIndex];            
  object.endPlatform.warningStripe = "nezadano";
  object.startPlatform.warningStripe = "nezadano";
  object.endPlatform.signalStripe = "nezadano";
  object.startPlatform.signalStripe = "nezadano";
  object.zebra.guidingStripe = "nezadano";
  var id = object.id;

  fetch(serverAddress + "/api/crosswalk/" + id + "/" + localStorage.username + "?count=0", {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(object)
  })
  .then((res) => res.json())
  .then((data) => console.log(data))

  if (crosswalkTactilePhotosArray.length == 0) {
    var a = document.getElementById('photos-crosswalk-tactile-skip-button');
    a.href = "/photos/";
    a.removeAttribute("onclick");
    a.click();
    showAlertPhotoDone();
    return;

  } else {
    document.getElementById("crosswalk-photo-tactile-checkbox-warning").checked = false;
    document.getElementById("crosswalk-photo-tactile-checkbox-signal").checked = false;
    document.getElementById("crosswalk-photo-tactile-checkbox-leading").checked = false;
    var img = document.getElementById("photos-crosswalk-tactile-img");
    if (img != null) {
      img.src = imageServer + "/images/crosswalks/" + crosswalkTactilePhotosArray[0];
    }
    crosswalkTactilePhotosArray.shift();
    crosswalkTactileIndex = crosswalkTactileIndex + 1;
  }
}

////PHOTOS CROSSWALK LINES
var crosswalkLinesPhotosArray = [];
var crosswalklinesPhotosDATA;
var crosswalkLinesIndex = 0;


function getCrosswalkLinesPhotos() {
//get data where cornerSource == photo && mapped==false
fetch(serverAddress + "/api/crosswalk/" + localStorage.username +"?attribute=numberOfStripes&fromImage=true")
.then(response => response.json())
.then(data => {
  crosswalkLinesPhotosDATA = data;
  for (var i = 0; i < crosswalkLinesPhotosDATA.length; i++) {
    var crosswalk = crosswalkLinesPhotosDATA[i];
    var imageName = crosswalk.imageName;
    crosswalkLinesPhotosArray.push(imageName);
  }

  var img = document.getElementById("photos-crosswalk-lines-img");
  if (img != null) {
    img.src = imageServer + "/images/crosswalks/" + crosswalkLinesPhotosArray[0];
  }
  crosswalkLinesPhotosArray.shift();
});  
}

function submitPhotoCrosswalkLines() {
  var object = crosswalkLinesPhotosDATA[crosswalkLinesIndex];
  var optionsNumbers = document.getElementsByClassName("photo-zebra-lines-number");
      for (var i = 0; i < optionsNumbers.length; i++){
        if(optionsNumbers[i].selected){
          object.zebra.numberOfStripes = optionsNumbers[i].value;
          var id = object.id;

          fetch(serverAddress + "/api/crosswalk/" + id + "/" + localStorage.username + "?count=1", {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(object)
          })
          .then((res) => res.json())
          .then((data) => console.log(data))

        if (crosswalkLinesPhotosArray.length == 0) {
        var a = document.getElementById('photos-crosswalk-lines-submit-button');
        a.href = "/photos/";
        a.removeAttribute("onclick");
        a.click();
        showAlertPhotoDone();
        return;

        } else {
          for (var i = 0; i < optionsNumbers.length; i++){
            optionsNumbers[i].selected = false; 
          }

          var img = document.getElementById("photos-crosswalk-lines-img");
          if (img != null) {
            img.src = imageServer + "/images/crosswalks/" + crosswalkLinesPhotosArray[0];
          }
          crosswalkLinesPhotosArray.shift();
          crosswalkLinesIndex = crosswalkLinesIndex + 1;
          return;
        }
          
      }
    }
    alert("Vyberte prosím počet jízdních pruhů.");
}

function skipPhotoCrosswalkLines() {
  var object = crosswalkLinesPhotosDATA[crosswalkLinesIndex];            
  object.zebra.numberOfStripes = -1;
  var id = object.id;

  fetch(serverAddress + "/api/crosswalk/" + id + "/" + localStorage.username + "?count=0", {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(object)
  })
  .then((res) => res.json())
  .then((data) => console.log(data))

  if (crosswalkLinesPhotosArray.length == 0) {
    var a = document.getElementById('photos-crosswalk-lines-skip-button');
    a.href = "/photos/";
    a.removeAttribute("onclick");
    a.click();
    showAlertPhotoDone();
    return;

  } else {
    var optionsNumbers = document.getElementsByClassName("photo-zebra-lines-number");
    for (var i = 0; i < optionsNumbers.length; i++){
      optionsNumbers[i].selected = false; 
    }

    var img = document.getElementById("photos-crosswalk-lines-img");
    if (img != null) {
      img.src = imageServer + "/images/crosswalks/" + crosswalkLinesPhotosArray[0];
    }
    crosswalkLinesPhotosArray.shift();
    crosswalkLinesIndex = crosswalkLinesIndex + 1;
  }
}

/////PHOTOS SIDEWALK SURFACE QUALITY
var sidewalkQualityPhotosArray = [];
var sidewalkQualityPhotosDATA;
var sidewalkQualityIndex = 0;

function getSidewalkQualityPhotos() {
//get data where cornerSource == photo && mapped==false
fetch(serverAddress + "/api/sidewalk/" + localStorage.username + "?attribute=quality&fromImage=true")
.then(response => response.json())
.then(data => {
  sidewalkQualityPhotosDATA = data;
  for (var i = 0; i < sidewalkQualityPhotosDATA.length; i++) {
    var sidewalk = sidewalkQualityPhotosDATA[i];
    var imageName = sidewalk.imageName;
    sidewalkQualityPhotosArray.push(imageName);
  }
  var img = document.getElementById("photos-sidewalk-surface-quality-img");
  if (img != null) {
    img.src = imageServer + "/images/sidewalks/" + sidewalkQualityPhotosArray[0];
  }
  sidewalkQualityPhotosArray.shift();
});  
}


function submitPhotoSidewalkQuality() {
  var object = sidewalkQualityPhotosDATA[sidewalkQualityIndex];
  var radioButtons = document.getElementsByName("photos-sidewalk-surface-quality-radio");
  for (var i = 0; i < radioButtons.length; i++){
    if(radioButtons[i].checked) {             
      object.quality = radioButtons[i].value;
      var id = object.id;

      fetch(serverAddress + "/api/sidewalk/" + id + "/" + localStorage.username + "?count=1", {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(object)
      })
      .then((res) => res.json())
      .then((data) => console.log(data))

      if (sidewalkQualityPhotosArray.length == 0) {
        var a = document.getElementById('photos-sidewalk-surface-quality-submit-button');
        a.href = "/photos/";
        a.removeAttribute("onclick");
        a.click();
        showAlertPhotoDone();
        return;

      } else {
        document.getElementById("sidewalk-photo-quality-radio-1").checked = false;
        document.getElementById("sidewalk-photo-quality-radio-2").checked = false;
        document.getElementById("sidewalk-photo-quality-radio-3").checked = false;
        document.getElementById("sidewalk-photo-quality-radio-4").checked = false;
        var img = document.getElementById("photos-sidewalk-surface-quality-img");
        if (img != null) {
          img.src = imageServer + "/images/sidewalks/" + sidewalkQualityPhotosArray[0];
        }
        sidewalkQualityPhotosArray.shift();
        sidewalkQualityIndex = sidewalkQualityIndex + 1;
        return;
      }
    }
  }
  alert("Vyberte prosím kvalitu zebry přechodu."); 
}

function skipPhotoSidewalkQuality() {
  var object = sidewalkQualityPhotosDATA[sidewalkQualityIndex];
  object.quality = "nezadano";
  var id = object.id;

  fetch(serverAddress + "/api/sidewalk/" + id + "/" + localStorage.username + "?count=0", {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(object)
  })
  .then((res) => res.json())
  .then((data) => console.log(data))

  if (sidewalkQualityPhotosArray.length == 0) {
    var a = document.getElementById('photos-sidewalk-surface-quality-skip-button');
        a.href = "/photos/";
        a.removeAttribute("onclick");
        a.click();
        showAlertPhotoDone();
    return;

  } else {
        document.getElementById("sidewalk-photo-quality-radio-1").checked = false;
        document.getElementById("sidewalk-photo-quality-radio-2").checked = false;
        document.getElementById("sidewalk-photo-quality-radio-3").checked = false;
        document.getElementById("sidewalk-photo-quality-radio-4").checked = false;
    var img = document.getElementById("photos-sidewalk-surface-quality-img");
    if (img != null) {
      img.src = imageServer + "/images/sidewalks/" + sidewalkQualityPhotosArray[0];
    }
    sidewalkQualityPhotosArray.shift();
    sidewalkQualityIndex = sidewalkQualityIndex + 1;
  }
}

/////PHOTOS SIDEWALK SURFACE TYPE
var sidewalkSurfTypePhotosArray = [];
var sidewalkSurfTypePhotosDATA;
var sidewalkSurfTypeIndex = 0;

function getSidewalkSurfTypePhotos() {
//get data where cornerSource == photo && mapped==false
fetch(serverAddress + "/api/sidewalk/" + localStorage.username + "?attribute=type&fromImage=true")
.then(response => response.json())
.then(data => {
  sidewalkSurfTypePhotosDATA = data;
  for (var i = 0; i < sidewalkSurfTypePhotosDATA.length; i++) {
    var sidewalk = sidewalkSurfTypePhotosDATA[i];
    var imageName = sidewalk.imageName;
    sidewalkSurfTypePhotosArray.push(imageName);
  }
  var img = document.getElementById("photos-sidewalk-surface-type-img");
  if (img != null) {
    img.src = imageServer + "/images/sidewalks/" + sidewalkSurfTypePhotosArray[0];
  }
  sidewalkSurfTypePhotosArray.shift();
});  
}


function submitPhotoSidewalkSurfType() {
  var object = sidewalkSurfTypePhotosDATA[sidewalkSurfTypeIndex];
  var radioButtons = document.getElementsByName("photos-sidewalk-surface-type-radio");
  for (var i = 0; i < radioButtons.length; i++){
    if(radioButtons[i].checked) {             
      object.type = radioButtons[i].value;
      var id = object.id;

      fetch(serverAddress + "/api/sidewalk/" + id + "/" + localStorage.username + "?count=1", {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(object)
      })
      .then((res) => res.json())
      .then((data) => console.log(data))

      if (sidewalkSurfTypePhotosArray.length == 0) {
        var a = document.getElementById('photos-sidewalk-surface-type-submit-button');
        a.href = "/photos/";
        a.removeAttribute("onclick");
        a.click();
        showAlertPhotoDone();
        return;

      } else {
        document.getElementById("sidewalk-photo-surface-type-radio-1").checked = false;
        document.getElementById("sidewalk-photo-surface-type-radio-2").checked = false;
        document.getElementById("sidewalk-photo-surface-type-radio-3").checked = false;
        document.getElementById("sidewalk-photo-surface-type-radio-4").checked = false;
        document.getElementById("sidewalk-photo-surface-type-radio-5").checked = false;
        var img = document.getElementById("photos-sidewalk-surface-type-img");
        if (img != null) {
          img.src = imageServer + "/images/sidewalks/" + sidewalkSurfTypePhotosArray[0];
        }
        sidewalkSurfTypePhotosArray.shift();
        sidewalkSurfTypeIndex = sidewalkSurfTypeIndex + 1;
        return;
      }
    }
  }
  alert("Vyberte prosím typ povrchu zebry přechodu."); 
}

function skipPhotoSidewalkSurfType() {
  var object = sidewalkSurfTypePhotosDATA[sidewalkSurfTypeIndex];            
  object.type = "nezadano";
  var id = object.id;

  fetch(serverAddress + "/api/sidewalk/" + id + "/" + localStorage.username + "?count=0", {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(object)
  })
  .then((res) => res.json())
  .then((data) => console.log(data))

  if (sidewalkSurfTypePhotosArray.length == 0) {
    var a = document.getElementById('photos-sidewalk-surface-type-skip-button');
    a.href = "/photos/";
    a.removeAttribute("onclick");
    a.click();
    showAlertPhotoDone();
    return;

  } else {
        document.getElementById("sidewalk-photo-surface-type-radio-1").checked = false;
        document.getElementById("sidewalk-photo-surface-type-radio-2").checked = false;
        document.getElementById("sidewalk-photo-surface-type-radio-3").checked = false;
        document.getElementById("sidewalk-photo-surface-type-radio-4").checked = false;
        document.getElementById("sidewalk-photo-surface-type-radio-5").checked = false;
    var img = document.getElementById("photos-sidewalk-surface-type-img");
    if (img != null) {
      img.src = imageServer + "/images/sidewalks/" + sidewalkSurfTypePhotosArray[0];
    }
    sidewalkSurfTypePhotosArray.shift();
    sidewalkSurfTypeIndex = sidewalkSurfTypeIndex + 1;
  }
}

/////STATISTICS

function updateGauges(){
  var cornerCollectedNum = app.gauge.get('.corner-collected');
  var sidewalkCollectedNum = app.gauge.get('.sidewalk-collected');
  var crosswalkCollectedNum = app.gauge.get('.crosswalk-collected');
  var obstacleCollectedNum = app.gauge.get('.obstacle-collected');
  var cornerAccuracy = app.gauge.get('.corner-accuracy');
  var sidewalkAccuracy = app.gauge.get('.sidewalk-accuracy');
  var crosswalkAccuracy = app.gauge.get('.crosswalk-accuracy');
  var obstacleAccuracy = app.gauge.get('.obstacle-accuracy');
  var cornerCollectedCount;
  var sidewalkCollectedCount;
  var crosswalkCollectedCount;
  var obstacleCollectedCount;
  var cornerAccuracyCount;
  var sidewalkAccuracyCount;
  var crosswalkAccuracyCount;
  var obstacleAccuracyCount;

  fetch(serverAddress + "/api/stats/" + localStorage.username)
    .then(response => response.json())
    .then(data => {
      cornerCollectedCount = data.cornerCount.toString();
      sidewalkCollectedCount = data.sidewalkCount.toString();
      crosswalkCollectedCount = data.crosswalkCount.toString();
      obstacleCollectedCount = data.obstacleCount.toString();
      cornerAccuracyCount = data.cornerAccuracy.toString();
      sidewalkAccuracyCount = data.sidewalkAccuracy.toString();
      crosswalkAccuracyCount = data.crosswalkAccuracy.toString();
      obstacleAccuracyCount = data.obstacleAccuracy.toString();
      
      //collected
      if(cornerCollectedNum != null){
        cornerCollectedNum.update({
          size: 200,
          valueText: cornerCollectedCount,
      });
      }

      if(sidewalkCollectedNum != null){
        sidewalkCollectedNum.update({
          size: 200,
          valueText: sidewalkCollectedCount,
      });
      }

      if(crosswalkCollectedNum != null){
        crosswalkCollectedNum.update({
          size: 200,
          valueText: crosswalkCollectedCount,
      });
      }

      if(obstacleCollectedNum != null){
        obstacleCollectedNum.update({
          size: 200,
          valueText: obstacleCollectedCount,
      });
      }

      //accuracy
      if(cornerAccuracy != null){

        if (cornerAccuracyCount == "0") {
          cornerAccuracy.update({
            size: 200,
            valueText: "-",
          });

        } else {
          cornerAccuracy.update({
            size: 200,
            value: data.cornerAccuracy/100,
            valueText: cornerAccuracyCount + " %",
          });

        }
        
      }

      if(sidewalkAccuracy != null){

        if (sidewalkAccuracyCount == "0") {
          sidewalkAccuracy.update({
            size: 200,
            valueText: "-",
          });

        } else {
          sidewalkAccuracy.update({
              size: 200,
              value: data.sidewalkAccuracy/100,
              valueText: sidewalkAccuracyCount  + " %",
          });
        }
        
      }

      if(crosswalkAccuracy != null){

        if (crosswalkAccuracyCount == "0") {
          crosswalkAccuracy.update({
            size: 200,
            valueText: "-",
          });
        } else {
          crosswalkAccuracy.update({
            size: 200,
            value: data.crosswalkAccuracy/100,
            valueText: crosswalkAccuracyCount  + " %",
          });

        }

      }

      if(obstacleAccuracy != null){

        if (obstacleAccuracyCount == "0") {
          obstacleAccuracy.update({
            size: 200,
            valueText: "-",
          });
        } else {
          obstacleAccuracy.update({
            size: 200,
            value: data.obstacleAccuracy/100,
            valueText: obstacleAccuracyCount  + " %",
          });

        }
        
      }

    });

  auditPage("My Statistics");
}

/////LEADERBOARD
function updateLeaderboard(){
  var username1 = document.getElementById("table-row-1-username");
  var points1 = document.getElementById("table-row-1-points");
  var icon1 = document.getElementById("table-row-1-icon");
  var username2 = document.getElementById("table-row-2-username");
  var points2 = document.getElementById("table-row-2-points");
  var icon2 = document.getElementById("table-row-2-icon");
  var username3 = document.getElementById("table-row-3-username");
  var points3 = document.getElementById("table-row-3-points");
  var icon3 = document.getElementById("table-row-3-icon");
  var username4 = document.getElementById("table-row-4-username");
  var points4 = document.getElementById("table-row-4-points");
  var icon4 = document.getElementById("table-row-4-icon");
  var username5 = document.getElementById("table-row-5-username");
  var points5 = document.getElementById("table-row-5-points");
  var icon5 = document.getElementById("table-row-5-icon");
  var username6 = document.getElementById("table-row-6-username");
  var points6 = document.getElementById("table-row-6-points");
  var icon6 = document.getElementById("table-row-6-icon");
  var username7 = document.getElementById("table-row-7-username");
  var points7 = document.getElementById("table-row-7-points");
  var icon7 = document.getElementById("table-row-7-icon");

  fetch(serverAddress + "/api/stats/all")
    .then(response => response.json())
    .then(data => {
      username1.innerHTML = data[0].username;
      points1.innerHTML = data[0].all;
      icon1.src = "./img/avatars/" + data[0].username + ".png";
      username2.innerHTML = data[1].username;
      points2.innerHTML = data[1].all;
      icon2.src = "./img/avatars/" + data[1].username + ".png";
      username3.innerHTML = data[2].username;
      points3.innerHTML = data[2].all;
      icon3.src = "./img/avatars/" + data[2].username + ".png";
      username4.innerHTML = data[3].username;
      points4.innerHTML = data[3].all;
      icon4.src = "./img/avatars/" + data[3].username + ".png";
      username5.innerHTML = data[4].username;
      points5.innerHTML = data[4].all;
      icon5.src = "./img/avatars/" + data[4].username + ".png";
      username6.innerHTML = data[5].username;
      points6.innerHTML = data[5].all;
      icon6.src = "./img/avatars/" + data[5].username + ".png";
      username7.innerHTML = data[6].username;
      points7.innerHTML = data[6].all;
      icon7.src = "./img/avatars/" + data[6].username + ".png";
      for (var i = data.length - 1; i >= 0; i--) {
          index= i + 1;
          document.getElementById("table-row-" + index + "").classList.remove("table-this-user"); 
      };
      for (var i = data.length - 1; i >= 0; i--) {
        if (data[i].username == localStorage.username){
          index= i + 1;
          document.getElementById("table-row-" + index + "").classList.add("table-this-user");
        }
      };
    });

  auditPage("Community Leaderboard");
}

//GAME-OBSTACLE - START
var scoreG1 = 0;

function addGamePointG1() {
    scoreG1 = scoreG1 + 1;

}

function resetGameScoreG1() {
    scoreG1 = 0;
    auditPage("Game 1");
}

function showScoreG1() {
    app.tab.show('#tab-6-obstacle', true);
    localStorage.setItem("scoreG1", scoreG1);
    document.getElementById("game-obstacle-score").innerHTML = scoreG1;
}

var scoreG2 = 0;

function addGamePointG2() {
    scoreG2 = scoreG2 + 1;
}

function resetGameScoreG2() {
    scoreG2 = 0;
    auditPage("Game 2");
}

function showScoreG2() {
    app.tab.show('#tab-6-tactile', true);
    localStorage.setItem("scoreG2", scoreG2);
    document.getElementById("game-tactile-score").innerHTML = scoreG2;  
}


$$(document).on('page:init', '.page[data-name="games"]', function () {
  if (localStorage.scoreG1 == undefined){
    document.getElementById("badge-game1").innerHTML = "nehráno";
  } else {
    document.getElementById("badge-game1").innerHTML = localStorage.scoreG1 + " / 5";
  }
  if(localStorage.scoreG2 == undefined){
    document.getElementById("badge-game2").innerHTML = "nehráno";
  } else {
    document.getElementById("badge-game2").innerHTML = localStorage.scoreG2 + " / 5";
  }
})

//GAME-OBSTACLE - END

////COMMUNITY ACTIVITY

$$(document).on('page:init', '.page[data-name="community"]', function () {
  if(localStorage.communityCoverageLiked == "true"){
    document.getElementById("community-coverage-icon").innerHTML = "favorite";
    var likes = document.getElementById("community-coverage-likes").innerHTML;
    document.getElementById("community-coverage-likes").innerHTML = parseInt(likes) + 1;
  }
  if(localStorage.communityRoutesLiked == "true"){
    document.getElementById("community-routes-icon").innerHTML = "favorite";
    var likes = document.getElementById("community-routes-likes").innerHTML;
    document.getElementById("community-routes-likes").innerHTML = parseInt(likes) + 1;
  }
  if(localStorage.communityCoverageLiked2 == "true"){
    document.getElementById("community-coverage-icon2").innerHTML = "favorite";
    var likes = document.getElementById("community-coverage-likes2").innerHTML;
    document.getElementById("community-coverage-likes2").innerHTML = parseInt(likes) + 1;
  }
  if(localStorage.communityRoutesLiked2 == "true"){
    document.getElementById("community-routes-icon2").innerHTML = "favorite";
    var likes = document.getElementById("community-routes-likes2").innerHTML;
    document.getElementById("community-routes-likes2").innerHTML = parseInt(likes) + 1;
  }
})

function addLikeCoverage(){
  if(localStorage.communityCoverageLiked == "true"){
    document.getElementById("community-coverage-icon").innerHTML = "favorite_border";
    var likes = document.getElementById("community-coverage-likes").innerHTML;
    document.getElementById("community-coverage-likes").innerHTML = parseInt(likes) - 1;
    localStorage.setItem("communityCoverageLiked", "false");
  } else {
    document.getElementById("community-coverage-icon").innerHTML = "favorite";
    var likes = document.getElementById("community-coverage-likes").innerHTML;
    document.getElementById("community-coverage-likes").innerHTML = parseInt(likes) + 1;
    localStorage.setItem("communityCoverageLiked", "true");
  }
}

function addLikeCoverage2(){
  if(localStorage.communityCoverageLiked2 == "true"){
    document.getElementById("community-coverage-icon2").innerHTML = "favorite_border";
    var likes = document.getElementById("community-coverage-likes2").innerHTML;
    document.getElementById("community-coverage-likes2").innerHTML = parseInt(likes) - 1;
    localStorage.setItem("communityCoverageLiked2", "false");
  } else {
    document.getElementById("community-coverage-icon2").innerHTML = "favorite";
    var likes = document.getElementById("community-coverage-likes2").innerHTML;
    document.getElementById("community-coverage-likes2").innerHTML = parseInt(likes) + 1;
    localStorage.setItem("communityCoverageLiked2", "true");
  }
}

function addLikeCoverage3(){
  if(localStorage.communityCoverageLiked3 == "true"){
    document.getElementById("community-coverage-icon3").innerHTML = "favorite_border";
    var likes = document.getElementById("community-coverage-likes3").innerHTML;
    document.getElementById("community-coverage-likes3").innerHTML = parseInt(likes) - 1;
    localStorage.setItem("communityCoverageLiked3", "false");
  } else {
    document.getElementById("community-coverage-icon3").innerHTML = "favorite";
    var likes = document.getElementById("community-coverage-likes3").innerHTML;
    document.getElementById("community-coverage-likes3").innerHTML = parseInt(likes) + 1;
    localStorage.setItem("communityCoverageLiked3", "true");
  }
}


function addLikeRoutes(){
  if(localStorage.communityRoutesLiked == "true"){
    document.getElementById("community-routes-icon").innerHTML = "favorite_border";
    var likes = document.getElementById("community-routes-likes").innerHTML;
    document.getElementById("community-routes-likes").innerHTML = parseInt(likes) - 1;
    localStorage.setItem("communityRoutesLiked", "false");
  } else {
    document.getElementById("community-routes-icon").innerHTML = "favorite";
    var likes = document.getElementById("community-routes-likes").innerHTML;
    document.getElementById("community-routes-likes").innerHTML = parseInt(likes) + 1;
    localStorage.setItem("communityRoutesLiked", "true");
  }
}

function addLikeRoutes2(){
  if(localStorage.communityRoutesLiked2 == "true"){
    document.getElementById("community-routes-icon2").innerHTML = "favorite_border";
    var likes = document.getElementById("community-routes-likes2").innerHTML;
    document.getElementById("community-routes-likes2").innerHTML = parseInt(likes) - 1;
    localStorage.setItem("communityRoutesLiked2", "false");
  } else {
    document.getElementById("community-routes-icon2").innerHTML = "favorite";
    var likes = document.getElementById("community-routes-likes2").innerHTML;
    document.getElementById("community-routes-likes2").innerHTML = parseInt(likes) + 1;
    localStorage.setItem("communityRoutesLiked2", "true");
  }
}

function removeNotificationBadge(){
    document.getElementById("notification-badge-person").remove();
    localStorage.setItem("ninethNotificationClicked", "true");
}

function removeNotificationBadge2(){
    document.getElementById("notification-badge-group").remove();
    localStorage.setItem("eightNotificationClicked", "true");
}