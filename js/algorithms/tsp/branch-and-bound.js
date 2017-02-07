
var BranchAndBound = {};
var bab = BranchAndBound;


bab.calculateLowerBound = function(matrix, verticesVisited)
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

bab.calculatePathCost = function(matrix, verticesVisited)
{
    var cost = 0;
    for(var i = 0; i + 1 < verticesVisited.length; i++)
    {
        cost += matrix[verticesVisited[i]][verticesVisited[i + 1]];
    }

    return cost;
}

// algorithm & example 1: https://www.youtube.com/watch?v=-cLsEHP0qt0
// example 2: http://www.jot.fm/issues/issue_2003_03/column7.pdf
// example 3: https://www.math.ku.edu/~jmartin/courses/math105-F11/Lectures/chapter6-part3.pdf
//
// when no need to come back: hamiltionian path
bab.calculate = function(robot, items)
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

    // merge items of the same type together 
    var vertices = itemsToVertices(items);
    vertices.unshift(robot);
    var distancesMatrix = constructDistancesMatrix(vertices);

    var results = [];
    //  each item:
    //  {
    //      verticesVisited : [],
    //      lowerBound : int
    //  }

    var result = {}
    result.verticesVisited = [0];
    result.lowerBound = bab.calculatePathCost(distancesMatrix, result.verticesVisited) + bab.calculateLowerBound(distancesMatrix, result.verticesVisited);
    results.push(result);

    var i = 0;
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

            var itemsSorted = [];
            // j = 1, skip the robot
            for(var j = 1; j < bestResult.verticesVisited.length; j++)
            {
                itemsSorted.push(vertices[bestResult.verticesVisited[j]]);
            }

            var test = itemsFromVertices(itemsSorted, items);
            console.log(test);
            return test;
        }

        var verticesUnvisited = []
        for(var i = 0; i < vertices.length; i++)
        {
            if(bestResult.verticesVisited.indexOf(i) === -1)
            {
                verticesUnvisited.push(i);
            }
        }

        for(var i = 0; i < verticesUnvisited.length; i++)
        {
            var result = {}
            result.verticesVisited = bestResult.verticesVisited.slice();
            result.verticesVisited.push(verticesUnvisited[i]);
            result.lowerBound = bab.calculatePathCost(distancesMatrix, result.verticesVisited) + bab.calculateLowerBound(distancesMatrix, result.verticesVisited);
            results.push(result);    
        }

        var bestResIndex = results.indexOf(bestResult);
        results.splice(bestResIndex, 1);
    }
}


tsp.branchAndBound = bab.calculate;













