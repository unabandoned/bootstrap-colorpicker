// Builds dist/ - the files this package ships - from src/.
//
// Replaces upstream's gulp 3 + webpack 4 + babel 6 pipeline with esbuild and
// sass. The output keeps upstream's shape: a UMD bundle (jquery external,
// the `color` library inlined) plus a minified copy, and the stylesheet
// compiled from SCSS plus a minified copy, all with source maps.
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import * as esbuild from 'esbuild';
import * as sass from 'sass';

const pkg = JSON.parse(readFileSync('package.json', 'utf8'));

// Browser floor for the CSS vendor prefixes and the JS syntax level. ES2015
// is the lowest level esbuild can lower this source (it uses classes) to.
const jsTarget = 'es2015';
const cssTarget = ['chrome51', 'edge79', 'firefox45', 'safari10'];

const banner = `/*!
 * Bootstrap Colorpicker - ${pkg.description}
 * @package ${pkg.name}
 * @version v${pkg.version}
 * @license ${pkg.license}
 * @link ${pkg.homepage}
 */`;

// Same UMD contract as upstream's webpack output: CommonJS, AMD (named
// "bootstrap-colorpicker") or a browser global, with jquery as the one
// external. esbuild emits a CommonJS bundle; the wrapper hands it `module`
// and a `require` that only resolves jquery.
const umdHead = `${banner}
(function (root, factory) {
  if (typeof exports === 'object' && typeof module === 'object') module.exports = factory(require('jquery'));
  else if (typeof define === 'function' && define.amd) define('bootstrap-colorpicker', ['jquery'], factory);
  else if (typeof exports === 'object') exports['bootstrap-colorpicker'] = factory(require('jquery'));
  else root['bootstrap-colorpicker'] = factory(root['jQuery']);
})(typeof self !== 'undefined' ? self : this, function (__jquery) {
'use strict';
var module = { exports: {} }, exports = module.exports;
var require = function (id) {
  if (id === 'jquery') return __jquery;
  throw new Error('bootstrap-colorpicker: cannot require "' + id + '"');
};`;
const umdFoot = `return module.exports;
});`;

rmSync('dist', { recursive: true, force: true });
mkdirSync('dist/js', { recursive: true });
mkdirSync('dist/css', { recursive: true });

for (const minify of [false, true]) {
  await esbuild.build({
    entryPoints: ['src/js/plugin.js'],
    outfile: `dist/js/bootstrap-colorpicker${minify ? '.min' : ''}.js`,
    bundle: true,
    format: 'cjs',
    platform: 'browser',
    target: jsTarget,
    // upstream resolved `import ... from 'extensions'` / 'Extension' against src/js
    nodePaths: ['src/js'],
    external: ['jquery'],
    banner: { js: umdHead },
    footer: { js: umdFoot },
    legalComments: 'inline',
    minify,
    sourcemap: true,
    logLevel: 'warning'
  });
}

// SCSS -> CSS with sass, then through esbuild for vendor prefixes and
// minification. The intermediate file carries sass's map inline so esbuild
// chains it, and the shipped maps point at src/sass/colorpicker.scss.
const scratch = join(tmpdir(), `bootstrap-colorpicker-${process.pid}`);
mkdirSync(scratch, { recursive: true });
try {
  const compiled = sass.compile('src/sass/colorpicker.scss', {
    style: 'expanded',
    sourceMap: true,
    sourceMapIncludeSources: true
  });
  const map = Buffer.from(JSON.stringify(compiled.sourceMap)).toString('base64');
  const intermediate = join(scratch, 'bootstrap-colorpicker.css');
  writeFileSync(intermediate,
    `${compiled.css}\n/*# sourceMappingURL=data:application/json;base64,${map} */\n`);

  for (const minify of [false, true]) {
    await esbuild.build({
      entryPoints: [intermediate],
      outfile: `dist/css/bootstrap-colorpicker${minify ? '.min' : ''}.css`,
      bundle: false,
      loader: { '.css': 'css' },
      target: cssTarget,
      banner: { css: banner },
      minify,
      sourcemap: true,
      logLevel: 'warning'
    });
  }
} finally {
  rmSync(scratch, { recursive: true, force: true });
}
