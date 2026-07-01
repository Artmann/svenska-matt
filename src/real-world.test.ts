import { expect, test } from 'bun:test'

import { convertIngredientLine } from './pipeline'

// Real-world ingredient lines copied verbatim from published recipes (and the
// recipe-database endpoint), paired with the Swedish output we expect. They
// exercise the whole pipeline together: list markers, HTML entities, structured
// quantities, dual metric annotations, embedded imperial sizes, notes, and the
// translation dictionary. A handful of lines contain free-form prose in their
// notes ("from 2 limes", "plus more for serving") or malformed source text
// (glued words); those stay partly English, which the offline dictionary cannot
// translate, and are kept here to document current behaviour.
const cases: Array<[string, string]> = [
  // Marinara
  ['3 garlic cloves', '3 vitlöksklyfta'],
  [
    '1 (28-ounce) can whole peeled tomatoes, drained',
    '1 tomat (795 g, avrunnen)'
  ],
  ['1 (6-ounce) can tomato paste', '1 tomatpuré (170 g)'],
  ['3 tablespoons extra-virgin olive oil', '3 msk olivolja'],
  ['1 tablespoon Italian seasoning', '1 msk italiensk kryddblandning'],
  ['1 teaspoon sea salt', '1 tsk salt'],
  ['½ teaspoon cane sugar', '½ tsk rörsocker'],
  ['Freshly ground black pepper', 'svartpeppar'],

  // Coleslaw
  ['¾ cup mayonnaise, slightly scant', '2 dl majonnäs (slightly scant)'],
  ['2 tablespoons apple cider vinegar', '2 msk äppelcidervinäger'],
  ['1 tablespoon Dijon mustard', '1 msk dijonsenap'],
  ['1 tablespoon sugar', '1 msk socker'],
  ['¾ teaspoon celery seeds', '¾ tsk sellerifrö'],
  ['¼ teaspoon sea salt', '¼ tsk salt'],
  ['6 cups shredded green cabbage', '14½ dl vitkål'],
  ['2 cups shredded red cabbage', '5 dl rödkål'],
  ['1 cup thinly sliced red onion', '2½ dl rödlök'],

  // Spaghetti squash
  ['1 spaghetti squash', '1 spaghettipumpa'],
  ['extra-virgin olive oil', 'olivolja'],
  ['sea salt and freshly ground black pepper', 'salt och svartpeppar'],

  // Breakfast tacos
  ['8 slices bacon', '8 bacon'],
  ['1 (16-oz.) pkg. frozen hash browns', '1 hashbrowns (455 g)'],
  ['8 large eggs', '8 ägg'],
  ['1/3 cup milk', '1 dl mjölk'],
  ['4 Tbsp. unsalted butter', '4 msk smör'],
  ['Kosher salt', 'salt'],
  ['4 large flour tortillas', '4 vetetortilla'],
  ['1/2 cup shredded cheddar', '1 dl cheddar'],
  ['1 ripe avocado, sliced', '1 avokado (skivad)'],
  ['Hot sauce, for serving', 'het sås (till servering)'],

  // Breakfast burrito
  [
    '1 pound small yellow potatoes, cut into ½-inch pieces',
    '455 g potatis (cut into 1 cm pieces)'
  ],
  ['Extra-virgin olive oil, for drizzling', 'olivolja (att ringla över)'],
  ['½ teaspoon smoked paprika', '½ tsk paprikapulver'],
  ['Red pepper flakes', 'chiliflingor'],
  ['1 red bell pepper', '1 röd paprika'],
  ['1 cup fresh spinach', '2½ dl spenat'],
  ['3 (12-inch) tortillas', '3 tortilla (30 cm)'],
  ['9 scrambled eggs', '9 ägg'],
  [
    '¾ cup cooked black beans, drained and rinsed',
    '2 dl svart böna (avrunnen och sköljd)'
  ],
  ['½ cup pico de gallo', '1 dl pico de gallo'],
  ['½ cup fresh cilantro leaves', '1 dl koriander'],
  ['1 lime, for squeezing', '1 lime (att pressa)'],

  // Dip
  ['1/2 cup sour cream', '1 dl gräddfil'],
  ['1/2 cup salsa', '1 dl salsa'],
  ['2-3 teaspoons lime juice', '2–3 tsk limesaft'],
  ['1/4 teaspoon ground cumin', '¼ tsk spiskummin'],
  ['salt and pepper to taste', 'salt och peppar (efter smak)'],
  ['hot sauce to taste, optional', 'het sås (valfritt, efter smak)'],

  // Manhattan
  ['2 ounces rye whiskey', '55 g rågwhisky'],
  ['1 ounce sweet vermouth', '30 g söt vermouth'],
  ['2 dashes Angostura bitters', '2 angostura bitter'],
  ['Ice', 'is'],
  [
    'Brandied cherry or lemon twist, for garnish, optional',
    'körsbär eller citronskal (till garnering, valfritt)'
  ],

  // Cupcakes (checkbox markers + dual metric annotations)
  ['▢1⅔ cup all-purpose flour 213g', '4 dl vetemjöl'],
  ['▢1 cup granulated sugar 200g', '2½ dl socker'],
  ['▢¼ teaspoon baking soda', '¼ tsk bikarbonat'],
  ['▢1½ teaspoon baking powder', '1½ tsk bakpulver'],
  ['▢¾ cup unsalted butter 170g, melted', '2 dl smör (smält)'],
  ['▢3 egg whites room temperature', '3 äggvita (rumstempererad)'],
  ['▢1 tablespoon vanilla extract 15mL', '1 msk vaniljextrakt'],
  [
    '▢½ cup sour cream 120mL, room temperature',
    '1 dl gräddfil (rumstempererad)'
  ],
  ['▢2 pound confectioners sugar 900g, sifted', '905 g florsocker (siktad)'],
  ['▢1 pinch kosher salt', '1 salt'],
  ['▢1 tsp whole milk', '1 tsk mjölk'],

  // Strawberry tart
  ['▢2 cups all purpose flour', '5 dl vetemjöl'],
  ['▢1/4 cup sugar', '½ dl socker'],
  ['▢1 egg yolk', '1 äggula'],
  ['▢1/2 tsp lemon zest', '½ tsk citronskal'],

  // Meringue (source is missing spaces on some lines)
  ['4large (142 grams) egg whites', '4 äggvita (142 g)'],
  ['1 3/4 cup(340 grams) granulated sugar', '4 dl socker (340 g)'],
  ['3/4 cup(170 grams) water', '2 dl vatten (170 g)'],
  [
    'Vanilla extract, or other flavoring (optional)',
    'vaniljextrakt (valfritt, eller annan smaksättning)'
  ],

  // Peruvian chicken (endpoint)
  ['¼ cup lime juice, (from 2 limes)', '½ dl limesaft (from 2 limes)'],
  ['4 large cloves garlic, (roughly chopped)', '4 vitlök (grovt hackad)'],
  ['2 teaspoons paprika', '2 tsk paprikapulver'],
  ['1 teaspoon black pepper', '1 tsk svartpeppar'],
  ['1 tablespoon cumin', '1 msk spiskummin'],
  ['1 teaspoon dried oregano', '1 tsk oregano'],
  ['4 lb whole chicken', '1,8 kg kyckling'],
  ['1 cup packed fresh cilantro leaves', '2½ dl koriander'],
  ['&frac18; teaspoon freshly ground black pepper', '⅛ tsk svartpeppar'],

  // Black bean salad (endpoint)
  ['2 ears fresh corn', '2 majs'],
  ['1 cup chopped red onion', '2½ dl rödlök'],
  ['1 (15.5-oz) can black beans', '1 svart böna (440 g)'],
  ['2 tablespoons red wine vinegar', '2 msk rödvinsvinäger'],
  ['2 tablespoons honey', '2 msk honung'],
  ['¾ teaspoon ground cumin', '¾ tsk spiskummin'],

  // Baked ziti (endpoint)
  ['4 cloves garlic, (minced)', '4 vitlök (finhackad)'],
  ['1 (28-oz) can crushed tomatoes', '1 tomat (795 g)'],
  ['¼ teaspoon crushed red pepper flakes', '¼ tsk chiliflingor'],
  ['1 cup heavy cream', '2½ dl vispgrädde'],
  [
    '1/3 cup chopped fresh basil, (plus more for serving)',
    '1 dl basilika (plus more for serving)'
  ],

  // Fish florentine (endpoint)
  ['1 tablespoon salted butter', '1 msk smör'],
  [
    '9 ounces fresh baby spinach (from two bags)',
    '255 g spenat (from two bags)'
  ],
  ['3 tablespoons grated Parmesan cheese', '3 msk parmesan'],
  ['fresh black pepper', 'svartpeppar'],

  // Spinach quiche (endpoint)
  ['½ cup thinly sliced shallots', '1 dl schalottenlök'],
  ['1¼ cups heavy cream', '3 dl vispgrädde'],
  ['Pinch ground nutmeg', 'muskotnöt'],
  ['⅛ teaspoon cayenne pepper', '⅛ tsk cayennepeppar'],

  // Turkey taco soup (endpoint)
  ['1 medium onion (chopped)', '1 lök (hackad)'],
  ['8 oz tomato sauce', '225 g tomatsås'],
  ['2 1/2 cups less-sodium chicken broth', '6 dl kycklingbuljong'],

  // Lasagna (endpoint)
  ['1 medium yellow onion, (roughly chopped)', '1 lök (grovt hackad)'],
  ['1 stalk celery, (roughly chopped)', '1 selleri (grovt hackad)'],
  ['¾ cup dry red wine', '2 dl rödvin'],
  ['1½ teaspoons dried thyme', '1½ tsk timjan'],
  ['2 bay leaves', '2 lagerblad'],
  ['3 oz cream cheese', '85 g färskost'],

  // Quiche lorraine (endpoint)
  [
    '8 oz thick-cut bacon (about 6 slices, diced)',
    '225 g bacon (about 6 slices, tärnad)'
  ]
]

test.each(cases)('converts %s', (input, expected) => {
  expect(convertIngredientLine(input).text).toEqual(expected)
})
