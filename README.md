# Bootstrap Colorpicker

[Bootstrap Colorpicker](https://github.com/unabandoned/bootstrap-colorpicker/) is a modular color picker plugin for Bootstrap 4.

[![npm](https://img.shields.io/npm/v/@unabandoned/bootstrap-colorpicker.svg?style=flat-square)](https://www.npmjs.com/package/@unabandoned/bootstrap-colorpicker)

> This is the maintained fork of [itsjavi/bootstrap-colorpicker](https://github.com/itsjavi/bootstrap-colorpicker),
> which was archived after 3.4.0 and whose `bootstrap-colorpicker` npm package is deprecated.
> It is published as `@unabandoned/bootstrap-colorpicker` by the
> [unabandoned](https://github.com/unabandoned) organization. The plugin API, the options and the
> `dist/` file paths are unchanged from 3.4.0.

## Install

```sh
npm install @unabandoned/bootstrap-colorpicker
```

To keep existing `import "bootstrap-colorpicker"` statements and
`bootstrap-colorpicker/dist/...` paths working unchanged, install it under the original name:

```sh
npm install bootstrap-colorpicker@npm:@unabandoned/bootstrap-colorpicker
```

`jquery` (>= 2.2) and `bootstrap` (>= 4.0) are peer dependencies, so the plugin uses your
application's copies; `popper.js` (>= 1.10) is an optional peer, needed only by Bootstrap 4's
popover. The package has no runtime dependencies of its own: the `color` library is bundled
into `dist/js`.

The `dist` files are only distributed via npm. From a clone, run `npm install` and then
`npm run build` (esbuild for the UMD bundle, sass for the stylesheet) to generate them, and
`npm test` to run the test suite.

## Versions

<table class="table table-bordered table-striped">
  <thead>
    <tr>
        <th>Colorpicker version</th>
        <th>Compatible Bootstrap version</th>
        <th>Dependencies</th>
    </tr>
  </thead>
  <tbody>
    <tr>
        <td>
          <a href="https://github.com/itsjavi/bootstrap-colorpicker/tree/v2.x">v2.x</a> <br>
          <a href="https://itsjavi.com/bootstrap-colorpicker/v2">Documentation</a>
        </td>
        <td>Bootstrap 3 or 4</td>
        <td>
          <ul>
            <li>jQuery >= 1.10</li>
            <li>Bootstrap CSS (input addon)</li>
          </ul>
        </td>
    </tr>
    <tr>
        <td>
          <a href="https://github.com/itsjavi/bootstrap-colorpicker">v3.x</a> <br>
          <a href="https://itsjavi.com/bootstrap-colorpicker">Documentation</a>
        </td>
        <td>Bootstrap 4 or without Bootstrap</td>
        <td>
          <ul>
            <li>jQuery >= 2.1.0</li>
            <li>Bootstrap CSS (input addon, popover)</li>
            <li>Bootstrap JS Bundle (popover)</li>
          </ul>
        </td>
    </tr>
  </thead>
</table>


Note that the plugin may work without Bootstrap if your code is not using any of the mentioned Bootstrap
dependencies.


## Examples

### With Bootstrap
The Bootstrap JS dependency is optional and it is mainly needed for the popover support.
No Bootstrap CSS is required for the plugin to work.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <link href="dist/css/bootstrap-colorpicker.css" rel="stylesheet">
</head>
<body>
  <div class="demo">
      <h1>Bootstrap Colorpicker Demo (with Bootstrap)</h1>
      <input id="demo-input" type="text" value="rgb(255, 128, 0)" />
  </div>
  <script src="//code.jquery.com/jquery-3.4.1.js"></script>
  <script src="//unpkg.com/bootstrap@4.3.1/dist/js/bootstrap.bundle.min.js"></script>
  <script src="dist/js/bootstrap-colorpicker.js"></script>
  <script>
    $(function () {
      // Basic instantiation:
      $('#demo-input').colorpicker();
      
      // Example using an event, to change the color of the #demo div background:
      $('#demo-input').on('colorpickerChange', function(event) {
        $('#demo').css('background-color', event.color.toString());
      });
    });
  </script>
</body>
```

### Without Bootstrap

To use the plugin without Bootstrap, the `popover` option should be set to `false` or `null` and, depending on your implementation,
you will usually need to set inline to `true` and a `container` selector option.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <link href="dist/css/bootstrap-colorpicker.css" rel="stylesheet">
</head>
<body>
  <div id="demo">
      <h1>Bootstrap Colorpicker Demo (without Bootstrap)</h1>
    <input type="text" value="rgb(255, 128, 0)" />
  </div>
  <script src="//code.jquery.com/jquery-3.4.1.js"></script>
  <script src="dist/js/bootstrap-colorpicker.js"></script>
  <script>
    $(function() {
      $('#demo').colorpicker({
        popover: false,
        inline: true,
        container: '#demo'
      });
    });
  </script>
</body>
```

## Contributions
* [Issues](https://github.com/unabandoned/bootstrap-colorpicker/issues)
* [Pull Requests](https://github.com/unabandoned/bootstrap-colorpicker/pulls)

This project exists thanks to all the [people who contributed](https://github.com/itsjavi/bootstrap-colorpicker/graphs/contributors) upstream.

Commits follow [Conventional Commits](https://www.conventionalcommits.org/); see [security.md](security.md) for reporting vulnerabilities.

## License
The MIT License (MIT).
Please see the [License File](LICENSE) for more information.

## Credits

Written and maintained by [Javi Aguilar](https://itsjavi.com) and all other contributors.

*Based on Stefan Petre's color picker (2013).*

*Thanks to JetBrains for supporting this project.*
