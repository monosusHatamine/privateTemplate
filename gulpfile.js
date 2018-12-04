'use strict';
/* ----------------------------------------------------------
 module
 ---------------------------------------------------------- */
var gulp = require('gulp'); //gulp
var sass = require('gulp-sass'); //scss
var pug = require('gulp-pug');
var babel = require('gulp-babel');
var sourcemaps = require('gulp-sourcemaps'); //scss ソースマップ生成
var clean =  require('del'); //指定したものを消去
var plumber = require('gulp-plumber');//errorが出ても処理を止めない
var postCss = require('gulp-postcss'); //CSSパーサーとそのASTを操作する
var autoprefixer = require('autoprefixer'); //autoでvendor prefixを付与する
var flexbug =  require('postcss-flexbugs-fixes'); //flexbox バグ対応
var browserSync = require('browser-sync').create(); //browser-sync サーバーを立ち上げ
var runsequence = require('run-sequence'); //並列処理を直列処理へ
var changed = require('gulp-changed'); //変更されたファイルのみ渡す
var cache = require('gulp-cached'); //変更されたファイルのキャッシュを残してstremに流さない
var progeny = require('gulp-progeny'); //依存関係を解析
var imagemin = require("gulp-imagemin"); //画像を軽量化
var htmlhint = require("gulp-htmlhint"); //html リントチェック
var spritesmith = require('gulp.spritesmith'); //スプライト画像
var browserify = require('browserify');
var babelify = require('babelify');
var watchify = require('watchify');
var fs = require("fs");
var source = require("vinyl-source-stream");
var gulp = require('gulp');
var ejs = require('gulp-ejs');
var rename = require('gulp-rename');

/* ----------------------------------------------------------
 path
 ---------------------------------------------------------- */
var path = {
  src_scss : 'src/scss/**/*.scss',
  src_pug : 'src/pug/**/*.pug',
  src_ejs : 'src/ejs/**/*.ejs',
  src_inc : 'src/pug/inc/',
  src_js : 'src/js/**/*.js',
  src_img : 'src/image/',
  src_img_png : 'src/image/**/*.png',
  src_img_gif : 'src/image/**/*.gif',
  src_img_jpg : 'src/image/**/*.jpg',
  src_img_svg : 'src/image/**/*.svg',
  src_sprite : 'src/sprite/',
  src_sprite_scss : 'src/scss/common/base',
  src_file : 'src/file/**/',
  src_html : 'src/html/**/',
  dest_css : 'dest/common/css/',
  dest_js : 'dest/common/js/',
  dest_img : 'dest/common/img/',
  dest_file : 'dest/common/',
  dest_html : 'dest/',
  dest : 'dest/',
  src : 'src/',
  root: './'
};

/* ----------------------------------------------------------
 autoprefixer setting
 ---------------------------------------------------------- */
var autoprefixerSet = [
  'last 2 version',
  'ie >= 11',
  'iOS >= 8.4',
  'Android >= 4.4'
];

/* ----------------------------------------------------------
 postcss plugin
 ---------------------------------------------------------- */
var postCssPlugin = [
  autoprefixer({
    browsers:autoprefixerSet
  }),
  flexbug
];

/* ----------------------------------------------------------
 task
 ---------------------------------------------------------- */
/*sass
 -----------------------------------------------------------*/

gulp.task('sass', function() {
  gulp.src([path.src_scss , '!src/scss/**/**/_*.scss'])
     .pipe(plumber({
       errorHandler: function (error) {
         console.log(error.message);
         this.emit('end');
       }}))
     .pipe(changed(path.dest))
     .pipe(progeny())
     .pipe(sourcemaps.init())
     .pipe(sass(
        {
          outputStyle: 'expanded' // nested, compact, compressed, expanded
        }
     ))
     .pipe(postCss(postCssPlugin))
     .pipe(sourcemaps.write())
     .pipe(gulp.dest(path.dest))
});

/*pug
 -----------------------------------------------------------*/
gulp.task('pug', function() {
  gulp.src([path.src_pug, '!src/**/_*.pug'])
     .pipe(plumber({ // OK
       errorHandler: function (error) { 
         console.log(error.message);
         this.emit('end');
       }}))

     .pipe(progeny())
     .pipe(pug({
        pretty: true
     }))
     .pipe(gulp.dest(path.dest))
});

/* ejs
 ------------------------------ */
//ejs
gulp.task('ejs', function() {
  var json = JSON.parse(fs.readFileSync('./src/data/config.json'));
  gulp.src([path.src_ejs,'!ejs/**/_*.ejs'])
    .pipe(ejs(json,{"ext": ".html"}))
    .pipe(rename({ extname: '.html' }))
    .pipe(gulp.dest(path.dest))
});

/*change(srcフォルダ内のimage,js,json,csv,pdfのフォルダをdestフォルダへコピー)
 -----------------------------------------------------------*/
gulp.task('change_js',function () {
  gulp.src([path.src_js, '!src/**/_*.js'])
     .pipe(changed(path.dest + '**/*.js'))
     .pipe(cache('change_js'))
     .pipe(gulp.dest(path.dest));
});

gulp.task('es6',['change_js'],function() {
  browserify('./src/js/common/js/common.js').transform(babelify, {presets: ['es2015', 'es2016']})
    .bundle()
    .on("error", function (err) { console.log("Error : " + err.message); })
    .pipe(source('common.js'))
    .pipe(gulp.dest('./dest/common/js/'));
});

gulp.task('change_img',function () {
  gulp.src([path.src_img_jpg , path.src_img_png , path.src_img_svg,path.src_img_gif])
     .pipe(gulp.dest(path.dest));
});

gulp.task('change_file',function () {
  gulp.src([path.src_file + '*.+(json|csv|pdf|ics|zip|eot|svg|ttf|woff|woff2|otf)'])
     .pipe(changed(path.dest + '**/*.+(json|csv|pdf|ics|zip|eot|svg|ttf|woff|woff2|otf)'))
     .pipe(cache('change_file'))
     .pipe(gulp.dest(path.dest_file));
});

gulp.task('change_html',function () {
  gulp.src([path.src_html + '*.+(json|csv|pdf|ics|zip|eot|svg|ttf|woff|woff2|otf|html|png|jpg|gif)'])
    .pipe(changed(path.dest + '**/*.+(json|csv|pdf|ics|zip|eot|svg|ttf|woff|woff2|otf|html|png|jpg|gif)'))
    .pipe(cache('change_html'))
    .pipe(gulp.dest(path.dest_html));
});

/*html lint
 -----------------------------------------------------------*/
gulp.task('htmlhint',function () {
  return gulp.src([path.dest + '**/*.html', '!'+ path.dest + 'inc/*.html'])
     .pipe(htmlhint())
     .pipe(htmlhint.reporter())
});


/*imgmin(画像圧縮)
 -----------------------------------------------------------*/
gulp.task('img', function(){
  var imageminOptions = {
    optimizationLevel: 7
  };
  return gulp.src(path.dest + '**/*.+(jpg|jpeg|png|gif|svg)')
     .pipe(imagemin(imageminOptions))
     .pipe(gulp.dest(path.dest));
});

/*sprite
 -----------------------------------------------------------*/
gulp.task('sprite', function () {
  var spriteData = gulp.src(path.src_sprite + '/*.png')
     .pipe(spritesmith({
       imgName: 'sprite.png',
       cssName: '_sprite.scss',
       imgPath: '/common/img/sprite.png',
       cssFormat: 'scss',
       padding: 4,
       algorithm: 'binary-tree',
       algorithmOpts: {sort: false}
     }));
  spriteData.img.pipe(gulp.dest(path.dest_img));
  spriteData.css.pipe(gulp.dest(path.src_sprite_scss));
});

/* browser sync
 -----------------------------------------------------------*/
gulp.task('serve', [], function (callback) {
  var path = require('path');
  var options = {
    baseDir: './dest/',
    watchDir: '',
    startPath: '/'
  };
  browserSync.init({
    watchOptions: {
      ignoreInitial: true,
      ignored: [ path.src_img + '**/*.+(jpg|jpeg|png|gif|svg)', path.dest + '**/*.+(jpg|jpeg|png|gif|svg)']
    },

    files: [
      options.watchDir + path.dest + '**/*.html',
      options.watchDir + path.dest + '**/*.css',
      options.watchDir + path.dest + '**/*.js',
      options.watchDir + path.dest + '**/*.json',
      options.watchDir + path.dest + '**/*.csv'
    ],
    server: {
      baseDir: options.baseDir
    },
    open: false,
    ghostMode: false,
    browser: 'chrome',
    // reloadDebounce: 100,
    startPath: options.startPath
  }, function (err, bs) {
    callback();
  });
});

/*clean
 -----------------------------------------------------------*/
/*dest用*/
gulp.task('clean',function () {
  return clean([path.dest])
});

/*build(clean後実施)
 -----------------------------------------------------------*/
gulp.task('build',['sprite', 'ejs','sass', 'es6' , 'change_img', 'change_file', 'change_html'],function (callback) {
  return runsequence(
     'htmlhint',
     callback
  );
});

/*watch
 -----------------------------------------------------------*/
gulp.task('watch', function() {
  gulp.watch([path.src_scss], ['sass']);
  gulp.watch([path.src_ejs], ['ejs']);
  gulp.watch([path.src_js] , ['change_js']);
  gulp.watch([path.src_js] , ['es6']);
  gulp.watch([path.src_file + '*.+(json|csv|pdf)'] , ['change_file']);
  gulp.watch([path.src_html] , ['change_html']);
  gulp.watch([path.dest_css + '**/*.css', path.dest + '**/*.html']).on('change', browserSync.reload);
});

/*default
 -----------------------------------------------------------*/
gulp.task('default', ['watch', 'serve']);