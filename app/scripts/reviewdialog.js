class ReviewDialog {
  constructor(el, acceptFunc, cancelFunc) {
    this.el = el;

    this.el.setAttribute('aria-hidden', true);

    this.closeBtn = this.el.querySelector('.modal-title > span');
    this.closeBtn.onclick = this.cancel.bind(this);

    this.nameEl = this.el.querySelector('#reviewer_name');
    this.reviewEl = this.el.querySelector('#reviewer_text');
    this.ratingEl = this.el.querySelector('#reviewer_rating');
    this.ratingStarEl = this.el.querySelector('#reviewer_rating_stars');
    this.reviewBtn = this.el.querySelector('#review_btn');

    // the button is disabled by default
    this.reviewBtn.setAttribute('disabled', true);
    this.reviewBtn.onclick = this.accept.bind(this);

    // Set rating control change
    this.ratingEl.onchange = this._ratingChanged.bind(this);
    this.ratingCtrl = new RatingControl(this.ratingStarEl);
    this._ratingChanged();

    // register other controls events
    this.nameEl.onchange = this._reviewerNameChanged.bind(this);
    this.reviewEl.onchange = this._reviewerTextChanged.bind(this);

    // set the dialog functions
    this.acceptFunc = acceptFunc || function () {};
    this.cancelFunc = cancelFunc || function () {};

    // When the user clicks outside the dialog window
    const thisObj = this;
    window.onclick = function (event) {
      if (event.target === thisObj.el) {
        thisObj.cancel();
      }
    };
  }

  /**
   * Escape the string
   * @param {string} string 
   */
  _escapeHTML(string) {
    // escape the user entries
    var htmlEscapes = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      '\'': '&#x27;',
      '/': '&#x2F;'
    };
    
    // Regex containing the keys listed immediately above.
    var htmlEscaper = /[&<>"'\/]/g;

    return ('' + string).replace(htmlEscaper, function(match) {
      return htmlEscapes[match];
    });
  }

  /**
   * Update the RatingCtrl basedon user input
   */
  _ratingChanged() {
    this.ratingCtrl.setRating(this.getReviewerRating());
  }

  /**
   * Return true if the reviewer name is composed of alphanumeric characters
   */
  _validateName() {
    var validRegEx = /^[A-Za-z0-9 ]+$/gi;
    const name = this.getReviewerName();
    return name.length >= 5 && name.length <= 48 && validRegEx.test(name);
  }

  /**
   * The review text length should not exceed 512 characters
   */
  _validateReview() {
    const review = this.getReviewerComments();
    return review.length >= 10 && review.length <= 512;
  }

  /**
   * Validate the reviewer name after the user changes the input field text
   */
  _reviewerNameChanged() {
    const errorEl = this.el.querySelector('#reviewer_name + small');
    const valid = this._validateName();
    if (!valid) {
      errorEl.innerHTML = 'The name could only contain letters, digits and spaces.';
    } else {
      errorEl.innerHTML = '';
    }
    this.isValid();
  }

  /**
   * Validate the review contents after the user changes the input field text
   */
  _reviewerTextChanged() {
    const errorEl = this.el.querySelector('#reviewer_text + small');
    const valid = this._validateReview();
    if (!valid) {
      errorEl.innerHTML = 'The review should not be lesser than 10 characters and should not exceed 512 characters.';
    } else {
      errorEl.innerHTML = '';
    }
    this.isValid();
  }

  /**
   * Enable/Disable the review submit button
   * @param {boolean} enable 
   */
  _enableReviewBtn(enable) {
    if (!enable) {
      this.reviewBtn.setAttribute('disabled', true);
    } else {
      this.reviewBtn.removeAttribute('disabled');
    }
  }

  /**
   * Return the review rating value
   * @returns {number}
   */
  getReviewerRating() {
    return parseInt(this.ratingEl.value);
  }

  /**
   * Return the reviewer name
   * @param {boolean} escape 
   */
  getReviewerName(escape) {
    if (escape) {
      return this._escapeHTML(this.nameEl.value.trim());
    }
    return this.nameEl.value.trim();
  }

  /**
   * Return the reviewer comment
   * @param {boolean} escape 
   */
  getReviewerComments(escape) {
    if (escape) {
      return this._escapeHTML(this.reviewEl.value.trim());
    }
    return this.reviewEl.value.trim();
  }

  /**
   * @returns {Review}
   */
  getReview() {
    return new Review({
      name: this.getReviewerName(true),
      comments: this.getReviewerComments(true),
      rating: this.getReviewerRating()
    });
  }

  /**
   * Return true if the form contains valid data
   * If the data is valid the submit button is enabled
   */
  isValid() {
    const valid = this._validateName() && this._validateReview();
    this._enableReviewBtn(valid);
    return valid;
  }

  /**
   * Display this dialog
   */
  showDialog() {
    this.el.setAttribute('aria-hidden', false);
    this.el.style.display = 'block';
  }

  /**
   * Hide this dialog
   */
  _close() {
    this.el.setAttribute('aria-hidden', true);
    this.el.style.display = 'none';
  }

  /**
   * Action to take when the user clicks on this submit button
   */
  accept() {
    this._close();
    this.acceptFunc();
  }

  /**
   * Action to take when the user clicks on cancel button
   */
  cancel() {
    this._close();
    this.cancelFunc();
  }
}