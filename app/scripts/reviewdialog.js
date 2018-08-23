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
    
    // Escape a string for HTML interpolation.
    this._escapeHTML = function(string) {
      return ('' + string).replace(htmlEscaper, function(match) {
        return htmlEscapes[match];
      });
    };

    const thisObj = this;
    window.onclick = function (event) {
      if (event.target === thisObj.el) {
        thisObj.cancel();
      }
    };
  }

  _ratingChanged() {
    const newRating = parseInt(this.ratingEl.value);
    this.ratingCtrl.setRating(newRating);
  }

  _validateName() {
    var validRegEx = /^[A-Za-z0-9 ]+$/gi;
    const name = this._escapeHTML(this.nameEl.value);
    return name.length >= 5 && name.length <= 48 && validRegEx.test(name);
  }

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

  _validateReview() {
    const review = this._escapeHTML(this.reviewEl.value);
    return review.length >= 10 && review.length <= 512;
  }

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

  isValid() {
    const valid = this._validateName() && this._validateReview();
    if (!valid) {
      this.reviewBtn.setAttribute('disabled', true);
    } else {
      this.reviewBtn.removeAttribute('disabled');
    }
    return valid;
  }

  show() {
    this.el.setAttribute('aria-hidden', false);
    this.el.style.display = 'block';
  }

  close() {
    this.el.setAttribute('aria-hidden', true);
    this.el.style.display = 'none';
  }

  accept() {
    this.close();
    this.acceptFunc();
  }

  cancel() {
    this.close();
    this.cancelFunc();
  }
}