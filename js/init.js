
var manager;

$(document).ready(function()
{
    manager = new Manager($("#simulation"));
    
    //var warehouse = new Warehouse();
    var robot = new Robot();


/*
    for(var i = 0; i < 750; i++)
    {
        var testItem = new Obstacle();
        testItem.x = randInt(1,48);
        testItem.y = randInt(1,48);

        manager.add(testItem);
    }
*/

    buildWarehouse(warehouseScheme, manager);

    robot.x = 12;
    robot.y = 9;
    
    // for testing aStar
    // var item = new Item();
    // item.x = 39; // randInt(0,49);
    // item.y = 46; // randInt(0,49);
    // manager.add(item);

    // for testing travelling salesman
    var shelveVertices = []
    for(var i = 0; i < manager.objects.length; i++)
    {
      var obj = manager.objects[i];

      if(obj instanceof Shelf)
      {
          shelveVertices.push(obj);
      }
    }
    
    var items = [];
    var robotInit = { x: robot.x, y: robot.y}
    items.push(robotInit);
    
    for(var i = 0; i < 10; i++)
    {
        var randIndex = randInt(0, shelveVertices.length - 1);
        var randshelf = shelveVertices.splice(randIndex, 1)[0];
    
        var item = new Item();
        item.x = randshelf.x; 
        item.y = randshelf.y; 
        
        items.push(item);
        manager.add(item);
    }
    


    //manager.add(warehouse);
    
    manager.add(robot);
    

    $("#simulation").focus();

    var node;
    var order;
    var orderIndex;
    $("#simulation").bind("keydown", function(e)
    {
        if(e.keyCode === 37) // left arrow
        {
            robot.move(robot.x - 1, robot.y);
        }
        else if(e.keyCode === 39) // right arrow
        {
            robot.move(robot.x + 1, robot.y);
        }
        else if(e.keyCode === 38) // up arrow
        {
            robot.move(robot.x, robot.y + 1);
        }
        else if(e.keyCode === 40) // down arrow
        {
            robot.move(robot.x, robot.y - 1);
        }
        else if(e.keyCode === 83) // s
        {
            var nextPos = decidePosByEuclidian(robot, item);

            if(nextPos != null)
            {
                robot.move(nextPos.x, nextPos.y);
            }
            else
            {
                console.log("cannae move")
            }
        }
        else if(e.keyCode === 68) // d
        {
            aStarGlow = true;
            node = aStarSearch(robot, item).node;

            if(node !== null)
            {
                //alert("Path found");
            }
            else
            {
                //alert("Path not found");
                return;
            }
        }
        else if(e.keyCode === 70) // f
        {
            if(node === null)
            {
                alert("success");
            }
            else
            {
                robot.move(node.x, node.y);
                node = node.child;
            }
        }
        else if(e.keyCode === 81) // q
        {
            item = items[order[orderIndex]];
            console.log("going for item index: " + order[orderIndex]);
            console.log(item);
            orderIndex++;
        }
        else if(e.keyCode === 87) // w
        {
            /*
            var vertices = [{x: 5, y: 10}, {x: 123, y: 43}, {x: 14, y: 15}, {x: 200, y: 300}]

            var matrix = tspConstructDistancesMatrix(vertices);
            console.log(matrix);

            var lb = tspCalculateTwiceTheLowerBound(matrix);
            console.log(lb);
            */

            order = tspBranchAndBoundYT(items);
            console.log(order);

            // move robot to the end
            order.splice(0,1);
            order.push(0);

            orderIndex = 0;
        }
    });
});


