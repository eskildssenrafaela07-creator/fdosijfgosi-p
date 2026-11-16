import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  colorLuminance,
  colorWithAlpha,
  mixHexColors,
  parseHexColor,
  quantizeGlowRadius,
  snapHalf,
} from './visualFx';

describe('visualFx pure color and sub-pixel helpers', () => {
  it('parses 3-char, 6-char, 8-char hex and rgb strings cleanly', () => {
    assert.deepEqual(parseHexColor('#ff8000'), { r: 255, g: 128, b: 0 });
    assert.deepEqual(parseHexColor('#0af'), { r: 0, g: 170, b: 255 });
    assert.deepEqual(parseHexColor('#52e5ffcc'), { r: 82, g: 229, b: 255 });
    assert.deepEqual(parseHexColor('rgba(12, 34, 56, 0.5)'), { r: 12, g: 34, b: 56 });
  });

  it('mixes hex colors accurately and clamps bounds', () => {
    assert.equal(mixHexColors('#000000', '#ffffff', 0), '#000000');
    assert.equal(mixHexColors('#000000', '#ffffff', 1), '#ffffff');
    assert.equal(mixHexColors('#000000', '#fe0064', 0.5), '#7f0032');
    assert.equal(mixHexColors('#102030', '#ffffff', -2), '#102030');
  });

  it('formats rgba strings and calculates relative luminance', () => {
    assert.equal(colorWithAlpha('#52e5ff', 0.5), 'rgba(82,229,255,0.500)');
    assert.ok(colorLuminance('#ffffff') > 0.99);
    assert.ok(colorLuminance('#000000') < 0.01);
    assert.ok(colorLuminance('#ffe066') > colorLuminance('#120c24'));
  });

  it('quantizes glow stamp radii and snaps coordinates to 0.5 virtual pixels', () => {
    assert.equal(quantizeGlowRadius(1), 4);
    assert.equal(quantizeGlowRadius(19), 20);
    assert.equal(quantizeGlowRadius(200), 128);
    assert.equal(snapHalf(10.24), 10);
    assert.equal(snapHalf(10.26), 10.5);
    assert.equal(snapHalf(10.74), 10.5);
    assert.equal(snapHalf(10.76), 11);
  });
});
