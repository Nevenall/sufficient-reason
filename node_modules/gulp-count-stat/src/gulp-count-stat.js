"use strict";

import path from "path";
import gutil from "gulp-util";
import through from "through2";
import formatNumber from "format-number";
import CountStream from "./count-stream";
import count from "./count";
import {FileTree} from "./file-tree";

const PLUGIN_NAME = "gulp-count-stat";

const DEFAULT_OPTIONS = {
  words: true,
  chars: true,
  showFile: true,
  showDir: true,
  showTotal: true,
  tree: true,
};

export default function gulpCountStat(options) {
  options = Object.assign({}, DEFAULT_OPTIONS, options);

  if (!options.words && !options.chars) {
    throw new gutil.PluginError(PLUGIN_NAME, "Either `words` or `chars` must be true");
  }

  const fileTree = new FileTree();
  const total = { words: 0, chars: 0 };
  const format = formatNumber();

  function eachFile(file, enc, callback) {
    if (file.isNull()) {
      return callback(null, file);
    }
    if (file.isStream()) {
      file.contents.pipe(new CountStream())
        .on("error", finish)
        .on("end", function () { finish(null, this) });
      return;
    }
    if (file.isBuffer()) {
      const counts = count(file.contents, enc);
      finish(null, counts);
    }

    function finish(err, counts) {
      if (err) {
        callback(new gutil.PluginError(PLUGIN_NAME, err));
        return;
      }

      const filepath = path.normalize(file.relative || file.path);
      const dirpath = path.dirname(filepath);

      let node;
      if (options.showFile) {
        node = fileTree.add(filepath);
      } else {
        node = fileTree.add(dirpath);
      }
      while (node) {
        const summary = node.data || (node.data = { words: 0, chars: 0 });
        addToSummary(counts, summary);
        node = node.parent;
        if (!options.showDir) break;
      }
      addToSummary(counts, total);

      file.countStat = counts;
      callback(null, file);
    }
  }

  function endStream(callback) {
    if (options.showFile || options.showDir) {
      fileTree.fold().sort();
      if (options.tree) {
        fileTree.walk((node) => {
          if (node.isRoot) return;
          const prefix = node.getTreePrefix({ skipRoot: true });
          logSummary(prefix + gutil.colors.cyan(node.name), node.data);
        });
      } else {
        fileTree.walkDepthFirst((node) => {
          if (node.isRoot) return;
          if (node.data) logSummary(gutil.colors.cyan(node.path), node.data);
        });
      }
    }
    if (options.showTotal) {
      logSummary(gutil.colors.green("Total"), total);
    }
    callback();
  }

  function addToSummary(counts, summary) {
    summary.words += counts.words;
    summary.chars += counts.chars;
  }

  function logSummary(title, summary) {
    const logline = [title];
    if (summary) {
      logline.push(":");
      if (options.words) {
        logline.push(gutil.colors.magenta(format(summary.words)), "words");
      }
      if (options.chars) {
        logline.push(gutil.colors.magenta(format(summary.chars)), "characters");
      }
    }
    gutil.log.apply(gutil, logline);
  }

  return through.obj(eachFile, endStream);
}
