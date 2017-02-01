
var Item = function()
{
    StaticObject.apply(this);

    this.collides = true;

    this.background = "transparent";
    this.zIndex = 3;

    this.order = null;
    this.picker = null;
    this.delivered = false;
}
extend(Item, StaticObject);
Item.prototype.weight = 5;
Item.prototype.cost = 0;

var CoffeMachine = function()
{
    Item.apply(this);
}
extend(CoffeMachine, Item);
CoffeMachine.prototype.weight = 50;
CoffeMachine.prototype.spriteUrl = "img/items/coffee-machine.png";

var Bone = function()
{
    Item.apply(this);
}
extend(Bone, Item);
Bone.prototype.weight = 8;
Bone.prototype.spriteUrl = "img/items/bone.png";

var Book = function()
{
    Item.apply(this);
}
extend(Book, Item);
Book.prototype.weight = 30;
Book.prototype.spriteUrl = "img/items/book.png";

var CD = function()
{
    Item.apply(this);
}
extend(CD, Item);
CD.prototype.weight = 3;
CD.prototype.spriteUrl = "img/items/cd.png";

var Drill = function()
{
    Item.apply(this);
}
extend(Drill, Item);
Drill.prototype.weight = 45;
Drill.prototype.spriteUrl = "img/items/drill.png";

var Flashlight = function()
{
    Item.apply(this);
}
extend(Flashlight, Item);
Flashlight.prototype.weight = 10;
Flashlight.prototype.spriteUrl = "img/items/flashlight.png";

var Glass = function()
{
    Item.apply(this);
}
extend(Glass, Item);
Glass.prototype.weight = 5;
Glass.prototype.spriteUrl = "img/items/glass.png";

var Headphones = function()
{
    Item.apply(this);
}
extend(Headphones, Item);
Headphones.prototype.weight = 15;
Headphones.prototype.spriteUrl = "img/items/headphones.png";

var Pad = function()
{
    Item.apply(this);
}
extend(Pad, Item);
Pad.prototype.weight = 20;
Pad.prototype.spriteUrl = "img/items/pad.png";

var Toothbrush = function()
{
    Item.apply(this);
}
extend(Toothbrush, Item);
Toothbrush.prototype.weight = 2;
Toothbrush.prototype.spriteUrl = "img/items/toothbrush.png";

var Kiwi = function()
{
    Item.apply(this);
}
extend(Kiwi, Item);
Kiwi.prototype.weight = 3;
Kiwi.prototype.spriteUrl = "img/items/kiwi.png";

var Chips = function()
{
    Item.apply(this);
}
extend(Chips, Item);
Chips.prototype.weight = 7;
Chips.prototype.spriteUrl = "img/items/chips.png";

var Watermelon = function()
{
    Item.apply(this);
}
extend(Watermelon, Item);
Watermelon.prototype.weight = 20;
Watermelon.prototype.spriteUrl = "img/items/watermelon.png";

var WatermelonSlice = function()
{
    Item.apply(this);
}
extend(WatermelonSlice, Item);
WatermelonSlice.prototype.weight = 4;
WatermelonSlice.prototype.spriteUrl = "img/items/watermelon-slice.png";

var Asparagus = function()
{
    Item.apply(this);
}
extend(Asparagus, Item);
Asparagus.prototype.weight = 9;
Asparagus.prototype.spriteUrl = "img/items/asparagus.png";

var CakeSlice = function()
{
    Item.apply(this);
}
extend(CakeSlice, Item);
CakeSlice.prototype.weight = 12;
CakeSlice.prototype.spriteUrl = "img/items/cake-slice.png";

var Cinammon = function()
{
    Item.apply(this);
}
extend(Cinammon, Item);
Cinammon.prototype.weight = 7;
Cinammon.prototype.spriteUrl = "img/items/cinammon.png";

var Doughnut = function()
{
    Item.apply(this);
}
extend(Doughnut, Item);
Doughnut.prototype.weight = 8;
Doughnut.prototype.spriteUrl = "img/items/doughnut.png";

var Eggplant = function()
{
    Item.apply(this);
}
extend(Eggplant, Item);
Eggplant.prototype.weight = 10;
Eggplant.prototype.spriteUrl = "img/items/eggplant.png";

var Garlic = function()
{
    Item.apply(this);
}
extend(Garlic, Item);
Garlic.prototype.weight = 3;
Garlic.prototype.spriteUrl = "img/items/garlic.png";

var Lemon = function()
{
    Item.apply(this);
}
extend(Lemon, Item);
Lemon.prototype.weight = 4;
Lemon.prototype.spriteUrl = "img/items/lemon.png";

var OrangeJuice = function()
{
    Item.apply(this);
}
extend(OrangeJuice, Item);
OrangeJuice.prototype.weight = 16;
OrangeJuice.prototype.spriteUrl = "img/items/orange-juice.png";

var Popcorn = function()
{
    Item.apply(this);
}
extend(Popcorn, Item);
Popcorn.prototype.weight = 6;
Popcorn.prototype.spriteUrl = "img/items/popcorn.png";

var Pretzel = function()
{
    Item.apply(this);
}
extend(Pretzel, Item);
Pretzel.prototype.weight = 5;
Pretzel.prototype.spriteUrl = "img/items/pretzel.png";

var ItemTypes = [CoffeMachine, Bone, Book, CD, Drill, Flashlight, Glass, Headphones, Pad, Toothbrush, Kiwi, Chips, Watermelon,
                 WatermelonSlice, Asparagus, CakeSlice, Cinammon, Doughnut, Eggplant, Garlic, Lemon, OrangeJuice, Popcorn, Pretzel]

