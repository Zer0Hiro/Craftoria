if (global['universal_decoration_matter']) {
  console.info('Universal Decoration Matter is enabled. Registering Universal Decoration Matter recipes...');
  ServerEvents.tags('item', (e) => {
    console.info('Adding decorative blocks to Universal Decoration Matter tag...');
    e.add('craftoria:decorative_blocks', [
      '@chipped',
      '@rechiseled',
      '@chisel',
      '@mcwbridges',
      '@mcwdoors',
      '@mcwfences',
      '@mcwholidays',
      '@mcwlights',
      '@mcwpaintings',
      '@mcwpaths',
      '@mcwroofs',
      '@mcwstairs',
      '@mcwtrpdoors',
      '@mcwwindows',
      '@handcrafted',
      '@refurbished_furniture',
      '@factory_blocks',
    ]);
    const amountAdded = Ingredient.of('#craftoria:decorative_blocks').itemIds.length;
    console.info(`Added ${amountAdded} decorative blocks to Universal Decoration Matter tag.`);
  });

  ServerEvents.recipes((e) => {
    console.info('Registering Universal Decoration Matter recipes...');

    // Takes forever to load, and eats up a lot of memory
    if (false)
      Ingredient.of('#craftoria:decorative_blocks').stacks.forEach((block) => {
        e.stonecutting(block.id, 'craftoria:universal_decoration_matter');
        // e.recipes.modern_industrialization
        //   .cutting_machine(1, 1)
        //   .itemIn('#craftoria:decorative_blocks')
        //   .itemOut(block.id)
        //   .fluidIn('modern_industrialization:lubricant', 1);
      });

    e.custom({
      type: 'chipped:workbench',
      ingredients: [{tag: 'craftoria:decorative_blocks'}],
    });
    console.info('Universal Decoration Matter recipes registered.');
  });

  ServerEvents.generateData('last', (e) => {
    let rechiceledJson = {
      type: 'rechiseled:chiseling',
      entries: [],
      overwrite: true,
    };
    Ingredient.of('#craftoria:decorative_blocks').stacks.forEach((block) => {
      rechiceledJson.entries.push({item: block.id});
    });

    e.json('craftoria:chiseling_recipes/universal_decoration_matter', rechiceledJson);
  });
} else console.info('Universal Decoration Matter is disabled. Skipping registration of Universal Decoration Matter recipes...');
