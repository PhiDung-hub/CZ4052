import { BaseHash } from "./baseHash.js";
import { simulationLog } from "../log.js";
import { binarySearch } from "./common.js";

class ConsistentHash extends BaseHash {

  hashFunction(string) {
    return this.hashRing(string);
  }

  addData(data_str) {
    const data_key = this.hashFunction(data_str);
    const server_key = this.getClosestKey(data_key);
    let server = this.servers.get(server_key);
    let real_server = this.real_servers.get(server.server_name);

    server.keys_size += 1;
    real_server.keys_size += 1;

    if (!server.keys.has(data_key)) {
      server.keys.set(data_key, [data_str]);
    }
    server.keys.get(data_key).push(data_str);

    return [
      server_key,
      server.server_name,
      server.keys_size,
      real_server.keys_size,
    ];
  }

  /**
     * Assign new server to the ring.
     * @param {Number} server_key - hash of the server name.
     * @param {String} server_name - name of the server.
     * */
  assignServer(server_key, server_name) {
    this.servers.set(server_key, {
      server_name,
      keys_size: 0,
      keys: new Map(),
    });
  }

  addServer(replication_factor) {
    let server_name = "S" + this.server_qty;

    simulationLog("[ + ] Add new server " + server_name);
    this.server_qty += 1;
    this.real_servers.set(server_name, { keys_size: 0 });

    for (let i = 0; i <= replication_factor; i++) {
      const virtual_server_name = server_name + " Virtual " + i;
      this.assignServer(this.hashRing(virtual_server_name), server_name);
    }

    // Get previous keys sizes, only for logging
    const prev_sizes = new Map();
    this.real_servers.forEach((server, server_name) => {
      prev_sizes.set(server_name, { keys_size: server.keys_size });
    });

    // assign new servers
    this.servers.forEach((server, _) => {
      server.keys.forEach((data_values, data_key) => {
        const closest_server_key = this.getClosestKey(data_key);
        if (closest_server_key != data_key) {
          server.keys_size -= server.keys.get(data_key).length;

          // Update previous new real server size
          let prev_real_server = this.real_servers.get(server.server_name);
          prev_real_server.keys_size -= server.keys.get(data_key).length;

          let closest_server = this.servers.get(closest_server_key);
          closest_server.keys.set(data_key, data_values);
          closest_server.keys_size += data_values.length;
          server.keys.delete(data_key);

          // Update new real server size
          let new_real_server = this.real_servers.get(closest_server.server_name);
          new_real_server.keys_size += data_values.length;
        }
      });
    });

    // Log changes
    this.real_servers.forEach((server, server_name) => {
      let prev_ksize = prev_sizes.get(server_name).key_size;
      if (server_name != server_name && prev_ksize != server.keys_size) {
        simulationLog(
          `Move ${prev_ksize - server.keys_size} keys
          from ${server_name} to ${server_name}`
        );
      }
    });
  }

  /**
   * Remove server with this
   * */
  removeServer(server_name) {
    simulationLog("[ - ] Remove server " + server_name);
    if (parseInt(this.real_servers.size) == 1) {
      return false;
    }

    const removed_server_keys = new Map();

    // Get removed_server_keys, and delete servers with those keys
    this.servers.forEach((server, server_key) => {
      if (server.server_name == server_name) {
        removed_server_keys.set(server_key, {
          keys_size: server.keys_size,
          keys: server.keys,
        });
        this.servers.delete(server_key);
      }
    });

    // Reassign keys
    removed_server_keys.forEach((server_to_be_removed, server_key) => {
      // Move keys from the deleted server to the new server
      const closest_server = this.servers.get(this.getClosestKey(server_key));
      closest_server.keys_size += server_to_be_removed.keys_size;
      closest_server.keys = server_to_be_removed.keys;
      const real_server = this.real_servers.get(closest_server.server_name);
      real_server.keys_size += server_to_be_removed.keys_size;

      simulationLog(
        "Move " +
          server_to_be_removed.keys_size +
          " keys from " +
          server_name +
          " to " +
          closest_server.server_name
      );
    });

    this.real_servers.delete(server_name);
    return true;
  }

  /**
   * @param {String} key - key/hash_value of the node to find position.
   * */
  getClosestKey(data_key) {
    let server_keys = Array.from(this.servers.keys());
    server_keys.sort((a, b) => a - b);
    return binarySearch(server_keys, data_key);
  }

}

export { ConsistentHash };
