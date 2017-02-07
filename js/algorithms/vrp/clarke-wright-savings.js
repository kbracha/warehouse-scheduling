
var ClarkeWrightSavings = {}
var cws = ClarkeWrightSavings;

cws.constructSavingsMatrix = function(depot, vertices)
{
    var savingsMatrix = createArray(vertices.length, vertices.length);

    for(var i = 0; i < vertices.length; i++)
    {
        for(var j = i + 1; j < vertices.length; j++)
        {
            var savings = cws.calculateSavings(depot, vertices[i], vertices[j]);
            savingsMatrix[j][i] = savings;
        }
    }

    return savingsMatrix;
}

cws.orderSavingsMatrix = function(matrix)
{
    var orderedSavings = []

    for(var i = 0; i < matrix.length; i++)
    {
        for(j = i + 1; j < matrix.length; j++)
        {
            var saving = 
            {
                cityA : j,
                cityB : i,
                value: matrix[j][i]
            }

            orderedSavings.push(saving);
        }
    }

    orderedSavings.sort(function(savingA, savingB)
    {
        return savingB.value - savingA.value;
    });

    return orderedSavings;
}

cws.calculateSavings = function(depot, verticeA, verticeB)
{
    return aStar.searchUnrestricted(depot, verticeA).cost + aStar.searchUnrestricted(depot, verticeB).cost - aStar.searchUnrestricted(verticeA, verticeB).cost;
}

cws.findItemAssignment = function(assignments, item)
{
    for(var i = 0; i < assignments.length; i++)
    {
        if(assignments[i].items.indexOf(item) != -1)
        {
            return assignments[i];
        }
    }
    return null;
}

cws.isAtTheEdgeOfAssignment = function(item, assignment)
{
    var index = assignment.items.indexOf(item);
    return index == 0 || index == assignment.items.length - 1;
}

cws.removeFromUnused = function(item, itemsUnused)
{
    var index = itemsUnused.indexOf(item);
    if(index != -1)
        itemsUnused.splice(index, 1);
}

// document VehicleRouting.doc
cws.calculate = function(depot, items, robotCapacity)
{
    // var depot = {x: 40, y: 40}
    // var vertices = [{x : 22, y: 22, weight: 18}, {x: 36, y: 26, weight: 26}, {x : 21, y: 45, weight: 11}, {x : 45, y: 35, weight: 30}, 
    //                 {x : 55, y: 20, weight: 21}, {x: 55, y: 45, weight: 16}, {x : 26, y: 59, weight: 29}, {x: 55, y: 65, weight: 37}]

    var savingsMatrix = cws.constructSavingsMatrix(depot, items);
    var orderedSavings = cws.orderSavingsMatrix(savingsMatrix);

    var itemsUnused = [];
    for(var i = 0; i < items.length; i++)
    {
        itemsUnused.push(i);
    }
    var assignments = [];

    for(var j = 0; j < orderedSavings.length && itemsUnused.length > 0; j++)
    {
        var assignment = orderedSavings[j];
        var itemA = assignment.cityA;
        var itemB = assignment.cityB;
        var assignmentOfItemA = cws.findItemAssignment(assignments, itemA);
        var assignmentOfItemB = cws.findItemAssignment(assignments, itemB);

        if(assignmentOfItemA == null && assignmentOfItemB == null)
        {
            var weight = items[itemA].weight + items[itemB].weight;

            if(weight <= robotCapacity)
            {
                assignments.push(
                    {
                        items : [itemA, itemB],
                        weight : weight,
                        cost: aStar.searchUnrestricted(items[itemA], items[itemB]).cost
                    }
                )

                cws.removeFromUnused(itemA, itemsUnused);
                cws.removeFromUnused(itemB, itemsUnused);
            }
        }
        else 
        {
            if(assignmentOfItemA == null)
            {
                var tempItem = itemA;
                
                assignmentOfItemA = assignmentOfItemB;
                itemA = itemB;

                itemB = tempItem;
                assignmentOfItemB = {
                    items : [itemB],
                    weight : items[itemB].weight,
                    cost: 0
                }
            }
            else if(assignmentOfItemB == null)
            {
                assignmentOfItemB = {
                    items : [itemB],
                    weight : items[itemB].weight,
                    cost: 0
                }
            }

            if(assignmentOfItemA != assignmentOfItemB && assignmentOfItemA.weight + assignmentOfItemB.weight <= robotCapacity)
            {
                if(cws.isAtTheEdgeOfAssignment(itemA, assignmentOfItemA) && cws.isAtTheEdgeOfAssignment(itemB, assignmentOfItemB))
                {
                    if(assignmentOfItemA.items.indexOf(itemA) == 0)
                    {
                        assignmentOfItemA.items.reverse();
                    }

                    if(assignmentOfItemB.items.indexOf(itemB) != 0)
                    {
                        assignmentOfItemB.items.reverse();
                    }

                    assignmentOfItemA.items = assignmentOfItemA.items.concat(assignmentOfItemB.items);
                    assignmentOfItemA.weight += assignmentOfItemB.weight;
                    assignmentOfItemA.cost += assignmentOfItemB.cost + aStar.searchUnrestricted(items[itemA], items[itemB]).cost;

                    //console.log(routeOfCityA.items)

                    var index = assignments.indexOf(assignmentOfItemB);
                    console.log(index)
                    if(index != -1)
                        assignments.splice(index, 1);

                    cws.removeFromUnused(itemB, itemsUnused);
                }
            }
        }
    }

    for(var i = 0; i < itemsUnused.length; i++)
    {
        var index = itemsUnused[i];

        assignments.push
        (
            {
                items : [index],
                weight : items[index].weight,
                cost: 0
            }
        )        
    }

    for(var i = 0; i < assignments.length; i++)
    {
        for(var j = 0; j < assignments[i].items.length; j++)
        {
            assignments[i].items[j] = items[assignments[i].items[j]];
        }

        assignments[i].cost += aStar.searchUnrestricted(depot, assignments[i].items[0]).cost + aStar.searchUnrestricted(assignments[i].items[assignments[i].items.length - 1], depot).cost;
    }

    return assignments;
}

vrp.cws = vrp.clarkeWrightSavings = cws.calculate;