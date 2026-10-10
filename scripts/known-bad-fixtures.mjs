// Component-tier known-bad fixtures. Each one fails in a real browser.
// The component tier may pass it or leave it incomplete; that is the
// blindness PR-45 names. A fixture no tier fails is not known-bad.
//
// color-contrast pair: #888888 on #ffffff. Measured with lib/colour
// contrastRatio: 3.54:1, below 4.5 and above 1.
// target-size: a 4px button adjacent to a second target. A lone 4px
// button passes WCAG 2.2 2.5.8's spacing exception, as P03-T13 measured.

export const KNOWN_BAD_FIXTURES = [
  {
    id: "target-size",
    document:
      '<!doctype html><html lang="en"><head><title>T</title></head><body><main><h1>T</h1><button type="button" style="width:4px;height:4px;padding:0">Go</button><button type="button" style="width:4px;height:4px;padding:0">Stop</button></main></body></html>',
  },
  {
    id: "color-contrast",
    document:
      '<!doctype html><html lang="en"><head><title>T</title></head><body style="background:#ffffff"><main><h1 style="color:#111111;background:#ffffff">T</h1><p style="color:#888888;background-color:#ffffff;font-size:16px">Soft grey</p></main></body></html>',
  },
  {
    id: "link-in-text-block",
    document:
      '<!doctype html><html lang="en"><head><title>T</title></head><body><main><h1>T</h1><p style="color:#1a1a1a;font-family:sans-serif;font-size:16px;font-weight:400;font-style:normal;text-decoration:none solid #1a1a1a;background:#ffffff">See <a href="/guide" style="color:#1a1a1a;font-family:sans-serif;font-size:16px;font-weight:400;font-style:normal;text-decoration:none solid #1a1a1a;background:#d0d0d0">more</a> now</p></main></body></html>',
  },
  {
    id: "avoid-inline-spacing",
    document:
      '<!doctype html><html lang="en"><head><title>T</title></head><body><main><h1>T</h1><p style="line-height:1.2 !important;letter-spacing:0.05em !important;word-spacing:0.05em !important">Locked</p></main></body></html>',
  },
];
