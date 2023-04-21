import { crc32, binarySearch } from "./common.js";

class BaseHash {
  
    constructor() {
        this.real_servers = new Map();
        this.servers = new Map();
        this.server_qty = 0;
    }

    resetRing() {
        this.servers.clear();
        this.real_servers.clear();
        this.server_qty = 0;
    }

    getServers() {
      return this.servers;
    }

    /**
     * It is used to hash the server_name to get the ring position.
     * @param {String} server_name - the ser_name needed to be hash.
     */
    hashRing(server_name) {
      return crc32(server_name) % 3600;
    }

    /**
     * It is used to hash the string to get the key.
     * @param {String} string - the data string to hash.
     */
    hashFunction(string) { }

    /**
     * 
     * @param {String} data_str - data to add to the ring.
     * */
    addData(data_str) { }

    /**
     * Add new server to the ring.
     * Need to reassign the keys to the new server.
     * @param {Number} replication_factor - number of virtual servers to add.
     */
    addServer(replication_factor) { }

    /**
     * Remove server from the ring.
     * Need to reassign the keys to other servers.
     * @param {String} server_name - name of the server to remove.
     * */
    removeServer(server_name) { }
  
}

export { BaseHash };
