import { BaseHash } from "./baseHash.js";
import { simulationLog } from "../log.js";
import { crc32 } from "./common.js";

class ConsistentHash extends BaseHash {
  hashFunction(input_data) {
    return crc32(input_data) % 360;
  }

  addData(data_str) {
    const hash = this.hashFunction(data_str);
    const key = this.getClosestKey(hash);
    let server = this.servers.get(key);
    let rs = this.physical_servers.get(server.server_name);

    server.keys_size += 1;
    rs.keys_size += 1;

    if (server.keys.has(hash)) {
      let c = server.keys.get(hash);
      c.push(data_str);
    } else {
      server.keys.set(hash, [data_str]);
    }

    return [key, server.server_name, server.keys_size, rs.keys_size];
  }

  assignServer(hash, server_name) {
    this.servers.set(hash, {
      server_name,
      keys_size: 0,
      keys: new Map(),
    });
  }

  addServer(replication_factor) {
    let server_name = "S" + this.server_qty;

    simulationLog("[ + ] Add new server " + server_name);
    this.server_qty += 1;
    this.physical_servers.set(server_name, { keys_size: 0 });
    this.assignServer(this.hashFunction(server_name), server_name);

    for (let i = 0; i < replication_factor; i++) {
      const virtual_server_name = server_name + " Virtual " + i;
      this.physical_servers.set(server_name, { keys_size: 0 });
      this.assignServer(this.hashFunction(virtual_server_name), server_name);
    }

    // Get previous keys sizes
    const prev_sizes = new Map();
    this.physical_servers.forEach((server, key) => {
      prev_sizes.set(key, { keys_size: server.keys_size });
    });

    // assign new servers
    this.servers.forEach((server, _) => {
      server.keys.forEach((v, k) => {
        const closest = this.getClosestKey(k);
        if (closest != k) {
          server.keys_size -= server.keys.get(k).length;

          // Update previous new real server size
          let prev_rs = this.physical_servers.get(server.server_name);
          prev_rs.keys_size -= server.keys.get(k).length;

          let ns = this.servers.get(closest);
          ns.keys.set(k, v);
          ns.keys_size += v.length;
          server.keys.delete(k);

          // Update new real server size
          let new_rs = this.physical_servers.get(ns.server_name);
          new_rs.keys_size += v.length;
        }
      });
    });

    // Log changes
    this.physical_servers.forEach((server, key) => {
      let prev_ksize = prev_sizes.get(key).key_size;
      if (key != server_name && prev_ksize != server.keys_size) {
        simulationLog(
          `Move ${prev_ksize - server.keys_size
          } keys from ${key} to ${server_name}`
        );
      }
    });
  }

  /**
   * Remove server with this
   * */
  removeServer(server_name) {
    simulationLog("[ - ] Remove server " + server_name);
    if (parseInt(this.physical_servers.size) == 1) {
      return false;
    }

    const removed_server_keys = new Map();

    // Get removed_server_keys, and delete servers with those keys
    this.servers.forEach((server, key) => {
      if (server.server_name == server_name) {
        removed_server_keys.set(key, {
          keys_size: server.keys_size,
          keys: server.keys,
        });
        this.servers.delete(key);
      }
    });

    // Reassign keys
    removed_server_keys.forEach((server, key) => {
      // Move keys from the deleted server to the new server
      const new_server = this.servers.get(this.getClosest(key));
      new_server.keys_size += server.keys_size;
      new_server.keys = server.keys;
      const rs = this.physical_servers.get(new_server.server_name);
      rs.keys_size += server.keys_size;

      simulationLog(
        "Move " +
        server.keys_size +
        " keys from " +
        server_name +
        " to " +
        new_server.server_name
      );
    });

    this.physical_servers.delete(server_name);
    return true;
  }
}

export { ConsistentHash };
