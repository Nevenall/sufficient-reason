"use strict";

import {Writable} from "stream";
import util from "util";
import count from "./count";

util.inherits(CountStream, Writable);
export default function CountStream(options) {
  Writable.call(this, options);
  this.chars = 0;
  this.words = 0;
}

CountStream.prototype._write = function (chunk, enc, callback) {
  const counts = count(chunk, enc);
  this.chars += counts.chars;
  this.words += counts.words;
  this.emit("progress");
  callback();
};
