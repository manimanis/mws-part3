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
    this._calcHash();
  }

  getId() {
    return this.name;
  }

  setName(id) {
    this.id = id;
  }

  getName() {
    return this.name;
  }

  setName(name) {
    this.name = name;
    this._calcHash();
  }

  getNeighborhood() {
    return this.neighborhood;
  }

  setNeighborhood(neighborhood) {
    this.neighborhood = neighborhood;
    this._calcHash();
  }

  getPhotograph() {
    return this.photograph;
  }

  setPhotograph(photograph) {
    this.photograph = photograph;
  }

  getAddress() {
    return this.address;
  }

  setAddress(address) {
    this.address = address;
    this._calcHash();
  }

  getLatLng() {
    return this.latlng;
  }

  setLatLng(latlng) {
    this.latlng = latlng;
    this._calcHash();
  }

  getCuisineType() {
    return this.cuisine_type;
  }

  setCuisineType(cuisine_type) {
    this.cuisine_type = cuisine_type;
    this._calcHash();
  }
  getOperatingHours() {
    return this.operating_hours;
  }

  setOperatingHours(operating_hours) {
    this.operating_hours = operating_hours;
  }

  getCreatedAt() {
    return this.createdAt;
  }

  setCreatedAt(createdAt) {
    this.createdAt = createdAt;
  }

  getUpdatedAt() {
    return this.updatedAt;
  }

  setUpdatedAt(updatedAt) {
    this.updatedAt = updatedAt;
  }

  isFavorite() {
    return this.is_favorite;
  }

  setFavorite(is_favorite) {
    this.is_favorite = is_favorite;
  }

  getHash() {
    return this.hash;
  }

  _calcHash() {
    this.hash = MD5.hash(JSON.stringify({
      name: this.name,
      neighborhood: this.neighborhood,
      address: this.address,
      latlng: this.latlng,
      cuisine_type: this.cuisine_type
    }));
  }
}

class Review {
  constructor(obj) {
    this.id = parseInt(obj.id) || 0;
    this.restaurant_id = parseInt(obj.restaurant_id) || 0;
    this.name = obj.name || '';
    this.createdAt = DateUtility.toDate(obj.createdAt);
    this.updatedAt = DateUtility.toDate(obj.updatedAt);
    this.rating = parseInt(obj.rating) || 0;
    this.comments = obj.comments || '';
    this._calcHash();
  }

  getId() {
    return this.id;
  }

  setId(id) {
    this.id = id;
  }

  getRestaurantId() {
    return this.restaurant_id;
  }

  setRestaurantId(restaurant_id) {
    this.restaurant_id = restaurant_id;
    this._calcHash();
  }

  getName() {
    return this.name;
  }

  setName(name) {
    this.name = name;
    this._calcHash();
  }

  getCreatedAt() {
    return this.createdAt;
  }

  setCreatedAt(createdAt) {
    this.createdAt = createdAt;
  }

  getUpdatedAt() {
    return this.updatedAt;
  }

  setUpdatedAt(updatedAt) {
    this.updatedAt = updatedAt;
  }

  getRating() {
    return this.rating;
  }

  setRating(rating) {
    this.rating = rating;
    this._calcHash();
  }

  getComments() {
    return this.comments;
  }

  setComments(comments) {
    this.comments = comments;
    this._calcHash();
  }

  getHash() {
    return this.hash;
  }

  _calcHash() {
    this.hash = MD5.hash(JSON.stringify({
      name: this.name,
      restaurant_id: this.restaurant_id,
      rating: this.rating,
      comments: this.comments
    }));
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