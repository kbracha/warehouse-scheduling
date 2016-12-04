
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


var Node = function(parent, x, y)
{
    this.parent = parent;
    this.collides = true;
    this.x = x;
    this.y = y;
    this.cost = 0;
}


Node.prototype = new Obj();

var aStarGlow = false;
var aStarSearch = function(hunter, target)
{
    var nodes = createArray(50, 50);
    for(var i = 0; i < nodes.length; i++)
    {
        for(var j = 0; j < nodes[i].length; j++)
        {
            nodes[i][j] = new Node(null, i, j);
        }
    }

    var nullList = []; // the node has not been seen yet
    var openList = []; // the node has been seen but has not been visited yet
    var closedList = []; // the node has been visited
    var cameFrom = {};

    var startNode = nodes[hunter.x][hunter.y];
    var currentNode = startNode;

    openList.push(currentNode);

    do
    {
        currentNode = findLowestScore(openList, startNode, target);

        var possibleNodes = [];
        if (currentNode.x !== 0)
        {
            possibleNodes.push(nodes[currentNode.x - 1][currentNode.y]);
        }
        if (currentNode.y !== 49)
        {
            possibleNodes.push(nodes[currentNode.x][currentNode.y + 1]);
        }
        if (currentNode.x !== 49)
        {
            possibleNodes.push(nodes[currentNode.x + 1][currentNode.y]);
        }
        if (currentNode.y !== 0)
        {
            possibleNodes.push(nodes[currentNode.x][currentNode.y - 1]);
        }    

        var found = false;
        possibleNodes.forEach(function(node)
        {
            if(node.x === target.x && node.y === target.y)
            {
                found = true;
            }
        });

        if(found === true)
        {
            var cost = 0;
            var n = currentNode;
            n.child = null;

            while(n.parent != null)
            {
                parent = n.parent;
                parent.child = n;
                n = parent;
                cost++;
            }

            n = n.child;

            var result = 
            {
                cost : cost,
                node : n    
            };

            return result;
        }

        possibleNodes = currentNode.canMoveArray(possibleNodes);

        possibleNodes.forEach(function(node)
        {
            if(openList.indexOf(node) === -1 && closedList.indexOf(node) === -1)
            {
                node.parent = currentNode;
                node.cost = currentNode.cost + 1;
                openList.push(node);

                if(aStarGlow)
                {
                    var tile = manager.getObjectAt(Tile, node.x, node.y);
                    tile.background = "pink";
                    tile.draw();           
                }
            }
            else if(openList.indexOf(node) !== -1)
            {
                var costFromCurrentNode = currentNode.cost + 1;
      
                if(costFromCurrentNode < node.cost)
                {
                    node.parent = currentNode;
                    node.cost = costFromCurrentNode;
                }
            }
        });


        var index = openList.indexOf(currentNode);
        openList.splice(index, 1);
        closedList.push(currentNode);

        if(aStarGlow)
        {
            var tile = manager.getObjectAt(Tile, currentNode.x, currentNode.y);
            tile.background = "red";
            tile.draw();
        }
    }
    while(openList.length !== 0)

    var result = { node: null}
    return result;
}


var g = function(node)
{
    return node.cost;
}

var h = function(node, target)
{
    return euclidianDistance(node, target);
}

var f = function(node, target)
{
    return g(node) + h(node, target); 
}

var findLowestScore = function(list, startNode, target)
{
    var lowestScore = Number.MAX_VALUE;
    var lowestNode = null;

    for(var i = 0; i < list.length; i++)
    {
        var score = f(list[i], target);
        
        if(score < lowestScore)
        {
            lowestScore = score;
            lowestNode = list[i];
        }
    }

    return lowestNode;
}


function createArray(length) {
    var arr = new Array(length || 0),
        i = length;

    if (arguments.length > 1) {
        var args = Array.prototype.slice.call(arguments, 1);
        while(i--) arr[length-1 - i] = createArray.apply(this, args);
    }

    return arr;
}


// algorithm & example 1: https://www.youtube.com/watch?v=-cLsEHP0qt0
// example 2: http://www.jot.fm/issues/issue_2003_03/column7.pdf
// example 3: https://www.math.ku.edu/~jmartin/courses/math105-F11/Lectures/chapter6-part3.pdf
//
// when no need to come back: hamiltionian path
var tspBranchAndBoundYT = function(robot, items)
{
    //vertices = new Array(5);
    //var distancesMatrix = 
    //[
    //    [Number.MAX_VALUE, 10, 8, 9, 7 ],
    //    [10, Number.MAX_VALUE, 10, 5, 6],
    //    [8, 10, Number.MAX_VALUE, 8, 9 ],
    //    [9, 5, 8, Number.MAX_VALUE, 6  ],
    //    [7, 6, 9, 6, Number.MAX_VALUE  ]
    //];
    //vertices = new Array(6);
    //var distancesMatrix = 
    //[
    //    [Number.MAX_VALUE, 8, 5, 3, 1, 2],
    //    [8, Number.MAX_VALUE, 4, 9, 2, 8],
    //    [5, 4, Number.MAX_VALUE, 9, 6, 7],
    //    [3, 9, 9, Number.MAX_VALUE, 1, 1],
    //    [1, 2, 6, 1, Number.MAX_VALUE, 9],
    //    [2, 8, 7, 1, 9, Number.MAX_VALUE]
    //];
    //vertices = new Array(6);
    //var distancesMatrix = 
    //[
    //    [Number.MAX_VALUE, 36, 32, 54, 20, 40],
    //    [36, Number.MAX_VALUE, 22, 58, 54, 67],
    //    [32, 22, Number.MAX_VALUE, 36, 42, 71],
    //    [54, 58, 36, Number.MAX_VALUE, 50, 92],
    //    [20, 54, 42, 50, Number.MAX_VALUE, 45],
    //    [40, 67, 71, 92, 45, Number.MAX_VALUE]
    //];

    var vertices = items.slice();
    vertices.unshift(robot);
    var distancesMatrix = tspConstructDistancesMatrix(vertices);

    var results = [];
    //  each item:
    //  {
    //      verticesVisited : [],
    //      lowerBound : int
    //  }

    var result = {}
    result.verticesVisited = [0];
    result.lowerBound = tspCalculatePathCost(distancesMatrix, result.verticesVisited) + tspCalculateLowerBound(distancesMatrix, result.verticesVisited);
    results.push(result);

    while(true)
    {
        var bestResult = results[0];

        for(var i = 1; i < results.length; i++)
        {
            if(results[i].lowerBound < bestResult.lowerBound)
            {
                bestResult = results[i];
            }
            else if(results[i].lowerBound == bestResult.lowerBound && results[i].verticesVisited.length > bestResult.verticesVisited.length)
            {
                bestResult = results[i];
            }
        }

        if(bestResult.verticesVisited.length == vertices.length - 1)
        {
            //console.log(results);
            //console.log(bestResult);
            //console.log(tspCalculatePathCost(distancesMatrix, bestResult.verticesVisited))
            log = true;
            //console.log(tspCalculateLowerBound(distancesMatrix, bestResult.verticesVisited))        
            //alert("found best res")

            // push the last remaining vertice
            for(var i = 0; i < vertices.length; i++)
            {
                if(bestResult.verticesVisited.indexOf(i) === -1)
                {
                    bestResult.verticesVisited.push(i);
                }
            }

            var itemsSorted = [];
            // j = 1, skip the robot
            for(var j = 1; j < bestResult.verticesVisited.length; j++)
            {
                itemsSorted.push(vertices[bestResult.verticesVisited[j]]);
            }

            return itemsSorted;
        }

        var verticesUnvisited = []
        for(var i = 0; i < vertices.length; i++)
        {
            if(bestResult.verticesVisited.indexOf(i) === -1)
            {
                verticesUnvisited.push(i);
            }
        }

        //console.log(bestResult);

        for(var i = 0; i < verticesUnvisited.length; i++)
        {
            var result = {}
            result.verticesVisited = bestResult.verticesVisited.slice();
            result.verticesVisited.push(verticesUnvisited[i]);
            result.lowerBound = tspCalculatePathCost(distancesMatrix, result.verticesVisited) + tspCalculateLowerBound(distancesMatrix, result.verticesVisited);
            results.push(result);    

            /*
            if(bestResult.verticesVisited[0] == 0 && bestResult.verticesVisited[1] == 2)
            {
                console.log(result);
                console.log(tspCalculatePathCost(distancesMatrix, result.verticesVisited));
                console.log(tspCalculateLowerBound(distancesMatrix, bestResult.verticesVisited))
            }    
            */
        }

        var bestResIndex = results.indexOf(bestResult);
        results.splice(bestResIndex, 1);
    }
}

var tspConstructDistancesMatrix = function(vertices)
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
                //var distance = chessboardDistance(vertices[i], vertices[j]);
                var distance = aStarSearch(vertices[i], vertices[j]).cost;
                distancesMatrix[i][j] = distance;
                distancesMatrix[j][i] = distance;
            }
        }
    }

    return distancesMatrix;
}


var log = false;
var logj;
var tspCalculateLowerBound = function(matrix, verticesVisited)
{
    var lowerBound = 0;
    var matrixCopy = matrix;

    //for(var i = 0; i + 1 < verticesVisited.length; i++)
    //{
    //    matrixCopy.splice(verticesVisited[i], 1);
    //
    //    for(var j = 0; j < matrixCopy.length; j++)
    //    {
    //        matrixCopy[j].splice(verticesVisited[i + 1], 1);
    //    }
    //}

    for(var i = 0; i < matrixCopy.length; i++)
    {
        // the vertice is already somewhere in the path and it is not the last vertice so you cannot go from it
        if(verticesVisited.indexOf(i) !== -1 && verticesVisited.indexOf(i) !== verticesVisited.length - 1)
            continue; 

        var min = Number.MAX_VALUE;

        for(var j = 0; j < matrixCopy.length; j++)
        {
            // the vertice is already somewhere in the path and it is not the first vertice so you cannot go to it
            if(verticesVisited.indexOf(j) !== -1 && verticesVisited.indexOf(j) !== 0)
                continue; 

            // do not allow to go from the first vertice to the last vertice as this would create a cycle 
            // (remember that the latest vertice is never the actual last vertice as the algorithm breaks when n - 2 vertices
            //  are found as the n - 1 then is obvious)
            if(verticesVisited.indexOf(j) !== -1 && verticesVisited.indexOf(i) !== -1)
                continue;

            if(matrixCopy[i][j] < min)
            {
                min = matrixCopy[i][j];
                logj = j;
            }
        }

        if(log)
        {
            console.log("i: " + i + ", j: " + logj + ", min: " + min + ", len: " + matrixCopy.length);
        }

        lowerBound += min;
    }

    return lowerBound;    
}

var tspCalculatePathCost = function(matrix, verticesVisited)
{
    var cost = 0;
    for(var i = 0; i + 1 < verticesVisited.length; i++)
    {
        cost += matrix[verticesVisited[i]][verticesVisited[i + 1]];
    }

    return cost;
}