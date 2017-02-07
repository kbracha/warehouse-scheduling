
var christofideles = {}

christofideles.calculate = function(robot, items)
{
    var vertices = items.slice();
    vertices.push(robot);

    var msp = mspKruskal(vertices);
    
    var preorderTreeWalk = [];
    
}
