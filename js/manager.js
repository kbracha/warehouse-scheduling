
var Manager = function(canvas)
{
    this.objects = []
    
    this.worldWidth = 50;
    this.worldHeight = 50;

    this.scaleX = 10;
    this.scaleY = 10;

    this.canvas = canvas;
}

Manager.prototype.add = function(object)
{
    if(this.objects.indexOf(object) == -1)
    {
        this.objects.push(object);
        $(object).css("display","none");
        $(this.canvas).append(object.canvas);
        this.draw(object);
    }
}

Manager.prototype.remove = function(object)
{
    $(object.canvas).remove()
}

Manager.prototype.draw = function(object)
{
    $(object.canvas).css({
        display: "block",
        position: "absolute",
        width: object.width * this.scaleX,
        height: object.height * this.scaleY,
        left: object.x * this.scaleX,
        top: (this.worldHeight - object.y - object.height) * this.scaleY,
        border: 0,
        "background-color": object.background,
        "z-index": object.zIndex
    });
}

Manager.prototype.placeAt = function(object, x, y)
{
    object.x = x;
    object.y = y;

    this.draw(object);
}

Manager.prototype.canPlaceAt = function(object, x, y)
{
    if(object.collides === false)
        return true;

    if(object.x === x && object.y === y)
        return true;

    for(var i = 0; i < this.objects.length; i++)
    {
        var obj = this.objects[i];

        if(obj.collides === true && obj.x === x && obj.y === y)
        {
            return false;
        }
    } 

    return true;
}


Manager.prototype.getObjectAt = function(classType, x, y)
{   
    for(var i = 0; i < this.objects.length; i++)
    {
        if(this.objects[i].x === x && this.objects[i].y === y && this.objects[i] instanceof classType)
        {
            return this.objects[i];
        }
    }

    return null;
}