/*
 * HTML Slideshow
 * Author: Rob Flaherty | rob@ravelrumba.com
 * Copyright (c) 2011 Rob Flaherty
 * MIT Licensed: http://www.opensource.org/licenses/mit-license.php
 */

var htmlSlides = {

  currentSlide: 1,
  deck: null,
  slideCount: null,
  prevButton: null,
  nextButton: null,
  slideNumber: null,

  init: function(options) {
    this.deck = $('#deck');
    this.slides = $('#deck > section');
    this.slideCount = this.slides.size();
    this.prevButton = $('#prev-btn');
    this.nextButton = $('#next-btn');
    this.slideNumber = $('#slide-number');

    //Add classes and ids to slides
    $('#deck > section').addClass('slide').each(function(index, el) { el.id = index + 1; });

    //Set total slide count in header
    $('#slide-total').html(this.slideCount);

    //Bind control events
    this.prevButton.on('click', $.proxy(this, 'prevSlide'));
    this.nextButton.on('click', $.proxy(this, 'showActions'));
    $('html').on('keydown', $.proxy(this, 'keyControls'));

    //Set initial slide
    this.changeSlide(parseInt(location.hash.slice(1)) || this.currentSlide);

    //Ensure focus stays on window and not embedded iframes/objects
    $(window).load(function() {
      this.focus();
    });

  },

  //Change slide
  changeSlide: function(id) {
    if (id < 1 || id > this.slideCount)
      id = id < 1 ? 1 : this.slideCount;

    this.currentSlide = id;

    //Update slide classes
    this.slides.removeClass('slide-selected').eq(id - 1).addClass('slide-selected')

    //Remove animations on previous slides
      .prevAll().find('.action').removeClass('action');

    //Update toolbar
    this.slideNumber.html(id);

    //Update hash
    location.hash = id;

    //Trigger newSlide event
    $('html').trigger('newSlide', id);

    //Hide arrows on first and last slides
    this.prevButton.css('visibility', id === 1 ? 'hidden' : 'visible');
    this.nextButton.css('visibility', id === this.slideCount ? 'hidden' : 'visible');
  },

  //Previous and Next slide
  prevSlide: function() { this.changeSlide(this.currentSlide - 1); },
  nextSlide: function() { this.changeSlide(this.currentSlide + 1); },

  //Reveal actions
  showActions: function() {
    var actions = $('.slide-selected').find('.action');

    //If actions exist
    if (actions.length > 0) {
      actions.first().removeClass('action').addClass('action-on').fadeIn(250);

      //Trigger newAction event
      $('html').trigger("newAction", $('.slide-selected').find('.action-on').length );
    } else {
      this.nextSlide();
    }
  },

  //Keyboard controls
  keyControls: function(event) {
    switch(event.keyCode) {
      //Left, up, and page up keys
      case 37:
      case 38:
      case 33:
        this.prevSlide();
      break;
      //Right, down, spacebar, and page down keys
      case 32:
      case 34:
      case 39:
      case 40:
        this.showActions();
      break;
    }
  }

};
