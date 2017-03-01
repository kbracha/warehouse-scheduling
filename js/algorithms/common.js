
var decidePosByEuclidian = function(hunter, target)
{
    var targetPos = { x: target.x, y: target.y }

    var possiblePos = 
    [
        {x: hunter.x + 1, y: hunter.y},
        {x: hunter.x - 1, y: hunter.y},
        {x: hunter.x, y: hunter.y + 1},
        {x: hunter.x, y: hunter.y - 1}
    ]

    for(var i = 0; i < possiblePos.length; i++)
    {
        if(possiblePos[i].x == targetPos.x && possiblePos[i].y == targetPos.y)
        {
            alert("success");
            return;
        }
    }

    possiblePos = hunter.canMoveArray(possiblePos);

    var minDistance = 9999999;
    for(var i = 0; i < possiblePos.length; i++)
    {
        var distance = euclidianDistance(possiblePos[i], targetPos);
        if(distance < minDistance)
        {
            minDistance = distance;
        }    
    }

    bestPos = []
    for(var i = 0; i < possiblePos.length; i++)
    {
        if(euclidianDistance(possiblePos[i], targetPos) == minDistance)
        {
            bestPos.push(possiblePos[i]);
        }
    }

    if(bestPos.length !== 0)
    {
        return bestPos[randInt(0, bestPos.length - 1)];
    }
    else
    {
        return null;
    }
}

var euclidianDistance = function(p1, p2)
{
    return Math.sqrt((p1.x - p2.x) * (p1.x - p2.x) + (p1.y - p2.y) * (p1.y - p2.y));  
}

var chessboardDistance = function(p1, p2)
{
    return Math.abs(p1.x - p2.x) + Math.abs(p1.y - p2.y);
}   

var randInt = function(min, max)
{
    return Math.floor((Math.random() * (max - min + 1)) + min)
}

// check whether it is possible to ever stand at (x, y)
// so check whether there are staticobjects which collide
// because colliding mobileobjects might move and free the space
var canPossiblyMoveAt = function(object, x, y)
{
    var objects = graphicsManager.getObjectsAt(x, y);

    for(var i = 0; i < objects.length; i++)
    {
        if(objects[i].collides === true)
        {
            if((objects[i].isInstanceOf(MobileObject) && chessboardDistance(object, objects[i]) != 1) || objects[i] == object)
            {
                continue;
            }

            return false;
        }
    } 

    return true;
}

var canPossiblyMoveAtWhich = function(object, positions)
{
    var allowedPositions = []

    for(var i = 0; i < positions.length; i++)
    {
        if(canPossiblyMoveAt(object, positions[i].x, positions[i].y) == true)
        {
            allowedPositions.push(positions[i]);
        }
    }

    return allowedPositions;
}


var TravellingSalesmanProblem = {}
var VehicleRoutingProblem = {}
var tsp = TravellingSalesmanProblem;
var vrp = VehicleRoutingProblem;


var createAndSortEdges = function(vertices)
{
    var edges = []

    for(var i = 0; i < vertices.length; i++)
    {
        for(var j = i + 1; j < vertices.length; j++)
        {
            var edge = 
            {
                vertices : [vertices[i], vertices[j]],
                weight : aStar.searchUnrestricted(vertices[i], vertices[j]).cost
            }

            edges.push(edge);
        }
    }

    edges.sort(function(edgeA, edgeB)
    {
        return edgeA.weight - edgeB.weight;
    })    

    return edges;
}

var mspKruskal = function(vertices)
{    
    var sets = [];
    var msp = []

    for(var i = 0; i < vertices.length; i++)
    {
        sets.push({ vertices : [vertices[i]] });
    }

    var edges = createAndSortEdges(vertices);

    for(var i = 0; i < edges.length; i++)
    {
        var set0 = findSet(edges[i].vertices[0]);
        var set1 = findSet(edges[i].vertices[1])
        if(set0 != set1)
        {
            msp.push(edges[i]);
            
            for(var j = 0; j < set1.vertices.length; j++)
            {
                set0.vertices.push(set1.vertices[j])
            }

            var set1index = sets.indexOf(set1);
            sets.splice(set1index, 1);

            if(sets.length == 1)
            {
                break;
            }
        }
    }

    return msp;

    function findSet(verticeIndex)
    {
        for(var i = 0 ; i < sets.length; i++)
        {
            if (sets[i].vertices.indexOf(verticeIndex) != -1)
            {
                return sets[i];
            }
        }
    }
}

// http://stackoverflow.com/questions/2676719/calculating-the-angle-between-the-line-defined-by-two-points
var calculateAngle = function(centrePoint, point)
{
    var delta_x = point.x - centrePoint.x;
    var delta_y = point.y - centrePoint.y;
    var angle = Math.atan2(delta_y, delta_x) * (180 / Math.PI)

    // convert negative angles to positive
    if(angle < 0)
    {
        angle = 360 + angle;
    }

    return angle;
}

// pack multiple items of the same type
var itemsToVertices = function(items)
{
    var itemTypes = {};

    for(var i = 0; i < items.length; i++)
    {
        if(!(items[i].getClass() in itemTypes))
        {
            itemTypes[items[i].getClass()] = items[i];
        }
    }

    var vertices = [];
    for(var key in itemTypes)
    {
        vertices.push(itemTypes[key]);
    }

    return vertices;
}

var itemsFromVertices = function(vertices, items)
{
    var itemsByVertices = [];

    for(var i = 0; i < vertices.length; i++)
    {
        var type = vertices[i].getClass();

        for(var j = 0; j < items.length; j++)
        {
            if(items[j].getClass() == type)
            {
                itemsByVertices.push(items[j]);
            }
        }
    }

    return itemsByVertices;
}

var constructDistancesMatrix = function(vertices)
{
    var distancesMatrix = createArray(vertices.length, vertices.length);

    for(var i = 0; i < vertices.length; i++)
    {
        for(var j = i; j < vertices.length; j++)
        {
            if(j == i)
            {
                distancesMatrix[i][j] = Number.MAX_VALUE;
            }
            else
            {
                var distance = aStar.searchUnrestricted(vertices[i], vertices[j]).cost;
                distancesMatrix[i][j] = distance;
                distancesMatrix[j][i] = distance;
            }
        }
    }

    return distancesMatrix;
}

var constructDistancesMatrix2 = function(vertices)
{
    var distancesMatrix = createArray(vertices.length, vertices.length);

    for(var i = 0; i < vertices.length; i++)
    {
        for(var j = i; j < vertices.length; j++)
        {
            if(j == i)
            {
                distancesMatrix[vertices[i]][vertices[j]] = Number.MAX_VALUE;
            }
            else
            {
                var distance = aStar.searchUnrestricted(vertices[i], vertices[j]).cost;
                distancesMatrix[vertices[i]][vertices[j]] = distance;
                distancesMatrix[vertices[j]][vertices[i]] = distance;
            }
        }
    }

    return distancesMatrix;
}







