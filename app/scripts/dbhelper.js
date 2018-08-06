class DBHelper {
  /**
 * Restaurant page URL.
 */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    let imageUrl = `/img/${restaurant.id}`;
    if (restaurant.photograph) {
      imageUrl = `/img/${restaurant.photograph}`;
    }
    if (!imageUrl.endsWith('.jpg')) {
      imageUrl += '.jpg';
    }
    return imageUrl;
  }

  /**
   * Get a parameter by name from page URL.
   */
  static getParameterByName(name, url) {
    if (!url) {
      url = window.location.href;
    }
    name = name.replace(/[\[\]]/g, '\\$&');
    const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
      results = regex.exec(url);
    if (!results) {
      return null;
    } 
    if (!results[2]) {
      return '';
    }
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
  }
}