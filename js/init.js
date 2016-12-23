
var manager;

var robotInit;
var running = false;

var shelfVertices = []

var robotsCount = 10;
var itemsPerRobotCount = 3;

$(document).ready(function()
{
    manager = new Manager($("#simulation"));
    
    buildWarehouse(warehouseScheme, manager);

    // for testing travelling salesman
    for(var i = 0; i < manager.objects.length; i++)
    {
      var obj = manager.objects[i];

      if(obj instanceof Shelf)
      {
          shelfVertices.push(obj);
      }
    }

    //manager.add(warehouse);

    
    $("#simulation").focus();
    bindButtons();

    //for(var x = 7; x < 7 + robotsCount; x++)
    //{
    //    prepare(x);
    //}
  
    prepare2();

    requestAnimationFrame(simulate);
});

var node = null;
var order;
var orderIndex;
var robot;
var robots = []

var prepare = function(x)
{
    var items = createItems(itemsPerRobotCount);
    var robot = new Robot();
    robot.x = x;
    robot.y = 9;
    manager.add(robot);
    robots.push(robot);

    //robot.addJob(new CollectItemsJob(items));
    var robotLocation = 
    {
        x : robot.x,
        y : robot.y - 1
    }

    var itemsOrdered = tspBranchAndBound(robotLocation, items);

    for(var i = 0; i < itemsOrdered.length; i++)
    {
       robot.addJob2(new GoNextToDestinationJob(itemsOrdered[i]))
    }

    robot.addJob2(new GoToDestinationJob(robotLocation))
}

var prepare2 = function()
{
    var items = createItems(6);

    for(var i = 0; i < 3; i++)
    {
        var robot = new Robot();
        robot.x = 12 + i;
        robot.y = 9;

        manager.add(robot);
        robots.push(robot);
    }

    var assignments = vrpBranchAndBound(items, robots);

    console.log(assignments);

    for(var i = 0; i < assignments.length; i++)
    {
        for(var j = 0; j < assignments[i].items.length; j++)
        {
           assignments[i].robot.addJob2(new GoNextToDestinationJob(assignments[i].items[j]))
        }

        var robotLocation = 
        {
            x : assignments[i].robot.x,
            y : assignments[i].robot.y
        }
    
        assignments[i].robot.addJob2(new GoToDestinationJob(robotLocation))        
    }
}

var frames = 0;
var simulate = function() 
{
    if(running)
    {
        frames++;
        if(frames == 10)
        {
            frames = 0;

            //if(!robot.makeAction())
            var stillWorking = false;

            for(var i = 0; i < robots.length; i ++)
            {
                if(robots[i].makeAction2())
                {
                    stillWorking = true;
                }
            }

            if(stillWorking == false)
                return;
        }
    }

    requestAnimationFrame(simulate);
}


var createItems = function(count)
{
    var items = []

    for(var i = 0; i < count; i++)
    {
        var randIndex = randInt(0, shelfVertices.length - 1);
        var randshelf = shelfVertices.splice(randIndex, 1)[0];
    
        var item = new Item();
        item.x = randshelf.x; 
        item.y = randshelf.y; 
        
        items.push(item);
        manager.add(item);
    }

    return items;
}

var bindButtons = function()
{
    $("#btnRun").click(function(e)
    {
        running = true;
    });

    $("#btnPause").click(function(e)
    {
        running = false;
    });
}

