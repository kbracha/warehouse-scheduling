
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
}


Node.prototype = new Obj();


var nodes = createArray(50, 50);
for(var i = 0; i < nodes.length; i++)
{
    for(var j = 0; j < nodes[i].length; j++)
    {
        nodes[i][j] = new Node(null, i, j);
    }
}

var aStarSearch = function(hunter, target)
{
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
            return currentNode;
        }

        possibleNodes = currentNode.canMoveArray(possibleNodes);

        possibleNodes.forEach(function(node)
        {
            if(openList.indexOf(node) === -1 && closedList.indexOf(node) === -1)
            {
                node.parent = currentNode;
                openList.push(node);

                var tile = manager.getObjectAt(Tile, node.x, node.y);
                tile.background = "pink";
                tile.draw();
            }
            else if(openList.indexOf(node) !== -1)
            {
                var parentDist = f(node.parent, startNode, node);
                var currentNodeDist = f(currentNode, startNode, node);

                if(currentNodeDist < parentDist)
                {
                    node.parent = currentNode;
                }
            }
        });


        var index = openList.indexOf(currentNode);
        openList.splice(index, 1);
        closedList.push(currentNode);

        var tile = manager.getObjectAt(Tile, currentNode.x, currentNode.y);
        tile.background = "red";
        tile.draw();
    }
    while(openList.length !== 0)

    return null;
}


var g = function(node, startNode)
{
    return euclidianDistance(node, startNode);
}

var h = function(node, target)
{
    return euclidianDistance(node, target);
}

var f = function(node, startNode, target)
{
    return g(node, startNode) + h(node, target); 
}

var findLowestScore = function(list, startNode, target)
{
    var lowestScore = Number.MAX_VALUE;
    var lowestNode = null;

    for(var i = 0; i < list.length; i++)
    {
        var score = f(list[i], startNode, target);
        
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