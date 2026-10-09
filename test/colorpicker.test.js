'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { dist, jqueries, loadGlobal, loadCommonJS } = require('./helpers');

// Exactly how CyberChef's "Parse colour code" operation drives the plugin.
function cyberChefPicker(window, color) {
  const $ = window.jQuery;
  $('body').html('<div id="colorpicker" style="white-space: normal;"></div>');
  const seen = [];
  const $el = $('#colorpicker').colorpicker({
    format: 'rgba',
    color,
    container: true,
    inline: true,
    useAlpha: true
  }).on('colorpickerChange', function (e) {
    seen.push(e.color.string('rgba'));
  });
  return { $, $el, seen, cp: $el.colorpicker('colorpicker') };
}

// Presses a slider at an offset; jsdom has no layout, so the slider sits at
// (0, 0) and the press coordinates are the offsets within it.
function press($, $target, left, top) {
  $target.trigger($.Event('mousedown', { pageX: left, pageY: top }));
  $target.trigger($.Event('mouseup', { pageX: left, pageY: top }));
}

for (const [label, jquery] of Object.entries(jqueries)) {
  describe(`bundle on ${label}`, () => {
    it('registers the jQuery plugin when loaded as a browser global', () => {
      const window = loadGlobal(jquery);
      assert.equal(typeof window.jQuery.fn.colorpicker, 'function');
      assert.equal(typeof window.jQuery.colorpicker, 'function');
      assert.equal(window.jQuery.fn.colorpicker.constructor, window.jQuery.colorpicker);
    });

    it('requires only jquery through its CommonJS branch (how webpack consumes it)', () => {
      const { window, requested } = loadCommonJS(jquery);
      assert.deepEqual(requested, ['jquery']);
      assert.equal(typeof window.jQuery.fn.colorpicker, 'function');
    });

    it('the minified bundle behaves the same', () => {
      const window = loadGlobal(jquery, dist('bootstrap-colorpicker.min.js'));
      const { $el, cp } = cyberChefPicker(window, 'rgba(83, 103, 206, 0.5)');
      assert.equal(cp.getValue(), 'rgba(83, 103, 206, 0.5)');
      assert.equal($el.find('.colorpicker-alpha').length, 1);
    });

    describe('inline rgba picker with alpha (CyberChef "Parse colour code")', () => {
      it('renders inline inside the element with saturation, hue and alpha bars', () => {
        const window = loadGlobal(jquery);
        const { $el, cp } = cyberChefPicker(window, 'rgba(255, 0, 0, 0.5)');

        const $picker = $el.children('.colorpicker');
        assert.equal($picker.length, 1, 'picker is appended into #colorpicker');
        assert.ok($picker.hasClass('colorpicker-inline'));
        assert.ok($picker.hasClass('colorpicker-visible'));
        assert.ok($picker.hasClass('colorpicker-with-alpha'));
        assert.ok(!$picker.hasClass('colorpicker-bs-popover-content'), 'no Bootstrap popover');
        for (const bar of ['.colorpicker-saturation', '.colorpicker-hue', '.colorpicker-alpha']) {
          assert.equal($picker.find(bar).length, 1, `${bar} is rendered`);
        }
        assert.equal(cp.getValue(), 'rgba(255, 0, 0, 0.5)');
        assert.equal(cp.format, 'rgba');
      });

      it('positions the guides and paints the bars from the initial colour', () => {
        const window = loadGlobal(jquery);
        const { $el } = cyberChefPicker(window, 'rgba(255, 0, 0, 0.5)');
        // saturation 100% / value 100% -> guide at the top-right corner
        const sat = $el.find('.colorpicker-saturation .colorpicker-guide')[0].style;
        assert.equal(sat.left, '126px');
        assert.equal(sat.top, '0px');
        // alpha 0.5 on a 126px bar
        assert.equal($el.find('.colorpicker-alpha .colorpicker-guide')[0].style.top, '63px');
        const satBg = $el.find('.colorpicker-saturation')[0].style.backgroundColor;
        assert.equal(satBg, 'rgb(255, 0, 0)');
      });

      it('fires colorpickerChange with an rgba string when the alpha bar moves', () => {
        const window = loadGlobal(jquery);
        const { $, $el, seen } = cyberChefPicker(window, 'rgba(255, 0, 0, 1)');
        press($, $el.find('.colorpicker-alpha'), 0, 126 / 4);
        assert.deepEqual(seen, ['rgba(255, 0, 0, 0.75)']);
      });

      it('fires colorpickerChange with an rgba string when the saturation area moves', () => {
        const window = loadGlobal(jquery);
        const { $, $el, seen } = cyberChefPicker(window, 'rgba(255, 0, 0, 0.5)');
        press($, $el.find('.colorpicker-saturation'), 63, 63);
        assert.deepEqual(seen, ['rgba(128, 64, 64, 0.5)']);
      });

      it('fires colorpickerChange with an rgba string when the hue bar moves', () => {
        const window = loadGlobal(jquery);
        const { $, $el, seen } = cyberChefPicker(window, 'rgba(255, 0, 0, 0.5)');
        press($, $el.find('.colorpicker-hue'), 0, 63);
        assert.deepEqual(seen, ['rgba(0, 255, 255, 0.5)']);
      });

      it('fires colorpickerChange on setValue and keeps the rgba format', () => {
        const window = loadGlobal(jquery);
        const { $el, seen, cp } = cyberChefPicker(window, 'rgba(255, 0, 0, 1)');
        $el.colorpicker('setValue', '#00ff0080');
        assert.deepEqual(seen, ['rgba(0, 255, 0, 0.5)']);
        assert.equal(cp.getValue(), 'rgba(0, 255, 0, 0.5)');
        $el.colorpicker('setValue', 'rgba(0, 255, 0, 0.5)');
        assert.equal(seen.length, 1, 'an unchanged colour does not fire again');
      });

      it('the event carries the colour item and the raw value', () => {
        const window = loadGlobal(jquery);
        const { $el } = cyberChefPicker(window, 'rgba(255, 0, 0, 1)');
        let event;
        $el.on('colorpickerChange', (e) => { event = e; });
        $el.colorpicker('setValue', 'hsla(240, 100%, 50%, 0.25)');
        assert.equal(event.type, 'colorpickerChange');
        assert.equal(event.value, 'hsla(240, 100%, 50%, 0.25)');
        assert.equal(event.color.string('rgba'), 'rgba(0, 0, 255, 0.25)');
        assert.equal(event.color.string('hex'), '#0000FF', 'hex drops alpha, as upstream');
        assert.equal(event.colorpicker, $el.colorpicker('colorpicker'));
      });

      it('can be destroyed', () => {
        const window = loadGlobal(jquery);
        const { $el } = cyberChefPicker(window, 'rgba(255, 0, 0, 1)');
        $el.colorpicker('destroy');
        assert.equal($el.children('.colorpicker').length, 0);
        assert.equal($el.data('colorpicker'), undefined);
      });
    });
  });
}

describe('ColorItem string conversions (ported from upstream tests/Color-test.js)', () => {
  const window = loadGlobal(jqueries['jquery 3']);
  const ColorItem = window.jQuery.colorpicker.Color;
  const dataset = [
    // hex
    ['#5367ce', '#5367CE', 'hex'],
    ['#5367ce55', '#5367CE', 'hex'],
    ['invalid', '#000000', 'hex'],
    ['rgb(83, 103, 206)', '#5367CE', 'hex'],
    // rgb
    ['#5367ce', 'rgb(83, 103, 206)', 'rgb'],
    ['#5367ce55', 'rgba(83, 103, 206, 0.33)', 'rgb'],
    ['invalid', 'rgb(0, 0, 0)', 'rgb'],
    ['rgb(83, 103, 206)', 'rgb(83, 103, 206)', 'rgb']
  ];
  for (const [value, expected, format] of dataset) {
    it(`${value} as ${format} is ${expected}`, () => {
      assert.equal(new ColorItem(value).string(format), expected);
    });
  }
});

describe('behaviour kept from the color 3.x library bundled up to 3.4.0', () => {
  const window = loadGlobal(jqueries['jquery 3']);
  const ColorItem = window.jQuery.colorpicker.Color;

  it('rounds the alpha of #rrggbbaa / #rgba input to two decimals', () => {
    assert.equal(new ColorItem('#00ff0080').string('rgba'), 'rgba(0, 255, 0, 0.5)');
    assert.equal(new ColorItem('#abcd').alpha, 0.87);
  });

  it('decides dark/light with the YIQ equation (drives the preview text colour)', () => {
    // Rec. 709 luma (color 4+) calls this one dark; YIQ calls it light.
    assert.equal(new ColorItem('#9D70B2').isDark(), false);
    assert.equal(new ColorItem('#9D70B2').isLight(), true);
    assert.equal(new ColorItem('#000000').isDark(), true);
  });
});
