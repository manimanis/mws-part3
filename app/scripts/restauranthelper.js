class RestaurantHelper {
  constructor() {
    this.db = new RestaurantsDB();
    this.restoMap = new MapHelper();

    this.id = parseInt(DBHelper.getParameterByName('id'));

    var thisObj = this;
    this.reviewDlg = new ReviewDialog(document.querySelector('#modal'), function () {
      // save the review when the user submit it
      const review = thisObj.reviewDlg.getReview();
      review.restaurant_id = thisObj.id;

      RestaurantFetch.createReview(review)
        .then(review => {
          console.log('Review saved: ', review);
          thisObj.db.saveReview(review);
          thisObj.getReviewsFromDB();
        })
        .catch(error => {
          console.log('Could not save the review, your review will be saved for later sync');
          thisObj.db.addToPendingQueue(review);
          thisObj.db.saveReview(review);
          thisObj.getReviewsFromDB();
        });
    });

    this.initMap();

    this.restaurant = null;
    this.getRestaurantFromDB()
      .then(() => this.getReviewsFromDB())
      .then(() => DataPersister.persistSavePending())
      .then(() => console.log('All pending data are saved'))
      .then(() => this.fetchRestaurantFromNetwork())
      .then(() => this.fetchReviewsFromNetwork())
      .then(() => this.getRestaurantFromDB())
      .then(() => this.getReviewsFromDB());
  }

  init(restaurant) {
    this.restaurant = restaurant;
    this.initMap(restaurant);
  }

  initMap() {
    this.restoMap.initMap();
  }

  /**
   * Center the map on the following coordinates
   * @param {array} restaurant 
   */
  centerMap(restaurant) {
    this.restoMap.centerMap([restaurant.latlng.lat, restaurant.latlng.lng]);
  }

  /**
   * Fetch restaurant data from IDB
   * @returns {Promise<Restaurant>}
   */
  getRestaurantFromDB() {
    console.log('Fetch restaurant data from IDB');
    return this.db.getRestaurantsById(this.id)
      .then(restaurant => {
        this.centerMap(restaurant);
        this.fillBreadcrumb(restaurant);
        this.restoMap.mapMarkerForRestaurant(restaurant);
        this.fillRestaurantHTML(restaurant);
        return restaurant;
      });
  }

  /**
   * Fetch restaurant information than save them in IDB
   * @return {Promise<restaurant>}
   */
  fetchRestaurantFromNetwork() {
    console.log('Fetch restaurant information than save them in IDB');
    return RestaurantFetch.fetchRestaurant(this.id)
      .then(restaurant => {
        console.log('fetch restaurant from network and saving data');
        this.db.saveRestaurant(restaurant);
        return restaurant;
      });
  }

  /**
   * Fetch Reviews data from IDB
   * @returns {Promise<Review>}
   */
  getReviewsFromDB() {
    console.log('Fetch Reviews data from IDB');
    return this.db.getAllReviews(this.id)
      .then(reviews => {
        console.log(`fetched ${reviews.length} reviews from idb`);
        this.fillReviewsHTML(reviews);
        return reviews;
      });
  }

  /**
   * Fetch reviews informations from Network and save the data to IDB
   * @return {Promise<Review[]>}
   */
  fetchReviewsFromNetwork() {
    console.log('Fetch reviews informations from Network and save the data to IDB');
    return RestaurantFetch.fetchRestaurantReviews(this.id)
      .then(reviews => {
        this.db.saveReviews(reviews);
        return reviews;
      });
  }

  /**
   * Get current restaurant from page URL.
   */
  fetchRestaurantFromURL() { }

  /**
   * Add restaurant name to the breadcrumb navigation menu
   */
  fillBreadcrumb(restaurant) {
    const breadcrumb = document.getElementById('breadcrumb');
    const li = document.createElement('li');
    li.innerHTML = restaurant.name;
    breadcrumb.appendChild(li);
  }

  /**
   * Create review HTML and add it to the webpage.
   */
  createReviewHTML(review) {
    const li = document.createElement('li');
    li.setAttribute('aria-label', 'Review by ' + review.name);

    const name = document.createElement('h3');
    name.innerHTML = review.name;
    name.setAttribute('class', 'author');
    li.appendChild(name);

    const updatedDate = new Date(review.updatedAt);

    const date = document.createElement('div');
    date.innerHTML = updatedDate.toDateString();
    date.setAttribute('class', 'date');
    li.appendChild(date);

    const rating = document.createElement('div');
    li.appendChild(rating);

    const ratingCtrl = new RatingControl(rating);
    ratingCtrl.setRating(review.rating);

    const comments = document.createElement('div');
    comments.innerHTML = review.comments;
    comments.setAttribute('class', 'comment');
    li.appendChild(comments);

    return li;
  }

  /**
   * Create all reviews HTML and add them to the webpage.
   */
  fillReviewsHTML(reviews) {
    const container = document.getElementById('reviews-container');
    container.innerHTML = '<ul id="reviews-list"></ul>';

    const title = document.createElement('h2');
    title.innerHTML = 'Reviews';
    container.appendChild(title);

    const divEl = document.createElement('div');
    divEl.id = 'review_add_new_div';
    container.appendChild(divEl);

    const addBtn = document.createElement('button');
    addBtn.id = 'review_add_new_btn';
    addBtn.innerHTML = '<i class="fas fa-edit"></i> New Review...';
    addBtn.onclick = this.reviewDlg.showDialog.bind(this.reviewDlg);
    divEl.appendChild(addBtn);

    if (!reviews) {
      const noReviews = document.createElement('p');
      noReviews.innerHTML = 'No reviews yet!';
      container.appendChild(noReviews);
      return;
    }

    const ul = document.getElementById('reviews-list');
    reviews.forEach(review => {
      ul.appendChild(this.createReviewHTML(review));
    });
    container.appendChild(ul);
  }

  /**
   * Create restaurant HTML and add it to the webpage
   */
  fillRestaurantHTML(restaurant) {
    const name = document.getElementById('restaurant-name');
    name.innerHTML = restaurant.name;

    const address = document.getElementById('restaurant-address');
    address.innerHTML = restaurant.address;

    /* changes mades by me */
    const figure = document.getElementById('restaurant-img');
    figure.removeAttribute('id');
    const picture = figure.getElementsByTagName('picture')[0];

    const imageSrc = DBHelper.imageUrlForRestaurant(restaurant);
    const largeImageSrc = imageSrc.replace('.jpg', '-large_2x.jpg');
    const normalImageSrc = imageSrc.replace('.jpg', '-normal_1x.jpg');
    const smallImageSrc = imageSrc.replace('.jpg', '-small.jpg');

    const source = document.createElement('source');
    source.setAttribute('srcset', largeImageSrc + ' 2x,' + normalImageSrc + ' 1x');
    picture.appendChild(source);

    const image = document.createElement('img');
    image.id = 'restaurant-img';
    image.className = 'restaurant-img';
    image.src = smallImageSrc;
    image.setAttribute('alt', 'Image of ' + restaurant.name + ' Restaurant');
    picture.appendChild(image);

    //const image = document.getElementById('restaurant-img');
    //image.className = 'restaurant-img'
    //image.src = DBHelper.imageUrlForRestaurant(restaurant);

    const cuisine = document.getElementById('restaurant-cuisine');
    cuisine.innerHTML = restaurant.cuisine_type;

    // fill operating hours
    if (restaurant.operating_hours) {
      this.fillRestaurantHoursHTML(restaurant.operating_hours);
    }
  }

  /**
   * Create restaurant operating hours HTML table and add it to the webpage.
   */
  fillRestaurantHoursHTML(operatingHours) {
    const hours = document.getElementById('restaurant-hours');
    for (let key in operatingHours) {
      const row = document.createElement('tr');

      const day = document.createElement('td');
      day.innerHTML = key;
      row.appendChild(day);

      const time = document.createElement('td');
      time.innerHTML = operatingHours[key];
      row.appendChild(time);

      hours.appendChild(row);
    }
  }
}

window.restaurantHelper = new RestaurantHelper();

// let restaurant;
// var newMap;

// /**
//  * Initialize map as soon as the page is loaded.
//  */
// document.addEventListener('DOMContentLoaded', (event) => {
//   initMap();
// });

// /**
//  * Initialize leaflet map
//  */
// initMap = () => {
//   fetchRestaurantFromURL((error, restaurant) => {
//     if (error) { // Got an error!
//       console.error(error);
//     } else {
//       self.newMap = L.map('map', {
//         center: [restaurant.latlng.lat, restaurant.latlng.lng],
//         zoom: 16,
//         scrollWheelZoom: false,
//         // the map is not focused by default
//         keyboard: false
//       });
//       L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}', {
//         mapboxToken: 'pk.eyJ1IjoibWFuaWFuaXMiLCJhIjoiY2l4dzJxYmE4MDAwbzJ3bG1yNm1ycjBjaCJ9.Wh2_bwQz6A3OK_izZcS1xQ',
//         maxZoom: 18,
//         attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/" tabindex="-1">OpenStreetMap</a> contributors, ' +
//           '<a href="https://creativecommons.org/licenses/by-sa/2.0/" tabindex="-1">CC-BY-SA</a>, ' +
//           'Imagery © <a href="https://www.mapbox.com/" tabindex="-1">Mapbox</a>',
//         id: 'mapbox.streets'
//       }).addTo(newMap);
//       fillBreadcrumb();
//       DBHelper.mapMarkerForRestaurant(self.restaurant, self.newMap);
//     }
//   });
// }

// /* window.initMap = () => {
//   fetchRestaurantFromURL((error, restaurant) => {
//     if (error) { // Got an error!
//       console.error(error);
//     } else {
//       self.map = new google.maps.Map(document.getElementById('map'), {
//         zoom: 16,
//         center: restaurant.latlng,
//         scrollwheel: false
//       });
//       fillBreadcrumb();
//       DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
//     }
//   });
// } */

// /**
//  * Get current restaurant from page URL.
//  */
// fetchRestaurantFromURL = (callback) => {
//   if (self.restaurant) { // restaurant already fetched!
//     callback(null, self.restaurant)
//     return;
//   }
//   const id = getParameterByName('id');
//   if (!id) { // no id found in URL
//     error = 'No restaurant id in URL'
//     callback(error, null);
//   } else {
//     DBHelper.fetchRestaurantById(id, (error, restaurant) => {
//       self.restaurant = restaurant;
//       if (!restaurant) {
//         console.error(error);
//         return;
//       }
//       fillRestaurantHTML();
//       callback(null, restaurant)
//     });
//   }
// }

