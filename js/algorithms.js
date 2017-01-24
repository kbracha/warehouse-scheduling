
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
    this.x = x;
    this.y = y;
    this.cost = 0;
}

Node.prototype = new StaticObject();

// check whether it is possible to ever stand at (x, y)
// so check whether there are staticobjects which collide
// because colliding mobileobjects might move and free the space
var canPossiblyMoveAt = function(hunter, x, y)
{
    var objects = graphicsManager.getObjectsAt(x, y);

    for(var i = 0; i < objects.length; i++)
    {
        if(objects[i].collides === true)
        {
            if((objects[i].isInstanceOf(MobileObject) && chessboardDistance(hunter, objects[i]) != 1) || objects[i] == hunter)
            {
                continue;
            }

            return false;
        }
    } 

    return true;
}

var canPossiblyMoveAtWhich = function(hunter, positions)
{
    var allowedPositions = []

    for(var i = 0; i < positions.length; i++)
    {
        if(canPossiblyMoveAt(hunter, positions[i].x, positions[i].y) == true)
        {
            allowedPositions.push(positions[i]);
        }
    }

    return allowedPositions;
}

var aStarGlow = false;
var aStarSearchTo = function(start, end, hunter)
{
    if(hunter == undefined)
    {
        hunter = start;
    }

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

    var startNode = nodes[start.x][start.y];
    var currentNode = startNode;

    openList.push(currentNode);

    do
    {
        currentNode = findLowestScore(openList, startNode, end);
        var found = false;
        var possibleNodes = [];

        if(currentNode.x == end.x && currentNode.y == end.y)
        {
            found = true;
        }
        else
        {
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

            possibleNodes.forEach(function(node)
            {
                if(node.x === end.x && node.y === end.y)
                {
                    found = true;
                }
            });
        }

        if(found === true)
        {
            var cost = 0;

            var n = {
                x : end.x,
                y : end.y,
                child : null,
                parent : currentNode
            }

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

        possibleNodes = canPossiblyMoveAtWhich(hunter, possibleNodes);

        possibleNodes.forEach(function(node)
        {
            if(openList.indexOf(node) === -1 && closedList.indexOf(node) === -1)
            {
                node.parent = currentNode;
                node.cost = currentNode.cost + 1;
                openList.push(node);
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
    }
    while(openList.length !== 0)

    var result = { node: null}
    return result;
}

var aStarSearchNextTo = function(start, end, hunter)
{
    var result = aStarSearchTo(start, end, hunter);

    if(result.node != null)
    {
         var node = result.node;
         
         while(node.child != null)
         {
             node = node.child;
         }

         node.parent.child = null;
    }

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

// algorithm & example 1: https://www.youtube.com/watch?v=-cLsEHP0qt0
// example 2: http://www.jot.fm/issues/issue_2003_03/column7.pdf
// example 3: https://www.math.ku.edu/~jmartin/courses/math105-F11/Lectures/chapter6-part3.pdf
//
// when no need to come back: hamiltionian path
var tspBranchAndBound = function(robot, items, distancesMatrix)
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
    if(distancesMatrix == undefined)
    {
        distancesMatrix = constructDistancesMatrix(vertices);
    }

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

var constructDistancesMatrix = function(vertices, vehiclesCount)
{
    if(vehiclesCount == undefined)
    {
        vehiclesCount = 0;
    }

    var vehiclesStart = vertices.length - vehiclesCount;

    var distancesMatrix = createArray(vertices.length, vertices.length);

    for(var i = 0; i < vertices.length; i++)
    {
        for(var j = i; j < vertices.length; j++)
        {
            if(j == i)
            {
                distancesMatrix[i][j] = Number.MAX_VALUE;
            }
            else if(i >= vehiclesStart && j >= vehiclesStart)
            {
                distancesMatrix[i][j] = Number.MAX_VALUE;
                distancesMatrix[j][i] = Number.MAX_VALUE;
            }
            else
            {
                //var distance = chessboardDistance(vertices[i], vertices[j]);
                var distance = aStarSearchTo(vertices[i], vertices[j]).cost;
                distancesMatrix[i][j] = distance;
                distancesMatrix[j][i] = distance;
            }
        }
    }

    return distancesMatrix;
}


var log = false;


// https://www.youtube.com/watch?v=A1wsIFDKqBk
vrpBranchAndBound = function(items, robots)
{
    items = items.concat(robots);

    var matrix = constructDistancesMatrix(items, robots.length)

    var objectsOrdered = tspBranchAndBound2(items, matrix);

    var itemType = items[0].uber;
    var breakOn = objectsOrdered[0].uber;

    if(objectsOrdered[0].uber == breakOn)
    {
        breakOn = robots[0].uber
    }

    var assignments = [];
    assignments.push({
        robot : null,
        items: []
    });
    assignmentsCount = 0;

    //for(var i = 0; i < objectsOrdered.length; i++)
    var i = 0;
    var reversed = false;
    if(objectsOrdered[0].uber != itemType)
    {
        reversed = true;
        i = objectsOrdered.length - 1;
    }

    while(true)
    {
        if(objectsOrdered[i].uber == itemType)
        {
            assignments[assignmentsCount].items.push(objectsOrdered[i]);
        }
        else // robot
        {
            assignments[assignmentsCount].robot = objectsOrdered[i];
            assignmentsCount++;  

            if(assignmentsCount != robots.length)
            {
                assignments.push({
                    robot : null,
                    items: []
                });     
            }      
        }
        
        if(reversed == false)
        {
            i++;

            if(i == objectsOrdered.length) 
            {
                break;
            }
        }
        else
        {
            i--;

            if(i < 0) 
            {
                break;
            }
        }
    }

    return assignments;
}


var tspCalculateLowerBound = function(matrix, verticesVisited)
{
    var lowerBound = 0;
    var matrixCopy = matrix;

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
            }
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

var tspBranchAndBound2 = function(items, distancesMatrix)
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
    //distancesMatrix = 
    //[
    //    [Number.MAX_VALUE, 22, 18, 30, 26, 28, 20, 20, 20, 20],
    //    [22, Number.MAX_VALUE, 32, 20, 22, 21, 18, 18, 18, 18],
    //    [18, 32, Number.MAX_VALUE, 20, 22, 21, 14, 14, 14, 14],
    //    [30, 20, 20, Number.MAX_VALUE, 30, 22, 16, 16, 16, 16],
    //    [26, 22, 22, 30, Number.MAX_VALUE, 26, 12, 12, 12, 12],
    //    [28, 21, 21, 22, 26, Number.MAX_VALUE, 19, 19, 19, 19],
    //    [20, 18, 14, 16, 12, 19, Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE],
    //    [20, 18, 14, 16, 12, 19, Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE],
    //    [20, 18, 14, 16, 12, 19, Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE],
    //    [20, 18, 14, 16, 12, 19, Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE],
    //];

    console.log(distancesMatrix)

    var vertices = items.slice();
    //if(distancesMatrix == undefined)
    //{
    //    distancesMatrix = constructDistancesMatrix(vertices);
    //}

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
            // push the last remaining vertice
            for(var i = 0; i < vertices.length; i++)
            {
                if(bestResult.verticesVisited.indexOf(i) === -1)
                {
                    bestResult.verticesVisited.push(i);
                }
            }

            //console.log(bestResult)

            var itemsSorted = [];
            // j = 1, skip the robot
            for(var j = 0; j < bestResult.verticesVisited.length; j++)
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



var constructSavingsMatrix = function(depot, vertices)
{
    var savingsMatrix = createArray(vertices.length, vertices.length);

    for(var i = 0; i < vertices.length; i++)
    {
        for(var j = i + 1; j < vertices.length; j++)
        {
            var savings = calculateSavings(depot, vertices[i], vertices[j]);
            savingsMatrix[j][i] = savings;
        }
    }

    return savingsMatrix;
}

var orderMatrixSavings = function(matrix)
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

var calculateSavingsDummy = {x: -10, y: -10}
var calculateSavings = function(depot, verticeA, verticeB)
{
    // set a dummy as a hunter to ensure that aStarSearch always finds a path
    return aStarSearchTo(depot, verticeA, calculateSavingsDummy).cost + aStarSearchTo(depot, verticeB, calculateSavingsDummy).cost - aStarSearchTo(verticeA, verticeB, calculateSavingsDummy).cost;
}


var depot = {x: 40, y: 40}
var vertices = [{x : 22, y: 22, weight: 18}, {x: 36, y: 26, weight: 26}, {x : 21, y: 45, weight: 11}, {x : 45, y: 35, weight: 30}, 
                {x : 55, y: 20, weight: 21}, {x: 55, y: 45, weight: 16}, {x : 26, y: 59, weight: 29}, {x: 55, y: 65, weight: 37}]

// document VehicleRouting.doc
var clarkeWrightSavings = function(depot, items, robotCapacity)
{
    var savingsMatrix = constructSavingsMatrix(depot, items);
    var orderedSavings = orderMatrixSavings(savingsMatrix);

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
        var assignmentOfItemA = findItemAssignment(assignments, itemA);
        var assignmentOfItemB = findItemAssignment(assignments, itemB);

        if(assignmentOfItemA == null && assignmentOfItemB == null)
        {
            var weight = items[itemA].weight + items[itemB].weight;

            if(weight <= robotCapacity)
            {
                assignments.push(
                    {
                        items : [itemA, itemB],
                        weight : weight
                    }
                )

                removeFromUnused(itemA, itemsUnused);
                removeFromUnused(itemB, itemsUnused);
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
                    weight : items[itemB].weight
                }
            }
            else if(assignmentOfItemB == null)
            {
                assignmentOfItemB = {
                    items : [itemB],
                    weight : items[itemB].weight
                }
            }

            if(assignmentOfItemA != assignmentOfItemB && assignmentOfItemA.weight + assignmentOfItemB.weight <= robotCapacity)
            {
                if(isAtTheEdgeOfAssignment(itemA, assignmentOfItemA) && isAtTheEdgeOfAssignment(itemB, assignmentOfItemB))
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

                    //console.log(routeOfCityA.items)

                    var index = assignments.indexOf(assignmentOfItemB);
                    console.log(index)
                    if(index != -1)
                        assignments.splice(index, 1);

                    removeFromUnused(itemB, itemsUnused);
                }
            }
        }
    }

    function findItemAssignment(assignments, item)
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
    function isAtTheEdgeOfAssignment(item, assignment)
    {
        var index = assignment.items.indexOf(item);
        return index == 0 || index == assignment.items.length - 1;
    }
    function removeFromUnused(item, itemsUnused)
    {
        var index = itemsUnused.indexOf(item);

        if(index != -1)
            itemsUnused.splice(index, 1);
    }

    for(var i = 0; i < itemsUnused.length; i++)
    {
        var index = itemsUnused[i];

        assignments.push
        (
            {
                items : [index],
                weight : items[index].weight
            }
        )        
    }

    for(var i = 0; i < assignments.length; i++)
    {
        for(var j = 0; j < assignments[i].items.length; j++)
        {
            assignments[i].items[j] = items[assignments[i].items[j]];
        }
    }

    return assignments;
}


var sweep = function(depot, items, robotCapacity)
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
        assignments[i].items = tspBranchAndBound(depot, assignments[i].items);
    }

    return assignments;
}

// http://stackoverflow.com/questions/2676719/calculating-the-angle-between-the-line-defined-by-two-points
function calculateAngle(depot, point)
{
    var delta_x = point.x - depot.x;
    var delta_y = point.y - depot.y;
    var angle = Math.atan2(delta_y, delta_x) * (180 / Math.PI)

    // convert negative angles to positive
    if(angle < 0)
    {
        angle = 360 + angle;
    }

    return angle;
}