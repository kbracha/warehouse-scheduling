
var ContainerObj = function()
{
    this.width = 1;
    this.height = 1;

    this.canvas = $.parseHTML("<div style='background-color: green;'></div>") 
}

ContainerObj.prototype = new Obj();