import { cow } from './cowsay/cowsay.js';

log(cow.say('Hello Wasm COWponents!'));
log("");
log(cow.say('Hello Wasm OWLponents!', 'owl'));

function log(msg) {
    if (globalThis.document) {
        document.body.textContent += `${msg}\n`;
    }
    console.log(msg);
}