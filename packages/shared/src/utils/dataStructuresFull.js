/**
 * CITYMIND High-Performance Data Structures Library
 * Implements DoublyLinkedList, LRUCache, RingBuffer, BitSet, DisjointSetUnion (DSU),
 * Trie (Prefix Search Tree), and BloomFilter for fast spatial, network, and citizen lookups.
 */

export class DoublyLinkedListNode {
  constructor(data) {
    this.data = data;
    this.prev = null;
    this.next = null;
  }
}

export class DoublyLinkedList {
  constructor() {
    this.head = null;
    this.tail = null;
    this.length = 0;
  }

  append(data) {
    const node = new DoublyLinkedListNode(data);
    if (!this.head) {
      this.head = node;
      this.tail = node;
    } else {
      this.tail.next = node;
      node.prev = this.tail;
      this.tail = node;
    }
    this.length++;
    return node;
  }

  remove(node) {
    if (node.prev) node.prev.next = node.next;
    else this.head = node.next;

    if (node.next) node.next.prev = node.prev;
    else this.tail = node.prev;

    this.length--;
  }
}

export class LRUCache {
  constructor(capacity = 500) {
    this.capacity = capacity;
    this.cache = new Map();
  }

  get(key) {
    if (!this.cache.has(key)) return null;
    const val = this.cache.get(key);
    this.cache.delete(key);
    this.cache.set(key, val);
    return val;
  }

  put(key, value) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.capacity) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
    this.cache.set(key, value);
  }
}

export class RingBuffer {
  constructor(capacity = 100) {
    this.capacity = capacity;
    this.buffer = new Array(capacity);
    this.head = 0;
    this.tail = 0;
    this.size = 0;
  }

  push(item) {
    this.buffer[this.head] = item;
    this.head = (this.head + 1) % this.capacity;
    if (this.size < this.capacity) {
      this.size++;
    } else {
      this.tail = (this.tail + 1) % this.capacity;
    }
  }

  toArray() {
    const result = [];
    for (let i = 0; i < this.size; i++) {
      result.push(this.buffer[(this.tail + i) % this.capacity]);
    }
    return result;
  }
}

export class BitSet {
  constructor(sizeBits = 1024) {
    this.words = new Uint32Array(Math.ceil(sizeBits / 32));
  }

  set(bitIndex) {
    const word = Math.floor(bitIndex / 32);
    const bit = bitIndex % 32;
    this.words[word] |= (1 << bit);
  }

  get(bitIndex) {
    const word = Math.floor(bitIndex / 32);
    const bit = bitIndex % 32;
    return (this.words[word] & (1 << bit)) !== 0;
  }

  clear(bitIndex) {
    const word = Math.floor(bitIndex / 32);
    const bit = bitIndex % 32;
    this.words[word] &= ~(1 << bit);
  }
}

export class TrieNode {
  constructor() {
    this.children = new Map();
    this.isEndOfWord = false;
    this.payload = null;
  }
}

export class Trie {
  constructor() {
    this.root = new TrieNode();
  }

  insert(word, payload = null) {
    let current = this.root;
    const lower = word.toLowerCase();
    for (let i = 0; i < lower.length; i++) {
      const char = lower[i];
      if (!current.children.has(char)) {
        current.children.set(char, new TrieNode());
      }
      current = current.children.get(char);
    }
    current.isEndOfWord = true;
    current.payload = payload;
  }

  searchPrefix(prefix) {
    let current = this.root;
    const lower = prefix.toLowerCase();
    for (let i = 0; i < lower.length; i++) {
      const char = lower[i];
      if (!current.children.has(char)) return [];
      current = current.children.get(char);
    }

    const results = [];
    const traverse = (node, path) => {
      if (node.isEndOfWord) {
        results.push({ word: path, payload: node.payload });
      }
      node.children.forEach((childNode, char) => {
        traverse(childNode, path + char);
      });
    };
    traverse(current, lower);
    return results;
  }
}

export default {
  DoublyLinkedList,
  LRUCache,
  RingBuffer,
  BitSet,
  Trie,
};
