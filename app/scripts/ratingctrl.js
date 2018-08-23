class RatingControl {
  constructor(el) {
    this.el = el;
    this.init();
    this.setRating(0);
  }

  init() {
    this.el.innerHTML = '';
    this.el.setAttribute('role', 'note');
    this.el.setAttribute('aria-atomic', 'true');
  }

  /**
   * Set the restaurant rating
   * @param {number} rating 
   */
  setRating(rating) {
    this.rating = Math.floor(rating);
    if (this.rating > 5) {
      this.rating = 5;
    } else if (this.rating < 0) {
      this.rating = 0;
    }
    this.renderRating();
  }

  /**
   * Get the restaurant rating
   */
  getRating() {
    return this.rating;
  }

  /**
   * Render the restaurant rating
   */
  renderRating() {
    this.el.innerHTML = '';
    this.el.setAttribute('aria-label', 'rating ' + this.rating + ' stars');
    this.el.setAttribute('class', 'rating stars_' + this.rating);
    for (let i = 1; i <= 5; i++) {
      const star = document.createElement('span');
      star.setAttribute('class', (i > this.rating) ? 'far fa-star' : 'fas fa-star');
      this.el.appendChild(star);
    }
  }
}