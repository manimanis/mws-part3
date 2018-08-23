// generated on 2018-08-05 using generator-webapp 3.0.1
const gulp = require('gulp');
const gulpLoadPlugins = require('gulp-load-plugins');
const browserSync = require('browser-sync').create();
const del = require('del');
const runSequence = require('run-sequence');
const babelify = require('babelify');
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const concat = require('gulp-concat');

const $ = gulpLoadPlugins();
const reload = browserSync.reload;

let dev = true;

gulp.task('styles', () => {
  return gulp.src('app/styles/*.css')
    .pipe($.if(dev, $.sourcemaps.init()))
    .pipe($.autoprefixer({ browsers: ['> 1%', 'last 2 versions', 'Firefox ESR'] }))
    .pipe($.if(dev, $.sourcemaps.write()))
    .pipe(gulp.dest('.tmp/styles'))
    .pipe(reload({ stream: true }));
});

gulp.task('main-scripts', () => {
  return gulp.src([
    'app/scripts/idb.js',
    'app/scripts/dbhelper.js',
    'app/scripts/maphelper.js',
    'app/scripts/ratingctrl.js',
    'app/scripts/restaurantsfetch.js',
    'app/scripts/restaurantdb.js',
    'app/scripts/mainhelper.js'
  ])
    .pipe($.plumber())
    .pipe($.if(dev, $.sourcemaps.init()))
    .pipe($.babel())
    .pipe(concat('main.bundle.js'))
    .pipe($.if(dev, $.sourcemaps.write('.')))
    .pipe(gulp.dest('.tmp/scripts'))
    .pipe(reload({ stream: true }));
});

gulp.task('restaurant-scripts', () => {
  return gulp.src([
    'app/scripts/idb.js',
    'app/scripts/dbhelper.js',
    'app/scripts/maphelper.js',
    'app/scripts/ratingctrl.js',
    'app/scripts/reviewdialog.js',
    'app/scripts/restaurantsfetch.js',
    'app/scripts/restaurantdb.js',
    'app/scripts/restauranthelper.js'
  ])
    .pipe($.plumber())
    .pipe($.if(dev, $.sourcemaps.init()))
    .pipe($.babel())
    .pipe(concat('restaurant.bundle.js'))
    .pipe($.if(dev, $.sourcemaps.write('.')))
    .pipe(gulp.dest('.tmp/scripts'))
    .pipe(reload({ stream: true }));
});

gulp.task('scripts', ['main-scripts', 'restaurant-scripts']);

gulp.task('copy-scripts', () => {
  return gulp.src('.tmp/scripts/*.js')
    .pipe(gulp.dest('./dist/scripts'));
});

function lint(files) {
  return gulp.src(files)
    .pipe($.eslint({ fix: true }))
    .pipe(reload({ stream: true, once: true }))
    .pipe($.eslint.format())
    .pipe($.if(!browserSync.active, $.eslint.failAfterError()));
}

gulp.task('lint', () => {
  return lint('app/scripts/**/*.js')
    .pipe(gulp.dest('app/scripts'));
});
gulp.task('lint:test', () => {
  return lint('test/spec/**/*.js')
    .pipe(gulp.dest('test/spec'));
});

gulp.task('html', ['styles', 'scripts'], () => {
  return runSequence(['copy-scripts'], () => {
    return gulp.src('app/*.html')
      .pipe($.useref({ searchPath: ['.tmp', 'app', '.'] }))
      .pipe($.if(/\.js$/, $.uglify({ compress: { drop_console: true } })))
      .pipe($.if(/\.css$/, $.cssnano({ safe: true, autoprefixer: false })))
      .pipe($.if(/\.html$/, $.htmlmin({
        collapseWhitespace: true,
        minifyCSS: true,
        minifyJS: { compress: { drop_console: true } },
        processConditionalComments: true,
        removeComments: true,
        removeEmptyAttributes: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true
      })))
      .pipe(gulp.dest('dist'));
  });
});

gulp.task('images', () => {
  return gulp.src('app/images/**/*')
    .pipe($.cache($.imagemin()))
    .pipe(gulp.dest('dist/images'));
});

gulp.task('fonts', () => {
  return gulp.src(require('main-bower-files')('**/*.{eot,svg,ttf,woff,woff2}', function (err) { })
    .concat('app/fonts/**/*'))
    .pipe($.if(dev, gulp.dest('.tmp/fonts'), gulp.dest('dist/fonts')));
});

gulp.task('extras', () => {
  return gulp.src([
    'app/**/*',
    '!app/**/*.html',
    '!app/scripts/*'
  ], {
      dot: true
    }).pipe(gulp.dest('dist'));
});

gulp.task('clean', del.bind(null, ['.tmp', 'dist']));

gulp.task('serve', () => {
  runSequence(['clean'], ['styles', 'scripts', 'fonts'], () => {
    browserSync.init({
      notify: false,
      port: 9000,
      server: {
        baseDir: ['.tmp', 'app']
      }
    });

    gulp.watch([
      'app/*.html',
      'app/images/**/*',
      '.tmp/fonts/**/*'
    ]).on('change', reload);

    gulp.watch('app/styles/**/*.css', ['styles']);
    gulp.watch('app/scripts/**/*.js', ['scripts']);
    gulp.watch('app/fonts/**/*', ['fonts']);
  });
});

gulp.task('serve:dist', ['default'], () => {
  browserSync.init({
    notify: false,
    port: 9000,
    server: {
      baseDir: ['dist']
    }
  });
});

gulp.task('serve:test', ['scripts'], () => {
  browserSync.init({
    notify: false,
    port: 9000,
    ui: false,
    server: {
      baseDir: 'test',
      routes: {
        '/scripts': '.tmp/scripts'
      }
    }
  });

  gulp.watch('app/scripts/**/*.js', ['scripts']);
  gulp.watch(['test/spec/**/*.js', 'test/index.html']).on('change', reload);
  gulp.watch('test/spec/**/*.js', ['lint:test']);
});


gulp.task('build', ['lint', 'html', 'images', 'fonts', 'extras'], () => {
  return gulp.src('dist/**/*').pipe($.size({ title: 'build', gzip: true }));
});

gulp.task('default', () => {
  return new Promise(resolve => {
    dev = false;
    runSequence(['clean'], 'build', resolve);
  });
});
