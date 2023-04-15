import { BaseHash } from "./baseHash.js";
import { simulationLog } from "../log.js";

class RendezvousHash extends BaseHash {

    constructor() {
        super();
        this.hrw = new Map();
    }

    helper(string) {
        let hash = 2_166_136_261n;
        const fnvPrime = 16_777_619n;
        let isUnicoded = false;        
        for (let index = 0; index < string.length; index++) {
            let characterCode = string.charCodeAt(index);
            if (characterCode > 0x7F && !isUnicoded) {
                string = unescape(encodeURIComponent(string));
                characterCode = string.charCodeAt(index);
                isUnicoded = true;
            }        
            hash ^= BigInt(characterCode);
            hash = BigInt.asUintN(32, hash * fnvPrime);
        }        
        return hash;
    };
    hashFunction(string) {
        let seed = this.helper(string);
        let t = Number(seed) + 0x6D_2B_79_F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        // Unlike original Mulberry32 function, we dont need to divide by 2^32
        return (t ^ t >>> 14) >>> 0;
    }

    /**
     * 
     * @param {String} data_str - data to add to the ring.
     * */
    addData(data_str) {
        const data_key = this.helper(data_str);
        const server_key = this.getHrwServer(data_key);

        let server = this.servers.get(server_key);
        let real_server = this.real_servers.get(server.server_name);
    
        server.keys_size += 1;
        real_server.keys_size += 1;

        if (server.keys.has(data_key)) {
            let c = server.keys.get(data_key);
            c.push(data_str);
        } else {
            server.keys.set(data_key, [data_str]);
        }

        if (this.hrw.has(data_key)) {
            this.hrw.get(data_key).push(data_str);
        } else {
            this.hrw.set(data_key, [data_str]);
        }

        return [
            server_key,
            server.server_name,
            server.keys_size,
            real_server.keys_size,
        ];
    }

    /**
     * Assign new server to the ring.
     * @param {Number} vserver_key - hash of the virtual server name.
     * @param {String} server_name - name of the server.
     * @param {String} virtual_server_name - name of the virtual server.
     * */
    assignServer(vserver_key, server_name, virtual_server_name) {
        this.servers.set(vserver_key, {
          server_name,
          virtual_server_name,
          keys_size: 0,
          keys: new Map(),
        });
      }

    /**
     * Add new server to the ring.
     * Need to reassign the keys to the new server.
     * @param {Number} replication_factor - number of virtual servers to add.
     */
    addServer(replication_factor) {
        let server_name = "S" + this.server_qty;
        let new_virtual_server_names = new Array();
        
        simulationLog("[ + ] Add new server " + server_name);
        this.server_qty += 1;
        this.real_servers.set(server_name, { keys_size: 0 });
    
        for (let i = 0; i <= replication_factor; i++) {
          const virtual_server_name = server_name + " Virtual " + i;
          new_virtual_server_names.push(virtual_server_name);
          this.assignServer(this.hashRing(virtual_server_name), server_name, virtual_server_name);
        }

        this.reassignKeys();
    }

    /**
     * Remove server from the ring.
     * Need to reassign the keys to other servers.
     * @param {String} server_name - name of the server to remove.
     * */
    removeServer(server_name) {
        simulationLog("[ - ] Remove server " + server_name);
        if (parseInt(this.real_servers.size) == 1) {
          return false;
        }

        this.real_servers.delete(server_name);
        this.servers.forEach((server, server_key) => {
            if (server.server_name == server_name) {
                this.servers.delete(server_key);
            }
        });
        
        this.server_qty -= 1;
        this.reassignKeys();
        return true;
    }

    /**
     * Given a data_key, find the server with the highest weight
     * @param {String} data_key - key to find the server for.
     * @returns {Number} max_server_key - key of the server with the highest weight.
     * @returns {Number} max_weight - weight of the server with the highest weight.
     */
    getHrwServer(data_key) {
        let max_weight = -Infinity;
        let max_server_key;

        this.servers.forEach((server, server_key) => {
            const weight = this.hashFunction(server.virtual_server_name + '-' + data_key);
            if (weight > max_weight) {
                max_weight = weight;
                max_server_key = server_key;
            }
        });

        return max_server_key;
    }

    reassignKeys() {
        // clear all keys from servers
        this.servers.forEach((server, _) => {
            server.keys_size = 0;
            server.keys.clear();
        });

        // clear all keys from real servers
        this.real_servers.forEach((server, _) => {
            server.keys_size = 0;
        });
        
        // reassign keys
        this.hrw.forEach((data_values, data_key) => {

            // Find the server with the highest weight
            const server_key = this.getHrwServer(data_key);
            let server = this.servers.get(server_key);
            let real_server = this.real_servers.get(server.server_name);

            // Add the key to the server
            server.keys.set(data_key, data_values);
            server.keys_size += data_values.length;
            real_server.keys_size += data_values.length;
        });
    }

}   

export { RendezvousHash };
