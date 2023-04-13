import { RendezvousHash } from './rendezvousHash.js';
import { ConsistentHash } from './consistentHash.js';

function getHashFunction(hash_function) {
    if (hash_function == "original") {
      return new ConsistentHash();
    } else if (hash_function == "rendezvous") {
        return new RendezvousHash();
    } 
}

export { getHashFunction };