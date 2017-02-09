

var twoOpt = {}


twoOpt.tryImprove = function(items, depot)
{
    var vertices = items.slice();
    vertices.push(depot);
    var edges = twoOpt.createEdges(vertices);
    var bestEdges = edges;
    console.log(edges);

    for(var i = 0; i < edges.length; i++)
    {
        var reducedEdges = edges.slice();
        var removedEdgeA = reducedEdges.splice(i, 1)[0];

        // it only makes sense to remove edges which are not adjacent
        for(var j = i + 2; j < edges.length; j++)
        {
            var reducedEdgesCopy = reducedEdges.slice();
            var index = reducedEdgesCopy.indexOf(edges[j]);
            var removedEdgeB = reducedEdgesCopy.splice(index, 1)[0];

            var previousCost = removedEdgeA.cost + removedEdgeB.cost;

            var newEdgesA = reducedEdgesCopy.slice();
            newEdgesA.push(twoOpt.createEdge(removedEdgeA.vertexA, removedEdgeB.vertexA));
            newEdgesA.push(twoOpt.createEdge(removedEdgeA.vertexB, removedEdgeB.vertexB));
            console.log(newEdgesA);

            var newEdgesB = reducedEdgesCopy.slice();
            newEdgesB.push(twoOpt.createEdge(removedEdgeA.vertexA, removedEdgeB.vertexB));
            newEdgesB.push(twoOpt.createEdge(removedEdgeA.vertexB, removedEdgeB.vertexA));
            console.log(newEdgesB);

            if(twoOpt.containsSubcycle(newEdgesA) == false)
            {
                var newCost = newEdgesA[edges.length - 2].cost + newEdgesA[edges.length - 1].cost;
                if(newCost < previousCost)
                {
                    return {
                        improvementMade : true,
                        vertices : twoOpt.createVertices(newEdgesA)
                    }; 
                }
            }
            
            if(twoOpt.containsSubcycle(newEdgesB) == false)
            {
                var newCost = newEdgesB[edges.length - 2].cost + newEdgesB[edges.length - 1].cost;
                if(newCost < previousCost)
                {
                    return {
                        improvementMade : true,
                        vertices : twoOpt.createVertices(newEdgesB)
                    }; 
                }
            }
        }
    }

    return {
        improvementMade : false
    };
}

// https://en.wikipedia.org/wiki/2-opt
twoOpt.tryImprove2 = function(assignments, depot, r)
{
    var adjustmentsMade = false;

    for(var i = 0; i < assignments.length; i++)
    {
        var vertices = assignments[i].items.slice();
        vertices.push(depot);

        var distancesMatrix = constructDistancesMatrix2(vertices);
        var cost = twoOpt.calculateCost(vertices, distancesMatrix);

        for(var j = 0; j < vertices.length; j++)
        {
            var verticesCopy1 = vertices.slice();
            var verticesCopy2 = vertices.slice();
            var verticesCopy3 = vertices.slice();
            
            var newVertices;
            // it only makes sense to remove edges which are not adjacent
            for(var k = j + 2; k < vertices.length; k++)
            {
                newVertices = verticesCopy1.splice(0, j);
                newVertices.concat(verticesCopy2.splice(j, k - j).reverse());
                newVertices.concat(verticesCopy3.splice(k, vertices.length));
            }
        }


    }

    return adjustmentsMade;
}

twoOpt.calculateCost = function(vertices, distancesMatrix)
{
    var cost = 0;

    for(var i = 0; i + 1 < vertices.length; i++)
    {
        cost += distancesMatrix[vertices[i]][vertices[i + 1]];
    }

    cost += distancesMatrix[vertices[vertices.length - 1]][vertices[0]];

    return cost;
}

twoOpt.containsSubcycle = function(edges)
{
    edgesCopy = edges.slice();

    var visited = []
    visited.push(edgesCopy[0].vertexA)
    visited.push(edgesCopy[0].vertexB)

    edgesCopy.splice(0, 1);

    while(true)
    {
        for(var i = 0; i < edgesCopy.length; i++)
        {
            var index = null;
            if(edgesCopy[i].vertexA == visited[visited.length - 1])
            {
                index = visited.indexOf(edgesCopy[i].vertexB);
                visited.push(edgesCopy[i].vertexB);
            }
            else if(edgesCopy[i].vertexB == visited[visited.length - 1])
            {
                index = visited.indexOf(edgesCopy[i].vertexA);
                visited.push(edgesCopy[i].vertexA);      
            }

            if(index != null)
            {
                if(index == -1)
                {
                    edgesCopy.splice(i, 1);
                    break;
                }
                else
                {
                    if(edgesCopy.length == 1)
                    {
                        return false;
                    }
                    else
                    {
                        return true;
                    }
                }
            }
        }
    }
}

twoOpt.createEdges = function(vertices)
{
    var edges = [];
    
    for(var i = 0; i + 1 < vertices.length; i++)
    {
        edges.push(twoOpt.createEdge(vertices[i], vertices[i + 1]));
    }

    edges.push(twoOpt.createEdge(vertices[vertices.length - 1], vertices[0]));

    return edges;
}

twoOpt.createEdge = function(vertexA, vertexB)
{
    return {
        vertexA : vertexA,
        vertexB : vertexB,
        cost : aStar.searchUnrestricted(vertexA, vertexB).cost      
    }
}

twoOpt.createVertices = function(edges)
{
    var vertices = []
    vertices.push(edges[0].vertexA)
    vertices.push(edges[0].vertexB)

    edges.splice(0, 1);

    while(edges.length > 1)
    {
        for(var i = 0; i < edges.length; i++)
        {
            if(edges[i].vertexA == vertices[vertices.length - 1])
            {
                vertices.push(edges[i].vertexB);
            }
            else if(edges[i].vertexB == vertices[vertices.length - 1])
            {
                vertices.push(edges[i].vertexA);      
            }
            else
            {
                continue;
            }

            edges.splice(i, 1);
            break;
        }
    }

    return vertices;
}

twoOpt.deploy = function(assignments, depot)
{
    for(var i = 0; i < assignments.length; i++)
    {
        var items = assignments[i].items;
        var packedItems = itemsToVertices(assignments[i].items);

        while(true)
        {
            var result = twoOpt.tryImprove(packedItems, depot)
            
            if(result.improvementMade == true)
            {
                var vertices = result.vertices;
                console.log("vertices:")
                console.log(vertices.slice())

                var index = vertices.indexOf(depot);
                var tail = vertices.splice(0, index);
                console.log("tail:")
                console.log(tail)
                var head = vertices.splice(1, vertices.length - 1);
                console.log("head:")
                console.log(head)
                head = head.concat(tail);
                console.log("all:")
                console.log(head)

                packedItems = head;
                assignments[i].items = itemsFromVertices(head, items);
            }
            else
            {
                break;
            }
        }
    }
}


