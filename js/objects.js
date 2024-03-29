
var StaticObject = function() 
{
    this.x = 0;
    this.y = 0;
    this.width = 1;
    this.height = 1;
    this.collides = false;

    this.canvas = $.parseHTML("<div>" +
                              "<div style='position: absolute; top: 0; left: 0; width:100%; height: 100%;'></div></div>") 
    $(this.canvas).data("object", this);
    this.sprite = $(this.canvas).children().first();

    if(this.spriteUrl != undefined)
    {
        this.setSprite(this.spriteUrl);
    }
    else
    {
        this.spriteUrl = null;
    }

    this.background = "transparent";
    this.zIndex = 0;   

    this.direction = Direction.South;

    this.spritePath = null;

    this.offX = 0;
    this.offY = 0;
}


StaticObject.prototype.isInstanceOf = function(className)
{
    if(this instanceof className)
        return true;

    var prototype = this.uber;

    while(prototype != null)
    {
        if(prototype.constructor == className)
        {
            return true;
        }

        prototype = prototype.uber;
    }

    return false;
}

StaticObject.prototype.draw = function()
{
    graphicsManager.draw(this);
}

StaticObject.prototype.move = function(x, y)
{
    graphicsManager.placeAt(this, x, y)
}

StaticObject.prototype.faceDirection = function(direction)
{
    this.direction = direction;
    this.setSpriteName(direction);
}

StaticObject.prototype.canMove = function(x, y)
{
    return graphicsManager.canPlaceAt(this, x , y);
}

StaticObject.prototype.getClass = function()
{
    return this.constructor.name;
}

StaticObject.prototype.setSpritePath = function(path)
{
    this.spritePath = path;
    
    this.setSpriteName(this.direction)
}

StaticObject.prototype.setSpriteName = function(name)
{
    if(this.spritePath == null)
        return;

    this.setSprite(this.spritePath + "/" + name + ".png");
}

StaticObject.prototype.setSprite = function(fullPath)
{
    this.spriteUrl = fullPath;
    $(this.sprite).css("background", "url(" + fullPath + ") 0 0")
    $(this.sprite).css("background-size", "100% 100%")
    $(this.sprite).css("background-repeat", "no-repeat")       
}

StaticObject.prototype.setBackground = function(color)
{
    this.background = color;
    graphicsManager.draw(this);
}

var MobileObject = function()
{
    StaticObject.apply(this);

    this.isMoving = false;
    this.currentMoveIteration = 1;
    this.iterationsPerMove = 3;

    this.steps = 0;
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

    graphicsManager.placeAt(this, x, y, -1 * xChange, -1 * yChange)

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

    graphicsManager.placeAt(this, this.x, this.y, offX, offY)
    
    var spriteName = this.direction;
    if(this.currentMoveIteration != this.iterationsPerMove)
    {
        spriteName += "-" + this.currentMoveIteration;
        this.setSpriteName(spriteName);
        this.currentMoveIteration++;
    }
    else
    {
        this.setSpriteName(spriteName);
        this.isMoving = false;
        this.currentMoveIteration = 1;
    
        this.steps++;
    }
}

MobileObject.prototype.getDistance = function(object)
{
    return graphicsManager.getChessboardDistance(this, object);
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





