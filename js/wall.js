

var Wall = function()
{
    Obj.apply(this);

    this.collides = true;
    this.background = "gray";
    this.zIndex = 2;
}


extend(Wall, Obj);


var Shelf = function()
{
    Obj.apply(this);

    this.collides = true;
    this.background = "chocolate";
    this.zIndex = 2;
}


extend(Shelf, Obj);


var Tile = function()
{
    Obj.apply(this);

    this.background = "yellow";
    this.zIndex = 0;
}

extend(Tile, Obj);


var Obstacle = function()
{
    Obj.apply(this);

    this.collides = true;
    this.background = "black";
    this.zIndex = 1;    
}

extend(Obstacle, Obj);