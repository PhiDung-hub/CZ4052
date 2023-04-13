class BaseHash {
  constructor() {
    this.servers = new Map();
    this.real_servers = new Map();
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

  hashFunction() { }

  addServer() { }

  removeServer() { }

  addData() { }
}

export { BaseHash };
