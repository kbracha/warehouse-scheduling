
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

    $("#simulation").focus();
    bindControls();

    for(var i = 0; i < 5; i++)
    {
        var robot = new Robot();
        robot.x = 23 + i;
        robot.y = 33;

        manager.add(robot);
        robots.push(robot);
    }
  
    setup();

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

var frames = 0;
var framesPerAction = 8;
var simulate = function() 
{
    if(running)
    {
        frames++;
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
            //var scrollTop = $("#simulation").scrollTop();
            //var scrollLeft = $("#simulation").scrollLeft();
            var off = $("#simulation").offset(); 
            var offY = e.pageY - off.top;
            var offX = e.pageX - off.left;

            //console.log($("#simulation").scrollTop() )
            //console.log(offX)

            var val = action * scale;
            $("#selZoom").val(val / 10 + "x");

            var scrTop = $("#simulation").scrollTop()
            var scrLeft = $("#simulation").scrollLeft()
            manager.setScale(val);

            console.log("scrollTop before: " + $("#simulation").scrollTop())

            if(action == 2)
            {
                $("#simulation").scrollTop($("#simulation").scrollTop() * 2 + offY);
                $("#simulation").scrollLeft($("#simulation").scrollLeft() * 2 + offX);
            }
            else
            {
                console.log("offy: " + offY)
                console.log("scrollTop before: " + $("#simulation").scrollTop())
                $("#simulation").scrollTop(scrTop / 2 - offY/2);
                $("#simulation").scrollLeft(scrLeft / 2 - offX/2);
                console.log("scrollTop after: " + $("#simulation").scrollTop())
                //$("#simulation").scrollLeft(0);
                //$("#simulation").scrollTop();
                //$("#simulation").scrollLeft($("#simulation").scrollLeft() * action + offX);                
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

