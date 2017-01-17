
var Item = function()
{
    StaticObject.apply(this);

    this.collides = true;

    this.background = "transparent";
    this.zIndex = 3;

    this.weight = 5;
}

extend(Item, StaticObject);

var CoffeMachine = function()
{
    Item.apply(this);
    this.setSpritePath("img/coffee-machine")
}
CoffeMachine.prototype.weight = 50;
extend(CoffeMachine, Item);

var Bone = function()
{
    Item.apply(this);
    this.setSpritePath("img/bone")
}
Bone.prototype.weight = 8;
extend(Bone, Item);

var Book = function()
{
    Item.apply(this);
    this.setSpritePath("img/book")
}
Book.prototype.weight = 30;
extend(Book, Item);

var CD = function()
{
    Item.apply(this);
    this.setSpritePath("img/cd")
}
CD.prototype.weight = 3;
extend(CD, Item);

var Drill = function()
{
    Item.apply(this);
    this.setSpritePath("img/drill")
}
Drill.prototype.weight = 45;
extend(Drill, Item);

var Flashlight = function()
{
    Item.apply(this);
    this.setSpritePath("img/flashlight")
}
Flashlight.prototype.weight = 10;
extend(Flashlight, Item);

var Glass = function()
{
    Item.apply(this);
    this.setSpritePath("img/glass")
}
Glass.prototype.weight = 5;
extend(Glass, Item);

var Headphones = function()
{
    Item.apply(this);
    this.setSpritePath("img/headphones")
}
Headphones.prototype.weight = 15;
extend(Headphones, Item);

var Pad = function()
{
    Item.apply(this);
    this.setSpritePath("img/pad")
}
Pad.prototype.weight = 20;
extend(Pad, Item);

var ToothBrush = function()
{
    Item.apply(this);
    this.setSpritePath("img/toothbrush")
}
ToothBrush.prototype.weight = 2;
extend(ToothBrush, Item);

var ItemTypes = [CoffeMachine, Bone, Book, CD, Drill, Flashlight, Glass, Headphones, Pad, ToothBrush]



var Order = function()
{
    this.items = {};
}


Order.prototype.add = function(itemType, quantity)
{
    if(!(itemType in this.items))
    {
        this.items[itemType] = {
            quantity : 0,
            link: itemType // create a link because when iterating over keys in items the key reference doesn't work
        }
    }

    this.items[itemType].quantity += quantity;
}

Order.prototype.getWeight = function()
{
    var weight = 0;

    for(var itemType in this.items)
    {
        weight += this.items[itemType].quantity * this.items[itemType].link.prototype.weight;
    }

    return weight;
}