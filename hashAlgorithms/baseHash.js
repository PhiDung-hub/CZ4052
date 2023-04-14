import { binarySearch } from "./common.js";

class BaseHash {
  constructor() {
    this.servers = new Map();
    this.physical_servers = new Map();
    this.server_qty = 0;
  }

  resetRing() {
    this.servers.clear();
    this.physical_servers.clear();
    this.server_qty = 0;
  }

  getServers() {
    return this.servers;
  }

  hashFunction() { }

  addData() { }

  addServer() { }


  removeServer() { }

  /**
   * @param {String} key - key/hash_value of the node to find position.
   * */
  getClosestKey(string_key) {
    let keys = Array.from(this.servers.keys());
    keys.sort((a, b) => a - b);
    return binarySearch(keys, string_key);
  }
}

export { BaseHash };
