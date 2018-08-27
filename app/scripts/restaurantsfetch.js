class RestaurantFetch {

  /**
   * Database URL.
   */
  static get DATABASE_URL() {
    const port = 1337; // Change this to your server port
    return `http://localhost:${port}`;
  }

  /**
   * Restaurants URL.
   */
  static get RESTAURANTS_URL() {
    return RestaurantFetch.DATABASE_URL + '/restaurants';
  }

  /**
   * Reviews URL.
   */
  static get REVIEWS_URL() {
    return RestaurantFetch.DATABASE_URL + '/reviews';
  }

  /**
   * Fetch all restaurants from network.
   */
  static fetchRestaurants() {
    return fetch(RestaurantFetch.RESTAURANTS_URL)
      .then(response => response.json())
      .then(restaurants => restaurants.map(restaurant => new Restaurant(restaurant)));
  }

  /**
   * Fetch one restaurant from network.
   * @param {number} id
   */
  static fetchRestaurant(id) {
    return fetch(RestaurantFetch.RESTAURANTS_URL + `/${id}`)
      .then(response => response.json())
      .then(restaurant => new Restaurant(restaurant));
  }

  /**
   * Fetch restaurants reviews.
   * @param {number} restaurant_id 
   */
  static fetchRestaurantReviews(restaurant_id) {
    return fetch(RestaurantFetch.REVIEWS_URL + `/?restaurant_id=${restaurant_id}`)
      .then(response => response.json())
      .then(reviews => reviews.map(review => new Review(review)).sort((a, b) => b.updatedAt - a.updatedAt));
  }

  static jsonURIEncode(json) {
    return Object.keys(json).map(function (key) {
      return encodeURIComponent(key) + '=' +
        encodeURIComponent(json[key]);
    }).join('&');
  }

  /**
   * Create a review with the review object. 
   * @param {object} review 
   */
  static createReview(review) {
    // Get only the necessary data from the Review object
    const netReview = {
      restaurant_id: review.restaurant_id,
      name: review.name,
      rating: review.rating,
      comments: review.comments
    };

    const bodyData = RestaurantFetch.jsonURIEncode(netReview);
    const headers = new Headers();
    headers.append('Content-Length', bodyData.length);
    headers.append('Content-Type', 'application/x-www-form-urlencoded; charset=utf-8');
    return fetch(RestaurantFetch.REVIEWS_URL + '/', {
      method: 'POST',
      headers: headers,
      body: bodyData
    })
      .then(response => response.json())
      .then(review => new Review(review));
  }

  /**
   * Create an array of reviews
   * @param {Review} reviews 
   */
  static createReviews(reviews) {
    return Promise.all(
      reviews.map(review => RestaurantFetch.createReview(review))
    );
  }

  /**
   * Update the specified review.
   * @param {Review} review 
   */
  static updateReview(review) {
    const bodyData = JSON.stringify(review);
    return fetch(RestaurantFetch.REVIEWS_URL + `/${review.id}`, {
      method: 'PUT',
      body: bodyData
    });
  }

  /**
   * Update an array of reviews
   * @param {Review} reviews 
   */
  static updateReviews(reviews) {
    return Promise.all(
      reviews.map(review => RestaurantFetch.updateReview(review))
    );
  }

  /**
   * Mark the specified restaurant as favorite or unfavorite.
   * @param {number} restaurant_id 
   * @param {boolean} is_favorite 
   */
  static favoriteRestaurant(restaurant_id, is_favorite) {
    return fetch(RestaurantFetch.RESTAURANTS_URL + `/${restaurant_id}/?is_favorite=${is_favorite}`, {
      method: 'PUT'
    });
  }

  /**
   * Update the restautant's is_favorite property
   * @param {array} restaurants 
   */
  static favoriteRestaurants(restaurants) {
    return Promise.all(
      restaurants.map(restaurant => RestaurantFetch.favoriteRestaurant(restaurant.id, restaurant.is_favorite))
    );
  }
}

// -- The restaurant format (fetch) --
// http://127.0.0.1:1337/restaurants/1
// {
//   "name": "Mission Chinese Food",
//   "neighborhood": "Manhattan",
//   "photograph": "1",
//   "address": "171 E Broadway, New York, NY 10002",
//   "latlng": {
//     "lat": 40.713829,
//     "lng": -73.989667
//   },
//   "cuisine_type": "Asian",
//   "operating_hours": {
//     "Monday": "5:30 pm - 11:00 pm",
//     "Tuesday": "5:30 pm - 11:00 pm",
//     "Wednesday": "5:30 pm - 11:00 pm",
//     "Thursday": "5:30 pm - 11:00 pm",
//     "Friday": "5:30 pm - 11:00 pm",
//     "Saturday": "12:00 pm - 4:00 pm, 5:30 pm - 12:00 am",
//     "Sunday": "12:00 pm - 4:00 pm, 5:30 pm - 11:00 pm"
//   },
//   "createdAt": 1504095563444,
//   "updatedAt": "2017-09-14T14:01:27.653Z",
//   "id": 1,
//   "is_favorite": false
// }

// -- The reviews format (fetch) --
// [
//   {
//     "id": 1,
//     "restaurant_id": 1,
//     "name": "Steve",
//     "createdAt": 1504095567183,
//     "updatedAt": 1504095567183,
//     "rating": 4,
//     "comments": "Mission Chinese Food has grown up from its scrappy Orchard Street days into a big, two story restaurant equipped with a pizza oven, a prime rib cart, and a much broader menu. Yes, it still has all the hits â€” the kung pao pastrami, the thrice cooked bacon â€”but chef/proprietor Danny Bowien and executive chef Angela Dimayuga have also added a raw bar, two generous family-style set menus, and showstoppers like duck baked in clay. And you can still get a lot of food without breaking the bank."
//   },
//   {
//     "id": 2,
//     "restaurant_id": 1,
//     "name": "Morgan",
//     "createdAt": 1504095567183,
//     "updatedAt": 1504095567183,
//     "rating": "4",
//     "comments": "This place is a blast. Must orders: GREEN TEA NOODS, sounds gross (to me at least) but these were incredible!, Kung pao pastrami (but you already knew that), beef tartare was a fun appetizer that we decided to try, the spicy ma po tofu SUPER spicy but delicous, egg rolls and scallion pancake i could have passed on... I wish we would have gone with a larger group, so much more I would have liked to try!"
//   },
//   {
//     "id": 3,
//     "restaurant_id": 1,
//     "name": "Jason",
//     "createdAt": 1504095567183,
//     "updatedAt": 1504095567183,
//     "rating": "3",
//     "comments": "I was VERY excited to come here after seeing and hearing so many good things about this place. Having read much, I knew going into it that it was not going to be authentic Chinese. The place was edgy, had a punk rock throwback attitude, and generally delivered the desired atmosphere. Things went downhill from there though. The food was okay at best and the best qualities were easily overshadowed by what I believe to be poor decisions by the kitchen staff."
//   }
// ]

// -- The review format (create) --
// {
//   "restaurant_id": <restaurant_id>,
//   "name": <reviewer_name>,
//   "rating": <rating>,
//   "comments": <comment_text>
// }

// -- The review format (update) --
// {
//   "name": <reviewer_name>,
//   "rating": <rating>,
//   "comments": <comment_text>
// }