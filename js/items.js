
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
    this.itemsInfo = {};
    this.items = [];
    this.assigned = false;
}


Order.prototype.add = function(itemType, quantity)
{
    if(!(itemType in this.itemsInfo))
    {
        this.itemsInfo[itemType] = {
            quantity : 0,
            itemType: itemType // create a link because when iterating over keys in items the key reference doesn't work
        }
    }

    this.itemsInfo[itemType].quantity += quantity;
}

Order.prototype.getWeight = function()
{
    var weight = 0;

    for(var key in this.itemsInfo)
    {
        weight += this.itemsInfo[key].quantity * this.itemsInfo[key].itemType.prototype.weight;
    }

    return weight;
}

Order.prototype.getCount = function()
{
    var count = 0;

    for(var key in this.itemsInfo)
    {
        count += this.itemsInfo[key].quantity;
    }

    return count;
}

Order.prototype.finalize = function(getItemSourceFunction)
{
    this.items = [];

    for(var key in this.itemsInfo)
    {
        var itemSource = getItemSourceFunction(this.itemsInfo[key].itemType);

        for(var i = 0; i < this.itemsInfo[key].quantity; i++)
        {
            var item = new this.itemsInfo[key].itemType();

            item.x = itemSource.x;
            item.y = itemSource.y;
            item.order = this;

            this.items.push(item);
        }
    }
    
    return this.items;    
}

Order.prototype.getItems = function()
{
    return this.items;
}

Order.prototype.getItemsInfo = function()
{
    return this.itemsInfo;
}

