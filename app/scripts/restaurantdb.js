class RestaurantsDB {
  constructor() {
    this._promiseDB = idb.open('restaurants', 1, (db) => {
      switch(db.oldVersion) {
        case 0:
          const os = db.createObjectStore('restaurants', { keyPath: 'id' });
          os.createIndex('cuisine_type', 'cuisine_type');
          os.createIndex('neighborhood', 'neighborhood');
      }
    })
    .catch(error => console.log('idb open', error));
  }

  /**
   * Return all restaurants
   */
  getAll() {
    let restos = [];
    return this._promiseDB.then((db) => {
      const tx = db.transaction('restaurants');
      const objStore = tx.objectStore('restaurants');
      return objStore.getAll(null);
    })
    .catch(error => console.log('getAll()', error));;
  }

  /**
   * Return a restaurant by its id
   * @param {number} id 
   */
  getById(id) {
    return this._promiseDB.then((db) => {
      return db.transaction('restaurants')
        .objectStore('restaurants')
        .get(id);
    });
  }

  /**
   * Return all the restaurants of a certain cuisine_type
   * @param {string} cuisine_type 
   */
  getByCuisine(cuisine_type) {
    return this.getAll()
    .then(restaurants => restaurants.filter(restaurant => restaurant.cuisine_type === cuisine_type));
  }

  /**
   * Return all the restaurants of a certain neighborhood
   * @param {string} neighborhood 
   */
  getByNeighborhood(neighborhood) {
    return this.getAll()
    .then(restaurants => restaurants.filter(restaurant => restaurant.neighborhood === neighborhood));
  }

  /**
   * Return all the restaurant of a certain cuisine_type within neighborhood
   * @param {string} cuisine_type 
   * @param {string} neighborhood 
   */
  getByCuisineAndNeighborhood(cuisine_type, neighborhood) {
    return this.getAll()
    .then(restaurants => {
      if (cuisine_type != 'all')  {
        restaurants = restaurants.filter(restaurant => restaurant.cuisine_type == cuisine_type);
      }
      if (neighborhood != 'all')  {
        restaurants = restaurants.filter(restaurant => restaurant.neighborhood == neighborhood);
      }
      return restaurants;
    });
  }

  /**
   * Return all the cuisines names ordered alphabeticallay
   */
  getCuisines() {
    return this.getAll()
    .then(restaurants => restaurants.map(restaurant => restaurant.cuisine_type))
    .then(cuisines => {
      cuisines = cuisines.filter((cuisine, index) => cuisines.indexOf(cuisine) == index);
      cuisines.sort();
      return cuisines;
    }); 
  }

  /**
   * Return all the neighborhoods ordered alphabeticallay
   */
  getNeighborhoods() {
    return this.getAll()
    .then(restaurants => restaurants.map(restaurant => restaurant.neighborhood))
    .then(neighborhoods => {
      neighborhoods = neighborhoods.filter((neighborhood, index) => neighborhoods.indexOf(neighborhood) == index);
      neighborhoods.sort();
      return neighborhoods;
    }); 
  }

  /**
   * Saves all the restaurants in the database
   * @param {Cuisine[]} restaurants 
   */
  saveRestaurants(restaurants) {
    this._promiseDB.then((db) => {
      const rs = db.transaction('restaurants', 'readwrite')
        .objectStore('restaurants');
      
      for (let restaurant of restaurants) {
        rs.put(restaurant);
      }
    })
    .catch(error => console.log('saveRestaurants()', error));
  }
}