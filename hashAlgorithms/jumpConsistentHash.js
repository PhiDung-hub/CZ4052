import { ConsistentHash } from "./consistentHash.js";
import { crc32 } from "./common.js";


class JumpConsistentHash extends ConsistentHash {

    hashFunction(string) {
        let server_keys = Array.from(this.servers.keys());
        let key = BigInt(crc32(string));
        let b = -1;
        let j = 0;

        server_keys.forEach((_) => {
            b = j;
            key = (key * 113n + 1n);
            j = Math.floor((b + 1) * (Number(1n << 31n) / Number((key >> 33n) + 1n)));
        });

        return b % 3600;
    }
}

export { JumpConsistentHash };