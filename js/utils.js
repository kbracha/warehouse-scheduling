var n = Tile; //undefined;
var w = Wall;
var s = Shelf;


var warehouseScheme = [
    [w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w],
    [w, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, w],
    [w, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, w],
    [w, n, n, n, n, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, n, n, n, n, n, n, n, n, w],
    [w, n, n, n, n, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, n, n, n, n, n, n, n, n, w],
    [w, n, n, n, n, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, n, n, n, n, n, n, n, n, w],
    [w, n, n, n, n, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, n, n, n, n, n, n, n, n, w],
    [w, n, n, n, n, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, n, n, n, n, n, n, n, n, w],
    [w, n, n, n, n, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, n, n, n, n, n, n, n, n, w],
    [w, n, n, n, n, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, n, n, n, n, n, n, n, n, w],
    [w, n, n, n, n, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, n, n, n, n, n, n, n, n, w],
    [w, n, n, n, n, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, n, n, n, n, n, n, n, n, w],
    [w, n, n, n, n, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, n, n, n, n, n, n, n, n, w],
    [w, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, w],
    [w, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, w],
    [w, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, w],
    [w, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, w],
    [w, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, w],
    [w, n, n, n, n, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, n, n, n, n, n, n, n, n, w],
    [w, n, n, n, n, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, n, n, n, n, n, n, n, n, w],
    [w, n, n, n, n, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, n, n, n, n, n, n, n, n, w],
    [w, n, n, n, n, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, n, n, n, n, n, n, n, n, w],
    [w, n, n, n, n, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, n, n, n, n, n, n, n, n, w],
    [w, n, n, n, n, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, n, n, n, n, n, n, n, n, w],
    [w, n, n, n, n, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, n, n, n, n, n, n, n, n, w],
    [w, n, n, n, n, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, n, n, n, n, n, n, n, n, w],
    [w, n, n, n, n, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, n, n, n, n, n, n, n, n, w],
    [w, n, n, n, n, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, n, n, n, n, n, n, n, n, w],
    [w, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, w],
    [w, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, w],
    [w, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, w],
    [w, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, w],
    [w, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, w],
    [w, n, n, n, n, n, n, n, n, n, s, s, s, s, s, s, s, s, s, s, s, s, n, n, n, n, n, n, s, s, s, s, s, s, s, s, s, s, s, s, n, n, n, n, n, n, n, n, n, n, n, n, n, w],
    [w, n, n, n, n, n, n, n, n, n, s, s, s, s, s, s, s, s, s, s, s, s, n, n, n, n, n, n, s, s, s, s, s, s, s, s, s, s, s, s, n, n, n, n, n, n, n, n, n, n, n, n, n, w],
    [w, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, w],
    [w, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, w],
    [w, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, w],
    [w, n, n, n, n, n, n, n, n, n, s, s, s, s, s, s, s, s, s, s, s, s, n, n, n, n, n, n, s, s, s, s, s, s, s, s, s, s, s, s, n, n, n, n, n, n, n, n, n, n, n, n, n, w],
    [w, n, n, n, n, n, n, n, n, n, s, s, s, s, s, s, s, s, s, s, s, s, n, n, n, n, n, n, s, s, s, s, s, s, s, s, s, s, s, s, n, n, n, n, n, n, n, n, n, n, n, n, n, w],
    [w, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, w],
    [w, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, w],
    [w, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, w],
    [w, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, w],
    [w, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, w],
    [w, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, w],
    [w, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, w],
    [w, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, w],
    [w, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, w],
    [w, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, w],
    [w, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, w],
    [w, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, w],
    [w, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, w],
    [w, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, w]
];


var getWarehouseSchemeWidth = function()
{
    return warehouseScheme[0].length;
}

console.log("width: " + getWarehouseSchemeWidth())

var getWarehouseSchemeHeight = function()
{
    return warehouseScheme.length;
}

console.log("height: " + getWarehouseSchemeHeight())

var buildWarehouse = function(scheme, manager)
{
    for(var y = 0; y < scheme.length; y++)
    {
        for(var x = 0; x < scheme[y].length; x++)
        {
            if(scheme[scheme.length - 1 - y][x] !== undefined)
            {
                if(scheme[scheme.length - 1 - y][x] == Shelf)
                {
                    var obj = new Tile();
                    obj.y = y;
                    obj.x = x;
                    manager.add(obj);
                }

                var obj = new scheme[scheme.length - 1 - y][x]();
                obj.y = y;
                obj.x = x;
                manager.add(obj);
            }
        }
    }
}

