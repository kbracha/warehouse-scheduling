
var aStar = {}

aStar.Node = function(x, y)
{
    this.x = x;
    this.y = y;
    this.parent = null;
    this.child = null;
    this.cost = 0;
}

aStar.Node.prototype = new StaticObject(); 

aStar.g = function(node)
{
    return node.cost;
}

aStar.h = function(node, target)
{
    return euclidianDistance(node, target);
}

aStar.f = function(node, target)
{
    return aStar.g(node) + aStar.h(node, target); 
}

aStar.findLowestScore = function(list, startNode, target)
{
    var lowestScore = Number.MAX_VALUE;
    var lowestNode = null;

    for(var i = 0; i < list.length; i++)
    {
        var score = aStar.f(list[i], target);
        
        if(score < lowestScore)
        {
            lowestScore = score;
            lowestNode = list[i];
        }
    }

    return lowestNode;
}

aStar.nodes = createArray(getWarehouseSchemeWidth(), getWarehouseSchemeHeight());
(function()
{
    for(var i = 0; i < aStar.nodes.length; i++)
    {
        for(var j = 0; j < aStar.nodes[i].length; j++)
        {
            aStar.nodes[i][j] = new aStar.Node(i, j);
        }
    }
})();

// pilgrim - if the searching object is not placed at the "start"
aStar.search = function(start, end, pilgrim)
{
    if(start.x == end.x && start.y == end.y)
    {
        return {
            node : null,
            cost : 0
        }
    }

    if(pilgrim == undefined)
    {
        pilgrim = start;
    }

    for(var i = 0; i < aStar.nodes.length; i++)
    {
        for(var j = 0; j < aStar.nodes[i].length; j++)
        {
            aStar.nodes[i][j] = new aStar.Node(i, j);
        }
    }

    var nullList = []; // the node has not been seen yet
    var openList = []; // the node has been seen but has not been visited yet
    var closedList = []; // the node has been visited
    var cameFrom = {};

    var startNode = aStar.nodes[start.x][start.y];
    var currentNode = startNode;

    openList.push(currentNode);

    do
    {
        currentNode = aStar.findLowestScore(openList, startNode, end);
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
                possibleNodes.push(aStar.nodes[currentNode.x - 1][currentNode.y]);
            }
            if (currentNode.y !== getWarehouseSchemeHeight() - 1)
            {
                possibleNodes.push(aStar.nodes[currentNode.x][currentNode.y + 1]);
            }
            if (currentNode.x !== getWarehouseSchemeWidth() - 1)
            {
                possibleNodes.push(aStar.nodes[currentNode.x + 1][currentNode.y]);
            }
            if (currentNode.y !== 0)
            {
                possibleNodes.push(aStar.nodes[currentNode.x][currentNode.y - 1]);
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
                node : n, // udpdate to head
                tail : currentNode 
            };

            return result;
        }

        possibleNodes = canPossiblyMoveAtWhich(pilgrim, possibleNodes);

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

// in unsrestricted search all mobile objects are ignored when searching for the path
aStar.searchUnrestricted = function(start, end)
{
    // create hunter with abstract coordinates outside the map to ensure
    // that it never collides with any mobile objects
    var pilgrim = { x : -2, y : -2};
    return aStar.search(start, end, pilgrim)
}

// finish on any coordinates next to "end"
aStar.searchNextTo = function(start, end, pilgrim)
{
    var result = aStar.search(start, end, pilgrim);

    if(result.node != null)
    {
         var node = result.node;
         
         while(node.child != null)
         {
             node = node.child;
         }

         node.parent.child = null;
         if(result.cost > 0)
         {
             result.cost -= 1;
         }
    }

    return result;
}

aStar.searchUnrestrictedNextTo = function(start, end)
{
    // create hunter with abstract coordinates outside the map to ensure
    // that it never collides with any mobile objects
    var pilgrim = { x : -2, y : -2};
    return aStar.searchNextTo(start, end, pilgrim)
}