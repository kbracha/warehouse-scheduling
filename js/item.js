
var Item = function()
{
    StaticObject.apply(this);

    this.collides = true;

    this.background = "transparent";
    this.zIndex = 3;

    this.setSpritePath("img/coffee-machine")

    this.width = 1
    this.height = 1
}

extend(Item, StaticObject);
