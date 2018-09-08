export default (p) => {
  const pallettes = [
    // rule : "underperforming" color at the beginning, "overperforming" at the end
    // diverging
    ['#9e0142','#c13e47','#dd6b51','#f29962','#fdc77b','#c9e69c','#9dc4a1','#809ea4','#6c78a4','#5e4fa2'], // red orange bluegreen purple
    ['#b2182b','#c84e45','#dc7863','#ed9f85','#fac7ae','#dbe8ef','#abc7e0','#7fa6cf','#5485bd','#2166ac'], // red orange blue
    ['#8b0000','#c32b48','#e9647f','#fea0ac','#ffe1d2','#85e18f','#6dc88c','#54af88','#379884','#008080'], // deepred lightred green darkgreen
    ['#8c510a','#a6712f','#be9252','#d6b378','#ecd7a7','#d3e7e3','#98c8c0','#66a89e','#39867d','#01665e'], // marroon beige blueegreen green
    ['#8e0152','#ae3f76','#cb6c9a','#e398bd','#f6c7df','#a9d7d0','#73afa7','#44877e','#1e6157','#003c30'],  // purple ping light green deepgreen
    
    // sequential
    ['#ffffcc','#ffe2a6','#ffc27e','#ffa256','#f4843b','#dc6c37','#c45634','#ad3e30','#96252b','#800026'], // yellow red
    ['#f7fcf0','#ccebe0','#9ed9cf','#77c6c1','#69adb7','#5b97ac','#4c80a1','#3b6997','#28548c','#084081'], // bluegreen blue
    ['#e0ffff','#d4e5ff','#c7ccff','#b8b2fd','#a999fa','#9781f4','#836beb','#6e55dd','#5942c9','#483d8b'], // LightCyan, Blue, DarkSlateBlue
    ['#ffffe0','#d6f3b7','#b0e393','#8fd375','#6fc259','#53af42','#3a9d2d','#238a1b','#0f760b','#006400'], // lightyellow, limegreen, DarkGreen
    ['#fff7f3','#ffd5dd','#ffb0c8','#fc8bb2','#f1659f','#d05095','#ae3d8a','#8c2980','#6b1575','#49006a'], // pink-yellow purple
  ];

  p = (typeof p === 'undefined')
    ? 0
    : pallettes[p+1] ? p+1 : 0;

  for (let i = 0; i < pallettes[p].length; i++) {
    let cssVar = '--color-' + (i + 1);
    document.documentElement.style.setProperty(cssVar, pallettes[p][i]);
  }

  return p;
};