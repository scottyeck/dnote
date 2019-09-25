const fs = require('fs');
const gulp = require('gulp');
const del = require('del');
const replace = require('gulp-replace');
const source = require('vinyl-source-stream');
const gulpif = require('gulp-if');
const imagemin = require('gulp-imagemin');
const livereload = require('gulp-livereload');
const zip = require('gulp-zip');

const target = process.env.TARGET || 'firefox';
const isProduction = process.env.NODE_ENV === 'PRODUCTION';

gulp.task('manifest', () => {
  const pkg = JSON.parse(fs.readFileSync('./package.json'));

  return gulp
    .src(`manifests/${target}/manifest.json`)
    .pipe(replace('__VERSION__', pkg.version))
    .pipe(gulp.dest(`dist/${target}`));
});

gulp.task('styles', () => {
  return gulp.src('src/styles/*.css').pipe(gulp.dest(`dist/${target}/styles`));
});

gulp.task(
  'html',
  gulp.series('styles', () => {
    return gulp.src('src/*.html').pipe(gulp.dest(`dist/${target}`));
  })
);

gulp.task('extras', () => {
  return gulp
    .src(
      [
        'src/*.*',
        'src/_locales/**',
        '!src/scripts.babel',
        '!src/*.json',
        '!src/*.html'
      ],
      {
        base: 'app',
        dot: true
      }
    )
    .pipe(gulp.dest(`dist/${target}`));
});

gulp.task('images', () => {
  return gulp
    .src('src/images/**/*')
    .pipe(
      gulpif(
        gulpif.isFile,
        imagemin({
          progressive: true,
          interlaced: true,
          svgoPlugins: [{ cleanupIDs: false }]
        })
      )
    )
    .pipe(gulp.dest(`dist/${target}/images`));
});

gulp.task('clean', del.bind(null, ['.tmp', `dist/${target}`]));

gulp.task(
  'watch',
  gulp.series('manifest', 'html', 'styles', 'images', () => {
    livereload.listen();

    gulp
      .watch([
        'src/*.html',
        'src/scripts/**/*',
        'src/images/**/*',
        'src/styles/**/*'
      ])
      .on('change', livereload.reload);

    gulp.watch('src/*.html', gulp.parallel('html'));
    gulp.watch('manifests/**/*.json', gulp.parallel('manifest'));
  })
);

gulp.task('package', function() {
  let manifest = require(`./dist/${target}/manifest.json`);

  return gulp
    .src(`dist/${target}/**`)
    .pipe(zip('dnote-' + manifest.version + '.zip'))
    .pipe(gulp.dest(`package/${target}`));
});

gulp.task(
  'build',
  gulp.series('manifest', gulp.parallel('html', 'extras', 'images'))
);

gulp.task('default', gulp.series('clean', 'build'));
