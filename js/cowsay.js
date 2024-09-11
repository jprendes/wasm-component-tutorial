import { instantiate } from "./cowsay/cowsay.js";

let fetchWasm = fetch;

export function Cowsay(imports) {
    return instantiate(
        (url) => fetchWasm(`./cowsay/${url}`).then(WebAssembly.compileStreaming),
        imports
    );
}

if (globalThis.process?.versions?.node) {
    let fs = await import("fs");
    fetchWasm = async (url) => new Response(
        fs.createReadStream(new URL(url, import.meta.url)),
        { headers: { "Content-Type": "application/wasm" }}
    );
}
