class FavoriteBtn {
  /**
   * Make a HTML link anchor behave as a switch control to favorite/unfavorite
   * one restaurant.
   * @param {HTMLElement} el the anchor element
   * @param {Restaurant} restaurant 
   */
  constructor(el, restaurant) {
    this.el = el;
    this.el.setAttribute('role', 'switch');
    this.setRestaurant(restaurant);
  }

  /**
   * Set the button state 
   * @param {boolean} favorite 
   */
  setFavorite(favorite) {
    this.restaurant.is_favorite = favorite;
    this.el.setAttribute('aria-checked', favorite);
    this.el.setAttribute('aria-label', (favorite) ? 'Unfavorite Restaurant ' + this.restaurant.name : 'Favorite Restaurant ' + this.restaurant.name);
    this.el.innerHTML = '<i class="fas fa-heart"></i>';
    this.el.href = '#';
    if (favorite) {
      this.el.className = 'is_favorite';
    } else {
      this.el.removeAttribute('class');
    }
  }

  /**
   * Return the current button state
   * @returns {boolean}
   */
  isFavorite() {
    return this.restaurant.is_favorite;
  }

  /**
   * Set the restaurant object for this control 
   * @param {Restaurant} restaurant 
   */
  setRestaurant(restaurant) {
    this.restaurant = restaurant;
    this.setFavorite(this.restaurant.is_favorite);
  }

  /**
   * Return the restaurant object associated to this control
   * @returns {Restaurant}
   */
  getRestaurant() {
    return this.restaurant;
  }

  /**
   * Toggle the button state
   */
  toggle() {
    this.setFavorite(!this.restaurant.is_favorite);
  }

  /**
   * Set the click function handler for the click event
   * @param {Function} click_handler 
   */
  setClickHandler(click_handler) {
    this.el.onclick = click_handler;
  }
}