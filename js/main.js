import { Cowsay } from "./cowsay.js";

let { cow } = await Cowsay({
    host: {
        log(msg) {
            globalThis.document?.body?.append?.(`${msg}\n\n`);
            console.log(msg);
        }
    }
});

console.log(cow.say("Hello Wasm COWponents!"));
console.log(cow.say("Hello Wasm OWLponents!", "owl"));
