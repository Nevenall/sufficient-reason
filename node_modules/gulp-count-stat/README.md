# gulp-count-stat

[![Build Status](https://travis-ci.org/io-monad/gulp-count-stat.svg?branch=master)](https://travis-ci.org/io-monad/gulp-count-stat)

gulp plugin to show countings on words or characters of files

![](images/screenshot.png)

## Install

    npm install --save-dev gulp-count-stat

## Usage

```js
var gulp = require("gulp");
var countStat = require("gulp-count-stat");

gulp.task("stat", function () {
    return gulp.src("chapter-*/**/*.txt")
        .pipe(countStat());
});

gulp.task("total", function () {
    return gulp.src("chapter-*/**/*.txt")
        .pipe(countStat({ showFile: false, showDir: false }));
});
```

NOTICE: Make sure `return` is in your gulp task. Otherwise you will get no output.

### countStat(options = {})

#### options

| Key | Type | Description | Default |
| --- | ---- | ----------- | ------- |
| `words` | Boolean | If `false`, omits countings of words from output | `true` |
| `chars` | Boolean | If `false`, omits countings of characters from output | `true` |
| `showFile` | Boolean | If `false`, omits countings on files from output | `true` |
| `showDir` | Boolean | If `false`, omits countings on directories from output | `true` |
| `showTotal` | Boolean | If `false`, omits total countings from output | `true` |
| `tree` | Boolean | If `false`, show countings in simple list (not tree) | `true` |

## Testing

    npm test

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

## License

MIT (See LICENSE)
