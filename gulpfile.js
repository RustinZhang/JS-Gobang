"use strict";
const gulp = require("gulp");
const babel = require("gulp-babel");
const sourcemaps = require("gulp-sourcemaps");
const sass = require("gulp-sass");
const cleanCSS = require('gulp-clean-css');

gulp.task("scripts", function() {
    return gulp.src("src/scripts/**/*.js")
    .pipe(sourcemaps.init())
    .pipe(babel(
    {
        plugins: ['transform-runtime']
    }
    ))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest("staging/scripts"));
});

gulp.task("styles", function() {
    return gulp.src("src/styles/**/*.sass")
    .pipe(sass())
    .pipe(sourcemaps.init())
    .pipe(cleanCSS())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest("dist/styles"));
});

gulp.task("default", ["scripts", "styles"]);
