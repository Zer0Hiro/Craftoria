global.amethystblock = (tick, material) => {
  const {block, level} = tick;
  const pos = block.getPos();
  const Direction = Java.loadClass('net.minecraft.core.Direction');

  const growAmethystBuds = () => {
    Direction.values().forEach((face) => {
      const offsetPos = pos.relative(face);
      const {x, y, z} = offsetPos;
      const adjacentBlockId = level.getBlock(offsetPos).id;
      const chanceOfGrowth = 0.1;
      const randomValue = Math.random();
      const waterlogged = level.isWaterAt(offsetPos);

      const blockTypes = {};
      blockTypes['minecraft:air'] = `craftoria:small_${material}_bud`;
      blockTypes['minecraft:water'] = `craftoria:small_${material}_bud`;
      blockTypes[`craftoria:small_${material}_bud`] = `craftoria:medium_${material}_bud`;
      blockTypes[`craftoria:medium_${material}_bud`] = `craftoria:large_${material}_bud`;
      blockTypes[`craftoria:large_${material}_bud`] = `craftoria:${material}_cluster`;

      // const blockTypes = {
      //   'minecraft:air': `craftoria:small_${material}`,
      //   [`craftoria:small_${material}_bud`]: `craftoria:medium_${material}_bud`,
      //   [`craftoria:medium_${material}_bud`]: `craftoria:large_${material}_bud`,
      //   [`craftoria:large_${material}_bud`]: `craftoria:${material}_cluster`,
      // };
      const blockType = blockTypes[adjacentBlockId];
      if (blockType && randomValue < chanceOfGrowth) {
        level.server.tell(`Trying to grow ${blockType} on ${adjacentBlockId} at ${x} ${y} ${z}`);
        const command = `setblock ${x} ${y} ${z} ${blockType}[facing=${face},waterlogged=${waterlogged}]`;
        console.info(command);
        tick.server.runCommandSilent(command);
      }
    });
  };

  growAmethystBuds();
};

global.buddingMaterials = {
  copper: {
    soundType: 'metal',
    displayName: 'Copper',
  },
  emerald: {
    soundType: 'amethyst',
    displayName: 'Emerald',
  },
};

StartupEvents.registry('block', (event) => {
  let getAABB = (i, j) => {
    let aabb = {
      upAabb: [j, 0, j, 16 - j, i, 16 - j],
      downAabb: [j, 16 - i, j, 16 - j, 16, 16 - j],
      northAabb: [j, j, 16 - i, 16 - j, 16 - j, 16],
      southAabb: [j, j, 0, 16 - j, 16 - j, i],
      eastAabb: [0, j, j, i, 16 - j, 16 - j],
      westAabb: [16 - i, j, j, 16, 16 - j, 16 - j],
    };

    return aabb;
  };

  let makeBuds = (material, soundType, displayName) => {
    let types = {
      small: getAABB(3, 4),
      medium: getAABB(4, 3),
      large: getAABB(5, 3),
      cluster: getAABB(7, 3),
    };

    for (let [type, aabb] in types) {
      if (type !== 'cluster') {
        event
          .create(`craftoria:${type}_${material}_bud`)
          .property(BlockProperties.FACING)
          .property(BlockProperties.WATERLOGGED)
          .renderType('cutout')
          .soundType(soundType)
          .hardness(0.5)
          .tagBoth('c:buds')
          .tagBlock(['minecraft:mineable/pickaxe'])
          .noDrops()
          .notSolid()
          .modelGenerator((m) => {
            m.parent('minecraft:block/cross');
            m.texture('cross', `craftoria:block/budding/${material}/${type}_bud`);
          })
          .box(aabb.upAabb[0], aabb.upAabb[1], aabb.upAabb[2], aabb.upAabb[3], aabb.upAabb[4], aabb.upAabb[5])
          .defaultState((state) => state.set(BlockProperties.FACING, Direction.UP).set(BlockProperties.WATERLOGGED, false))
          .placementState((state) => {
            state.set(BlockProperties.FACING, state.clickedFace);
            state.set(BlockProperties.WATERLOGGED, state.isInWater());
          })
          .displayName(`${displayName} ${type} Bud`);
      } else {
        event
          .create(`craftoria:${material}_${type}`)
          .property(BlockProperties.FACING)
          .property(BlockProperties.WATERLOGGED)
          .renderType('cutout')
          .soundType(soundType)
          .hardness(0.5)
          .tagBoth('c:buds')
          .tagBlock(['minecraft:mineable/pickaxe'])
          .drops(() => {
            return {
              rolls: 1,
              items: [`craftoria:${material}_shard`],
            };
          })
          .notSolid()
          .modelGenerator((m) => {
            m.parent('minecraft:block/cross');
            m.texture('cross', `craftoria:block/budding/${material}/${type}`);
          })
          .box(aabb.upAabb[0], aabb.upAabb[1], aabb.upAabb[2], aabb.upAabb[3], aabb.upAabb[4], aabb.upAabb[5])
          .defaultState((state) => state.set(BlockProperties.FACING, Direction.UP).set(BlockProperties.WATERLOGGED, false))
          .placementState((state) => {
            state.set(BlockProperties.FACING, state.clickedFace);
            state.set(BlockProperties.WATERLOGGED, state.isInWater());
          })
          .displayName(`${displayName} Cluster`);
      }
    }
  };

  let makeBuddingBlock = (material, soundType, displayName) => {
    event
      .create(`craftoria:budding_${material}`)
      .soundType(soundType)
      .hardness(0.5)
      .tagBoth('c:budding_blocks')
      .tagBlock(['minecraft:mineable/pickaxe'])
      .modelGenerator((m) => {
        m.parent('minecraft:block/cube');
        m.texture('all', `craftoria:block/budding/${material}/budding`);
      })
      .noDrops()
      .randomTick((tick) => global.amethystblock(tick, material))
      .displayName(`Budding ${displayName}`);

    event
      .create(`craftoria:${material}_block`)
      .soundType(soundType)
      .hardness(0.5)
      .tagBlock(['minecraft:mineable/pickaxe'])
      .modelGenerator((m) => {
        m.parent('minecraft:block/cube');
        m.texture('all', `craftoria:block/budding/${material}/block`);
      })
      .displayName(`${displayName} Block`);
  };

  let makeBuddingSet = (material, soundType, displayName) => {
    makeBuds(material, soundType, displayName);
    makeBuddingBlock(material, soundType, displayName);
  };

  for (let [material, {soundType, displayName}] in global.buddingMaterials) {
    makeBuddingSet(material, soundType, displayName);
  }
});

StartupEvents.registry('item', (event) => {
  for (let [material, {displayName}] in global.buddingMaterials) {
    event.create(`craftoria:${material}_shard`).texture(`craftoria:item/shard/${material}`).displayName(`${displayName} Shard`);
  }
});
