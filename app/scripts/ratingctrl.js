class RatingControl {
  constructor(el) {
    this.el = el;
    this.init();
    this.setRating(0);
  }

  init() {
    rating.innerHTML = '';
    rating.setAttribute('role', 'note');
    rating.setAttribute('aria-label', 'rating ' + review.rating + ' stars');
    rating.setAttribute('aria-atomic', 'true');
    rating.setAttribute('class', 'rating stars_' + review.rating);
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
    rating.innerHTML = '';
    for (let i = 1; i <= 5; i++) {
      const star = document.createElement('span');
      star.setAttribute('class', (i > rating) ? 'far fa-star' : 'fas fa-star');
      el.appendChild(star);
    }
  }
}