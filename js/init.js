
var graphicsManager;
var manager;

var robotInit;
var running = false;

var autoOrder = true;

var shelfVertices = []
var robotsCount = 10;
var selectedRobot = null;

var orders = []
var robots = []
var items = []
var selectedItem = null;

var selectedOrder = null;

var checkoutTops = []
var checkoutMiddles = []
var checkoutBottoms = []

var baseScaleX;
var baseScaleY;

var depot;

//var maxOrders = Number.MAX_VALUE;
var maxOrders = 200;
var steps = 0;
var maxSteps = Number.MAX_VALUE;

var xorgen;


$(document).ready(function()
{
    //Math.seedrandom('test');
    var seed = prompt("Enter seed value for pseudorandom algorithm", "rgu");
    console.log(seed);
    xorgen = new xor4096(seed);

    graphicsManager = new GraphicsManager($("#simulation"), getWarehouseSchemeWidth(), getWarehouseSchemeHeight());
    baseScaleY = ($(window).height() - 20) / getWarehouseSchemeHeight();
    baseScaleX = ($(window).width() - $(".sidebar").width() - 20) / getWarehouseSchemeWidth();

    $("#simulation").css("max-height", $(window).height());
    $("#simulation").css("max-width", $(window).width() - $(".sidebar").width());

    graphicsManager.scaleY = baseScaleY;
    graphicsManager.scaleX = baseScaleX;
    
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

        robot.depot = { x : checkoutTop.x, y : checkoutTop.y };
        robot.depotStand = { x : checkoutTop.x + 1, y : checkoutTop.y}

        graphicsManager.add(robot);
        robots.push(robot); 
    }

    depot = { x : Math.floor(getWarehouseSchemeWidth() / 2), y : 2, depotStand : { x : Math.floor(getWarehouseSchemeWidth() / 2), y : 2}}

    manager = new WarehouseManager(depot, robots);
    manager.ordersUpdated = updateOrdersInfo;
    manager.setVrpFunction(vrp.sweep);
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

    itemsInit();

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
var framesPerAction = 1;
var oneRound = false;
var idleRobots = true;
var simulate = function() 
{
    if((running || oneRound) && steps <= maxSteps)
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

            idleRobots = false;
            steps = 0;
            for(var i = 0; i < robots.length; i ++)
            {
                var wasIdle = !robots[i].isBusy();

                robots[i].makeAction();

                if(wasIdle && robots[i].isBusy() == false)
                {
                    idleRobots = true;
                }

                steps += robots[i].steps;
            
                $("#steps").text(steps);
            }

            updateSelectedRobot();
        }
    }

    if(autoOrder && idleRobots && orders.length < maxOrders)
    {
        console.log("Detected free robots and no assignments awaiting. Auto ordering is on.");

        var randOrders = createRandomOrders();

        if(orders.length + randOrders.length > maxOrders)
        {
            randOrders = randOrders.splice(0, maxOrders - orders.length);
        }

        console.log("Created " + randOrders.length + " orders");

        for(var i = 0; i < randOrders.length; i++)
        {
            manager.acknowledgeOrder(randOrders[i]);
        }
        
        orders = orders.concat(randOrders);

        $("#orderCount").text(orders.length);

        idleRobots = false;
    }

    requestAnimationFrame(simulate);
}

var createItemSources = function(count)
{
    var shelfVertices = graphicsManager.getObjects(Shelf);
    
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
        var factor;

        if(val == "1x")
        {
            factor = 1;
        }
        else if(val == "2x")
        {
            factor = 2;
        }
        else if(val == "4x")
        {
            factor = 4;
        }
        else if(val == "8x")
        {
            factor = 8;
        }
        else if(val == "16x")
        {
            factor = 16;
        }

        graphicsManager.setScale(baseScaleX * factor, baseScaleY * factor);

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

        var scaleX = graphicsManager.getScaleX();
        var action = 0;

        if (e.originalEvent.wheelDelta > 0 || e.originalEvent.detail < 0) 
        {
            if(scaleX != baseScaleX * 16)
            {
                action = 2;
            }
        }
        else 
        {
            if(scaleX != baseScaleX)
            {
                action = 0.5;
            }
        }

        if(action != 0)
        {
            var off = $("#simulation").offset(); 
            var offY = e.pageY - off.top;
            var offX = e.pageX - off.left;

            var val = action * (scaleX / baseScaleX);
            $("#selZoom").val(val + "x");

            var scrTop = $("#simulation").scrollTop()
            var scrLeft = $("#simulation").scrollLeft()
            graphicsManager.setScale(val * baseScaleX, val * baseScaleY);

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
        if(basketOrder.getCount() == 0)
        {
            alert("You need to add at least 1 item to the basket");
            return;
        }

        basketOrder.finalize(getItemSource);
        manager.acknowledgeOrder(basketOrder);
        orders.push(basketOrder);
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

    $("#improvement").change( function()
    {
        if($(this).is(':checked'))
        {
            manager.useTwoOpt = true;
            console.log("use")
        }
        else
        {
            manager.useTwoOpt = false;
            console.log("not use");
        }
    });

    $("#autoOrder").change( function()
    {
        if($(this).is(':checked'))
        {
            autoOrder = true;
        }
        else
        {
            autoOrder = false
        }
    });

    $( "#orders" ).dialog({ 
        autoOpen: false,
        title: "View orders",
        width: 800,
        height: 500
    });

    $( "#basket" ).dialog({ 
        autoOpen: false,
        title: "Basket",
        width: 800,
        height: 500
    });

    $("#btnViewOrders").click(function(e)
    {
        $("#orders").dialog( "open" );
    });

    $("#btnViewBasket").click(function(e)
    {
        $("#basket").dialog( "open" );
    });

    $("#selItemsPlacement").change(function(e) 
    {
        var val = $("#selItemsPlacement").find(":selected").val();

        if(val == "Random")
        {
            placeItemsRandom();
        }
        else
        {
            placeItemsByPopularity();
        }
        
        selectItem(selectedItem);
    });

    $("#btnSetMaxOrders").click(function(e)
    {
        maxOrders = $("#maxOrders").val();
    })

    $("#btnSetMaxSteps").click(function()
    {
        maxSteps = $("#maxSteps").val();
    });

    $("#btnCancelOrder").click(cancelOrder);
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
    var selectedId = $(".orders-entry-selected").data("order-id");
    selectedOrder = null;

    $("#awaitingOrders").empty();

    var awaitingOrders = manager.awaitingOrders;
    for(var i = 0; i < awaitingOrders.length; i++)
    {
         $("#awaitingOrders").append(createOrderEntry(awaitingOrders[i].id));
    }

    $("#awaitingOrdersHeader").text("Awaiting orders (" + awaitingOrders.length + ")");

    $("#pendingOrders").empty();

    var pendingOrders = manager.pendingOrders;
    for(var i = 0; i < pendingOrders.length; i++)
    {
         $("#pendingOrders").append(createOrderEntry(pendingOrders[i].id));      
    }

    $("#pendingOrdersHeader").text("Pending orders (" + pendingOrders.length + ")");

    $("#completedOrders").empty();

    var completedOrders = manager.completedOrders;
    for(var i = 0; i < completedOrders.length; i++)
    {
         $("#completedOrders").append(createOrderEntry(completedOrders[i].id));    
    }

    $("#completedOrdersHeader").text("Completed orders (" + completedOrders.length + ")");

    $("#orders-info-table").empty();
    $("#btnCancelOrder").css("display", "none"); 
    $("#lblCancelOrder").css("display", "none");   

    if(selectedId)
    {
        displayOrder(selectedId);
    }

    $(".orders-entry").click(function()
    {
        $(".orders-entry-selected").removeClass("orders-entry-selected");
        $(this).addClass("orders-entry-selected"); 

        $("#orders-info-table").empty();
        $("#btnCancelOrder").css("display", "none"); 
        $("#lblCancelOrder").css("display", "none");    

        var id = $(this).data("order-id");
        
        displayOrder(id);
    });

    updateSelectedRobot();

    function createOrderEntry(id)
    {
        var el = $("<div class='orders-entry ' data-order-id='" + id + "'>Order #" + id + "</div>");

        if(id == selectedId)
        {
            $(el).addClass("orders-entry-selected");
        }

        return el;
    }

    function displayOrder(id)
    {
        for(var i = 0; i < manager.awaitingOrders.length; i++)
        {
             if(manager.awaitingOrders[i].id == id)
             {
                 selectedOrder = manager.awaitingOrders[i];
                 displayAwaitingOrder(manager.awaitingOrders[i]);
                 return;
             }
        }   

        for(var i = 0; i < manager.pendingOrders.length; i++)
        {
             if(manager.pendingOrders[i].id == id)
             {
                 selectedOrder = manager.pendingOrders[i];
                 displayPendingOrder(manager.pendingOrders[i]);
                 return;
             }
        }   

        for(var i = 0; i < manager.completedOrders.length; i++)
        {
             if(manager.completedOrders[i].id == id)
             {
                 selectedOrder = manager.completedOrders[i];
                 displayCompletedOrder(manager.completedOrders[i]);
                 return;
             }
        }  
    }

    function displayAwaitingOrder(order)
    {
        var itemsInfo = order.getItemsInfo();
         
        for(var key in itemsInfo)
        {
            addTableEntry(itemsInfo[key].itemType.name, itemsInfo[key].quantity, null, "");
        }

        $("#btnCancelOrder").css("display", "block");
    }

    function displayPendingOrder(order)
    {
        var items = order.getItems();
        
        for(var j = 0; j < items.length; j++)
        {
            var status;
            var picker = items[j].picker;
            var pickerName = null;
            if(items[j].transferData == null)
            {
                if(picker != null)
                {
                    pickerName = picker.name;

                    if(items[j].delivered == true)
                    {
                        status = "delivered";
                    }
                    else
                    {
                       if(picker.backpack.indexOf(items[j]) != -1)
                       {
                           status = "carried";
                       }
                       else if(items[j].order.cancelled == false)
                       {
                           status = "will be picked";
                       }
                       else if(items[j].returned == true)
                       {
                           status = "returned";
                       }
                       else
                       {
                           status = "pickup abandoned";
                       }
                    }    
                }
                else
                {
                    status = "unassigned"
                }
            }
            else
            {
                if(items[j].transferData.replaceWith != undefined)
                {
                    pickerName = items[j].transferData.replaceWith.picker.name;
                    
                    status = "fill in from order #" + items[j].transferData.replaceWith.order.id + "<br>";
                    if(pickerName != items[j].transferData.receivingRobot.name)
                    {
                        status += makeRobotLink(items[j].transferData.passingRobot.name) + " will pass to " + makeRobotLink(items[j].transferData.receivingRobot.name);
                    }
                    else
                    {
                        status += makeRobotLink(items[j].transferData.passingRobot.name) + " passed to " + makeRobotLink(items[j].transferData.receivingRobot.name);
                    }
                }
                else
                {
                    pickerName = items[j].picker.name;

                    status = "transfer to order #" + items[j].transferData.replacing.order.id + "<br>";
                    if(pickerName != items[j].transferData.receivingRobot.name)
                    {
                        status += makeRobotLink(items[j].transferData.receivingRobot.name) + " will receive from " + makeRobotLink(items[j].transferData.passingRobot.name);
                    }
                    else
                    {
                        status += makeRobotLink(items[j].transferData.receivingRobot.name) + " received from " + makeRobotLink(items[j].transferData.passingRobot.name);
                    }
                }
            }
        
            addTableEntry(items[j].getClass(), 1, pickerName, status);
        }
           
        if(order.cancelled == false)
        {
            var containsTransfers = false;
            for(var i = 0; i < order.items.length; i++)
            {
                if(order.items[i].transferData != null)
                {
                    containsTransfers = true;
                }
            }

            if(containsTransfers == false)
            {
                $("#btnCancelOrder").css("display", "block");
            }
            else
            {
                $("#lblCancelOrder").text("Cannot cancel - order contains transfers");
                $("#lblCancelOrder").css("display", "block");
            }
        }
        else
        {
            $("#lblCancelOrder").text("Cancelled");
            $("#lblCancelOrder").css("display", "block");
        }                  
    }

    function displayCompletedOrder(order)
    {
        var items = order.getItems();

        if(order.cancelled == false)
        {
            for(var j = 0; j < items.length; j++)
            {
                if(items[j].transferData == null)
                {
                    addTableEntry(items[j].getClass(), 1, items[j].picker.name, "delivered");
                }
                else
                {
                    pickerName = items[j].transferData.replaceWith.picker.name;

                    status = "filled in from order #" + items[j].transferData.replaceWith.order.id + "<br>";
                    status += makeRobotLink(items[j].transferData.passingRobot.name) + " passed to " + makeRobotLink(items[j].transferData.receivingRobot.name);                    
                
                    addTableEntry(items[j].getClass(), 1, pickerName, status);
                }        
            }
        }   
        else
        {
            for(var j = 0; j < items.length; j++)
            {
                if(items[j].transferData == null)
                {
                    var pickerName = null, status = "unassigned";

                    if(items[j].picker != null)
                    {
                        pickerName = items[j].picker.name;

                        if(items[j].delivered == true)
                        {
                            status = "delivered";
                        }
                        else if(items[j].returned == true)
                        {
                            status = "returned";
                        }
                        else
                        {
                            status = "pickup abandoned";
                        }
                    }
                }
                else
                {
                    pickerName = items[j].picker.name;

                    status = "transferred to order #" + items[j].transferData.replacing.order.id + "<br>";
                    status += makeRobotLink(items[j].transferData.receivingRobot.name) + " received from " + makeRobotLink(items[j].transferData.passingRobot.name);                   
                }

                addTableEntry(items[j].getClass(), 1, pickerName, status);
            }            

            $("#lblCancelOrder").text("Cancelled");
            $("#lblCancelOrder").css("display", "block");
        }          
    }

    function addTableEntry(itemName, quantity, pickerName, status)
    {
        if(pickerName != null)
        {
            pickerName = makeRobotLink(pickerName);
        }
        else
        {
            pickerName = "";
        }

        $("#orders-info-table").append("<tr><td class='text-center'>" + makeItemLink(itemName) +"</td><td class='text-center'>" + quantity + "</td>"
                                     + "<td class='text-center'>" + pickerName + "</td><td class='text-center'>" + status + "</td></tr>");
    }
}

var cancelOrder = function()
{
    manager.cancelOrder(selectedOrder);
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

    $("#robotAwayToCollect").empty();
    $("#robotAwayToCollect").append(makeItemsString(robot.returnItemsToCollect()));
    $("#robotAwayToReceive").empty();
    $("#robotAwayToReceive").append(makeItemsString(robot.returnItemsToReceive()));
    $("#robotCollected").empty();
    $("#robotCollected").append(makeItemsString(robot.returnItemsCollected()));
    $("#robotAwayToPass").empty();
    $("#robotAwayToPass").append(makeItemsString(robot.returnItemsToPass()));
    $("#robotAwayToReturn").empty();
    $("#robotAwayToReturn").append(makeItemsString(robot.returnItemsToReturn()));

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
    $("#itemPopularity").text(item.popularity); 

    $("#itemCoordinates").text("(" + item.x + ", " + item.y + ")");
}

var updateSelectedRobot = function()
{
    selectRobot(selectedRobot);
}

var createRandomOrders = function()
{
    var newOrders = [];
    var orderCount = randInt(1, 10);

    console.log(orderCount)

    for(var i = 0; i < orderCount; i++)
    {
        var order = createRandomOrder();
        newOrders.push(order);
    }

    return newOrders;
}

var createRandomOrder = function()
{
    var order = new Order();

    var itemsCount = randInt(1, 10);

    for(var i = 0; i < itemsCount; i++)
    {
        var index = randInt(0, popularityTable.length - 1);
        order.add(popularityTable[index], 1);
    }

    order.finalize(getItemSource);

    return order;
}

var itemsRandomLocation = []
var itemsPopularityBasedLocation = []
var itemsInit = function()
{
    applyPopularityToItems();

    for(var i = 0; i < items.length; i++)
    {
        itemsRandomLocation[i] = { x : items[i].x, y : items[i].y }
    }

    var itemsByDistances = getItemLocationsByDistanceFromDepot();

    var itemsByPopularity = items.slice();
    itemsByPopularity.sort(function(itemA, itemB)
    {
        return itemA.popularity * itemA.weight - itemB.popularity * itemB.weight;
    });

    for(var i = 0; i < items.length; i++)
    {
        for(var j = 0; j < itemsByPopularity.length; j++)
        {
            if(items[i] == itemsByPopularity[j])
            {
                itemsPopularityBasedLocation[i] = { x : itemsByDistances[j].x, y : itemsByDistances[j].y }
            }
        }
    }
}

var getItemLocationsByDistanceFromDepot = function()
{
    var itemLocations = items.slice();
    var distance = {}

    for(var i = 0; i < itemLocations.length; i++)
    {
        distance[itemLocations[i].getClass()] = aStar.searchUnrestricted(itemLocations[i], depot).cost;
    }

    // sort descending
    itemLocations.sort(function(itemA, itemB)
    {
        return distance[itemB.getClass()] - distance[itemA.getClass()];
    });

    for(var i = 0; i < itemLocations.length; i++)
    {
        itemLocations[i] = { x : itemLocations[i].x, y: itemLocations[i].y}
    }

    return itemLocations;
}

var placeItemsRandom = function()
{
    for(var i = 0; i < items.length; i++)
    {
        items[i].move(itemsRandomLocation[i].x, itemsRandomLocation[i].y);
    }    
}

var placeItemsByPopularity = function()
{
    for(var i = 0; i < items.length; i++)
    {
        items[i].move(itemsPopularityBasedLocation[i].x, itemsPopularityBasedLocation[i].y);
    }
}

var popularityTable;
var popularitySum;
var applyPopularityToItems = function()
{
    popularityTable = []

    var popularitySum = 0;
    for(var i = 0; i < ItemTypes.length; i++)
    {
        var popularity = randInt(1, 100);
        ItemTypes[i].prototype.popularity = popularity;
        popularitySum += popularity;
    } 

    var currentIndex = 0;
    for(var i = 0; i < ItemTypes.length; i++)
    {
        for(var j = 0; j < ItemTypes[i].prototype.popularity; j++)
        {
            popularityTable[currentIndex + j] = ItemTypes[i];
        }

        currentIndex += ItemTypes[i].prototype.popularity;
        
        ItemTypes[i].prototype.popularity /= popularitySum;
        ItemTypes[i].prototype.popularity *= 100;
        ItemTypes[i].prototype.popularity = ItemTypes[i].prototype.popularity.toFixed(2);
    }
}