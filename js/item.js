
var Item = function()
{
    this.x = 25;
    this.y = 45;

    this.collides = true;

    this.background = "blue";
    this.zIndex = 3;

    this.canvas = $.parseHTML("<div></div>")
}

Item.prototype = new Obj();