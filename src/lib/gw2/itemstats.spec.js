import applyAttributes from './itemstats';

// PoF
const STAT_MARSHALS = {
  id: 1378,
  name: "Marshal's",
  attributes: {
    Power: 0.3,
    Precision: 0.165,
    Healing: 0.3,
    ConditionDamage: 0.165
  }
};

const STAT_GRIEVING = {
  id: 1379,
  name: "Grieving",
  attributes: {
    Power: 0.3,
    Precision: 0.165,
    CritDamage: 0.165,
    ConditionDamage: 0.3
  }
};


// New Stat (Quad Attrib)
const STAT_MINSTREL = {
  id: 1134,
  name: 'Minstrel\'s',
  attributes: {
    Toughness: 0.3,
    Vitality: 0.165,
    Healing: 0.3,
    BoonDuration: 0.165,
  },
};

// Celectiel stat (7 Attrib)
const STAT_CELECTIEL = {
  id: 588,
  name: 'Celestial',
  attributes: {
    Power: 0.165,
    Precision: 0.165,
    Toughness: 0.165,
    Vitality: 0.165,
    CritDamage: 0.165,
    Healing: 0.165,
    ConditionDamage: 0.165,
  },
};

// Berseker (3 Attrib - Legacy)
const STAT_BERSEKER = {
  id: 161,
  name: 'Berserker\'s',
  attributes: {
    Power: 0.35,
    Precision: 0.25,
    CritDamage: 0.25,
  },
};

const STAT_BERSEKER_VALKYRE = {
  id: 591,
  name: 'Berserker\'s and Valkyrie',
  attributes: {
    Power: 0.35,
    Precision: 0.25,
    Vitality: 0,
    CritDamage: 0.25,
  },
};

const STAT_WIRED = {
  id: 591,
  name: 'MadeUp\'s',
  attributes: {
    Power: 0.35,
    Precision: 0.25,
    Vitality: 0,
    CritDamage: 0.25,
    ConditionDamage: 0.165,
  },
};

const SELECTABLE_ACCESORRY = {
    name: "Spectral Talisman",
    description: "<c=@flavor>Resonates with the otherworldly power of Gorseval the Multifarious.</c>",
    type: "Trinket",
    level: 80,
    rarity: "Ascended",
    vendor_value: 413,
    game_types: [
      "Activity",
      "Wvw",
      "Dungeon",
      "Pve"
    ],
    flags: [
      "HideSuffix",
      "AccountBound",
      "NoSell",
      "NotUpgradeable",
      "DeleteWarning",
      "AccountBindOnUse"
    ],
    restrictions: [],
    id: 77422,
    chat_link: "[&AgFuLgEA]",
    icon: "https://render.guildwars2.com/file/775402D23629AE6F42487B336280E19FDB7E0843/1302752.png",
    details: {
      type: "Accessory",
      infusion_slots: [
        {
          flags: [
            "Infusion"
          ]
        }
      ],
      secondary_suffix_item_id: "",
      stat_choices: [
        1366,
        1374,
        1119,
        584,
        1128,
        1163,
        658,
        586,
        1267,
        1263,
        1264,
        1271
      ]
    }
  };

const SELECTABLE_RING = {
  name: 'Black Ice Band',
  description: '<c=@flavor>An icy chill emanates from the ring.</c>',
  type: 'Trinket',
  level: 80,
  rarity: 'Ascended',
  vendor_value: 495,
  game_types: [
    'Activity',
    'Wvw',
    'Dungeon',
    'Pve',
  ],
  flags: [
    'HideSuffix',
    'AccountBound',
    'NoSell',
    'NotUpgradeable',
    'Unique',
    'DeleteWarning',
    'AccountBindOnUse',
  ],
  restrictions: [],
  id: 79712,
  chat_link: '[&AgFgNwEA]',
  icon: 'https://render.guildwars2.com/file/ABA374A30ADC99376BBAF811CFDF0E72E1B36050/1601394.png',
  details: {
    type: 'Ring',
    infusion_slots: [
      {
        flags: [
          'Infusion',
        ],
      },
    ],
    secondary_suffix_item_id: '',
    stat_choices: [
      588, 656, 659, 658, 660, 584, 586, 583, 657, 585, 592, 581, 591, 1064, 1066, 1139,
      1162, 1115, 1134, 1130, 1125, 1038, 1114, 1037, 1119, 1163, 1128, 690, 1097, 1035,
      1145, 1098, 1220,
    ],
  },
};

const SELECTABLE_ACENDED_ARMOR_CHEST = {
    name: "Refined Envoy Breastplate",
    description: "<c=@flavor>This armor attempts to channel the power of the envoys.</c>",
    type: "Armor",
    level: 80,
    rarity: "Ascended",
    vendor_value: 240,
    default_skin: 7075,
    game_types: [
      "Activity",
      "Wvw",
      "Dungeon",
      "Pve"
    ],
    flags: [
      "HideSuffix",
      "AccountBound",
      "NoSell",
      "DeleteWarning",
      "AccountBindOnUse"
    ],
    restrictions: [],
    id: 80648,
    chat_link: "[&AgEIOwEA]",
    icon: "https://render.guildwars2.com/file/2AA96D63CFBA41DD5FE805D94A073BB22E7EBC57/1634569.png",
    details: {
      type: "Coat",
      weight_class: "Heavy",
      defense: 381,
      infusion_slots: [
        {
          flags: [
            "Infusion"
          ]
        }
      ],
      secondary_suffix_item_id: "",
      stat_choices: [
        1377,
        1379,
        1378,
        155,
        161,
        159,
        157,
        158,
        160,
        153,
        605,
        700,
        616,
        154,
        156,
        162,
        686,
        559,
        754,
        753,
        799,
        1026,
        1067,
        1226,
        1225,
        1229,
        1224,
        1228,
        1227,
        1231,
        1232
      ]
    }
  };

const SELECTABLE_LEGEND_ARMOR_CHEST = {
    name: "Perfected Envoy Breastplate",
    description: "<c=@flavor>This armor attempts to channel the power of the envoys.</c>",
    type: "Armor",
    level: 80,
    rarity: "Legendary",
    vendor_value: 240,
    default_skin: 7157,
    game_types: [
      "Activity",
      "Wvw",
      "Dungeon",
      "Pve"
    ],
    flags: [
      "HideSuffix",
      "AccountBound",
      "NoSalvage",
      "NoSell",
      "DeleteWarning",
      "AccountBindOnUse"
    ],
    restrictions: [],
    id: 80254,
    chat_link: "[&AgF+OQEA]",
    icon: "https://render.guildwars2.com/file/DACF9B1ACBE8687B6B31ABC0CF295301120D7A67/1634563.png",
    details: {
      type: "Coat",
      weight_class: "Heavy",
      defense: 381,
      infusion_slots: [
        {
          flags: [
            "Infusion"
          ]
        }
      ],
      secondary_suffix_item_id: "",
      stat_choices: [
        155,
        161,
        159,
        157,
        158,
        160,
        153,
        605,
        700,
        616,
        154,
        156,
        162,
        686,
        559,
        754,
        753,
        799,
        1026,
        1067,
        1123,
        1140,
        1085,
        1153,
        1118,
        1131,
        1111,
        1109,
        1222,
        1344,
        1363,
        1364
      ]
    }
  };

const SELECTABLE_ACENDED_WEP_RIFLE = {
  name: "Sabetha's Malicious Boomstick",
  description: "<c=@flavor>Pried from Sabetha's cold, dead hands.</c>",
  type: "Weapon",
  level: 80,
  rarity: "Ascended",
  vendor_value: 10000,
  default_skin: 6141,
  game_types: [
    "Activity",
    "Wvw",
    "Dungeon",
    "Pve"
  ],
  flags: [
    "HideSuffix",
    "AccountBound",
    "NoSell",
    "Unique",
    "DeleteWarning",
    "AccountBindOnUse"
  ],
  restrictions: [],
  id: 77363,
  chat_link: "[&AgEzLgEA]",
  icon: "https://render.guildwars2.com/file/773EEC16503A09253E2D99400FD26F0B679ED995/1301720.png",
  details: {
    type: "Rifle",
    damage_type: "Physical",
    min_power: 1035,
    max_power: 1265,
    defense: 0,
    infusion_slots: [
      {
        flags: [
          "Infusion"
        ]
      },
      {
        flags: [
          "Infusion"
        ]
      }
    ],
    secondary_suffix_item_id: "",
    stat_choices: [
      1379,
      1378,
      160,
      154,
      754,
      700,
      153,
      559,
      1224,
      1067,
      1229
    ]
  }
};

function pack (...args) {
  return args;
}

function attr (name, value) {
  return {
    attribute: name,
    modifier: value,
  };
}

describe('itemStats', () => {
  describe('applyAttributes', () => {
    it('should return empty list if no item', () => {
      const ret = applyAttributes(undefined, {});
      expect(ret).to.be.deep.equal([]);
    });

    it('should return empty list if no stat', () => {
      const ret = applyAttributes({}, undefined);
      expect(ret).to.be.deep.equal([]);
    });

    it('should return empty list if item exists but missing info', () => {
      const ret = applyAttributes({}, {});
      expect(ret).to.be.deep.equal([]);
    });

    it('should throw if using wired stat', () => {
      expect(() => applyAttributes(SELECTABLE_RING, STAT_WIRED)).to.throw(
        /impossible condition/
      );
    });

    it('should work for back items (Without details)', () => {
      const ret = applyAttributes({
        type: 'Back',
        details: {},
        rarity: 'ascended',
        level: 80,
      }, STAT_MINSTREL);
      expect(ret).to.be.deep.equal(pack(
        attr('Toughness', 52),
        attr('Vitality', 27),
        attr('Healing', 52),
        attr('BoonDuration', 27),
      ));
    });

    it('should work for ring with 3 Stats', () => {
      const ret = applyAttributes(SELECTABLE_RING, STAT_BERSEKER);
      expect(ret).to.be.deep.equal(pack(
        attr('Power', 126),
        attr('Precision', 85),
        attr('CritDamage', 85),
      ));
    });

    it('should work for armor chest with 3 Stats', () => {
      const ret = applyAttributes(SELECTABLE_ACENDED_ARMOR_CHEST, STAT_BERSEKER);
      expect(ret).to.be.deep.equal(pack(
        attr('Power', 141),
        attr('Precision', 101),
        attr('CritDamage', 101),
      ));
    });

    it('should work for acended weapon chest with 3 Stats', () => {
      const ret = applyAttributes(SELECTABLE_ACENDED_WEP_RIFLE, STAT_BERSEKER);
      expect(ret).to.be.deep.equal(pack(
        attr('Power', 251),
        attr('Precision', 179),
        attr('CritDamage', 179),
      ));
    });

    it('should work for ring with 4 Stats (Legacy)', () => {
      const ret = applyAttributes(SELECTABLE_RING, STAT_BERSEKER_VALKYRE);
      expect(ret).to.be.deep.equal(pack(
        attr('Power', 126),
        attr('Precision', 67),
        attr('Vitality', 18),
        attr('CritDamage', 85),
      ));
    });

    it('should work for ring with 4 Stats', () => {
      const ret = applyAttributes(SELECTABLE_RING, STAT_MINSTREL);
      expect(ret).to.be.deep.equal(pack(
        attr('Toughness', 106),
        attr('Vitality', 56),
        attr('Healing', 106),
        attr('BoonDuration', 56),
      ));
    });

    it('should work for ring with 7 Stats', () => {
      const ret = applyAttributes(SELECTABLE_RING, STAT_CELECTIEL);
      expect(ret).to.be.deep.equal(pack(
        attr('Power', 57),
        attr('Precision', 57),
        attr('Toughness', 57),
        attr('Vitality', 57),
        attr('CritDamage', 57),
        attr('Healing', 57),
        attr('ConditionDamage', 57),
      ));
    });

    // PoF
    it('should work for accessory with greiving stat ', () => {
      const ret = applyAttributes(SELECTABLE_ACCESORRY, STAT_GRIEVING);
      expect(ret).to.be.deep.equal(pack(
        attr('Power', 92),
        attr('Precision', 49),
        attr('CritDamage', 49),
        attr('ConditionDamage', 92),
      ));
    });

    it('should work for accessory with marshal stat ', () => {
      const ret = applyAttributes(SELECTABLE_ACCESORRY, STAT_MARSHALS);
      expect(ret).to.be.deep.equal(pack(
        attr('Power', 92),
        attr('Precision', 49),
        attr('Healing', 92),
        attr('ConditionDamage', 49),
      ));
    });

    it('should work for legendary armor chest with marshal stat ', () => {
      const ret = applyAttributes(SELECTABLE_LEGEND_ARMOR_CHEST, STAT_MARSHALS);
      expect(ret).to.be.deep.equal(pack(
        attr('Power', 121),
        attr('Precision', 67),
        attr('Healing', 121),
        attr('ConditionDamage', 67),
      ));
    });

    it('should work for acended weapon chest with greiving stat ', () => {
      const ret = applyAttributes(SELECTABLE_ACENDED_WEP_RIFLE, STAT_GRIEVING);
      expect(ret).to.be.deep.equal(pack(
        attr('Power', 215),
        attr('Precision', 118),
        attr('CritDamage', 118),
        attr('ConditionDamage', 215),
      ));
    });
  });
});
