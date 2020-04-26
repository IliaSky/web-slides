var link = location.origin + location.pathname;
var name = link.split('/').pop().replace('.html', '');
var base = link.replace(/\/[^\/]+$/, '/');

// replace relative links for printed versions
if (location.origin == 'file://') {
  window.onbeforeprint = function(){
    $('a[href^="file://"]').each(function(){
      this.href = this.href.replace(base, 'https://iliasky.com/www/presentations/');
    });
  };
  if (window.matchMedia) {
    window.matchMedia('print').addListener(window.onbeforeprint);
  }
}

$('#deck h1').eq(0).parent().append('<a class="print-location" href="' + link + '">(' + location.host + location.pathname + ')</a>')
  .append('<div class="print-time">Printed on ' + (new Date().toUTCString()) + '</div>')
  .append('<a class="pdf-download" href="' + base + 'pdf/' + name + '-light.pdf">light.pdf</a>')
  .append('<a class="pdf-download" href="' + base + 'pdf/' + name + '-dark.pdf">dark.pdf</a>');

$('head').append('<meta name="theme-color" content="#289">'); // #269186
$('head').append('<link rel="icon" href="icon.png">');
$('head').append('<link rel="manifest" href="manifest.json">');


var flags = {};
location.search.slice(1).split('&').forEach(function(e) {
  var pair = e.split('='), key = pair[0], value = pair[1];
  flags[key] = /true|yes|1/.test(value);
});


var settings = {
  dark: flags.dark || localStorage && localStorage.dark ? true : false,
  home: flags.home || false,
  read: flags.home || flags.read || false,
  isTouch: false,
  isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream
};


var util = {
  prettifyHTML: function(text) { return text.replace(/>/g, '> ').replace(/<\//g, ' </').replace(/>  /g, '> ').replace(/  <\//g, ' </').replace(/\n <\//g, '\n</');},
  escapeHTML: function(text) { return text.replace(/&/g, '&amp;').replace(/>/g, '&gt;').replace(/</g, '&lt;'); },
  codeToPre: function(text, lang) { return '<pre class="highlight ' + lang + '">' + util.escapeHTML(text) + '</pre>' },
  isTouch: (function(){
    var lastTouch = 0;
    $(document).on('touchend', function(e) {lastTouch = e.timeStamp});
    return function (e){ return (e.originalEvent || e).pointerType == 'touch' || (e.timeStamp - lastTouch < 110); }
  })(),
  isSmall: function () {
    return Math.max(document.documentElement.clientWidth, window.innerWidth || 0) <= 480;
  },
  once: function(selector, eventName, handler) {
    var $element = $(selector);
    var singleHandler = function(e) {
      handler(e);
      $element.off(eventName, singleHandler);
    };
    $element.on(eventName, singleHandler);
  }
};

var fullscreen = {
  isActive: function () { return document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement; },
  request: function () {
    var el = document.documentElement;
    var rfs = el.requestFullScreen || el.webkitRequestFullScreen || el.mozRequestFullScreen || el.msRequestFullscreen;
    rfs ? rfs.call(el) : fullscreen.toggleIE();
  },
  exit: function () {
    var efs = document.exitFullscreen || document.msExitFullscreen || document.mozCancelFullScreen || document.webkitExitFullscreen;
    efs ? efs.call(document) : fullscreen.toggleIE();
  },
  toggleIE: function () {
    var axo = window.ActiveXObject && new window.ActiveXObject("WScript.Shell");
    axo && axo.SendKeys('{F11}');
  },
  toggle: function () { fullscreen.isActive() ? fullscreen.exit() : fullscreen.request(); },
  isSupported: (function(el){
    return el.requestFullScreen || el.webkitRequestFullScreen || el.mozRequestFullScreen || el.msRequestFullscreen || window.ActiveXObject;
  })(document.documentElement)
};

$('html').addClass('desktop')
  .toggleClass('dark', settings.dark)
  .toggleClass('read-mode', settings.read)
  .addClass('fullscreen-' + (fullscreen.isSupported && !flags.home ? '' : 'not-') + 'supported');
if (location)
if (settings.isIOS) {
  $('html').removeClass('desktop').addClass('touch').addClass('ios');
  settings.isTouch = true;
  $('iframe.intro').map(function() {
    $(this).prev()
    $(this).parent().addClass('withIntro');
 });
} else {
  var checkForMouse = function(e){
    if (!util.isTouch(e)) {
      console.log("mousemove", util.isTouch(e), e);
      settings.isTouch = false;
      $('html').removeClass('touch').addClass('desktop').removeClass('navi-hover');
      $(document).off('mousemove', checkForMouse);
    }
  };
  $('html').on('click', function(e){
    var wasTouch = settings.isTouch;
    settings.isTouch = util.isTouch(e);
    console.log('click', wasTouch, settings.isTouch);
    if (settings.isTouch && !wasTouch) {
      $('html').addClass('touch').removeClass('desktop');
      $(document).on('mousemove', checkForMouse);
    }
  }, true);
}
// Textarea actions
$('textarea.single-demo, textarea.example').each(function(){
  var isPHP = this.value.indexOf('<?php') != -1 || this.className.indexOf('php') != -1;
  var content = isPHP ? this.value : util.prettifyHTML(this.value);
  $(this).replaceWith(util.codeToPre(content, isPHP ? 'php' : 'html'));
});

$('textarea.new-demo').each(function(){
  var content = util.prettifyHTML(this.value);
  var html = '<div class="demo-code">' + util.codeToPre(content, 'html') + '</div><div class="demo-result">' + this.value + '</div>';
  $(this).replaceWith('<div class="demo">' + html + '</div>');
});

// $('.demo-code textarea').change(function(){
//   var v = this.value; $(this).parent().parent().find('.demo-result').html(v);
// }).change();

// Actions
var buttons = {
  'home-button': {
    icon: '<svg width="24" height="24" viewBox="3 3 20 20"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"></path></svg>',
    container: 'body > header',
    href: './index.html'
  },
  'fullscreen': { //☒↔↕⤡⤢
    icon: '<svg width="24" height="24" viewBox="3 5 18 18"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>',
    description: 'Toggle Fullscreen',
    click: fullscreen.toggle
  },
  'toggle-dark-style': {
    icon: '&#x25d1;',
    description: 'Toggle Dark Mode',
    click: function() {
      settings.dark = !settings.dark;
      if (localStorage)
        localStorage.dark = settings.dark ? 1: '';
      $('html').toggleClass('dark', settings.dark);
    }
  },
  'read-mode': {
    icon: '&#x1f4d6;',
    description: 'Toggle Read Mode',
    click: function() {
      settings.read = !settings.read;
      $('html').toggleClass('read-mode', settings.read);
      if (settings.read) {
        buttons['disable-animations'].click();
        location.href = location.href;
      }
    }
  },
  // 'pdf-version': {
  //   icon: '⇩',
  //   description: 'PDF version',
  //   href: location.href.replace(/#.*/, '').replace(/([^\/]+)\.html/, 'pdf/$1.pdf')
  // },
  'disable-animations': {
    icon: '&#x21af;',
    description: 'Disable animations',
    click: function() {
      $('.action').addClass('action-on').removeClass('action').css({display: 'list-item'});

      $('#disable-animations').css({display: 'none'});
    }
  }
};
$('body > header nav ul').parent().parent().append('<nav id="actions-menu" />');
Object.keys(buttons).forEach(function(id) {
  var e = buttons[id];
  var href = (e.href ? ' href="' + e.href + '"' : '');
  var icon = '<span class="icon">' + e.icon + '</span>';
  var description = e.description ? '<span class="description">' + e.description + '</span>' : '';
  var container = e.container || '#actions-menu';
  $(container).prepend(
    '<a class="sky-button" id="' + id + '"' + href + '>' + icon + description + '</a>'
  );
  e.click && $('#' + id).click(e.click);
});

if (settings.read) {
  buttons['disable-animations'].click();
}
if (settings.home) {
  $('#read-mode').css({display: 'none'});
}
// Highlight Examples
var languages ={
	js: {
	  s: /(('|"|\/)(?![\w\s]*>)(?:[^\2]*?(?:[^\\\2]\\(?:\\\\)*\2[^\2]*)*)\2)/g,
	  esc: /(\\.)/g,
	  k: /(\b(function|var|let|const|super|class(?!=)|extends|void|this|replace|find|shift|unshift|join|call|apply|slice)\b|\{|\}|\[|\])/g,
	  kd: /\b(break|case|catch|continue|debugger|default|delete|do|else|finally|for|if|in|instanceof|new|return|switch|throw|try|typeof|while|with)\b/g,
	  nb: /(\$|\b(?:document|window|Math)\b)/g
	},
  php: {
    s: /(('|"|\/)(?![\w\s]*>)(?:[^\2]*?(?:[^\\\2]\\(?:\\\\)*\2[^\2]*)*)\2)/g,
    esc: /(\\.)/g,
    k: /(\b(function|class(?!=))\b|\(|\)|\{|\}|\[|\]|\$\w+)/g,
    kd: /\b(break|case|catch|continue|delete|do|if|else|finally|for|foreach|as|new|and|or|die|return|switch|throw|try|while)\b/g,
    nb: /(\$)/g
  },
  perl: {
    s: /(('|"|\/)(?![\w\s]*>)(?:[^\2]*?(?:[^\\\2]\\(?:\\\\)*\2[^\2]*)*)\2)/g,
    esc: /(\\.)/g,
    k: /(\b(if|else|new|and|or|die|return|while)\b|\(|\)|\{|\}|\[|\]|\$\w+)/g,
    kd: /(\b(use|strict|warnings|sub|map|join|class(?!=))\b)/g,
    nb: /(\$)/g
  },
  sql: {
    k: /(\(|\)|=+|\*|\||;)/g,
    esc: /(\\.)/g,
    s: /('(?:[^']*?(?:[^\\']\\(?:\\\\)*'[^']*)*)')/g,
    kd: /\b(select|insert|into|values|update|delete|create|alter|from|join|inner|left|right|full|outer|on|limit|top|group|sort|by|where|having|as|not|null|primary|key|index)\b/gi,
  },
  'java': {
    s: /(('|"|\/)(?![\w\s]*>)(?:[^\2]*?(?:[^\\\2]\\(?:\\\\)*\2[^\2]*)*)\2)/g,
    k: /(\b(do|while|for|if|else|switch|case)\b|\.|\*|\||\{|\})/g,
    esc: /(\\.|public|private|static|throws|class(?= )|null)/g,
    kd: /\b([A-Z]\w+|return|try|catch|finally|void|int|new)\b/g,
    nb: /((&[lg]t;|!)?=(?= ))/g,
    n: /\b(\d+)\b/,
    r: /\b(import)\b/g
  },
  cs:{
    s: /(('|"|\/)(?![\w\s]*>)(?:[^\2]*?(?:[^\\\2]\\(?:\\\\)*\2[^\2]*)*)\2)/g,
    k: /(\b(do|while|for|if|else|switch|case)\b|\.|\*|\||\{|\})/g,
    esc: /(\\.|public|private|static|throws|class(?= )|null)/g,
    kd: /\b([A-Z]\w+|return|try|catch|finally|void|int|new)\b/g,
    nb: /((&[lg]t;|!)?=(?= ))/g,
    n: /\b(\d+)\b/
  },
  ruby: {
    s: /(('|"|\/)(?![\w\s]*>)(?:[^\2]*?(?:[^\\\2]\\(?:\\\\)*\2[^\2]*)*)\2)/g,
    esc: /(\\.|#\{.*?\})/g,
    kd: /(\b(def|get|do|end|class(?!=))\b)/g,
    k: /(\||\{|\}|=(?= ))/g,
    r: /(require)/g
  },
  python: {
    s: /(('|")(?:[^\2]*?(?:[^\\\2]\\(?:\\\\)*\2[^\2]*)*)\2)/g,
    esc: /(\\.)/g,
    kd: /(\b(def|return|for|if|else|elif|do|end|class(?!=))\b|=+(?= ))/g,
    k: /(@[\w\.]+|\||\{|\})/g,
    r: /(from|import)/g
  },
  templates: {
    s: /(('|")(?:[^\2]*?(?:[^\\\2]\\(?:\\\\)*\2[^\2]*)*)\2)/g,
    esc: /(\{\{.*?\}\}|&lt;[-=%].*?[-=%]&gt;|@\w+)/g,
    k: /(\b(function|for|in|class(?!=))\b|#\w+|\+|\||\[|\]|\{|\}|=(?= ))/g,
    kd: /\b(return|table|tr|td|th)\b/g,
  },
  html: {
    s: /(('|")(?:[^\2]*?(?:[^\\\2]\\(?:\\\\)*\2[^\2]*)*)\2)/g,
    k: /(&lt;\/?\w+)/g,
    c: /(&lt;!--.*--&gt;|&lt;!DOCTYPE .*&gt;|&lt;\/?|\/?&gt;)/g,
  },
  php: {
    s: /(('|")(?:[^\2]*?(?:[^\\\2]\\(?:\\\\)*\2[^\2]*)*)\2)/g,
    k: /(&lt;(?!\?)\/?\w+|\$\w+)/g,
    n: /(&lt;\?(php|=)?|\?&gt;)/g,
    r: /\b(namespace|new|include|require|null)\b/,
    esc: /\b(array(?=\()|class(?!=)|extends)\b/g,
    kd: /\b(if|else|elseif|switch|foreach|as|for|do|while|return|define|function|public|private|protected|use|echo|endforeach|endif)\b/g,
    c: /(&lt;!--.*--&gt;|&lt;!DOCTYPE .*&gt;|&lt;(?!\?)\/?|[\/-]?&gt;)/g,
  }
}
var highlight = function (str, syntax) {
  for (var klass in syntax)
    str = str.replace(syntax[klass], '<span class="' + klass + '">$1</span>');
  return str;
};
$('.highlight').each(function(){
  var language = languages[this.className.split(' ').pop()];
  this.innerHTML = this.innerHTML.split('\n').map(function(e){
    e = e.replace(/\s+$/, '').replace(/^\/\//m, ' //').split(' //');
    var code = highlight(e.shift(), language);
    var comment = e.length ? ((code.length ? ' ' : '') + '<span class="c">//' + e.join('//') + '</span>') : '';
    return code + comment;
  }).join('\n');
  if (this.innerHTML.slice(0,2) == '\n') this.innerHTML = this.innerHTML.slice(2);
});

// $('.two-columns').each(function(){
//   this.innerHTML = '<table><tbody><tr>' + [].slice.call(this.children).map(function(el){
//     return '<td>'+el.outerHTML+'</td>';
//   }).join('') + '</tr></tbody></table>'
// })

// Extra
$('section').each(function() {
  this.innerHTML = this.innerHTML
                          .replace(/([^\\])`(.*?[^\\])`/g, '$1<code>$2</code>')
                          .replace(/\\`/g, '`')
                          .replace(/ =(>|&gt;)/g, ' &rArr;')
                          .replace(/ -(>|&gt;)/g, ' &rarr;')
                          .replace(/¿/g, '<span class="question">?</span>');
});

// Questions & answers
$('section').each(function(i, slide){
  $(this).find('.question').each(function(id){
    var info = $(slide).find('.questions').children()[id];
    this.innerHTML = '?<span class="question-info ' + info.className + '">' + info.innerHTML + '</span>';
  }).click(function(){
    console.log(this);
    console.log(this.length);
    this.id == 'active' ? this.id = '' : ($('#active').attr('id', ''), this.id = 'active');
  });
});


// Maintain scroll position after resize/orientationchange
$('#deck').on('scroll', function() {
  if (settings.read) {
    settings.lastLocation
  }
});

// Top Navi
$(function(){
  var i=0;
  var nav = '<ol>' + $('#deck > section').map(function (){
    return '<li><a href="#' + (++i) + '">' + $(this).find('h1').eq(0).html() + '</a></li>';
  }).toArray().join('') + '</ol>';
  $('body > header > h1').replaceWith(function(){
    return '<nav id="top-navi"><h1><a id="menu-icon">&#9776;</a>' + this.innerHTML + '</h1>' + nav + '</nav>';
  });

  var stopHover = function() { $('html').removeClass('navi-hover'); };
  // var state = 'hide';
  // var peek = false;

  //   tap - peek/hide
  //   outsideClick/hashchange - hide

  // large
  //   tap - peek/lock/hide
  //   outsideClick/hashchange - hide if peeking
  $('#top-navi h1').click(function(e) {
    var $html = $('html');
    if (!settings.isTouch) { // desktop
      $html.toggleClass('navi-locked');
    } else { // touch
      if ($html.hasClass('navi-locked')) {
        $html.removeClass('navi-locked');
      } else if ($html.hasClass('navi-hover')) {
        $html.addClass('navi-locked').removeClass('navi-hover');
      } else {
        $html.addClass('navi-hover');
        $('#deck').one('click', stopHover);
      }
    }
  });
  // $('#top-navi a').click(function(){
  //   htmlSlides.changeSlide(parseInt(this.hash.slice(1)));
  //   // $('.slide-selected').prevAll().find('.action').removeClass('action');
  // });
  $(document).on('newSlide', function(e, id){
    console.log('newSlide', e, id);
    $('#top-navi li').removeClass('current').eq(id - 1).addClass('current');
  })



  $(window).on('hashchange', function(){
    util.isSmall() && $('html').removeClass('navi-locked');
    settings.isTouch && stopHover();
    htmlSlides.changeSlide(parseInt(location.hash.slice(1)));
  }).trigger('hashchange');

});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('sw.js').then(function(registration) {
      console.log('SW registered with scope: ', registration.scope);
    }, function(err) {
      console.log('SW registration failed: ', err);
    });
  });
}
//$("section:contains(Какво ще разгледаме днес) li").click(function(){

//})
// development
//$(function(){ $('.action').removeClass('action'); $('html').addClass('navi-locked') })