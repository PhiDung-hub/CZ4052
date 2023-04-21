import { ConsistentHash } from "./consistentHash.js";
import { RendezvousHash } from "./rendezvousHash.js";
import { JumpConsistentHash } from "./jumpConsistentHash.js";

function getHashFunction(hash_function) {
  // console.log(hash_function);
  if (hash_function == "original") {
    return new ConsistentHash();
  } else if (hash_function == "rendezvous") {
    return new RendezvousHash();
  } else if (hash_function == "jump") {
    return new JumpConsistentHash();
  } else if (hash_function == "maglev") {
    return new RendezvousHash();
  }
}

export { getHashFunction };
