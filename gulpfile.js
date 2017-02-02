'use strict';

// https://www.npmjs.com/package/gulp-typescript/

const mainFolder = "app/";

// common
const gulp = require('gulp');
const plumber = require('gulp-plumber');
const gutil = require('gulp-util');
const browserSync = require('browser-sync').create();

// TS
var typescript = require('gulp-typescript');
var sourcemaps = require('gulp-sourcemaps');

// common livereload
gulp.task('watch', function () {
  browserSync.init({
    server: mainFolder,
    port: '9000',
    notify: false,
    startPath: './'
  });

  gulp.watch([mainFolder + 'js/**/*.ts'], gulp.series('compile-type-script', 'reload'));
  gulp.watch([mainFolder + '*.html'], gulp.series('reload'));
});

gulp.task('compile-type-script', function() {
  const tsProject = typescript.createProject('tsconfig.json');

  let tsResult = gulp.src(
      [
        mainFolder + 'js/*.ts',
        '!' + mainFolder + 'js/_*.ts'
      ]
    )
    .pipe(sourcemaps.init())
    .pipe(tsProject());
  
  return tsResult
    .js
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(mainFolder + 'js/'));

  // tsconfig.json file text: https://www.typescriptlang.org/docs/handbook/compiler-options.html
  //{
  //  "compilerOptions": {
  //  "target": "es5",
  //    "module": "es2015",
  //    "outFile": "bundle.js",
  //    "moduleResolution": "Node"
  //  }
  //}
});

gulp.task('reload', function (callback) {
  browserSync.reload();
  callback();
});


// tasks for work ----------------------
gulp.task('default',
  gulp.series('compile-type-script', gulp.parallel('watch'))
);