class MainHelper {
  constructor() {
    this.restDB = new RestaurantsDB();
    this.restoMap = new MapHelper();

    this.initMap();
    this.getRestaurantsFromDB()
      .then(() => {
        this.worker = new Worker('scripts/worker.js');
        this.worker.onmessage = (e) => {
          this.getRestaurantsFromDB();
        };
        this.worker.postMessage('start');
      })
      .then(() => this.fetchRestaurantsFromNetwork());
  }

  /**
   * Initialize leaflet map, called from HTML.
   */
  initMap() {
    this.restoMap.initMap();
  }

  /**
   * Fetch restaurants from IDB
   */
  getRestaurantsFromDB() {
    return this.restDB.getAllRestaurants()
      .then(restaurants => {
        console.log('Fetched restaurants data from IDB');
        this.setRestaurants(restaurants);
      });
  }

  /**
   * Fetch restaurants from Network
   */
  fetchRestaurantsFromNetwork() {
    return RestaurantFetch.fetchRestaurants()
      .then(restaurants => {
        console.log('Fetched restaurants data from Network');
        this.restDB.saveRestaurants(restaurants);
        this.setRestaurants(restaurants);
      });
  }

  /**
   * Update the page with this collection of restaurants
   * @param {RestaurantCollection} restaurants 
   */
  setRestaurants(restaurants) {
    this.restaurants = restaurants;
    this.fillNeighborhoodsHTML(this.restaurants.getNeighborhoods());
    this.fillCuisinesHTML(this.restaurants.getCuisines());
    this.updateRestaurants();
  }

  /**
   * Update page and map for current restaurants.
   */
  updateRestaurants() {
    const cSelect = document.getElementById('cuisines-select');
    const nSelect = document.getElementById('neighborhoods-select');

    const cIndex = cSelect.selectedIndex;
    const nIndex = nSelect.selectedIndex;

    const cuisine = cSelect[cIndex].value;
    const neighborhood = nSelect[nIndex].value;

    const restaurants = this.restaurants.getByCuisineAndNeighborhood(cuisine, neighborhood);
    this.resetRestaurants();
    this.fillRestaurantsHTML(restaurants);
  }

  /**
   * Clear current restaurants, their HTML and remove their map markers.
   */
  resetRestaurants() {
    const ul = document.getElementById('restaurants-list');
    ul.innerHTML = '';

    this.restoMap.removeMarkers();
  }

  /**
   * Create all restaurants HTML and add them to the webpage.
   */
  fillRestaurantsHTML(restaurants) {
    const ul = document.getElementById('restaurants-list');
    restaurants.forEach(restaurant => {
      ul.append(this.createRestaurantHTML(restaurant));
    });
    this.addMarkersToMap(restaurants);
  }

  /**
   * Create restaurant HTML.
   */
  createRestaurantHTML(restaurant) {
    const li = document.createElement('li');
    li.setAttribute('aria-label', restaurant.name + ' restaurant\'s description');

    const favoriteDiv = document.createElement('div');
    favoriteDiv.classList = ['favorite-restaurant'];
    li.appendChild(favoriteDiv);

    const favoriteLink = document.createElement('a');
    favoriteDiv.appendChild(favoriteLink);
    const favoriteBtn = new FavoriteBtn(favoriteLink, restaurant);
    favoriteBtn.setClickHandler(this.toggleFavoriteClick(favoriteBtn));

    const picture = document.createElement('picture');
    li.appendChild(picture);

    const imageSrc = DBHelper.imageUrlForRestaurant(restaurant);
    const largeImageSrc = imageSrc.replace('.jpg', '-large_2x.jpg');
    const normalImageSrc = imageSrc.replace('.jpg', '-normal_1x.jpg');
    const smallImageSrc = imageSrc.replace('.jpg', '-small.jpg');

    const source = document.createElement('source');
    source.setAttribute('srcset', largeImageSrc + ' 2x,' + normalImageSrc + ' 1x');
    picture.appendChild(source);

    const image = document.createElement('img');
    image.className = 'restaurant-img';
    image.src = smallImageSrc;
    image.setAttribute('alt', 'Image of ' + restaurant.name + ' Restaurant');
    picture.appendChild(image);

    const name = document.createElement('h2');
    name.innerHTML = restaurant.name;
    li.append(name);

    const neighborhood = document.createElement('p');
    neighborhood.innerHTML = restaurant.neighborhood;
    li.append(neighborhood);

    const address = document.createElement('p');
    address.innerHTML = restaurant.address;
    li.append(address);

    const more = document.createElement('a');
    more.classList = ['view-details'];
    more.innerHTML = 'View Details';
    more.href = DBHelper.urlForRestaurant(restaurant);
    li.append(more);

    return li;
  }

  /**
   * Return a function used to toggle the favorite state for this button
   * @param {Restaurant} favoriteBtn 
   */
  toggleFavoriteClick(favoriteBtn) {
    const thisObj = this;
    return function (e) {
      e.preventDefault();

      const restaurant = favoriteBtn.getRestaurant();
      favoriteBtn.toggle();

      // If we cannot un/favorite a restaurant we add it to the pending queue
      RestaurantFetch.favoriteRestaurant(restaurant.id, restaurant.is_favorite)
        .then(() => thisObj.restDB.saveRestaurant(restaurant))
        .then(() => console.log(`Restaurant ${restaurant.name} ` + (restaurant.is_favorite ? 'is favorite' : 'is unfavorite')))
        .catch(error => {
          console.log('Could not un/favorite restaurant', error);
          thisObj.restDB.saveRestaurant(restaurant);
          thisObj.restDB.addToPendingQueue(restaurant);

          // relay the task to the worker
          thisObj.worker.postMessage('start');
        });
    };
  }

  /**
   * Add markers for current restaurants to the map.
   */
  addMarkersToMap(restaurants) {
    this.restoMap.addMarkersToMap(restaurants);
  }

  /**
 * Fetch all cuisines and set their HTML.
 */
  fetchCuisines() {
    this.fillCuisinesHTML(this.restaurants.getCuisines());
  }

  /**
   * Set cuisines HTML.
   */
  fillCuisinesHTML(cuisines) {
    this.cuisines = cuisines;

    const select = document.getElementById('cuisines-select');
    select.innerHTML = '<option value="all">All Cuisines</option>';
    cuisines.forEach(cuisine => {
      const option = document.createElement('option');
      option.innerHTML = cuisine;
      option.value = cuisine;
      select.append(option);
    });
  }

  /**
   * Fetch all neighborhoods and set their HTML.
   */
  fetchNeighborhoods() {
    this.fillNeighborhoodsHTML(this.restaurants.getNeighborhoods());
  }

  /**
   * Set neighborhoods HTML.
   */
  fillNeighborhoodsHTML(neighborhoods) {
    this.neighborhoods = neighborhoods;

    const select = document.getElementById('neighborhoods-select');
    select.innerHTML = '<option value="all">All Neighborhoods</option>';
    neighborhoods.forEach(neighborhood => {
      const option = document.createElement('option');
      option.innerHTML = neighborhood;
      option.value = neighborhood;
      select.append(option);
    });
  }

}

window.mainHelper = new MainHelper();







