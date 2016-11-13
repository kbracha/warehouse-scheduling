
var manager;

$(document).ready(function()
{
    manager = new Manager($("#simulation"));
    
    //var warehouse = new Warehouse();
    var robot = new Robot();
    var item = new Item();

    for(var i = 0; i < 750; i++)
    {
        var testItem = new Obstacle();
        testItem.x = randInt(1,48);
        testItem.y = randInt(1,48);

        manager.add(testItem);
    }

    buildWarehouse(warehouseScheme, manager);


    item.x = 39; // randInt(0,49);
    item.y = 46; // randInt(0,49);

    robot.x = 12;
    robot.y = 9;

    //manager.add(warehouse);
    manager.add(item);
    manager.add(robot);
 

    console.log(item);
    console.log(robot);
    

    $("#simulation").focus();

    var node;

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
            node = aStarSearch(robot, item);

            if(node !== null)
            {
                alert("Path found");
            }
            else
            {
                alert("Path not found");
                return;
            }

            node.child = null;

            while(node.parent != null)
            {
                var parent = node.parent;
                parent.child = node;
                node = parent;
            }

            node = node.child;
            console.log(node);
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
    });
});


