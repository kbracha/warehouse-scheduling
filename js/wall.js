

var Wall = function()
{
    StaticObject.apply(this);

    this.collides = true;
    this.background = "gray";
    this.zIndex = 2;
}
extend(Wall, StaticObject);


var Shelf = function(x, y)
{
    StaticObject.apply(this);

    this.collides = true;
    this.background = "transparent";
    this.zIndex = 2;
    this.x = x;
    this.y = y;

    this.setSpritePath("img/table")
}
extend(Shelf, StaticObject);


var Tile = function()
{
    StaticObject.apply(this);

    this.setSpritePath("img/tile")
    this.zIndex = 0;

    this.canvas = $.parseHTML("<div>" +
                              "<div style='position: absolute; top: 0; left: 0; width:100%; height: 100%; border: 1px solid black;'></div></div>") 
    $(this.canvas).data("object", this);
    this.sprite = $(this.canvas).children().first();
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




