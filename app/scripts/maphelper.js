class MapHelper {
  constructor() {
    this.markers = [];
  }

  /**
   * Initialize leaflet map, called from HTML.
   */
  initMap(coordinates) {
    if (!coordinates) {
      coordinates = [40.722216, -73.987501];
    }
    
    this.restoMap = L.map('map', {
      zoom: 12,
      scrollWheelZoom: false,
      // the map is not focused by default
      keyboard: false
    });
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}', {
      mapboxToken: 'pk.eyJ1IjoibWFuaWFuaXMiLCJhIjoiY2l4dzJxYmE4MDAwbzJ3bG1yNm1ycjBjaCJ9.Wh2_bwQz6A3OK_izZcS1xQ',
      maxZoom: 18,
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/" tabindex="-1">OpenStreetMap</a> contributors, ' +
        '<a href="https://creativecommons.org/licenses/by-sa/2.0/" tabindex="-1">CC-BY-SA</a>, ' +
        'Imagery © <a href="https://www.mapbox.com/" tabindex="-1">Mapbox</a>',
      id: 'mapbox.streets'
    }).addTo(this.restoMap);
    this.centerMap(coordinates);
  }

  /**
   * center the map to the specified coordinates
   * @param {array} coordinates 
   */
  centerMap(coordinates) {
    this.restoMap.setView(coordinates);
  }

  /**
  * Map marker for a restaurant.
  */
  mapMarkerForRestaurant(restaurant) {
    // https://leafletjs.com/reference-1.3.0.html#marker  
    const marker = new L.marker([restaurant.latlng.lat, restaurant.latlng.lng],
      {
        title: restaurant.name,
        alt: restaurant.name,
        url: DBHelper.urlForRestaurant(restaurant),
        // no keyboard interaction
        keyboard: false
      });
    marker.addTo(this.restoMap);
    return marker;
  }

  /**
   * Add markers for current restaurants to the map.
   */
  addMarkersToMap(restaurants) {
    restaurants.forEach(restaurant => {
      // Add marker to the map
      const marker = this.mapMarkerForRestaurant(restaurant);
      marker.on('click', onClick);
      function onClick() {
        window.location.href = marker.options.url;
      }
      this.markers.push(marker);
    });
  }

  /**
   * Remove markers
   */
  removeMarkers() {
    // Remove all map markers
    if (this.markers) {
      this.markers.forEach(marker => marker.remove());
    }
    this.markers = [];
  }
}