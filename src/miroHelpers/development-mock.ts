const mockFrameData = [
  {
    bounds: {
      x: -2297.55657540186,
      y: -470.49809952837705,
      top: -773.3022169083861,
      left: -3373.69938639023,
      bottom: -167.69398214836804,
      right: -1221.4137644134898,
      width: 2152.28562197674,
      height: 605.608234760018,
    },
    title: "Test",
  },
];

const mockShapeData = [
  {
    bounds: {
      x: -2714.3424482737005,
      y: -664.7992387383106,
      top: -731.197967677474,
      left: -2927.29822553214,
      bottom: -598.400509799147,
      right: -2501.386671015261,
      width: 425.911554516879,
      height: 132.797457878327,
    },
    style: {
      textColor: "#ffffff",
    },
    text: "<p>I1.1</p><p>VEL: 3 LD: 1</p>",
    plainText: "I1.1 VEL: 3 LD: 1",
  },
  {
    bounds: {
      x: -2290.766737580255,
      y: -664.7992387383106,
      top: -731.197967677474,
      left: -2501.3866710152606,
      bottom: -598.400509799147,
      right: -2080.1468041452486,
      width: 421.239866870012,
      height: 132.797457878327,
    },
    style: {
      textColor: "#ffffff",
    },
    text: "<p>I1.2</p><p>VEL: 5 LD: 3</p>",
    plainText: "I1.2 VEL: 5 LD: 3",
  },
  {
    bounds: {
      x: -1870.2982255321401,
      y: -664.197967677474,
      top: -730.5966966166375,
      left: -2080.918158967146,
      bottom: -597.7992387383105,
      right: -1659.678292097134,
      width: 421.239866870012,
      height: 132.797457878327,
    },
    style: {
      textColor: "#ffffff",
    },
    text: "<p>I2.1</p><p>VEL: 8 LD: 5</p>",
    plainText: "I2.1 VEL: 8 LD: 5",
  },
  {
    bounds: {
      x: -1450.9181589671457,
      y: -664.197967677474,
      top: -730.5966966166375,
      left: -1661.5380924021517,
      bottom: -597.7992387383105,
      right: -1240.2982255321397,
      width: 421.239866870012,
      height: 132.797457878327,
    },
    style: {
      textColor: "#ffffff",
    },
    text: "<p>I2.2</p><p>VEL: 3 LD: 2</p>",
    plainText: "I2.2 VEL: 3 LD: 2",
  },
  {
    bounds: {
      x: -3139.3424482737005,
      y: -499.7992387383104,
      top: -598.4005097991469,
      left: -3352.29822553214,
      bottom: -401.1979676774739,
      right: -2926.386671015261,
      width: 425.911554516879,
      height: 197.202542121673,
    },
    style: {
      textColor: "#1a1a1a",
    },
    text: '<p><span style="color:rgb(26,26,26)">F55849 Feature 1</span></p><p><span style="color:rgb(26,26,26)">Size: 3</span></p>',
    plainText: "F55849 Feature 1 Size: 3",
  },
  {
    bounds: {
      x: -3139.3424482737005,
      y: -302.5966966166374,
      top: -401.1979676774739,
      left: -3352.29822553214,
      bottom: -203.99542555580092,
      right: -2926.386671015261,
      width: 425.911554516879,
      height: 197.202542121673,
    },
    style: {
      textColor: "#1a1a1a",
    },
    text: '<p><span style="color:rgb(26,26,26)">CO</span></p><p><span style="color:rgb(26,26,26)">Size: 8</span></p>',
    plainText: "CO Size: 8",
  },
];

const mockStickerData = [
  {
    bounds: {
      x: -2713.7982255321403,
      y: -467.69796767747397,
      top: -518.6989547272149,
      left: -2758.3122449308175,
      bottom: -416.69698062773307,
      right: -2669.2842061334627,
      width: 89.0280387973547,
      height: 102.00197409948177,
    },
    text: "<p>Some stuff here</p><p>1pt</p>",
    plainText: "Some stuff here 1pt",
  },
  {
    bounds: {
      x: -2403.672926651315,
      y: -313.3628614820259,
      top: -364.3638485317668,
      left: -2448.186946049992,
      bottom: -262.36187443228505,
      right: -2359.158907252637,
      width: 89.0280387973547,
      height: 102.00197409948177,
    },
    text: "<p>Some stuff here</p><p>3pt</p>",
    plainText: "Some stuff here 3pt",
  },
  {
    bounds: {
      x: -1888.108985066794,
      y: -313.3628614820259,
      top: -364.3638485317668,
      left: -1932.6230044654715,
      bottom: -262.36187443228505,
      right: -1843.5949656681169,
      width: 89.0280387973547,
      height: 102.00197409948177,
    },
    text: "<p>Some stuff here</p><p>5pt</p>",
    plainText: "Some stuff here 5pt",
  },
  {
    bounds: {
      x: -1450.29822553214,
      y: -467.69796767747397,
      top: -518.6989547272149,
      left: -1494.8122449308173,
      bottom: -416.69698062773307,
      right: -1405.7842061334627,
      width: 89.0280387973547,
      height: 102.00197409948177,
    },
    text: "<p>Cool stuff here</p><p>2pt</p>",
    plainText: "Cool stuff here 2pt",
  },
];

export const mockMiroApi = () => {
  (window as unknown as Record<string, unknown>).miro = {
    onReady(callback: () => void) {
      callback();
    },
    broadcastData(...args: unknown[]) {
      console.info("Broadcast data:", ...args);
      return;
    },
    board: {
      widgets: {
        get(options: Record<string, unknown>) {
          if (options.type === "frame") {
            return mockFrameData;
          }
          if (options.type === "shape") {
            return mockShapeData;
          }
          if (options.type === "sticker") {
            return mockStickerData;
          }
        },
        update(widgets: Record<string, unknown> | Record<string, unknown>[]) {
          console.info("Update widget(s):", widgets);
          return;
        },
      },
    },
  };
};
