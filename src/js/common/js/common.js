/* ==========================================================
 setting
 ========================================================== */
/* condition setting */
var condition = {};

/* user agent */
var ua = navigator.userAgent.toLowerCase();
var ver = navigator.appVersion.toLowerCase();
var isMSIE = (ua.indexOf('msie') > -1) && (ua.indexOf('opera') === -1); //all ie
var isIE11 = (ua.indexOf('trident/7') > -1); // ie11
var isEdge = (ua.indexOf("AppleWebkit") >= 0 && ua.indexOf("Edge") === -1); //edge
/* matchMedia */
var matchMediaFunction = function () {
  isMatchSP = window.matchMedia('(max-width:599px)').matches;
  isMatchSPTB = window.matchMedia('(max-width:1024px)').matches;
  isMatchTB = window.matchMedia('(min-width:600px) and (max-width:1024px)').matches;
  isMatchTBPC = window.matchMedia('(min-width:600px)').matches;
  isMatchPC = window.matchMedia('(min-width:1025px)').matches;
  isBrowser = '';
  if (isMatchPC) {
    isBrowser = 'pc';
  } else if (isMatchTB) {
    isBrowser = 'tb';
  } else if (isMatchSP) {
    isBrowser = 'sp';
  }
};
$(function () {
  matchMediaFunction();//初期処理
  $(window).on('load resize', function () {//リサイズ処理
    matchMediaFunction();
  });
});
/* ----------------------------------------------------------
  anchor link
---------------------------------------------------------- */
$(function () {
  anchorLink();
});
var anchorLink = function (argAction, argHref) {
  //スクロール処理関数
  var scrollFunction = function (argItemHref, argSpeed) {
    var addHeight = 20,//スクロール時の余白追加
      matchCase = /.*(#.*)/,
      hrefPageUrl = argItemHref.match(matchCase)[1].split(/\?/)[0],
      target = $(hrefPageUrl === '#' || hrefPageUrl === '' ? 'body' : hrefPageUrl);
    try {
      var position = target.offset().top - addHeight;
    } catch (e) {
      console.log(hrefPageUrl + 'がありません。');
      console.log(e);
    }
    //SPヘッダー追従分の余白計算
    if (isMatchPC) {
      position = position - 93 - 100;//header height
    }else{
      position = position - 68 - 50;//header height
    }
    if (position) {
      $('body,html').stop().animate({scrollTop: position}, argSpeed);
    }
  };

  //クリック処理
  $('.js-scroll').on('click', function () {
    var thisHref = $(this).attr('href') ? $(this).attr('href'): $(this).find('[href*="#"]').attr('href');
    scrollFunction(thisHref, 1000);
    return false;
  });

  //読み込み処理
  if (location.href.match(/#/)) {//アクセス時スクロール処理
    $(window).on('load', function () {
      console.log(location.href);
      scrollFunction(location.href, 400);
    });
  }
};
/* ----------------------------------------------------------
  accordion
---------------------------------------------------------- */
$(function () {
  accordionFunc();
});
var accordionFunc = function () {
  var $root = $('[data-accordion="root"]');
  var $trigger = $('[data-accordion="trigger"]');
  var $target = $('[data-accordion="target"]');
  var activeClass = 'is-active';
  $root.each(function () {
    $(this).find($target).hide();
  });
  $trigger.on('click',function () {
    $(this).toggleClass(activeClass);
    $(this).closest($root).find($target).slideToggle();
  });
};