'use strict';

const { readFileSync } = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');

const root = path.join(__dirname, '..');
const dist = (file) => path.join(root, 'dist', 'js', file);

// Every jQuery line the peer range admits and CI can install: CyberChef runs
// jQuery 3, and jQuery 4 is the current major.
// Both resolve to the package's dist/jquery.js, the plain browser build.
const jqueries = {
  'jquery 3': require.resolve('jquery3'),
  'jquery 4': require.resolve('jquery')
};

function newWindow() {
  const dom = new JSDOM('<!doctype html><html><head></head><body></body></html>', {
    runScripts: 'outside-only',
    pretendToBeVisual: true
  });
  return dom.window;
}

// Loads jQuery and the bundle as plain <script>s would: the UMD wrapper
// sees no module system and registers on window.jQuery.
function loadGlobal(jqueryPath, bundle = dist('bootstrap-colorpicker.js')) {
  const window = newWindow();
  window.eval(readFileSync(jqueryPath, 'utf8'));
  window.eval(readFileSync(bundle, 'utf8'));
  return window;
}

// Loads the bundle through its CommonJS branch, the way webpack consumes it
// (CyberChef does `import "bootstrap-colorpicker"`): `require('jquery')` must
// be the only import and must receive the consumer's jQuery.
function loadCommonJS(jqueryPath, bundle = dist('bootstrap-colorpicker.js')) {
  const window = newWindow();
  window.eval(readFileSync(jqueryPath, 'utf8'));
  const $ = window.jQuery;
  const requested = [];
  const mod = { exports: {} };
  const run = new window.Function('module', 'exports', 'require', readFileSync(bundle, 'utf8'));
  run(mod, mod.exports, (id) => {
    requested.push(id);
    if (id === 'jquery') return $;
    throw new Error(`unexpected require(${JSON.stringify(id)})`);
  });
  return { window, requested, exports: mod.exports };
}

module.exports = { dist, jqueries, loadGlobal, loadCommonJS };
