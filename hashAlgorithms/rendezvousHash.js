import { BaseHash } from "./baseHash.js";
import { simulationLog } from "../log.js";
import { crc32 } from "./common.js";

class RendezvousHash extends BaseHash {

    hash_function(string) {
        return crc32(string) % 360;
    }

    addServer(vnodes) {
        let server_name = "S" + this.server_qty;
        let prev_sizes = new Map();
        simulationLog("[ + ] Add new server " + server_name);
        this.server_qty += 1;
        let hash = this.hash_function(server_name);
        this.real_servers.set(server_name, { keys_size: 0 });
        this.servers.set(hash, {
            server_name: server_name,
            keys_size: 0,
            keys: new Map(),
        });
        let sn = "";
        for (let i = 0; i < vnodes; i++) {
            sn = server_name + " Virtual " + i;
            hash = this.hash_function(sn);
            this.servers.set(hash, {
                server_name: server_name,
                keys_size: 0,
                keys: new Map(),
            });
        }
        
        // Get previous keys sizes
        this.real_servers.forEach((s, key) => {
            prev_sizes.set(key, { keys_size: s.keys_size });
        });

        this.servers.forEach((s, k) => {
            s.keys.forEach((v, k) => {
                let closest = this.getClosest(k);
                if (closest != k) {
                    s.keys_size -= s.keys.get(k).length;

                    // Update previous new real server size
                    let prev_rs = this.real_servers.get(s.server_name);
                    prev_rs.keys_size -= s.keys.get(k).length;

                    let ns = this.servers.get(closest);
                    ns.keys.set(k, v);
                    ns.keys_size += v.length;
                    s.keys.delete(k);

                    // Update new real server size
                    let new_rs = this.real_servers.get(ns.server_name);
                    new_rs.keys_size += v.length;
                }
            });
        });

        // Log changes
        this.real_servers.forEach((s, key) => {
            let prev = prev_sizes.get(key);
            if (key != server_name && prev.keys_size != s.keys_size) {
                simulationLog(
                    "Move " +
                    (prev.keys_size - s.keys_size) +
                    " keys from " +
                    key +
                    " to " +
                    server_name
                );
            }
        });
    }

    removeServer(server_name) {
        simulationLog("[ - ] Remove server " + server_name);
        if (parseInt(this.real_servers.size) == 1) {
            return false;
        }

        let removed_server_keys = new Map();
        let ns, rs;

        // Get removed_server_keys
        this.servers.forEach((value, key) => {
            if (value.server_name == server_name) {
                removed_server_keys.set(key, {
                    keys_size: value.keys_size,
                    keys: value.keys,
                });
            }
        });

        // Remove server and vnodes
        removed_server_keys.forEach((_value, key) => {
            this.servers.delete(key);
        });

        // Reassign keys
        removed_server_keys.forEach((v, k) => {
            ns = this.servers.get(this.getClosest(k));
            ns.keys_size += v.keys_size;
            ns.keys = v.keys;
            rs = this.real_servers.get(ns.server_name);
            rs.keys_size += v.keys_size;

            simulationLog(
                "Move " +
                v.keys_size +
                " keys from " +
                server_name +
                " to " +
                ns.server_name
            );
        });

        this.real_servers.delete(server_name);
        return true;
    }

    addData(str) {
        let hash = this.hash_function(str);
        let k = this.getClosest(hash);
        let server = this.servers.get(k);
        let rs = this.real_servers.get(server.server_name);
      
        server.keys_size += 1;
        rs.keys_size += 1;
      
        if (server.keys.has(hash)) {
            let c = server.keys.get(hash);
            c.push(str);
        } else {
            server.keys.set(hash, [str]);
        }
      
        return [k, server.server_name, server.keys_size, rs.keys_size];
    }

    getClosest(hash) {
        
    }
    
      
    binarySearch(arr, target, lo = 0, hi = arr.length - 1) {
        
    }
}

export { RendezvousHash };