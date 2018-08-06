class MainHelper {
  constructor() {
    this.restDB = new RestaurantsDB();
    this.restoMap = new MapHelper();

    RestaurantFetch.fetchRestaurants()
      .then(restaurants => {
        this.restDB.saveRestaurants(restaurants);
        
        this.updateRestaurants();
        this.fetchNeighborhoods();
        this.fetchCuisines();
      });

    this.initMap();
    this.fetchNeighborhoods();
    this.fetchCuisines();
  }

  /**
   * Initialize leaflet map, called from HTML.
   */
  initMap() {
    this.restoMap.initMap();
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

    this.restDB.getByCuisineAndNeighborhood(cuisine, neighborhood)
      .then(restaurants => {
        this.resetRestaurants();
        this.fillRestaurantsHTML(restaurants);
      });
  }

  /**
   * Clear current restaurants, their HTML and remove their map markers.
   */
  resetRestaurants() {
    // Remove all restaurants
    this.restaurants = [];
    const ul = document.getElementById('restaurants-list');
    ul.innerHTML = '';

    this.restoMap.removeMarkers();
  }

  /**
   * Create all restaurants HTML and add them to the webpage.
   */
  fillRestaurantsHTML(restaurants) {
    this.restaurants = restaurants;

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
    more.innerHTML = 'View Details';
    more.href = DBHelper.urlForRestaurant(restaurant);
    li.append(more)

    return li;
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
    this.restDB.getCuisines()
      .then(cuisines => this.fillCuisinesHTML(cuisines));
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
    this.restDB.getNeighborhoods()
      .then(neighborhoods => {
        this.fillNeighborhoodsHTML(neighborhoods);
      });
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







