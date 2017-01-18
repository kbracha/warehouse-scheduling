
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
    shelfVertices = manager.getObjects(Shelf);

    var order = new Order();
    order.add(Toothbrush, 2);
    order.add(Toothbrush, 5);

    order.add(Flashlight, 3);
    order.add(Glass, 10);
    order.add(Pad, 2);
    order.add(Headphones, 1);

    console.log(order.getWeight());

    items = createItemSources(ItemTypes.length);

    var orderItems = order.getItems();
    orderItems.push({
        itemType : Headphones,
        quantity : 1
    })

    orderItems.push({
        itemType : Pad,
        quantity : 3
    })

    orderItems.push({
        itemType : Toothbrush,
        quantity : 3
    })

    console.log("--- order items -- ")
    console.log(orderItems);
    console.log("-----");

    var vertices = []
    for(var i = 0; i < orderItems.length; i++)
    {
        console.log(getItemSource(orderItems[i].itemType))
        var itemSource = getItemSource(orderItems[i].itemType);
        var itemToOrder = new orderItems[i].itemType();
        itemToOrder.x = itemSource.x;
        itemToOrder.y = itemSource.y;
        itemToOrder.weight = itemToOrder.weight * orderItems[i].quantity;
        console.log(itemToOrder.weight)
        vertices.push(itemToOrder);
    }
    var depot = {
        x : 23,
        y : 33
    }

    var routes = clarkeWrightSavings(depot, vertices, 50);
    console.log(routes);

    var itemDummies = order.createItemDummies(getItemSource);
    console.log(itemDummies);
    var routes2 = clarkeWrightSavings(depot, itemDummies, 50);

    console.log(routes2);
    
    $("#simulation").focus();
    bindControls();

    for(var i = 0; i < routes2.length; i++)
    {
        var robot = new Robot();
        robot.x = 23 + i;
        robot.y = 33;

        manager.add(robot);
        robots.push(robot); 

        var itenz = []
        for(var j = 0; j < routes2[i].cities.length; j++)
        {
            itenz.push(itemDummies[routes2[i].cities[j]]);
        }

        console.log(itenz);

        assignItemsToRobot(robot, itenz);      
    }
    
    /*
    for(var i = 0; i < 5; i++)
    {
        var robot = new Robot();
        robot.x = 23 + i;
        robot.y = 33;

        manager.add(robot);
        robots.push(robot);
    }

    setup();
    */

    requestAnimationFrame(simulate);
    
});

var node = null;
var order;
var orderIndex;
var robot;
var robots = []
var items = []


var setup = function()
{
    for(var i = 0; i < items.length; i++)
    {
        manager.remove(items[i]);
    }

    for(var i = 0; i < robots.length; i++)
    {
        robots[i].jobQueue = []
    }

    items = createItems(5);

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

var assignItemsToRobot = function(robot, items)
{
    for(var i = 0; i < items.length; i++)
    {
       robot.addJob2(new GoNextToDestinationJob(items[i]))
    }   

    var robotLocation = 
    {
        x : robot.x,
        y : robot.y
    }    

    robot.addJob2(new GoToDestinationJob(robotLocation)) 
}

var frames = 0;
var framesPerAction = 8;
var oneRound = false;
var simulate = function() 
{
    if(running || oneRound)
    {
        if(oneRound == true)
        {
            frames = framesPerAction;
            oneRound = false;
        }
        else
        {
            frames++;
        }

        if(frames >= framesPerAction)
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

            //if(stillWorking == false)
            //    return;
        }
    }

    requestAnimationFrame(simulate);
}


var createItemSources = function(count)
{
    Math.seedrandom('test');
    
    var items = []

    for(var i = 0; i < count; i++)
    {
        var randIndex = randInt(0, shelfVertices.length - 1);
        var randshelf = shelfVertices.splice(randIndex, 1)[0];
    
        var item = new ItemTypes[i]();
        item.x = randshelf.x; 
        item.y = randshelf.y; 
        
        items.push(item);
        manager.add(item);
    }

    return items;
}

var getItemSource = function(itemType)
{
    for(var i = 0; i < items.length; i++)
    {
        if(items[i] instanceof itemType)
        {
            return items[i];
        }
    }
}

var bindControls = function()
{
    $("#btnRun").click(function(e)
    {
        running = true;
    });

    $("#btnPause").click(function(e)
    {
        running = false;
    });

    $("#btnOneRound").click(function(e)
    {
        oneRound = true;
    });

    $("#btnReset").click(function(e)
    {
        setup();
    });

    $("#selSpeed").change(function(e)
    {
        var val = $("#selSpeed").val()
        
        if(val == "0.125x")
        {
            framesPerAction = 64; 
        }
        else if(val == "0.25x")
        {
            framesPerAction = 32;
        }
        else if(val == "0.5x")
        {
            framesPerAction = 16;
        }
        else if(val == "1x")
        {
            framesPerAction = 8;
        }
        else if(val == "2x")
        {
            framesPerAction = 4;
        }
        else if(val == "4x")
        {
            framesPerAction = 2;
        }
        else if(val == "8x")
        {
            framesPerAction = 1;
        }

        console.log(framesPerAction)
    });

    $("#selZoom").change(function(e)
    {
        var val = $("#selZoom").val()
        
        if(val == "1x")
        {
            manager.setScale(10);
        }
        else if(val == "2x")
        {
            manager.setScale(20);
        }
        else if(val == "4x")
        {
            manager.setScale(40);
        }
        else if(val == "8x")
        {
            manager.setScale(80);
        }
        else if(val == "16x")
        {
            manager.setScale(160);
        }

        console.log(framesPerAction)
    });

    $(window).on("wheel", function(e)
    {
        if(!isCtrl)
        {
            return;
        }

        e.preventDefault();

        var simOffset = $("#simulation").offset(); 
        var relX = e.pageX - simOffset.left;
        var relY = e.pageY - simOffset.top;

        var scale = manager.getScaleX();
        var action = 0;

        if (e.originalEvent.wheelDelta > 0 || e.originalEvent.detail < 0) 
        {
            if(scale != 160)
            {
                action = 2;
            }
        }
        else 
        {
            if(scale != 10)
            {
                action = 0.5;
            }
        }

        
        if(action != 0)
        {
            var off = $("#simulation").offset(); 
            var offY = e.pageY - off.top;
            var offX = e.pageX - off.left;

            var val = action * scale;
            $("#selZoom").val(val / 10 + "x");

            var scrTop = $("#simulation").scrollTop()
            var scrLeft = $("#simulation").scrollLeft()
            manager.setScale(val);

            if(action == 2)
            {
                $("#simulation").scrollTop($("#simulation").scrollTop() * 2 + offY);
                $("#simulation").scrollLeft($("#simulation").scrollLeft() * 2 + offX);
            }
            else
            {
                $("#simulation").scrollTop(scrTop / 2 - offY/2);
                $("#simulation").scrollLeft(scrLeft / 2 - offX/2);              
            }
        }
    })

    $(document).keydown(ctrlCheck).keyup(ctrlCheck);

    var isCtrl = false;
    function ctrlCheck(e) 
    {
        if (e.which === 17) {
            isCtrl = e.type === 'keydown' ? true : false;
        }
    }
}

