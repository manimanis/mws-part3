class MainHelper {
  constructor() {
    this.restDB = new RestaurantsDB();
    this.restoMap = new MapHelper();

    this.initMap();
    this.fetchRestaurants();
  }

  /**
   * Initialize leaflet map, called from HTML.
   */
  initMap() {
    this.restoMap.initMap();
  }

  /**
   * Fetch restaurants from IDB first then try to fetch from network
   */
  fetchRestaurants() {
    this.restDB.getAllRestaurants()
      .then(idb_restaurants => {
        this.restaurants = new RestaurantCollection(idb_restaurants);

        this.fetchNeighborhoods();
        this.fetchCuisines();
        this.updateRestaurants();

        // Get the pending data 
        // if the operation succeeds than 
        //  - clear the pending_save flag
        //  - update the IDB store
        const restPending = this.restaurants.getPendingSave();
        if (restPending.length > 0) {
          RestaurantFetch.favoriteRestaurants(restPending)
            .then(() => {
              this.restaurants.clearPendingSave();
              this.restDB.saveRestaurants(restPending);
            });
        }

        // Fetch restaurants from network
        RestaurantFetch.fetchRestaurants()
          .then(restaurants => {
            this.restaurants = new RestaurantCollection(restaurants);

            this.restDB.saveRestaurants(this.restaurants);

            this.fetchNeighborhoods();
            this.fetchCuisines();
            this.updateRestaurants();
          });
      });
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
    favoriteLink.setAttribute('aria-label', (restaurant.is_favorite) ? 'Unfavorite Restaurant' : 'Favorite Restaurant');
    favoriteLink.innerHTML = '<i class="fas fa-heart"></i>';
    favoriteLink.href = '#';
    if (restaurant.is_favorite) {
      favoriteLink.className = 'is_favorite';
    }
    favoriteLink.onclick = this.toggleFavoriteClick(li, restaurant);
    favoriteDiv.appendChild(favoriteLink);

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
   * @param {HTMLElement} li 
   * @param {Restaurant} restaurant 
   */
  toggleFavoriteClick(li, restaurant) {
    const thisObj = this;
    return function (e) {
      e.preventDefault();
      const favoriteLink = li.querySelector('div.favorite-restaurant a');

      restaurant.is_favorite = !restaurant.is_favorite;
      if (restaurant.is_favorite) {
        favoriteLink.className = 'is_favorite';
      } else {
        favoriteLink.removeAttribute('class');
      }

      // TODO: Add handeling state with IDB and network
      RestaurantFetch.favoriteRestaurant(restaurant.id, restaurant.is_favorite)
        .then(response => response.json())
        .then(restaurant_net => {
          thisObj.restDB.saveRestaurant(new Restaurant(restaurant_net));
        })
        .catch(error => {
          console.log('Could not un/favorite restaurant', error);
          // TODO: Set save_pending flag
          restaurant.save_pending = true;
          thisObj.restDB.saveRestaurant(restaurant);
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







