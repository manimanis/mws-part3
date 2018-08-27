class RestaurantsDB {
  static get DB_NAME() {
    return 'restaurants_v2';
  }

  static get RESTAURANTS_STORE() {
    return 'restaurants';
  }

  static get REVIEWS_STORE() {
    return 'reviews';
  }

  static get CUISINE_TYPE_INDEX() {
    return 'cuisine_type';
  }

  static get NEIGHBORHOOD_INDEX() {
    return 'neighborhood';
  }

  static get RESTAURANT_ID_INDEX() {
    return 'restaurant_id';
  }

  static get PENDING_SAVE_RESTOS() {
    return 'pending_save_restaurants';
  }

  static get PENDING_SAVE_REVIEWS() {
    return 'pending_save_reviews';
  }

  constructor() {
    this._promiseDB = idb.open(RestaurantsDB.DB_NAME, 3, (db) => {
      console.log('create data store');
      if (!db.objectStoreNames.contains(RestaurantsDB.RESTAURANTS_STORE)) {
        const os = db.createObjectStore(RestaurantsDB.RESTAURANTS_STORE, { keyPath: 'id' });
        os.createIndex(RestaurantsDB.CUISINE_TYPE_INDEX, RestaurantsDB.CUISINE_TYPE_INDEX);
        os.createIndex(RestaurantsDB.NEIGHBORHOOD_INDEX, RestaurantsDB.NEIGHBORHOOD_INDEX);
      }

      if (!db.objectStoreNames.contains(RestaurantsDB.REVIEWS_STORE)) {
        const os = db.createObjectStore(RestaurantsDB.REVIEWS_STORE, { keyPath: 'id' });
        os.createIndex(RestaurantsDB.RESTAURANT_ID_INDEX, RestaurantsDB.RESTAURANT_ID_INDEX);
      }

      if (!db.objectStoreNames.contains(RestaurantsDB.PENDING_SAVE_RESTOS)) {
        const os = db.createObjectStore(RestaurantsDB.PENDING_SAVE_RESTOS);
      }

      if (!db.objectStoreNames.contains(RestaurantsDB.PENDING_SAVE_REVIEWS)) {
        const os = db.createObjectStore(RestaurantsDB.PENDING_SAVE_REVIEWS);
      }
    })
      .catch(error => console.log('idb open', error));
  }

  /**
   * Return the list of reviews having (save_pending) set to true
   */
  getPendingReviews() {
    return this._promiseDB.then((db) => {
      return db.transaction(RestaurantsDB.PENDING_SAVE_REVIEWS)
        .objectStore(RestaurantsDB.PENDING_SAVE_REVIEWS)
        .getAll()
        .then(reviews => reviews.map(review => new Review(review)));
    });
  }

  /**
   * Return the list of retaurants having (save_pending) set to true
   */
  getPendingRestaurants() {
    return this._promiseDB.then((db) => {
      return db.transaction(RestaurantsDB.PENDING_SAVE_RESTOS)
        .objectStore(RestaurantsDB.PENDING_SAVE_RESTOS)
        .getAll()
        .then(restaurants => restaurants.map(restaurant => new Restaurant(restaurant)));
    });
  }

  _getObjectKeyVal(object) {
    let objStore = null, objKey = null, objVal = null;
    if (object instanceof Restaurant) {
      objStore = RestaurantsDB.PENDING_SAVE_RESTOS;
      objKey = `Resto${object.id}`;
      objVal = object;
    } else if (object instanceof Review) {
      objKey = `${object.restaurant_id}${object.name}${object.comments}`;
      objStore = RestaurantsDB.PENDING_SAVE_REVIEWS;
      objVal = object;
    }
    return [objStore, objKey, objVal];
  }

  addToPendingQueue(object) {
    let [objStore, objKey, objVal] = this._getObjectKeyVal(object);

    if (objStore == null || objKey == null || objVal == null) {
      return Promise.reject('Cannot save an object of that type in IDB');
    }

    return this._promiseDB.then((db) => {
      return db.transaction(objStore, 'readwrite')
        .objectStore(objStore)
        .put(objVal, objKey);
    });
  }

  removeFromPendingQueue(object) {
    let [objStore, objKey, objVal] = this._getObjectKeyVal(object);

    if (objStore == null || objKey == null || objVal == null) {
      return Promise.reject('Cannot remove this object from IDB');
    }

    return this._promiseDB.then((db) => {
      return db.transaction(objStore, 'readwrite')
        .objectStore(objStore)
        .delete(objKey);
    });
  }

  /**
   * Return all restaurants
   */
  getAllRestaurants() {
    return this._promiseDB.then((db) => {
      const tx = db.transaction(RestaurantsDB.RESTAURANTS_STORE);
      const objStore = tx.objectStore(RestaurantsDB.RESTAURANTS_STORE);
      return objStore.getAll(null);
    })
      .catch(error => console.log('getAll()', error));
  }

  /**
   * Return all the reviews for a restaurant.
   * @param {Review[]} restaurant_id 
   */
  getAllReviews(restaurant_id) {
    return this._promiseDB.then((db) => {
      const tx = db.transaction(RestaurantsDB.REVIEWS_STORE);
      const idx = tx.objectStore(RestaurantsDB.REVIEWS_STORE)
        .index(RestaurantsDB.RESTAURANT_ID_INDEX);
      return idx.getAll(restaurant_id);
    })
      .then(reviews => reviews.map(review => new Review(review)).sort((a, b) => b.updatedAt - a.updatedAt))
      .catch(error => console.log('getAll()', error));
  }

  /**
   * Return a restaurant by its id
   * @param {number} id 
   */
  getRestaurantsById(id) {
    return this._promiseDB.then((db) => {
      return db.transaction(RestaurantsDB.RESTAURANTS_STORE)
        .objectStore(RestaurantsDB.RESTAURANTS_STORE)
        .get(id);
    });
  }

  /**
   * Return a Review by its id.
   * @param {number} review_id 
   */
  getReviewById(review_id) {
    return this._promiseDB.then((db) => {
      return db.transaction(RestaurantsDB.REVIEWS_STORE)
        .objectStore(RestaurantsDB.REVIEWS_STORE)
        .get(review_id);
    });
  }

  /**
   * Return all the restaurants of a certain cuisine_type
   * @param {string} cuisine_type 
   */
  getRestaurantsByCuisine(cuisine_type) {
    return this.getAll()
      .then(restaurants => restaurants.filter(restaurant => restaurant.cuisine_type === cuisine_type));
  }

  /**
   * Return all the restaurants of a certain neighborhood
   * @param {string} neighborhood 
   */
  getRestaurantsByNeighborhood(neighborhood) {
    return this.getAll()
      .then(restaurants => restaurants.filter(restaurant => restaurant.neighborhood === neighborhood));
  }

  /**
   * Return all the restaurant of a certain cuisine_type within neighborhood
   * @param {string} cuisine_type 
   * @param {string} neighborhood 
   */
  getRestaurantsByCuisineAndNeighborhood(cuisine_type, neighborhood) {
    return this.getAllRestaurants()
      .then(restaurants => {
        if (cuisine_type != 'all') {
          restaurants = restaurants.filter(restaurant => restaurant.cuisine_type == cuisine_type);
        }
        if (neighborhood != 'all') {
          restaurants = restaurants.filter(restaurant => restaurant.neighborhood == neighborhood);
        }
        return restaurants;
      });
  }

  /**
   * Return all the cuisines names ordered alphabeticallay
   */
  getCuisines() {
    return this.getAllRestaurants()
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
    return this.getAllRestaurants()
      .then(restaurants => restaurants.map(restaurant => restaurant.neighborhood))
      .then(neighborhoods => {
        neighborhoods = neighborhoods.filter((neighborhood, index) => neighborhoods.indexOf(neighborhood) == index);
        neighborhoods.sort();
        return neighborhoods;
      });
  }

  /**
   * Save one restaurant data
   * @param {Restaurant} restaurant 
   */
  saveRestaurant(restaurant) {
    this._promiseDB.then((db) => {
      const rs = db.transaction(RestaurantsDB.RESTAURANTS_STORE, 'readwrite')
        .objectStore(RestaurantsDB.RESTAURANTS_STORE);

      rs.put(restaurant);
    })
      .catch(error => console.log('saveRestaurant()', error));
  }

  /**
   * Save one review in the database.
   * @param {Review} review 
   */
  saveReview(review) {
    this._promiseDB.then((db) => {
      const rs = db.transaction(RestaurantsDB.REVIEWS_STORE, 'readwrite')
        .objectStore(RestaurantsDB.REVIEWS_STORE);

      rs.put(review);
    })
      .catch(error => console.log('saveReviews()', error));
  }

  /**
   * Saves all the restaurants in the database.
   * @param {Array | RestaurantCollection} restaurants 
   */
  saveRestaurants(restaurants) {
    this._promiseDB.then((db) => {
      const rs = db.transaction(RestaurantsDB.RESTAURANTS_STORE, 'readwrite')
        .objectStore(RestaurantsDB.RESTAURANTS_STORE);

      const restArr = (restaurants instanceof RestaurantCollection) ? restaurants.getAll() : restaurants;
      for (let restaurant of restArr) {
        rs.put(restaurant);
      }
    })
      .catch(error => console.log('saveRestaurants()', error));
  }

  /**
   * Save all the reviews in the database.
   * @param {Review[]} reviews 
   */
  saveReviews(reviews) {
    this._promiseDB.then((db) => {
      const rs = db.transaction(RestaurantsDB.REVIEWS_STORE, 'readwrite')
        .objectStore(RestaurantsDB.REVIEWS_STORE);
      for (let review of reviews) {
        rs.put(review);
      }
    })
      .catch(error => console.log('saveReviews()', error));
  }

  /**
   * Set the specified restaurant as favorite or unfavorite
   * @param {number} restaurant_id 
   * @param {boolean} is_favorite 
   */
  setFavoriteRestaurant(restaurant_id, is_favorite) {
    this.getRestaurantsById(restaurant_id)
      .then(restaurant => {
        restaurant.is_favorite = is_favorite;
      })
      .then(restaurant => this.saveRestaurant(restaurant))
      .catch(error => console.log('setFavoriteRestaurant()', error));
  }
}