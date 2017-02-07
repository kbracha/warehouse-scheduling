

var greedy = {}

// remove robot (it is one of the vertices in the tour)
// and return tour where index 0 is the first vertex where robot should go to
greedy.setupTour = function(robot, tour)
{
    var robotIndex = tour.indexOf(robot);
    // split the tour where robot is
    var tourPart = tour.splice(robotIndex, tour.length - robotIndex)
    // remove robot from the tour
    tourPart.splice(0, 1);
    // concat parts
    return tour.concat(tourPart);    
} 

greedy.findPath = function(vertex, paths)
{
    console.log(vertex)
    for(var i = 0; i < paths.length; i++)
    {
        console.log(paths[i]);
        if(paths[i].vertices.indexOf(vertex) != -1)
        {
            return paths[i];
        }
    }

      console.log("FAIL")
}

greedy.isAtTheEdgeOfPath = function(vertex, path)
{
    var index = path.vertices.indexOf(vertex);

      return index == 0 || index == path.vertices.length - 1;
}

greedy.calculate = function(robot, items)
{
    var vertices = items.slice();
    vertices.push(robot);

    var edges = createAndSortEdges(vertices);
    var paths = []
    for(var i = 0; i < vertices.length; i++)
    {
        console.log(i)
        paths.push({
            vertices : [vertices[i]]
        });
    }

    for(var i = 0; i < edges.length && paths.length != 1; i++)
    {
        var vertexA = edges[i].vertices[0];
        var vertexB = edges[i].vertices[1];
        var pathA = greedy.findPath(vertexA, paths);
        var pathB = greedy.findPath(vertexB, paths);
        console.log(pathB);

        if(pathA != pathB && greedy.isAtTheEdgeOfPath(vertexA, pathA) == true && greedy.isAtTheEdgeOfPath(vertexB, pathB) == true)
        {
            if(pathA.vertices.indexOf(vertexA) == 0)
            {
                pathA.vertices.reverse();
            }

            if(pathB.vertices.indexOf(vertexB) != 0)
            {
                pathB.vertices.reverse();
            }

            pathA.vertices = pathA.vertices.concat(pathB.vertices);

            var index = paths.indexOf(pathB);
            paths.splice(index, 1);
        }
    }

    return greedy.setupTour(robot, paths[0].vertices)
}

tsp.greedy = greedy.calculate;







