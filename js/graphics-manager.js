
var GraphicsManager = function(canvas, worldWidth, worldHeight)
{
    this.canvas = canvas;    
    this.worldWidth = worldWidth;
    this.worldHeight = worldHeight;

    this.objects = createArray(this.worldWidth, this.worldHeight)
    for(var i = 0; i < this.worldWidth; i++)
    {
        for(var j = 0; j < this.worldHeight; j++)
        {
            this.objects[i][j] = [];
        }
    }

    this.scaleX = 10;
    this.scaleY = 10;
}

GraphicsManager.prototype.add = function(object)
{
    this.objects[object.x][object.y].push(object);
    $(object).css("display","none");
    $(this.canvas).append(object.canvas);
    this.draw(object);
}

GraphicsManager.prototype.remove = function(object)
{
    var index = this.objects[object.x][object.y].indexOf(object);
    if(index != -1)
    {
        this.objects[object.x][object.y].splice(index, 1);
        $(object.canvas).remove()
    }
}

GraphicsManager.prototype.setScale = function(scale)
{
    this.scaleX = scale;
    this.scaleY = scale;    
    this.redraw();
}

GraphicsManager.prototype.getScaleX = function()
{
    return this.scaleX;
}

GraphicsManager.prototype.redraw = function()
{
    for(var i = 0; i < this.worldWidth; i++)
    {
        for(var j = 0; j < this.worldHeight; j++)
        {
            for(var k = 0; k < this.objects[i][j].length; k++)
            {
                this.draw(this.objects[i][j][k])
            }

        }
    }
}

GraphicsManager.prototype.draw = function(object)
{
    $(object.canvas).css({
        display: "block",
        position: "absolute",
        width: object.width * this.scaleX,
        height: object.height * this.scaleY,
        left: (object.x + object.offX) * this.scaleX,
        top: (this.worldHeight - (object.y + object.offY) - object.height) * this.scaleY,
        border: 0,
        "background-color": object.background,
        "z-index": object.zIndex
    });
}

GraphicsManager.prototype.placeAt = function(object, x, y, offX, offY)
{
    var index = this.objects[object.x][object.y].indexOf(object);
    this.objects[object.x][object.y].splice(index, 1);

    this.objects[x][y].push(object);

    object.x = x;
    object.y = y;
    
    if(offX != undefined)
    {
        object.offX = offX;
    }
    else
    {
        object.offX = 0;
    }

    if(offY != undefined)
    {
        object.offY = offY;
    }
    else
    {
        object.offY = 0;
    }

    this.draw(object);
}

GraphicsManager.prototype.canPlaceAt = function(object, x, y)
{
    if(object.collides === false)
        return true;

    if(object.x === x && object.y === y)
        return true;

    var objects = this.objects[x][y];
    for(var i = 0; i < objects.length; i++)
    {
        if(objects[i].collides === true)
        {
            return false;
        }
    } 

    return true;
}

GraphicsManager.prototype.getObjectAt = function(classType, x, y)
{   
    var objects = this.objects[x][y];

    for(var i = 0; i < objects.length; i++)
    {
        if(objects[i].isInstanceOf(classType))
        {
            return objects[i];
        }
    }

    return null;
}

GraphicsManager.prototype.getObjects = function(classType)
{
    var objects = []

    for(var i = 0; i < this.worldWidth; i++)
    {
        for(var j = 0; j < this.worldHeight; j++)
        {
            for(var k = 0; k < this.objects[i][j].length; k++)
            {
                if(classType == undefined || this.objects[i][j][k] instanceof classType)
                {
                    objects.push(this.objects[i][j][k])
                }
            }

        }
    }

    return objects;
}

GraphicsManager.prototype.getObjectsAt = function(x, y)
{
    return this.objects[x][y];   
}

GraphicsManager.prototype.getChessboardDistance = function(objectA, objectB)
{
    return chessboardDistance(objectA, objectB);
}   

/*
Manager.prototype.getObjectsAt = function(x, y)
{

}
*/