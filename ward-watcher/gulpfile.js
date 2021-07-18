/**
 * 🗣 Shout out:
 * Modified gulpfile - original from https://github.com/nhsuk/nhsuk-prototype-kit/blob/master/gulpfile.js
 * https://service-manual.nhs.uk/design-system/design-principles
 */

"use strict";

// Core dependencies
const gulp = require("gulp");

// External dependencies
const babel = require("gulp-babel");
const clean = require("gulp-clean");
const sass = require("gulp-sass");

// Delete all the files in /public build directory
function cleanPublic() {
    return gulp.src("public", { allowEmpty: true }).pipe(clean());
}

// Compile SASS to CSS
function compileStyles() {
    return gulp
        .src(["assets/sass/**/*.scss"])
        .pipe(sass())
        .pipe(gulp.dest("public/css"))
        .on("error", (err) => {
            console.log(err);
            process.exit(1);
        });
}

// Compile JavaScript (with ES6 support)
function compileScripts() {
    return gulp
        .src(["assets/javascript/**/*.js"])
        .pipe(babel())
        .pipe(gulp.dest("public/js"))
        .on("error", (err) => {
            console.log(err);
            process.exit(1);
        });
}

// Compile assets
function compileAssets() {
    return gulp
        .src([
            "assets/**/**/*.*",
            "!**/assets/**/**/*.js", // Don't copy JS files
            "!**/assets/**/**/*.scss", // Don't copy SCSS files
        ])
        .pipe(gulp.dest("public"));
}

// Watch for changes within assets/
function watch() {
    gulp.watch("assets/sass/**/*.scss", compileStyles);
    gulp.watch("assets/javascript/**/*.js", compileScripts);
    gulp.watch("assets/**/**/*.*", compileAssets);
}

exports.watch = watch;
exports.compileStyles = compileStyles;
exports.compileScripts = compileScripts;
exports.cleanPublic = cleanPublic;

gulp.task("build", gulp.series(cleanPublic, compileStyles, compileScripts, compileAssets));
gulp.task("clean", gulp.series(cleanPublic));
