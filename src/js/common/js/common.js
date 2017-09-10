/**
 * common.js
 *
 */


/* ----------------------------------------------------------
 init
---------------------------------------------------------- */
$(function(){
	// スムーススクロール
	pageScroll();
	// 画像ロールオーバー
	rollover();
	// ローカルナビカレント
	localNav();
});
/* ----------------------------------------------------------
 pageScroll
---------------------------------------------------------- */
var pageScroll = function(){
	$('.js-scroll').click(function() {
		var speed = 400; // スクロールスピード
		var href= $(this).attr("href");
		var target = $(href == "#" || href == "" ? 'html' : href);
		var position = target.offset().top;
		if(href == '#'){
			// リンク#のときはページの先頭へ
			$('body,html').animate({scrollTop:0}, speed, 'swing');
		} else {
			// それ以外は指定idへ
			$('body,html').animate({scrollTop:position}, speed, 'swing');
		}
		return false;
	});
}
/* ----------------------------------------------------------
 rollover
---------------------------------------------------------- */
var rollover = function(){
	var suffix = { normal : '_no.', over   : '_on.'}
	$('.js-over').each(function(){
		var a = null;
		var img = null;
		var elem = $(this).get(0);
		if( elem.nodeName.toLowerCase() == 'a' ){
			a = $(this);
			img = $('img',this);
		}else if( elem.nodeName.toLowerCase() == 'img' || elem.nodeName.toLowerCase() == 'input' ){
			img = $(this);
		}
		var src_no = img.attr('src'); // イメージ取得
		var src_on = src_no.replace(suffix.normal, suffix.over); // オーバーイメージに変換
		/* イメージ置換 */
		if( elem.nodeName.toLowerCase() == 'a' ){
			a.on("mouseover focus",function(){ img.attr('src',src_on); })
				.on("mouseout blur",  function(){ img.attr('src',src_no); });
		}else if( elem.nodeName.toLowerCase() == 'img' ){
			img.on("mouseover",function(){ img.attr('src',src_on); })
				.on("mouseout", function(){ img.attr('src',src_no); });
		}else if( elem.nodeName.toLowerCase() == 'input' ){
			img.on("mouseover focus",function(){ img.attr('src',src_on); })
				.on("mouseout blur",  function(){ img.attr('src',src_no); });
		}
		/* イメージ先読み */
		var cacheimg = document.createElement('img');
		cacheimg.src = src_on;
	});
};
/* ----------------------------------------------------------
 localNav
---------------------------------------------------------- */
var localNav = function(){
	var navClass = document.body.className.toLowerCase(),
		navLocal = $(".nav-local"),
		prefix = 'nav',
		current = 'is-current',
		parent = 'is-parent',
		regex = {
			a  : /l/,
			dp : [
				/l[\d]+-[\d]+-[\d]+-[\d]+/,
				/l[\d]+-[\d]+-[\d]+/,
				/l[\d]+-[\d]+/,
				/l[\d]+/
			]
		},
		route = [],
		i,
		l,
		temp,
		node;

	/* 子要素を非表示 */
	$("ul ul", parent).hide();
	if( navClass.indexOf("ldef") >= -1 ){
		for(i = 0, l = regex.dp.length; i < l; i++){
			temp = regex.dp[i].exec( navClass );
			if( temp ){
				route[i] = temp[0].replace(regex.a, prefix);
			}
		}

		/* アクティブ時にクラス付与 */
		if( route[0] ){
			// depth 4
			node = $("a."+route[0], navLocal);
			node.addClass(current);
			node.next().show();
			node.parent().parent().show()
				.parent().parent().show()
				.parent().parent().show();
			node.parent().parent().prev().addClass(parent);
			node.parent().parent()
				.parent().parent().prev().addClass(parent);
			node.parent().parent()
				.parent().parent()
				.parent().parent().prev().addClass(parent);

		}else if( route[1] ){
			// depth 3
			node = $("a."+route[1], navLocal);
			node.addClass(current);
			node.next().show();
			node.parent().parent().show()
				.parent().parent().show();
			node.parent().parent().prev().addClass(parent);
			node.parent().parent()
				.parent().parent().prev().addClass(parent);

		}else if( route[2] ){
			// depth 2
			node = $("a."+route[2], navLocal);
			node.addClass(current);
			node.next().show();
			node.parent().parent().show();
			node.parent().parent().prev().addClass(parent);

		}else if( route[3] ){
			// depth 1
			node = $("a."+route[3], navLocal);
			node.addClass(current);
			node.next().show();
		}
	}
}