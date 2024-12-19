ClientEvents.generateAssets('after_mods', (e) => {
  let types = ['small', 'medium', 'large', 'cluster'];

  let facing = {
    up: {},
    down: {x: 180},
    north: {x: 90},
    south: {x: 90, y: 180},
    east: {x: 90, y: 90},
    west: {x: 90, y: 270},
  };

  let timesRanModelGen = 0;

  for (let [material, _] in global.buddingMaterials) {
    types.forEach((type) => {
      if (type !== 'cluster') {
        e.blockState(`craftoria:${type}_${material}_bud`, (block) => {
          for (let [face, rotation] in facing) {
            let x = rotation.x || 0;
            let y = rotation.y || 0;
            block.variant(`facing=${face}`, (variant) => {
              variant.model(`craftoria:block/${type}_${material}_bud`).x(x).y(y);
            });
            timesRanModelGen++;
          }
        });
      } else {
        e.blockState(`craftoria:${material}_cluster`, (block) => {
          for (let [face, rotation] in facing) {
            let x = rotation.x || 0;
            let y = rotation.y || 0;
            block.variant(`facing=${face}`, (variant) => {
              variant.model(`craftoria:block/${material}_cluster`).x(x).y(y);
            });
            timesRanModelGen++;
          }
        });
      }
    });
  }
});
