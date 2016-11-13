

var Wall = function()
{
    this.collides = true;
    this.background = "gray";
    this.zIndex = 2;
    this.canvas = $.parseHTML("<div></div>")
}


Wall.prototype = new Obj();


var Shelf = function()
{
    this.collides = true;
    this.background = "chocolate";
    this.zIndex = 2;
    this.canvas = $.parseHTML("<div></div>")
}


Shelf.prototype = new Obj();


var Tile = function()
{
    this.collides = false;
    this.background = "yellow";
    this.zIndex = 0;
    this.canvas = $.parseHTML("<div></div>")
}

Tile.prototype = new Obj();


var Obstacle = function()
{
    this.collides = true;
    this.background = "black";
    this.zIndex = 1;    
    this.canvas = $.parseHTML("<div></div>")
}

Obstacle.prototype = new Obj();