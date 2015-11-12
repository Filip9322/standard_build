// //////////////////////////////////////////////
// REQUERIDOS
// //////////////////////////////////////////////
var gulp = require('gulp');
var gutil = require('gulp-util');
var stylus = require('gulp-stylus');
var minifyCSS = require('gulp-minify-css');
var nib = require('nib');
var jade = require('gulp-jade');
var plumber = require('gulp-plumber');
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var browserify = require('browserify');
var babelify = require("babelify");
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var uglify = require('gulp-uglify');
var smoosher = require('gulp-smoosher');
var imageop = require('gulp-image-optimization');

// //////////////////////////////////////////////
// CONFIG DIRECTORIES
// //////////////////////////////////////////////
var config = {
  html: {
    main: './src/index.jade',
    output: './build',
    watch: './src/index.jade'
  },
  styles: {
    main: './src/styles/main.styl',
    output: './build/css',
    watch: './src/styles/**/*.styl'
  },
  scripts: {
    main: './src/scripts/main.js',
    output: './build/js',
    watch: './src/scripts/**/*.js'
  },
  images: {
    output: './dist/img',
    watch: ['./build/img/*.png', './build/img/*.jpg']
  }
}

// //////////////////////////////////////////////
// BROWSERSYNC TASK
// //////////////////////////////////////////////
gulp.task('browser-sync', function(){
  browserSync({
    server:{
      baseDir: "./build"
    }
  });
});
// TASK TO RUN BUILD SERVER FOR TESTING FINAL APP
gulp.task('build:serve', function(){
  browserSync({
    server:{
      baseDir: "./dist/"
    }
  });
});

// //////////////////////////////////////////////
// HTML TASK
// //////////////////////////////////////////////
gulp.task('build:html', function(){
  gulp.src([config.html.main])
  .pipe(plumber())
  .pipe(jade({
    pretty: true
  }))
  .pipe(gulp.dest(config.html.output))
  .pipe(reload({stream:true}));
});

// //////////////////////////////////////////////
// CSS BUILD
// //////////////////////////////////////////////
gulp.task('build:css', function() {
  gulp.src(config.styles.main)
    .pipe(stylus({
      use: nib(),
      'include css': true
    }))
    .pipe(plumber())
    .pipe(minifyCSS())
    .pipe(gulp.dest(config.styles.output))
    .pipe(reload({stream:true}));
});

// //////////////////////////////////////////////
// SCRIPTS BUILD
// //////////////////////////////////////////////
gulp.task('build:js', function() {
  return browserify(config.scripts.main)
    //.transform(babelify) --> ECMASCRIPT 6 OPTIONAL
    .bundle()
    .on('error', function(e){
      gutil.log(e);
    })
    .pipe(source('bundle.js'))
    .pipe(buffer())
    .pipe(uglify())
    .pipe(gulp.dest(config.scripts.output));
});

// //////////////////////////////////////////////
// IMAGE TASK
// //////////////////////////////////////////////
gulp.task('images', function() {
  gulp.src(config.images.watch)
    .pipe(imageop({
      optimizationLevel: 5,
      progressive: true,
      interlaced: true
    }))
    .pipe(gulp.dest(config.images.output));
});

// //////////////////////////////////////////////
// WATCH TASK
// //////////////////////////////////////////////
gulp.task('watch', function() {
  gulp.watch(config.html.watch, ['build:html']);
  gulp.watch(config.styles.watch, ['build:css']);
  gulp.watch(config.scripts.watch, ['build:js']);
  gulp.watch(config.images.watch, ['images']);
});

// //////////////////////////////////////////////
// SMOOSHER TASK
// //////////////////////////////////////////////
gulp.task('inline', function() {
  gulp.src('./build/index.html')
    .pipe(smoosher())
    .pipe(gulp.dest('./dist'));
});

// //////////////////////////////////////////////
// BUILD TASK
// //////////////////////////////////////////////
gulp.task('build', ['build:html', 'build:css', 'build:js', 'images', 'inline']);

gulp.task('default', ['browser-sync', 'watch']);
