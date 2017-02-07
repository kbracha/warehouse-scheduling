
var graphicsManager;
var manager;

var robotInit;
var running = false;

var shelfVertices = []
var robotsCount = 10;
var selectedRobot = null;

var orders = []
var robots = []
var items = []
var selectedItem = null;

var checkoutTops = []
var checkoutMiddles = []
var checkoutBottoms = []


$(document).ready(function()
{
    graphicsManager = new GraphicsManager($("#simulation"), getWarehouseSchemeWidth(), getWarehouseSchemeHeight());
    //var h = $(window).height() / getWarehouseSchemeHeight();
    //var w = $(window).width() / getWarehouseSchemeWidth();
    console.log($(window).width() / $(window).height()) // 2.1080246913580245
    //graphicsManager.scaleY = h;
    //graphicsManager.scaleX = w;
    
    buildWarehouse2(warehouseScheme2, graphicsManager);

    var startX = Math.floor((getWarehouseSchemeWidth() - robotsCount * 2)/2);
    console.log(startX)
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

    var depot = { x : Math.floor(getWarehouseSchemeWidth() / 2), y : 2 }

    manager = new WarehouseManager(depot, robots);
    manager.ordersUpdated = updateOrdersInfo;
    manager.setVrpFunction(vrp.cws);
    manager.setTspFunction(tsp.nn);

    items = createItemSources(ItemTypes.length);

    $.ajax({
        url: "./php/orders.php",
        dataType: "json",
        success: function (data)
        {
            populateBasketList(data);
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

var clearRouteMarks = function(robot)
{
    var marks = graphicsManager.getObjects(Mark);
    var robotCharacter = robot.name[0];

    for(var i = 0; i < marks.length; i++)
    {
        if(marks[i].character == robotCharacter)
        {
            graphicsManager.remove(marks[i]);
        }
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

            updateTotalSteps();
            updateSelectedRobot();
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

var reset = function()
{
    for(var i = 0; i < robots.length; i++)
    {
        robots[i].reset();
        manager.reset();
    }

    if(running == false)
    {
        oneRound = true;
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
        reset();
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
        displayRouteMarks(selectedRobot);
    });

    $("#btnClearMarks").click(function(e)
    {
        clearRouteMarks(selectedRobot);
    });

    for(var i = 0; i < robots.length; i++)
    {
        $("#selRobots").append($("<option></option>")
                    .data("robot",robots[i])
                    .text(robots[i].name)); 
    }

    for(var i = 0; i < items.length; i++)
    {
        $("#selItems").append($("<option></option>")
                    .data("item", items[i])
                    .text(items[i].getClass())); 
    }

    $("#selRobots").change(function() 
    {
        var robot = $("#selRobots").find(":selected").data("robot")
        selectRobot(robot)
    });

    $("#selItems").change(function() 
    {
        var item = $("#selItems").find(":selected").data("item")
        selectItem(item)
        console.log(selectedItem);
    });

    selectRobot(robots[0]);
    selectItem(items[0]);

    $("#btnCheckOrders").click(function(e)
    {
        manager.handleAwaitingOrders();
        manager.handleAwaitingAssignments();
    });

    $("#btnItemAddToBasket").click(function(e)
    {
        console.log(selectedItem.getClass());
        console.log(window[selectedItem.getClass()])
        basketOrder.add(window[selectedItem.getClass()], 1);
        updateBasket();
    });

    $("#btnAddBasket").click(function(e)
    {
        var filename = $("#selBasket").val();
        $.ajax({
            url: "./data/" + filename,
            success: function (data)
            {
                parseBasketData(data.basketData);
            }
        });
    });

    $("#btnClearBasket").click(function(e)
    {
        basketOrder = new Order();
        updateBasket();
    });

    $("#btnSubmitBasket").click(function(e)
    {
        basketOrder.finalize(getItemSource);
        manager.acknowledgeOrder(basketOrder);
        basketOrder = new Order();
        updateBasket();
    });

    updateBasket();

    $("#btnResetSteps").click(function(e)
    {
        for(var i = 0; i < robots.length; i++)
        {
            robots[i].steps = 0;
        }

        $("#steps").text(0);
    });

    $("#simulation").click(function(e)
    {
        var object = graphicsManager.getObjectFromCanvas(e.target);
        if(object == undefined)
        {
            return;
        }
        else if(object.isInstanceOf(Robot))
        {
            changeRobotSelection(object.name);
        }
        else if(object.isInstanceOf(Item))
        {
            changeItemSelection(object.getClass());
        }
    });

    $('input[type=radio][name=radioVRP]').change(function() 
    {
        if (this.value == 'Savings') 
        {
            manager.setVrpFunction(vrp.cws);
            console.log("savings")
        }
        else if (this.value == 'Sweep') 
        {
            manager.setVrpFunction(vrp.sweep);
            console.log("sweep")
        }
        else if (this.value == 'Centroid Based') 
        {
            manager.setVrpFunction(vrp.cb);
            console.log("centroid")
        }
    });

    $('input[type=radio][name=radioTSP]').change(function() 
    {
        if (this.value == 'Nearest Neighbour') 
        {
            manager.setTspFunction(tsp.nn);
            console.log("nn")
        }
        else if (this.value == 'Greedy') 
        {
            manager.setTspFunction(tsp.greedy);
            console.log("greedy")
        }
        else if (this.value == 'Branch and Bound') 
        {
            manager.setTspFunction(tsp.branchAndBound);
            console.log("branch and bound")
        }
    });
}

var basketOrder = new Order();
var parseBasketData = function(basketData)
{
    for(var i = 0; i < basketData.length; i++)
    {
        for(var j = 0; j < basketData[i].items.length; j++)
        {
            basketOrder.add(window[basketData[i].items[j].name], basketData[i].items[j].quantity);
        }
    }

    updateBasket();
}

var populateBasketList = function(data)
{
    for(var i = 0; i < data.length - 1; i++)
    {
         $("#selBasket").append($("<option></option>")
                    .val(data[i])
                    .text(data[i]));        
    }
}

var updateBasket = function()
{
     $("#basketId").text(basketOrder.id);
     $("#basketItems").empty();
     var itemsInfo = basketOrder.getItemsInfo();
     
     for(var key in itemsInfo)
     {
         var name = itemsInfo[key].itemType.name;

         $("#basketItems").append("&nbsp;&nbsp;-"+
         makeItemLink(name) + " x " + itemsInfo[key].quantity + "&nbsp;&nbsp;"
         + '<button class="basket-item-btn" onclick="changeBasket(\'' + name + '\',\'increase\')">+</button>'
         + '<button class="basket-item-btn" onclick="changeBasket(\'' + name + '\',\'decrease\')">-</button>'
         + '<button class="basket-item-btn" onclick="changeBasket(\'' + name + '\',\'remove\')">x</button>'
         + "<br>");
     }

     $("#basketCount").text(basketOrder.getCount());
     $("#basketWeight").text(basketOrder.getWeight());
     $("#basketCost").text(basketOrder.getCost());
}

var changeBasket = function(itemName, action)
{
    var itemsInfo = basketOrder.getItemsInfo();

    for(var key in itemsInfo)
    {
         if(itemsInfo[key].itemType.name == itemName)
         {
             if(action == "increase")
             {
                 basketOrder.add(itemsInfo[key].itemType, 1)
             }
             else if(action == "decrease")
             {
                 basketOrder.remove(itemsInfo[key].itemType, 1)
             }
             else // if action == "remove"
             {
                 basketOrder.remove(itemsInfo[key].itemType, itemsInfo[key].quantity)
             }
             
             break;
         }
    }   

    updateBasket();
}

var makeItemLink = function(itemName)
{
    return "<span style='cursor: pointer;' onclick='changeItemSelection(\"" + itemName + "\")'>" + itemName + "</span>";  
}

var makeRobotLink = function(robotName)
{
    return "<span style='cursor: pointer;' onclick='changeRobotSelection(\"" + robotName + "\")'>" + robotName + "</span>";  
}

var changeItemSelection = function(itemName)
{
    $('#selItems').val(itemName).change();
}

var changeRobotSelection = function(robotName)
{
    $('#selRobots').val(robotName).change();
}

var updateOrdersInfo = function()
{
    $("#awaitingOrders").empty();

    var awaitingOrders = manager.awaitingOrders;
    for(var i = 0; i < awaitingOrders.length; i++)
    {
         $("#awaitingOrders").append("<b>Order #" + awaitingOrders[i].id + "</b><br>");
         var itemsInfo = awaitingOrders[i].getItemsInfo();
         
         for(var key in itemsInfo)
         {
             $("#awaitingOrders").append("&nbsp;&nbsp;-" + makeItemLink(itemsInfo[key].itemType.name) + " x " + itemsInfo[key].quantity + "<br>");
         }
    }

    $("#pendingOrders").empty();

    var pendingOrders = manager.pendingOrders;
    for(var i = 0; i < pendingOrders.length; i++)
    {
         $("#pendingOrders").append("<b>Order #" + pendingOrders[i].id + "</b><br>");
         var items = pendingOrders[i].getItems();
         
         for(var j = 0; j < items.length; j++)
         {
             var status;
             var picker = items[j].picker;
             if(picker != null)
             {
                 if(items[j].delivered == true)
                 {
                     status = "delivered by " + makeRobotLink(picker.name);
                 }
                 else
                 {
                    status = "fetched by " + makeRobotLink(picker.name);
                 }    
             }
             else
             {
                 status = "waiting for assignment";
             }

             $("#pendingOrders").append("&nbsp;&nbsp;-" + makeItemLink(items[j].getClass()) + " : " + status + "<br>");
         }        
    }

    $("#completedOrders").empty();

    var completedOrders = manager.completedOrders;
    for(var i = 0; i < completedOrders.length; i++)
    {
         $("#completedOrders").append("<b>Order #" + completedOrders[i].id + "</b><br>");
         var items = completedOrders[i].getItems();
         
         for(var j = 0; j < items.length; j++)
         {
             $("#completedOrders").append("&nbsp;&nbsp;-" + makeItemLink(items[j].getClass()) + " : delivered by " + makeRobotLink(items[j].picker.name) + "<br>");
         }        
    }
}

var updateTotalSteps = function()
{
    var steps = 0;
    for(var i = 0; i < robots.length; i ++)
    {
        robots[i].makeAction()
        steps += robots[i].steps;

        $("#steps").text(steps);
    }
}

var selectRobot = function(robot)
{
    if(selectedRobot != null)
    {
        selectedRobot.setBackground("transparent");
    }
    
    selectedRobot = robot;
    selectedRobot.setBackground("green");

    $("#robotImg").attr("src", robot.spriteUrl);

    $("#robotSteps").text(robot.steps);

    var carries;
    var itemsCarried = robot.returnItemsCollected();
    if(itemsCarried.length != 0)
    {
        carries = itemsCarried[0].getClass();
        for(var i = 1; i < itemsCarried.length; i++)
        {
            carries += ", " + itemsCarried[i].getClass();
        }
    }
    else
    {
        carries = "Nothing";
    }

    $("#robotAwayToCollect").empty();
    $("#robotAwayToCollect").append(makeItemsString(robot.returnItemsToCollect()));
    $("#robotCollected").empty();
    $("#robotCollected").append(makeItemsString(robot.returnItemsCollected()));

    $("#robotCoordinates").text("(" + robot.x + ", " + robot.y + ")");

    function makeItemsString(items)
    {
        var string;
        if(items.length != 0)
        {
            string = makeItemLink(items[0].getClass()) + " (#" + items[0].order.id + ")";
            for(var i = 1; i < items.length; i++)
            {
                string += ", " + makeItemLink(items[i].getClass()) + " (#" + items[i].order.id + ")";
            }
        }
        else
        {
            string = "None";
        }

        return string;
    }
}

var selectItem = function(item)
{
    if(selectedItem != null)
    {
        selectedItem.setBackground("transparent");
    }
    
    selectedItem = item;
    selectedItem.setBackground("yellow");

    $("#itemImg").attr("src", item.spriteUrl);  

    $("#itemWeight").text(item.weight); 
    $("#itemCost").text(item.cost); 

    $("#itemCoordinates").text("(" + item.x + ", " + item.y + ")");
}

var updateSelectedRobot = function()
{
    selectRobot(selectedRobot);
}

