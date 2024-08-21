// password protect pages (jankily)
//
// use a SHA-256 encoded password to password protect private pages
// this is not very secure, but will do for my needs
//
// More info:
//   https://dev.to/halan/4-ways-of-symmetric-cryptography-and-javascript-how-to-aes-with-javascript-3o1b

const SECRET = "d0c04f4b1951e4aeaaec8223ed2039e542f3aae805a6fa7f6d794e5afff5d272";

const PUBLIC_PAGES = ["intro", "denver-guide"];

function log() {
  console.log("cipher> ", ...arguments);
}

class Passcode {
  _text;
  _hash;

  constructor(text) {
    this.text = text;
  }

  // convert an array of character byte integers to a string
  decode(arr) { 
    return arr.map(b => b.toString(16).padStart(2, "0")).join("");
  }

  // get the text attribute
  get text() {
    return this._text;
  }

  // set the text attribute and clear out the hash attribute
  set text(value) {
    this._text = value;
    this._hash = null;
  }

  // generate and store the SHA-256 hash
  get hash() {
    if (!this.text) {
      return;
    }

    if (!this._hash) {
      var buffer = new TextEncoder("UTF-8").encode(this.text);
      var promise = crypto.subtle.digest("SHA-256", buffer)
        .then(digest => Array.from(new Uint8Array(digest)))
        .then(bytes => this._hash = this.decode(bytes));
    }

    return this._hash;
  }
}

// already authorized if the page is public of if they have the secret cookie
function authorized() {
  var url = window.location.href;
  return (
    (document.cookie == SECRET) || 
    PUBLIC_PAGES.some((p) => url.endsWith(`${p}.html`))
  );
}
  
// password protect pages (jankily)
function protect() {
  // skip if they've already authorized
  if (authorized()) {
    return;
  }

  var text = prompt("Password: ");

  // user canceled -- redirect to a public page
  if (text === null) {
    clearInterval(retry);
    window.location.href = "intro.html";
  }

  // get the Passcode object for their password attempt
  var attempt = new Passcode(text);

  // throw an error if attempt.hash does not exist
  // otherwise continue with the auth logic
  function finish() {
    if (!attempt.hash) {
      new Error("Still waiting...");

    } else {
      clearInterval(retry);

      if (attempt.hash !== SECRET) {
        protect()
      } else {
        document.cookie = SECRET;
        // document.location.reload();
        var unhide = setInterval(() => {
          if (document.readyState == "complete") {
            $("body").show();
            clearInterval(unhide);
          }
        }, 500)
      }
    }
  }

  // keep retrying until finish() succeeds
  var retry = setInterval(finish, 500);
}

// before anything else, do the password protection
var startup = new Event("startup");
runner = new Promise(resolve => window.addEventListener("startup", protect));
window.dispatchEvent(startup);

// on load, unhide content if authorized
window.addEventListener("DOMContentLoaded", (e) => {
  if (authorized()) {
    $("body").show();
  }
});

// export as a module for node
// or catch and ignore in pure JS
try {
  module.exports = {Passcode, SECRET};
} catch (error) {
  // no-op
}
