import { BaseHash } from "./baseHash.js";
import { simulationLog } from "../log.js";
import { crc32 } from "./common.js";

class RendezvousHash extends BaseHash {
  hash_function(string) {
    return crc32(string) % 360;
  }
}

export { RendezvousHash };
