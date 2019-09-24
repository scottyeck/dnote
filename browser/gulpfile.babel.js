const fs = require("fs");
const gulp = require("gulp");
const del = require("del");
const replace = require("gulp-replace");
const eslint = require("gulp-eslint");
const source = require("vinyl-source-stream");
const browserify = require("browserify");
const gulpif = require("gulp-if");
const imagemin = require("gulp-imagemin");
const livereload = require("gulp-livereload");
const tsify = require("tsify");
const zip = require("gulp-zip");
const uglify = require("gulp-uglify");
const sourcemaps = require("gulp-sourcemaps");
const buffer = require("vinyl-buffer");

const target = process.env.TARGET || "firefox";
const isProduction = process.env.NODE_ENV === "PRODUCTION";

gulp.task("manifest", () => {
  const pkg = JSON.parse(fs.readFileSync("./package.json"));

  return gulp
    .src(`manifests/${target}/manifest.json`)
    .pipe(replace("__VERSION__", pkg.version))
    .pipe(gulp.dest(`dist/${target}`));
});

gulp.task("styles", () => {
  return gulp.src("src/styles/*.css").pipe(gulp.dest(`dist/${target}/styles`));
});

gulp.task(
  "html",
  gulp.series("styles", () => {
    return gulp.src("src/*.html").pipe(gulp.dest(`dist/${target}`));
  })
);

gulp.task("extras", () => {
  return gulp
    .src(
      [
        "src/*.*",
        "src/_locales/**",
        "!src/scripts.babel",
        "!src/*.json",
        "!src/*.html"
      ],
      {
        base: "app",
        dot: true
      }
    )
    .pipe(gulp.dest(`dist/${target}`));
});

gulp.task("lint", () => {
  return gulp
    .src("src/scripts/**/*.js")
    .pipe(eslint({ env: { es6: true } }))
    .pipe(eslint.format());
});

gulp.task("images", () => {
  return gulp
    .src("src/images/**/*")
    .pipe(
      gulpif(
        gulpif.isFile,
        imagemin({
          progressive: true,
          interlaced: true,
          // don't remove IDs from SVGs, they are often used
          // as hooks for embedding and styling
          svgoPlugins: [{ cleanupIDs: false }]
        })
      )
    )
    .pipe(gulp.dest(`dist/${target}/images`));
});

gulp.task(
  "babel",
  gulp.series("manifest", () => {
    let manifest = require(`./dist/${target}/manifest.json`);

    let chain = browserify({
      basedir: ".",
      debug: true,
      entries: ["src/scripts/popup.tsx"]
    })
      .plugin(tsify)
      .transform("babelify", {
        presets: ["@babel/preset-env"],
        extensions: [".js", ".tsx"]
      })
      .bundle()
      .pipe(source("popup.js"));

    if (isProduction) {
      chain = chain
        .pipe(buffer())
        .pipe(sourcemaps.init({ loadMaps: true }))
        .pipe(uglify())
        .pipe(sourcemaps.write("./"));
    }

    // inject variables
    return chain
      .pipe(
        replace(
          "__API_ENDPOINT__",
          isProduction ? "https://api.getdnote.com" : "http://127.0.0.1:5000"
        )
      )
      .pipe(
        replace(
          "__WEB_URL__",
          isProduction ? "https://app.getdnote.com" : "http://127.0.0.1:3000"
        )
      )
      .pipe(replace("__VERSION__", manifest.version))
      .pipe(gulp.dest(`dist/${target}/scripts`));
  })
);

gulp.task("clean", del.bind(null, [".tmp", `dist/${target}`]));

gulp.task(
  "watch",
  gulp.series("html", "lint", "babel", "styles", "images", () => {
    livereload.listen();

    gulp
      .watch([
        "src/*.html",
        "src/scripts/**/*",
        "src/images/**/*",
        "src/styles/**/*"
      ])
      .on("change", livereload.reload);

    gulp.watch("src/scripts/**/*", gulp.parallel("lint", "babel"));
    gulp.watch("src/*.html", gulp.parallel("html"));
    gulp.watch("manifests/**/*.json", gulp.parallel("manifest"));
  })
);

gulp.task("package", function() {
  let manifest = require(`./dist/${target}/manifest.json`);

  return gulp
    .src(`dist/${target}/**`)
    .pipe(zip("dnote-" + manifest.version + ".zip"))
    .pipe(gulp.dest(`package/${target}`));
});

gulp.task(
  "build",
  gulp.series(
    "manifest",
    "lint",
    "babel",
    gulp.parallel("html", "extras", "images")
  )
);

gulp.task("default", gulp.series("clean", "build"));
