
var Obj = function()
{
    this.x = 0;
    this.y = 0;
    this.width = 1;
    this.height = 1;
    this.collides = false;

    this.canvas = $.parseHTML("<div></div>") 

    this.background = "green";
    this.zIndex = 0;   
}


Obj.prototype.draw = function()
{
    manager.draw(this);
}


Obj.prototype.move = function(x, y)
{
    manager.placeAt(this, x, y);
}


Obj.prototype.canMove = function(x, y)
{
    return manager.canPlaceAt(this, x , y);
}


Obj.prototype.canMoveArray = function(positions)
{
    var allowedPositions = [];

    for(var i = 0; i < positions.length; i++)
    {
        if(this.canMove(positions[i].x, positions[i].y) === true)
        {
            allowedPositions.push(positions[i]);
        }
    }

    return allowedPositions;
}