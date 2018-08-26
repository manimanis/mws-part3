class DateUtility {
  static toDate(value) {
    // The date is a timestamp
    if (!isNaN(value)) {
      return value;
    }

    // The date is in the ISO format "2018-08-23T17:14:20.633Z"
    const regex = /(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}.\d+)Z/g;
    const dateArr = regex.exec(value);
    if (dateArr && dateArr.length == 7) {
      return Date.UTC(dateArr[1], dateArr[2] - 1, dateArr[3], dateArr[4], dateArr[5], dateArr[6]);
    }

    return Date.now();
  }
}

class Restaurant {
  constructor(obj) {
    this.id = obj.id || 0;
    this.name = obj.name || '';
    this.neighborhood = obj.neighborhood || '';
    this.photograph = obj.photograph || this.id;
    this.address = obj.address || '';
    this.latlng = obj.latlng || { 'lat': 40.7, 'lng': -73.9 };
    this.cuisine_type = obj.cuisine_type || '';
    this.operating_hours = obj.operating_hours || {};
    this.createdAt = DateUtility.toDate(obj.createdAt);
    this.updatedAt = DateUtility.toDate(obj.updatedAt);
    this.is_favorite = obj.is_favorite === true || obj.is_favorite === 'true';
    this.save_pending = obj.save_pending || false;
  }
}

class Review {
  constructor(obj) {
    this.id = obj.id || 0;
    this.restaurant_id = obj.restaurant_id || 0;
    this.name = obj.name || '';
    this.createdAt = DateUtility.toDate(obj.createdAt);
    this.updatedAt = DateUtility.toDate(obj.updatedAt);
    this.rating = parseInt(obj.rating) || 0;
    this.comments = obj.comments || '';
    this.save_pending = obj.save_pending || false;
  }
}

class RestaurantCollection {
  constructor(restaurants) {
    this.setRestaurants(restaurants);
  }

  setRestaurants(restaurants) {
    this.restaurants = restaurants.map(restaurant => new Restaurant(restaurant));
  }

  /**
   * Return a restaurant by its id
   * @param {numbr} id 
   */
  getById(id) {
    return this.restaurants.filter(restaurant => restaurant.id == id)[0];
  }

  /**
   * Return all restaurants
   */
  getAll() {
    return this.restaurants;
  }

  /**
   * Return all restaurants that are waiting to be synced with the server
   */
  getPendingSave() {
    return this.restaurants.filter(restaurant => restaurant.save_pending);
  }

  clearPendingSave() {
    for (let restaurant of this.restaurants) {
      restaurant.save_pending = false;
    }
  }

  /**
   * Return all the restaurants of a certain cuisine_type
   * @param {string} cuisine_type 
   */
  getByCuisine(cuisine_type) {
    return this.restaurants.filter(restaurant => restaurant.cuisine_type === cuisine_type);
  }

  /**
   * Return all the restaurants of a certain neighborhood
   * @param {string} neighborhood 
   */
  getByNeighborhood(neighborhood) {
    return this.restaurants.filter(restaurant => restaurant.neighborhood === neighborhood);
  }

  /**
   * Return all the restaurant of a certain cuisine_type within neighborhood
   * @param {string} cuisine_type 
   * @param {string} neighborhood 
   */
  getByCuisineAndNeighborhood(cuisine_type, neighborhood) {
    return this.restaurants.filter(restaurant => {
      let isOK = true;
      if (cuisine_type != 'all') { isOK = restaurant.cuisine_type === cuisine_type; }
      if (neighborhood != 'all') { isOK = restaurant.neighborhood === neighborhood; }
      return isOK;
    });
  }

  /**
   * Return all the cuisines names ordered alphabeticallay
   */
  getCuisines() {
    let cuisines = this.restaurants.map(restaurant => restaurant.cuisine_type);
    cuisines.sort();
    return cuisines.filter((cuisine, index) => (index == 0 || (index > 0 && cuisine != cuisines[index - 1])));
  }

  /**
   * Return all the neighborhoods ordered alphabeticallay
   */
  getNeighborhoods() {
    let neighborhoods = this.restaurants.map(restaurant => restaurant.neighborhood);
    neighborhoods.sort();
    return neighborhoods.filter((neighborhood, index) => (index == 0 || (index > 0 && neighborhood != neighborhoods[index - 1])));
  }
}