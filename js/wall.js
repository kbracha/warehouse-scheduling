

var Wall = function()
{
    StaticObject.apply(this);

    this.collides = true;
    this.background = "gray";
    this.zIndex = 2;
}
extend(Wall, StaticObject);


var Shelf = function()
{
    StaticObject.apply(this);

    this.collides = true;
    this.background = "transparent";
    this.zIndex = 2;

    this.setSpritePath("img/table")
}
extend(Shelf, StaticObject);


var Tile = function()
{
    StaticObject.apply(this);

    this.setSpritePath("img/tile")
    this.zIndex = 0;
}
extend(Tile, StaticObject);


var Obstacle = function()
{
    StaticObject.apply(this);

    this.collides = true;
    this.background = "black";
    this.zIndex = 1;    
}
extend(Obstacle, StaticObject);


var CheckoutTop = function()
{
    StaticObject.apply(this);

    this.setSprite("img/checkout/checkout-top.png")
    this.zIndex = 1;
    this.collides = true;
}
extend(CheckoutTop, StaticObject);

var CheckoutBottom = function()
{
    StaticObject.apply(this);

    this.setSprite("img/checkout/checkout-bottom.png")
    this.zIndex = 1;
    this.collides = true;
}
extend(CheckoutBottom, StaticObject);




