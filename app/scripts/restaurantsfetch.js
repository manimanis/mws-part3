class RestaurantFetch {

  /**
   * Database URL.
   */
  static get DATABASE_URL() {
    const port = 1337; // Change this to your server port
    return `http://localhost:${port}/restaurants`;
  }

  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants() {
    // Fetch from the external network
    return fetch(RestaurantFetch.DATABASE_URL)    
    .then(response => response.json())
    .catch(error => {
      console.log('Could not fetch from: ' + RestaurantFetch.DATABASE_URL);
      return fetch('/data/restaurants.json')
                    .then(response => response.json())
                    .then(data => data.restaurants)
    });
  }
}