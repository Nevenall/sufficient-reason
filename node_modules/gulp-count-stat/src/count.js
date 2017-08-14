"use strict";

import wordCount from "word-count";

export default function count(contents, enc) {
  if (contents instanceof Buffer) {
    contents = contents.toString("utf8");
  } else if (enc && enc !== "utf8") {
    contents = new Buffer(String(contents), enc).toString("utf8");
  }
  const chars = contents.length;
  const words = wordCount(contents);
  return { chars, words };
}
