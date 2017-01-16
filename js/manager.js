
var Manager = function(canvas)
{
    this.objects = createArray(50, 50)
    for(var i = 0; i < 50; i++)
    {
        for(var j = 0; j <50; j++)
        {
            this.objects[i][j] = [];
        }
    }
    
    this.worldWidth = 50;
    this.worldHeight = 50;

    this.scaleX = 10;
    this.scaleY = 10;

    this.canvas = canvas;
}

Manager.prototype.add = function(object)
{
    //if(this.objects.indexOf(object) == -1)
    //{
        this.objects[object.x][object.y].push(object);
        $(object).css("display","none");
        $(this.canvas).append(object.canvas);
        this.draw(object);
    //}
}

Manager.prototype.remove = function(object)
{
    var index = this.objects[object.x][object.y].indexOf(object);
    if(index != -1)
    {
        this.objects[object.x][object.y].splice(index, 1);
        $(object.canvas).remove()
    }
}

Manager.prototype.setScale = function(scale)
{
    this.scaleX = scale;
    this.scaleY = scale;    
    this.redraw();
}

Manager.prototype.getScaleX = function()
{
    return this.scaleX;
}

Manager.prototype.redraw = function()
{
    for(var i = 0; i < 50; i++)
    {
        for(var j = 0; j <50; j++)
        {
            for(var k = 0; k < this.objects[i][j].length; k++)
            {
                this.draw(this.objects[i][j][k])
            }

        }
    }
}

Manager.prototype.draw = function(object)
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

Manager.prototype.placeAt = function(object, x, y, offX, offY)
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

Manager.prototype.canPlaceAt = function(object, x, y)
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

Manager.prototype.getObjectAt = function(classType, x, y)
{   
    var objects = this.objects[x][y];

    for(var i = 0; i < objects.length; i++)
    {
        if(objects[i] instanceof classType)
        {
            return objects[i];
        }
    }

    return null;
}

Manager.prototype.getObjects = function(classType)
{
    var objects = []

    for(var i = 0; i < 50; i++)
    {
        for(var j = 0; j <50; j++)
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

Manager.prototype.getObjectsAt = function(x, y)
{
    return this.objects[x][y];   
}

/*
Manager.prototype.getObjectsAt = function(x, y)
{

}
*/