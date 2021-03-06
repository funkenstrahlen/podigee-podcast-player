var gulp = require('gulp'),
    gutil = require('gulp-util'),
    sass = require('gulp-sass'),
    coffee = require('gulp-coffee'),
    watch = require('gulp-watch'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    browserify = require('gulp-browserify'),
    rename = require('gulp-rename'),
    connect = require('gulp-connect');
    gzip = require('gulp-gzip');
    fs = require('fs');
    s3 = require('gulp-s3');

var dest = './dist';
var paths = {
  main_stylesheet: ['./src/stylesheets/app.scss'],
  stylesheets: ['./src/stylesheets/*.scss'],
  main_javascript: ['./src/javascripts/app.coffee'],
  javascripts: ['./src/javascripts/**/*.coffee'],
  html: ['./src/html/podigee-podcast-player.html', './src/html/embed-example.html'],
  images: ['./src/images/**'],
  fonts: ['./vendor/fonts/**'],
  themes: {
    html: ['./src/themes/**/index.html'],
    css: ['./src/themes/**/*.scss']
  }
};

gulp.task('upload', function() {
  awsCredentials = JSON.parse(fs.readFileSync('./aws.json'))
  return gulp.src('build/**')
    .pipe(s3(awsCredentials, {
      uploadPath: "/podcast-player/",
      headers: {'x-amz-acl': 'public-read'}
    }))
})

gulp.task('stylesheets', function() {
  return gulp.src(paths.main_stylesheet)
    .pipe(sass({style: 'compressed'}))
    .pipe(gulp.dest('./build/stylesheets'))
    .pipe(gzip())
    .pipe(gulp.dest('./build/stylesheets'))
    .pipe(connect.reload())
})

gulp.task('javascripts', function() {
  gulp.src(paths.main_javascript, {read: false})
    .pipe(browserify({
      transform: ['coffeeify'],
      extensions: ['.coffee']
    }))
    .pipe(uglify())
    .pipe(rename('podigee-podcast-player.js'))
    .pipe(gulp.dest('./build/javascripts'))
    .pipe(gzip())
    .pipe(gulp.dest('./build/javascripts'))
    .pipe(connect.reload())
})

gulp.task('html', function() {
  gulp.src(paths.html)
    .pipe(gulp.dest('./build'))
    .pipe(connect.reload())
})

gulp.task('images', function() {
  gulp.src(paths.images)
    .pipe(gulp.dest('./build/images'))
    .pipe(connect.reload())
})

gulp.task('fonts', function() {
  gulp.src(paths.fonts)
    .pipe(gulp.dest('./build/fonts'))
    .pipe(connect.reload())
})

gulp.task('themes', function() {
  gulp.src(paths.themes.html)
    .pipe(gulp.dest('./build/themes'))
    .pipe(connect.reload())

  gulp.src(paths.themes.css)
    .pipe(sass({style: 'compressed'}))
    .pipe(gulp.dest('./build/themes'))
    .pipe(connect.reload())
})

gulp.task('default', ['stylesheets', 'javascripts', 'html', 'images', 'fonts', 'themes'])

gulp.task('watch', function() {
  // Watch .scss files
  gulp.watch(paths.stylesheets, ['stylesheets'])
  // Watch .js files
  gulp.watch(paths.javascripts, ['javascripts'])
  // Watch .html files
  gulp.watch(paths.html, ['html'])
  // Watch images files
  gulp.watch(paths.images, ['images'])
  // Watch theme files
  gulp.watch(paths.themes.html, ['themes'])
  gulp.watch(paths.themes.css, ['themes'])
})

gulp.task('connect', function() {
  connect.server({
    host: '0.0.0.0',
    root: [__dirname],
    livereload: true
  });
});

// Serve
gulp.task('serve', ['default', 'connect', 'watch']);
