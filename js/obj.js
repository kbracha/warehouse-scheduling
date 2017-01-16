
var StaticObject = function() 
{
    this.x = 0;
    this.y = 0;
    this.width = 1;
    this.height = 1;
    this.collides = false;

    this.canvas = $.parseHTML("<div>" +
                              "<div style='position: absolute; top: 0; left: 0; width:100%; height: 100%;'></div></div>") 
    this.sprite = $(this.canvas).children().first();

    this.background = "green";
    this.zIndex = 0;   

    this.direction = Direction.South;

    this.spritePath = null;

    this.offX = 0;
    this.offY = 0;
}


StaticObject.prototype.draw = function()
{
    manager.draw(this);
}

StaticObject.prototype.move = function(x, y)
{
    manager.placeAt(this, x, y)
}

StaticObject.prototype.faceDirection = function(direction)
{
    this.direction = direction;
    this.setSprite(direction);
}

StaticObject.prototype.canMove = function(x, y)
{
    return manager.canPlaceAt(this, x , y);
}

StaticObject.prototype.canMoveArray = function(positions)
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

StaticObject.prototype.getClass = function()
{
    return this.constructor.name;
}

StaticObject.prototype.setSpritePath = function(path)
{
    this.spritePath = path;
    
    this.setSprite(this.direction)
}

StaticObject.prototype.setSprite = function(name)
{
    if(this.spritePath == null)
        return;

    $(this.sprite).css("background", "url(" + this.spritePath + "/" + name + ".png" + ") 0 0")
    $(this.sprite).css("background-size", "100% 100%")
    $(this.sprite).css("background-repeat", "no-repeat")    
}


var MobileObject = function()
{
    StaticObject.apply(this);

    this.isMoving = false;
    this.currentMoveIteration = 1;
    this.iterationsPerMove = 3;
}

extend(MobileObject, StaticObject);

MobileObject.prototype.move = function(x, y)
{
    var xChange = x - this.x;
    var yChange = y - this.y;
    var direction;

    if(xChange < 0)
    {
        direction = Direction.West;
    }
    else if(xChange > 0)
    {
        direction = Direction.East;
    }
    else if(yChange < 0)
    {
        direction = Direction.South;
    }
    else if(yChange > 0)
    {
        direction = Direction.North;
    }

    this.isMoving = true;

    manager.placeAt(this, x, y, -1 * xChange, -1 * yChange)

    if(this.direction != direction)
    {
        this.faceDirection(direction);
    }
    else
    {
        this.continueMove();
    }
}

MobileObject.prototype.continueMove = function()
{
    var offX = 0
    var offY = 0;
    var offValue = this.currentMoveIteration / this.iterationsPerMove;

    if(this.direction == Direction.West)
    {
        offX = -offValue + 1;
    }
    else if(this.direction == Direction.East)
    {
        offX = offValue - 1;
    }
    else if(this.direction == Direction.North)
    {
        offY = offValue - 1;
    }
    if(this.direction == Direction.South)
    {
        offY = -offValue + 1;
    }

    manager.placeAt(this, this.x, this.y, offX, offY)
    
    var spriteName = this.direction;
    if(this.currentMoveIteration != this.iterationsPerMove)
    {
        spriteName += "-" + this.currentMoveIteration;
        this.setSprite(spriteName);
        this.currentMoveIteration++;
    }
    else
    {
        this.isMoving = false;
        this.currentMoveIteration = 1;
    }
}


function extend(Child, Parent) 
{
    var p = Parent.prototype;
    var c = Child.prototype;

    for (var i in p) 
    {
        c[i] = p[i];
    }

    c.uber = p;
}



var Direction = {
    South : "south",
    North : "north",
    East : "east",
    West : "west"
} 

/*
function Child() {
Parent.apply(this,
arguments);
}
extend2(Child,
Parent);
*/





