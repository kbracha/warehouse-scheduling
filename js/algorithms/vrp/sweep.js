
var sweep = {}


sweep.calculate = function(depot, items, robotCapacity, tspAlgorithm)
{
    var itemsOrdered = []
    // angles for depot (0,0):
    // (1,1)   : 45 
    // (1,-1)  : -45 
    // (-1,-1) : -135
    // (-1, 1) : 135

    for(var i = 0; i < items.length; i++)
    {
        var angle = calculateAngle(depot, items[i]);

        itemsOrdered.push( 
        {
            item: items[i],
            angle : angle
        });
    }

    itemsOrdered.sort(function(itemA, itemB)
    {
        return itemA.angle - itemB.angle;
    })

    // sweep from the x positive axis (3 o'clock) counter-clockwise
    var assignments = []
    var assignment = assignment = {items : [], weight : 0 };

    for(var i = 0; i < itemsOrdered.length; i++)
    {
        if(assignment.weight + itemsOrdered[i].item.weight > robotCapacity)
        {
            assignments.push(assignment);
            assignment = {items : [], weight : 0 };
        }

        assignment.items.push(itemsOrdered[i].item);
        assignment.weight += itemsOrdered[i].item.weight;
    }

    assignments.push(assignment);
 
    for(var i = 0; i < assignments.length; i++)
    {
        console.log(assignments[i].items);
        assignments[i].items = tspAlgorithm(depot, assignments[i].items);
    }

    return assignments;
}


vrp.sweep = sweep.calculate;