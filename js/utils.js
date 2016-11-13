var n = Tile; //undefined;
var w = Wall;
var s = Shelf;

console.log(n);
console.log(w);


var warehouseScheme = [
    [w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w],
    [w, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, w],
    [w, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, w],
    [w, n, n, n, n, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, n, n, n, n, w],
    [w, n, n, n, n, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, n, n, n, n, w],
    [w, n, n, n, n, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, n, n, n, n, w],
    [w, n, n, n, n, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, n, n, n, n, w],
    [w, n, n, n, n, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, n, n, n, n, w],
    [w, n, n, n, n, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, n, n, n, n, w],
    [w, n, n, n, n, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, n, n, n, n, w],
    [w, n, n, n, n, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, n, n, n, n, w],
    [w, n, n, n, n, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, n, n, n, n, w],
    [w, n, n, n, n, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, n, n, n, n, w],
    [w, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, w],
    [w, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, w],
    [w, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, w],
    [w, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, w],
    [w, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, w],
    [w, n, n, n, n, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, n, n, n, n, w],
    [w, n, n, n, n, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, n, n, n, n, w],
    [w, n, n, n, n, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, n, n, n, n, w],
    [w, n, n, n, n, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, n, n, n, n, w],
    [w, n, n, n, n, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, n, n, n, n, w],
    [w, n, n, n, n, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, n, n, n, n, w],
    [w, n, n, n, n, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, n, n, n, n, w],
    [w, n, n, n, n, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, n, n, n, n, w],
    [w, n, n, n, n, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, n, n, n, n, w],
    [w, n, n, n, n, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, s, s, n, n, n, n, n, n, n, n, n, w],
    [w, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, w],
    [w, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, w],
    [w, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, w],
    [w, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, w],
    [w, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, w],
    [w, n, n, n, n, n, n, n, n, n, s, s, s, s, s, s, s, s, s, s, s, s, n, n, n, n, n, n, s, s, s, s, s, s, s, s, s, s, s, s, n, n, n, n, n, n, n, n, n, w],
    [w, n, n, n, n, n, n, n, n, n, s, s, s, s, s, s, s, s, s, s, s, s, n, n, n, n, n, n, s, s, s, s, s, s, s, s, s, s, s, s, n, n, n, n, n, n, n, n, n, w],
    [w, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, w],
    [w, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, w],
    [w, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, w],
    [w, n, n, n, n, n, n, n, n, n, s, s, s, s, s, s, s, s, s, s, s, s, n, n, n, n, n, n, s, s, s, s, s, s, s, s, s, s, s, s, n, n, n, n, n, n, n, n, n, w],
    [w, n, n, n, n, n, n, n, n, n, s, s, s, s, s, s, s, s, s, s, s, s, n, n, n, n, n, n, s, s, s, s, s, s, s, s, s, s, s, s, n, n, n, n, n, n, n, n, n, w],
    [w, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, w],
    [w, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, w],
    [w, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, w],
    [w, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, w],
    [w, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, w],
    [w, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, w],
    [w, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, w],
    [w, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, w],
    [w, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, w],
    [w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w]
];




var buildWarehouse = function(scheme, manager)
{
    for(var y = 0; y < scheme.length; y++)
    {
        for(var x = 0; x < scheme[y].length; x++)
        {
            if(scheme[scheme.length - 1 - y][x] !== undefined)
            {
                var obj = new scheme[scheme.length - 1 - y][x]();
                obj.y = y;
                obj.x = x;
                manager.add(obj);
            }
        }
    }
}