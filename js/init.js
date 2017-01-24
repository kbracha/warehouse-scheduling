
var graphicsManager;
var manager;

var robotInit;
var running = false;

var shelfVertices = []
var robotsCount = 10;

var orders = []
var robots = []
var items = []

var checkoutTops = []
var checkoutMiddles = []
var checkoutBottoms = []

$(document).ready(function()
{
    graphicsManager = new GraphicsManager($("#simulation"));
    
    buildWarehouse(warehouseScheme, graphicsManager);

    var startX = Math.floor((50 - robotsCount * 2)/2);
    for(var i = 0; i < robotsCount * 2; i+=2)
    {
        var checkoutTop = new CheckoutTop();
        checkoutTop.x = startX + i;
        checkoutTop.y = 2;
        graphicsManager.add(checkoutTop);
        checkoutTops.push(checkoutTop);

        var checkoutMiddle = new CheckoutBottom();
        checkoutMiddle.x = startX + i;
        checkoutMiddle.y = 1;
        graphicsManager.add(checkoutMiddle);
        checkoutMiddles.push(checkoutMiddle);

        var checkoutBottom = new CheckoutBottom();
        checkoutBottom.x = startX + i;
        checkoutBottom.y = 0;
        graphicsManager.add(checkoutBottom);
        checkoutBottoms.push(checkoutBottom);

        var robot = new Robot();
        robot.x = startX + i + 1;
        robot.y = 2;

        robot.depot = { x : checkoutTop.x, y : checkoutTop.y }

        graphicsManager.add(robot);
        robots.push(robot); 
    }

    var depot = { x : 25, y : 1 }

    manager = new WarehouseManager(depot, robots);
    manager.ordersUpdated = updateOrdersInfo;
    manager.setAlgorithm(sweep);

    items = createItemSources(ItemTypes.length);

    $.ajax({
        url: "./php/orders.php",
        dataType: "json",
        success: function (data)
        {
            populateOrderList(data);
        }
    });

    $("#simulation").focus();
    bindControls();

    requestAnimationFrame(simulate);
});


var displayAllRouteMarks = function()
{
    for(var i = 0; i < robots.length; i++)
    {
        displayRouteMarks(robots[i]);
    }
}

var clearAllRouteMarks = function()
{
    var marks = graphicsManager.getObjects(Mark);

    for(var i = 0; i < marks.length; i++)
    {
        graphicsManager.remove(marks[i]);
    }
}

var displayRouteMarks = function(robot)
{
    var marks = robot.generateRouteMarks();

    for(var j = 0; j < marks.length; j++)
    {
        graphicsManager.add(marks[j]);
    }      
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

            manager.makeAction();

            for(var i = 0; i < checkoutBottoms.length; i++)
            {
                var item = graphicsManager.getObjectAt(Item, checkoutBottoms[i].x, checkoutBottoms[i].y);
                if(item != null)
                {
                    graphicsManager.remove(item);
                }

                item = graphicsManager.getObjectAt(Item, checkoutMiddles[i].x, checkoutMiddles[i].y);
                if(item != null)
                {
                    graphicsManager.placeAt(item, checkoutBottoms[i].x, checkoutBottoms[i].y);
                }

                item = graphicsManager.getObjectAt(Item, checkoutTops[i].x, checkoutTops[i].y);
                if(item != null)
                {
                    graphicsManager.placeAt(item, checkoutMiddles[i].x, checkoutMiddles[i].y);
                }
            }

            for(var i = 0; i < robots.length; i ++)
            {
                robots[i].makeAction()
            }
        }
    }

    requestAnimationFrame(simulate);
}


var createItemSources = function(count)
{
    var shelfVertices = graphicsManager.getObjects(Shelf);
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
        graphicsManager.add(item);
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
            graphicsManager.setScale(10);
        }
        else if(val == "2x")
        {
            graphicsManager.setScale(20);
        }
        else if(val == "4x")
        {
            graphicsManager.setScale(40);
        }
        else if(val == "8x")
        {
            graphicsManager.setScale(80);
        }
        else if(val == "16x")
        {
            graphicsManager.setScale(160);
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

        var scale = graphicsManager.getScaleX();
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
            graphicsManager.setScale(val);

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

    $("#btnDisplayAllMarks").click(function(e)
    {
        displayAllRouteMarks();
    });

    $("#btnClearAllMarks").click(function(e)
    {
        clearAllRouteMarks();
    });

    $("#btnDisplayMarks").click(function(e)
    {
        var robot = $("#selRobots").find(":selected").data("robot");
        displayRouteMarks(robot);
    });

    for(var i = 0; i < robots.length; i++)
    {
        $("#selRobots").append($("<option></option>")
                    .data("robot",robots[i])
                    .text(robots[i].name)); 
    }

    $("#btnCheckOrders").click(function(e)
    {
        manager.handleAwaitingOrders();
        manager.handleAwaitingAssignments();
    });

    $("#btnAddOrder").click(function(e)
    {
        var filename = $("#selOrders").val();
        $.ajax({
            url: "./data/" + filename,
            success: function (data)
            {
                parseOrderData(data.orderData);
            }
        });
    });
}

var parseOrderData = function(orderData)
{
    for(var i = 0; i < orderData.length; i++)
    {
        var order = new Order();

        for(var j = 0; j < orderData[i].items.length; j++)
        {
            order.add(window[orderData[i].items[j].name], orderData[i].items[j].quantity);
        }

        order.finalize(getItemSource);

        manager.acknowledgeOrder(order);
    }
}

var populateOrderList = function(data)
{
    for(var i = 0; i < data.length - 1; i++)
    {
         $("#selOrders").append($("<option></option>")
                    .val(data[i])
                    .text(data[i]));        
    }
}

var updateOrdersInfo = function()
{
    $("#awaitingOrders").empty();

    var awaitingOrders = manager.awaitingOrders;
    for(var i = 0; i < awaitingOrders.length; i++)
    {
         $("#awaitingOrders").append("<b>Order #" + i + "</b><br>");
         var itemsInfo = awaitingOrders[i].getItemsInfo();
         
         for(var key in itemsInfo)
         {
             $("#awaitingOrders").append("&nbsp;&nbsp;-" + itemsInfo[key].itemType.name + " x " + itemsInfo[key].quantity + "<br>");
         }
    }

     $("#pendingOrders").empty();

    var pendingOrders = manager.pendingOrders;
    for(var i = 0; i < pendingOrders.length; i++)
    {
         $("#pendingOrders").append("<b>Order #" + i + "</b><br>");
         var items = pendingOrders[i].getItems();
         
         for(var j = 0; j < items.length; j++)
         {
             var status;
             var picker = items[j].picker;
             if(picker != null)
             {
                 if(items[j].delivered == true)
                 {
                     status = "delivered by " + picker.name;
                 }
                 else
                 {
                    status = "fetched by " + picker.name;
                 }    
             }
             else
             {
                 status = "waiting for assignment";
             }

             $("#pendingOrders").append("&nbsp;&nbsp;-" + items[j].getClass() + " : " + status + "<br>");
         }        
    }

    $("#completedOrders").empty();

    var completedOrders = manager.completedOrders;
    for(var i = 0; i < completedOrders.length; i++)
    {
         $("#completedOrders").append("<b>Order #" + i + "</b><br>");
         var items = completedOrders[i].getItems();
         
         for(var j = 0; j < items.length; j++)
         {
             $("#completedOrders").append("&nbsp;&nbsp;-" + items[j].getClass() + " : delivered by " + items[j].picker.name + "<br>");
         }        
    }
}