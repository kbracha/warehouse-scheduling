
var Item = function()
{
    StaticObject.apply(this);

    this.collides = true;

    this.background = "transparent";
    this.zIndex = 3;

    this.forOrder = null;
}
extend(Item, StaticObject);
Item.prototype.weight = 5;

var CoffeMachine = function()
{
    Item.apply(this);
    this.setSpritePath("img/coffee-machine")
}
extend(CoffeMachine, Item);
CoffeMachine.prototype.weight = 50;

var Bone = function()
{
    Item.apply(this);
    this.setSpritePath("img/bone")
}
extend(Bone, Item);
Bone.prototype.weight = 8;

var Book = function()
{
    Item.apply(this);
    this.setSpritePath("img/book")
}
extend(Book, Item);
Book.prototype.weight = 30;

var CD = function()
{
    Item.apply(this);
    this.setSpritePath("img/cd")
}
extend(CD, Item);
CD.prototype.weight = 3;

var Drill = function()
{
    Item.apply(this);
    this.setSpritePath("img/drill")
}
extend(Drill, Item);
Drill.prototype.weight = 45;

var Flashlight = function()
{
    Item.apply(this);
    this.setSpritePath("img/flashlight")
}
extend(Flashlight, Item);
Flashlight.prototype.weight = 10;

var Glass = function()
{
    Item.apply(this);
    this.setSpritePath("img/glass")
}
extend(Glass, Item);
Glass.prototype.weight = 5;

var Headphones = function()
{
    Item.apply(this);
    this.setSpritePath("img/headphones")
}
extend(Headphones, Item);
Headphones.prototype.weight = 15;

var Pad = function()
{
    Item.apply(this);
    this.setSpritePath("img/pad")
}
extend(Pad, Item);
Pad.prototype.weight = 20;

var Toothbrush = function()
{
    Item.apply(this);
    this.setSpritePath("img/toothbrush")
}
extend(Toothbrush, Item);
Toothbrush.prototype.weight = 2;

var ItemTypes = [CoffeMachine, Bone, Book, CD, Drill, Flashlight, Glass, Headphones, Pad, Toothbrush]



var Order = function()
{
    this.items = {};
    this.assigned = false;
}


Order.prototype.add = function(itemType, quantity)
{
    if(!(itemType in this.items))
    {
        this.items[itemType] = {
            quantity : 0,
            itemType: itemType // create a link because when iterating over keys in items the key reference doesn't work
        }
    }

    this.items[itemType].quantity += quantity;
}

Order.prototype.getWeight = function()
{
    var weight = 0;

    for(var key in this.items)
    {
        weight += this.items[key].quantity * this.items[key].itemType.prototype.weight;
    }

    return weight;
}

Order.prototype.createItems = function(getItemSourceFunction)
{
    var items = [];

    for(var key in this.items)
    {
        var itemSource = getItemSourceFunction(this.items[key].itemType);

        for(var i = 0; i < this.items[key].quantity; i++)
        {
            var item = new this.items[key].itemType();

            item.x = itemSource.x;
            item.y = itemSource.y;
            item.forOrder = this;

            items.push(item);
        }
    }
    
    return items;    
}

/*
Order.prototype.getItems = function()
{
    var items = []

    for(var key in this.items)
    {
        items.push(this.items[key]);
    }
    
    return items;
}
*/