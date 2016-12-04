
var Item = function()
{
    Obj.apply(this);

    this.collides = true;

    this.background = "blue";
    this.zIndex = 3;
}

extend(Item, Obj);
