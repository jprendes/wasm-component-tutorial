# wasm component tutorial

This guide will show you how to create your first wasm component using Rust, and execute it in Node.js and in your browser.

## Setup

First we need Rust and Node.js
```bash
curl -sSf https://sh.rustup.rs | bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | NODE_VERSION=19 bash
. ~/.bashrc
```

The tool we will be using is called `jco`, and we also need and http server to show the result
```bash
npm install -g @bytecodealliance/jco serve
```

Finally, we need to install the `wasm32-unknown-unknown` rust target
```bash
rustup target add wasm32-unknown-unknown
```

## Writing the component

Let's create our own `cowsay` component, we need a crate for it
```bash
cargo init --lib --name cowsay
```

We need to specify the crate type by adding to `./Cargo.toml`
```toml
[lib]
crate-type = ["cdylib"]
```

Then we need to define its interface in `./wit/cowsay.wit`
```wit
package local:cowsay;
world cowsay {
    export cow: interface {
        enum cows {
            cow,
            owl
        }
        say: func(text: string, cow: option<cows>) -> string;
    }
}
```

To consume this interface from our Rust code, we will use the `wit-bindgen` crate
```bash
cargo add wit-bindgen
```

This crate provides a `generate!` macro to generate the Rust traits from the `wit` file
```rust
mod bindings {
    wit_bindgen::generate!({
        world: "cowsay",
    });
}
```

This generates a `Cows` enum, and a a `Guest` trait for implementing the behaviour of the `cow` interface
```rust
use bindings::exports::cow::{ Guest, Cows };
```

Now we just need to create a new type to represent our component, and let `wit-bindgen` know about it
```rust
struct Component;
bindings::export!(Component with_types_in bindings);
```

We can use an empty struct since we don't need to preserve any state.

Finally we need to implement the `Guest` trait for our component
```rust
impl Guest for Component {
    fn say(text: String, cow: Option<Cows>) -> String {
        let cow = cow.unwrap_or(Cows::Cow);
        match cow {
            Cows::Cow => cowsay(text),
            Cows::Owl => owlsay(text),
        }
    }
}

fn cowsay(text: String) -> String {
    let dash: String = text.chars().map(|_| '─').collect();
    format!(
        r"╭─{dash}─╮
│ {text} │
╰┬{dash}─╯
 │   ^__^
 ╰─  (oo)\_______
     (__)\       )/\
         ||----w |
         ||     ||"
    )
}

fn owlsay(text: String) -> String {
    let dash: String = text.chars().map(|_| '─').collect();
    format!(
        r"         ╭─{dash}─╮
         │ {text} │
         ╰┬{dash}─╯
   ___    │
  (o o)  ─╯
 (  V  )
/--m-m-"
    )
}
```

And we are done!

## Compiling it

There are a few steps to compile the component:

1. Compile the crate to a core wasm module
```bash
cargo build --target wasm32-unknown-unknown --release
```

2. Convert the core wasm module to a wasm component
```bash
jco new ./target/wasm32-unknown-unknown/release/cowsay.wasm -o ./cowsay.wasm
```

3. Finally, we need to generate JS bindings for the component
```bash
jco transpile --out-dir ./js/cowsay/ ./cowsay.wasm
```

## Running it

A `main.js` script is provided, which:
1. loads the component
2. calls it twice, once with a cow and once with an own
3. prints the result

You can run the component using Node.js
```bash
node ./js/main.js
```

It should print
```
╭────────────────────────╮
│ Hello Wasm COWponents! │
╰┬───────────────────────╯
 │   ^__^
 ╰─  (oo)\_______
     (__)\       )/\
         ||----w |
         ||     ||

         ╭────────────────────────╮
         │ Hello Wasm OWLponents! │
         ╰┬───────────────────────╯
   ___    │
  (o o)  ─╯
 (  V  )
/--m-m-
```

Or you can serve it an open it on your browser at http://localhost:3000
```bash
serve ./js/
```
