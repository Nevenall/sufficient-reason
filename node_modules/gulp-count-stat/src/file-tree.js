"use strict";

import path from "path";

class FileTree {
  constructor(treeOrPaths = null) {
    if (treeOrPaths instanceof Array) {
      this.tree = new FileTreeNode();
      this.addPaths(treeOrPaths);
    } else {
      this.tree = new FileTreeNode(treeOrPaths);
    }
  }

  add(pathOrNode) {
    if (typeof pathOrNode === "string") {
      return path.normalize(pathOrNode).split(path.sep).reduce((parent, entry) => {
        return parent.getChild(entry) || parent.addChild(entry);
      }, this.tree);
    } else {
      return this.tree.addChild(pathOrNode);
    }
  }

  addPaths(paths) {
    return paths.map(p => this.add(p));
  }

  get(findPath) {
    let found = null;
    findPath = path.normalize(findPath);
    this.walk(node => {
      if (node.path === findPath) {
        found = node;
        return false;
      }
    });
    return found;
  }

  toString(options = {}) {
    const lines = this.map(node => node.toTreeString(options));
    if (options.skipRoot) lines.shift();
    return lines.join("\n");
  }

  toObject(options = {}) {
    return this.tree.toObject(options);
  }

  walk(fn, {depthFirst = false, leafOnly = false} = {}) {
    const emitNode = leafOnly ? function (node) {
      return node.isLeaf ? fn(node) : true;
    } : fn;

    const walkNode = depthFirst ?
      function (node) {
        if (!node.children.every(walkNode)) return false;
        return emitNode(node) !== false;
      } :
      function (node) {
        if (emitNode(node) === false) return false;
        return node.children.every(walkNode);
      };

    walkNode(this.tree);
    return this;
  }

  walkDepthFirst(fn) {
    return this.walk(fn, { depthFirst: true });
  }

  walkLeaf(fn) {
    return this.walk(fn, { leafOnly: true });
  }

  map(fn) {
    const results = [];
    this.walk(node => { results.push(fn(node)) });
    return results;
  }

  mapLeaf(fn) {
    const results = [];
    this.walkLeaf(node => { results.push(fn(node)) });
    return results;
  }

  print(fn, options) {
    if (typeof fn === "object") { options = fn; fn = null }
    options = options || {};

    return this.walk(node => {
      if (options.skipRoot && node.isRoot) return;
      const result = fn ? fn(node) : node.toTreeString(options);
      if (typeof result === "object") {
        let {prefix, suffix} = result;
        prefix = prefix ? `${prefix} ` : "";
        suffix = suffix ? ` ${suffix}` : "";
        const treePrefix = node.getTreePrefix(options);
        console.log(`${treePrefix}${prefix}${node.toString()}${suffix}`);
      } else if (typeof result !== "undefined" && result !== null) {
        console.log(result);
      }
    });
  }

  filter(fn) {
    return this._transform(node => {
      return fn(node) ? node : null;
    });
  }

  reject(fn) {
    return this._transform(node => {
      return fn(node) ? null : node;
    });
  }

  foldRoot() {
    return this.fold(true);
  }

  fold(rootOnly = false) {
    return this._transform(node => {
      if ((node.isRoot || !rootOnly) && node.children.length === 1) {
        const child = node.children[0];
        child.name = path.join(node.name, child.name);
        return child;
      } else {
        return node;
      }
    });
  }

  sort(compareFunction) {
    this.tree.sort(compareFunction);
    return this;
  }

  _transform(fn) {
    this.tree = (function transformNode(node) {
      let newNode = fn(node);
      if (!newNode) {
        return null;
      }

      if (node !== newNode) {
        if (newNode.parent) {
          newNode.parent.removeChild(newNode);
        }
        if (node.parent) {
          node.parent.replaceChild(node, newNode);
        }
        return transformNode(newNode);
      }

      node.children.forEach((child, index) => {
        const newChild = transformNode(child);
        if (!newChild) {
          node.removeChild(child);
        }
      });
      return node;
    })(this.tree);
    if (!this.tree) this.tree = new FileTreeNode();
    return this;
  }
}

class FileTreeNode {
  constructor(node) {
    node = node || {};
    this._name = node.name || ".";
    this.parent = node.parent || null;
    this.children = node.children || [];
    this.childNameToIndex = node.childNameToIndex || {};
    this.data = node.data || null;
  }

  get name() {
    return this._name;
  }

  set name(newName) {
    if (this.parent) {
      const existChild = this.parent.getChild(newName);
      if (existChild) {
        this.parent.replaceChild(existChild, this);
      } else {
        const index = this.parent.childNameToIndex[this.name];
        delete this.parent.childNameToIndex[this.name];
        this.parent.childNameToIndex[newName] = index;
      }
    }
    this._name = newName;
  }

  get isRoot() {
    return !this.parent;
  }

  get isLeaf() {
    return this.children.length === 0;
  }

  get path() {
    if (!this.parent) return (this.name || ".");
    return path.join(this.parent.path, this.name);
  }

  get childIndex() {
    if (!this.parent) return 0;
    return this.parent.childNameToIndex[this.name] || 0;
  }

  get isFirstChild() {
    if (!this.parent) return false;
    return this.childIndex === 0;
  }

  get isLastChild() {
    if (!this.parent) return false;
    return this.childIndex === this.parent.children.length - 1;
  }

  get depth() {
    if (!this.parent) return 0;
    return this.parent.depth + 1;
  }

  getTreeIndent(options) {
    if (!this.parent) return "";
    options = options || {};
    if (options.skipRoot && this.parent.isRoot) return "";
    return this.parent.getTreeIndent(options) + (this.isLastChild ? "     " : "│   ");
  }

  getTreePrefix(options) {
    if (!this.parent) return "";
    options = options || {};
    if (options.skipRoot && this.parent.isRoot) return "";
    return this.parent.getTreeIndent(options) + (this.isLastChild ? "└─ " : "├─ ");
  }

  toString() {
    return this.name;
  }

  toTreeString(options) {
    return this.getTreePrefix(options) + this.name;
  }

  toObject(options) {
    options = options || {};
    const obj = {};
    if (options.dataKey) { obj[options.dataKey] = this.data }
    this.children.forEach(child => obj[child.name] = child.toObject(options));
    return this.isRoot && this.name !== "." ? { [this.name]: obj } : obj;
  }

  getChild(name) {
    const index = this.indexOfChild(name);
    return index >= 0 ? this.children[index] : null;
  }

  indexOfChild(name) {
    return this.childNameToIndex.hasOwnProperty(name) ?
      this.childNameToIndex[name] : -1;
  }

  addChild(child) {
    return this.insertChild(child, this.children.length);
  }

  sort(compareFunction) {
    this.children.sort(compareFunction);
    this.childNameToIndex = {};
    this.children.forEach((child, index) => {
      this.childNameToIndex[child.name] = index;
      child.sort(compareFunction);
    });
  }

  insertChild(child, index) {
    if (typeof child === "string") {
      child = new FileTreeNode({ name: child });
    } else if (!(child instanceof FileTreeNode)) {
      child = new FileTreeNode(child);
    }

    if (index < 0) {
      index = this.children.length + 1 + index;
    }
    index = Math.max(0, Math.min(this.children.length, index));

    if (child.parent && child.parent !== this) {
      child.parent.removeChild(child);
    }
    child.parent = this;

    const oldIndex = this.indexOfChild(child.name);
    if (oldIndex >= 0) {
      if (oldIndex === index) {
        this.children[index] = child;
      } else {
        this.childNameToIndex[child.name] = index;
        this.children.splice(oldIndex, 1);
        this.children.splice(oldIndex < index ? (index - 1) : index, 0, child);
      }
    } else {
      this.childNameToIndex[child.name] = index;
      this.children.splice(index, 0, child);
    }
    return child;
  }

  removeChild(child) {
    const index = this.children.indexOf(child);
    if (index >= 0) {
      const node = this.children[index];
      node.parent = null;
      this.children.splice(index, 1);
      delete this.childNameToIndex[node.name];
      return node;
    } else {
      return null;
    }
  }

  replaceChild(oldChild, newChild) {
    const index = this.children.indexOf(oldChild);
    if (oldChild) {
      this.removeChild(oldChild);
    }
    if (index >= 0) {
      return this.insertChild(newChild, index);
    } else {
      return this.addChild(newChild);
    }
  }

  clone() {
    return new FileTreeNode(this);
  }
}

function fileTree(paths) {
  return new FileTree(paths);
}
fileTree.FileTree = FileTree;

export default fileTree;
