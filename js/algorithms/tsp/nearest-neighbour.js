
var NearestNeigbour = {}
var nn = NearestNeigbour;


nn.calculate = function(robot, items)
{
    var vertices = items.slice();
    vertices.push(robot);

    var distancesMatrix = constructDistancesMatrix(vertices);

    var minTour = {
        cost : Number.MAX_VALUE
    }

    for(var i = 0; i < vertices.length; i++)
    {
        var tour = nn.calculateTour(i, vertices, distancesMatrix);

        if(tour.cost < minTour.cost)
        {
            minTour = tour;
        }
    }

    minTour = minTour.vertices;
    
    for(var i = 0; i < minTour.length; i++)
    {
        minTour[i] = vertices[minTour[i]]
    }

    return greedy.setupTour(robot, minTour);
}

nn.calculateTour = function(startingVertexIndex, vertices, distancesMatrix)
{
    var currentVertexIndex = startingVertexIndex;
    var usedVertices = [startingVertexIndex];
    var cost = 0;

    while(usedVertices.length != vertices.length)
    {
        var minDistance = Number.MAX_VALUE;
        var minVertexIndex = null;

        for(var i = 0; i < vertices.length; i++)
        {
            if(usedVertices.indexOf(i) == -1)
            {
                var distance = distancesMatrix[currentVertexIndex][i];
                
                if(distance < minDistance)
                {
                    minDistance = distance;
                    minVertexIndex = i;
                }
            }
        }

        cost += minDistance;
        usedVertices.push(minVertexIndex);
        currentVertexIndex = minVertexIndex;
    }

    cost += distancesMatrix[minVertexIndex][startingVertexIndex]

    console.log(usedVertices);

    return {
        cost : cost,
        vertices : usedVertices
    }
}

tsp.nn = nn.calculate;