'use strict';
/*
* node v6.11.2
* gulp version 3.9.1
* */

/* ----------------------------------------------------------
 npm package
 ---------------------------------------------------------- */
/* load
 ---------------------------------------------------------- */
var $ = require('gulp-load-plugins')({
  pattern: ['gulp-*', 'gulp.*', '@*/gulp{-,.}*'],
  lazy: true,
  scope: ['dependencies', 'devDependencies']
});

/* universal (全体に適用する gulp plugin loadプラグイン対象をコメントアウト)
 ---------------------------------------------------------- */
var gulp        = require('gulp'), //gulp
    minimist = require('minimist'), //taskに引数を渡す 例「gulp task -r」
    clean       = require('del'), //指定したものを消去
    browserSync = require('browser-sync').create(), //サーバーを立ち上げ
    runSequence = require('run-sequence'), //並列処理を直列へ
    aigis = require('gulp-aigis'), //スタイルガイド生成
    data = require('gulp-data'), //データの取得
    lineEndingCorrector = require('gulp-line-ending-corrector'), //改行コードを指定
    convertEncoding = require('gulp-convert-encoding'),//文字コードを指定
    ignore = require('gulp-ignore'),//対象ファイルを除外
    plumber     = require('gulp-plumber'),//エラーが出ても処理を止めない
    progeny     = require('gulp-progeny'), //依存関係を解析
    changed     = require('gulp-changed'), //変更されたファイルのみ渡す
    cache       = require('gulp-cached'), //変更されたファイルのキャッシュを残してstremに流さない
    spritesmith = require('gulp.spritesmith'), //スプライト画像
    gulpif      = require('gulp-if'), //gulp内条件分岐
    imagemin    = require("gulp-imagemin");//画像を軽量化

/* 引数の取得
 ---------------------------------------------------------- */
var argv = minimist(process.argv.slice(2));

/* HTML (HTML用 gulp plugin loadプラグイン対象をコメントアウト)
 ---------------------------------------------------------- */
var pug        = require('gulp-pug'); //ejs
var ejs        = require('gulp-ejs'); //ejs
var prettify   = require("gulp-prettify");//HTML整形

/* CSS (css用 gulp plugin loadプラグイン対象をコメントアウト)
 ---------------------------------------------------------- */
var cleanCss     = require('gulp-clean-css'), //css圧縮
    postCss      = require('gulp-postcss'), //cssフレームワーク cssを独自AST化（抽象化）する
    autoprefixer = require('autoprefixer'), //自動でvendorprefixを付与する
    flexbug      = require('postcss-flexbugs-fixes'), //flexbox バグ対応
    stylus       = require('gulp-stylus'), //stylus
    sass         = require('gulp-sass'), //scss
    sourcemaps   = require('gulp-sourcemaps'), //ソースマップ
    cssComb      = require('gulp-csscomb'); //css整形

/* ----------------------------------------------------------
 path (gulpのパスの指定に使用する)
 ---------------------------------------------------------- */
var path = {
  src_stylus: ['src/stylus/**/*.styl'],
  src_stylus_ignore: /(\/|\\)_.*\.styl$/,
  src_scss: 'src/scss/**/*.scss',
  src_pug: 'src/pug/**/*.pug',
  src_ejs: 'src/ejs/**/*.ejs',
  src_pug_ignore: '!src/pug/**/_*.pug',
  src_js: 'src/js/**/*.js',
  src_img: 'src/file/',
  src_sprite: 'src/sprite/',
  src_sprite_scss: 'src/scss/common/stylesheets/_common/',
  src_file: 'src/file/**/*.+(gif|jpg|png|json|csv|pdf|ics|zip|eot|ttf|otf|woff|woff2|mp4|xls|mcd|ico)',
  src_file_svg: 'src/file/**/*.+(svg)',
  dest: 'dest/',
  dest_all: 'dest/**/*',
  src: 'src/',
  src_temp: 'src/temp/',
  root: './'
};

/* ----------------------------------------------------------
 Plugin config
 (各タスク内で使用するプラグイン設定 true → 使用 false → 停止)
 ---------------------------------------------------------- */
var pluginConfig = {
  stylus: {
    sorcemap: false, //stylusのsorcemapを実行
    minify: false //stylusのminifyを実行
  },
  pug: {
    pretty: true //pugのprettyを実行 falseで圧縮
  },
  scss: {
    sorcemap: false, //scssのsorcemapを実行
    minify: false //scssのminifyを実行
  },
  ejs: {
    prettify: true //ejsのprettifyを切る
  }
};

/* ----------------------------------------------------------
 autoprefixer setting (プレフィックス対象のブラウザのverを指定する)
 ---------------------------------------------------------- */
var autoprefixerSet = [
  'last 2 version',
  'ie >= 10',
  'iOS >= 8',
  'Android >= 4.4'
];

/* ----------------------------------------------------------
 postcss plugin (postcss製のプラグインをまとめる)
 ---------------------------------------------------------- */
var postCssPlugin = [
  autoprefixer({
    browsers: autoprefixerSet
  }),
  flexbug
];

/* ----------------------------------------------------------
 task
 ---------------------------------------------------------- */
/*stylus (stylusコンパイルタスク)
 -----------------------------------------------------------*/
gulp.task('stylus', function() {
  return gulp.src(path.src_stylus)
    .pipe($.plumber({
      errorHandler: function (error) {
        console.log(error.message);
        this.emit('end');
      }
    }))
    .pipe(ignore.exclude(function(file){
      return file.path.search(path.src_stylus_ignore) !== -1;
    }))
    .pipe($.if(pluginConfig.stylus.sorcemap, $.sourcemaps.init()))
    .pipe(stylus({
      compress: false
    }))
    .pipe($.if(pluginConfig.stylus.sorcemap, $.sourcemaps.write()))
    .pipe(postCss(postCssPlugin))
    .pipe($.csscomb())
    .pipe($.if(pluginConfig.stylus.minify,cleanCss()))
    .pipe(gulp.dest(path.dest));
});

/*sass (scssコンパイルタスク)
 -----------------------------------------------------------*/
gulp.task('sass', function () {
  return gulp.src(path.src_scss)
    .pipe($.plumber({
      errorHandler: function (error) {
        console.log(error.message);
        this.emit('end');
      }
    }))
    .pipe($.cached('sass'))
    .pipe($.progeny())
    .pipe($.if(pluginConfig.scss.sorcemap, $.sourcemaps.init()))
    .pipe($.sass({outputStyle: 'compressed'})) //nested, expanded, compact, compressed
    .pipe(postCss(postCssPlugin))
    .pipe($.csscomb())
    .pipe($.if(pluginConfig.scss.sorcemap, $.sourcemaps.write()))
    .pipe($.if(pluginConfig.scss.minify,cleanCss()))
    .pipe(convertEncoding({to: 'utf-8'}))
    .pipe(lineEndingCorrector({eolc: 'CRLF'}))
    .pipe(gulp.dest(path.dest));
});

/*exepanded(minifyしていないcssをsrc/temp内へコンパイルする)
 -----------------------------------------------------------*/
gulp.task('cssexpanded', function () {
  return gulp.src(path.src_stylus)
    .pipe($.sass({outputStyle: 'expanded'}))
    .pipe(postCss(postCssPlugin))
    .pipe($.csscomb())
    .pipe(gulp.dest(path.src_temp));
});

/*pug (pug用のタスク)
 -----------------------------------------------------------*/
gulp.task('pug', function () {
  return gulp.src([path.src_pug, path.src_pug_ignore])
    .pipe($.plumber({
      errorHandler: function (error) {
        console.log(error.message);
        this.emit('end');
      }
    }))
    .pipe($.cached('pug'))
    .pipe($.data(function (file) {
      return {
        'fileName': file.path.replace(/\\/g,'/').split('/src/pug')[1],
        'metaData': require('./meta.json')
      }
    }))
    .pipe(pug({
      pretty: pluginConfig.pug.pretty,
      basedir: './'//gulpfile.jsの階層をrootとする
    }))
    .pipe(convertEncoding({to: 'utf-8'}))
    .pipe(lineEndingCorrector({eolc: 'CRLF'}))
    .pipe(gulp.dest(path.dest));
});

/*ejs (ejs用のタスク)
 -----------------------------------------------------------*/
gulp.task('ejs', function () {
  var ejsSrc = path.src_ejs.replace(/\*\./g, '[^_]*.');
  return gulp.src(ejsSrc)
    .pipe($.plumber({
      errorHandler: function (error) {
        console.log(error.message);
        this.emit('end');
      }
    }))
    .pipe($.cached('ejs'))
    .pipe($.progeny())
    .pipe($.data(function (file) {
      return {
        'fileName': file.path.replace(/\\/g,'/').split('/src/ejs')[1],
        'relativeRoot': file.path.replace(/\\/g,'/').split('/src/ejs/')[1].replace(/[^/]/g,'').replace(/\//g,'../')
      }
    }))
    .pipe($.ejs(
      {
        data: {
          default: require('./src/ejs/common/setting/default.json'),
          setting_json: require('./src/ejs/common/setting/setting.json')
        }
      }, {},
      {ext: '.html'}))
    .pipe(convertEncoding({to: 'utf-8'}))
    .pipe(lineEndingCorrector({eolc: 'CRLF'}))
    .pipe(gulp.dest(path.dest))
    .pipe($.if(pluginConfig.ejs.prettify, $.prettify()));
});

/* prettify (HTMLを整形)
 -----------------------------------------------------------*/
gulp.task('prettify', function () {
  if (pluginConfig.ejs.prettify === true) {
    return gulp.src([path.dest + '**/*.html'])
      .pipe($.prettify(
        {
          indent_size: 2,
          indent_inner_html: true,
          unformatted:['br','a','span']
        }
      ))
      .pipe(gulp.dest(path.dest));
  }
});

/* copy(srcフォルダ内をdestフォルダへコピー)
 -----------------------------------------------------------*/
gulp.task('copy_js', function () {
  return gulp.src(path.src_js)
    .pipe($.cached('copy_js'))
    .pipe($.plumber({
      errorHandler: function (error) {
        console.log(error.message);
        this.emit('end');
      }
    }))
    .pipe(gulp.dest(path.dest));
});

gulp.task('copy_file', function () {
  return gulp.src(path.src_file)
    .pipe($.cached('copy_file'))
    .pipe($.plumber({
      errorHandler: function (error) {
        console.log(error.message);
        this.emit('end');
      }
    }))
    .pipe(gulp.dest(path.dest));
});

gulp.task('copy_file_svg', function () {
  return gulp.src(path.src_file_svg)
    .pipe($.cached('copy_file_svg'))
    .pipe($.plumber({
      errorHandler: function (error) {
        console.log(error.message);
        this.emit('end');
      }
    }))
    .pipe(convertEncoding({to: 'utf-8'}))//文字コードの統一
    // .pipe(lineEndingCorrector({eolc: 'CRLF'}))//改行コードの統一
    .pipe(gulp.dest(path.dest));
});

/*imgmin(画像圧縮)
 -----------------------------------------------------------*/
gulp.task('miniImg', function () {
  var imageminOptions = {
    optimizationLevel: 7
  };
  return gulp.src([path.dest + '**/*.+(gif|svg|jpg|png)'])
    .pipe($.imagemin(imageminOptions))
    .pipe(gulp.dest(path.dest));
});

/* style guide スタイルガイドジェネレーター
 -----------------------------------------------------------*/
gulp.task('sg', function() {
  require('./styleguide_generator')
});

/* aigis スタイルガイドジェネレーター
 -----------------------------------------------------------*/
gulp.task('aigis', function() {
  return gulp.src('./src/styleguide/aigis_config.yml')
    .pipe(aigis());
});

/* sprite (sprite用タスク)
 ----------------------------------------------------------- */
gulp.task('sprite', function () {
  var spriteData = gulp.src(path.src_sprite + '/*.png')
    .pipe($.spritesmith({
      imgName: 'sprite.png',
      cssName: '_sprite.scss',
      imgPath: '/common/img/sprite.png',
      cssFormat: 'scss',
      padding: 10,
      algorithm: 'top-down',
      algorithmOpts: {sort: false}
    }));
  spriteData.img.pipe(gulp.dest(path.src + 'file/common/img'));
  spriteData.css.pipe(gulp.dest(path.src + 'scss/common/stylesheets/_common'));
});

/* browser sync (ローカルブラウザを立ち上げSSIに対応)
 -----------------------------------------------------------*/
gulp.task('serve', function (callback) {
  var connectSSI = require('connect-ssi');
  var options    = {
    baseDir: './dest/',
    watchDir: '',
    startPath: '/'
  };
  browserSync.init({
    server: {
      baseDir: options.baseDir ,
      middleware: [
        connectSSI({
          baseDir: options.baseDir,
          ext: '.html'
        })
      ]
    },
    open: 'external',
    ghostMode: false,
    browser: 'default',
    reloadDebounce: 0,
    startPath: options.startPath
  }, function (err, bs) {
    callback();
  });
});

/*reload (ブラウザをリロードする)
 ---------------------------------------------------------- */
gulp.task('reload', function () {
  browserSync.reload();
});

/*clean (destフォルダを消去)
 -----------------------------------------------------------*/
gulp.task('clean', function () {
  return clean(path.dest)
});

/*build
ビルド用タスク 直列処理を行う
 -----------------------------------------------------------*/
gulp.task('build', function (callback) {
  return runSequence(
    'clean',
    ['sass', 'sprite', 'ejs', 'copy_js', 'copy_file', 'copy_file_svg'],
    // 'cssexpanded',
    'sprite',
    callback
  );
});

/*default (サーバー立ち上げ、ファイル監視)
 -----------------------------------------------------------*/
gulp.task('default', ['serve'], function () {
  gulp.watch([path.src_scss], ['sass']);
  gulp.watch([path.src_ejs], ['ejs']);
  gulp.watch([path.src_js], ['copy_js']);
  gulp.watch([path.src + '**/*.+(gif|jpg|png|json|csv|pdf|ics|zip|ico|svg)'], ['copy_file']);
  gulp.watch([path.src + '**/*.+(svg)'], ['copy_file_svg']);
  //watch中にdestフォルダに変更があったら一回だけリロード実行
  var timer;
  gulp.watch(path.dest_all).on('change', function () {
    if (timer !== false) {
      clearTimeout(timer);
    }
    timer = setTimeout(function () {
      gulp.start('reload');
    }, 1000)
  });
});
