import { ConsistentHash } from "./consistentHash.js";
import { crc32 } from "./common.js";


class JumpConsistentHash extends ConsistentHash {

    hashFunction(string) {
        let key = BigInt(crc32(string));
        let b = -1;
        let j = 0;
        while (j < this.server_qty) {
            b = j;
            key = (key * 2862933555777941757n + 1n) % (2n ** 64n);
            j = Math.floor((b + 1) * (Number(1n << 31n) / Number((key >> 33n) + 1n)));
        }
        return b;
    }
}

export { JumpConsistentHash };