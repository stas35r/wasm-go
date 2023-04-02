import Client from "./Client";
import Go from "./wasm_exec";

class WasmLoader {
  private go: Go;

  constructor() {
    if (!WebAssembly) {
      throw new Error("WebAssembly is not supported in your browser");
    }

    this.go = new Go();
  }

  async runWasm(wasmLink: string, client: Client) {
    const source = await WebAssembly.instantiateStreaming(
      fetch(wasmLink),
      this.go.importObject
    );

    this.go.run(source.instance, client);
  }
}

export default WasmLoader;
