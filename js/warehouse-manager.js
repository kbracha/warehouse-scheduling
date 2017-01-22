
var WarehouseManager = function(depot, robots)
{
    this.robots = robots;
    this.depot = depot;

    var self = this;
    for(var i = 0; i < robots.length; i++)
    {
        robots[i].itemDelivered = function(item) 
        {
            self.receiveItem(item);
        } 
    }

    this.awaitingOrders = [];
    this.pendingOrders = [];
    this.completedOrders = []

    this.awaitingAssignments = [];
    this.pendingAssignments = [];
    this.completedAssignments = [];

    this.ordersUpdated = null;
}

WarehouseManager.prototype.makeAction = function()
{
    if(this.awaitingOrders.length != 0)
    {
        this.handleAwaitingOrders();
    }

    if(this.awaitingAssignments.length != 0)
    {
        this.handleAwaitingAssignments();
    }
}

WarehouseManager.prototype.handleAwaitingOrders = function()
{
    var items = [];

    console.log("Manager: processing " + this.awaitingOrders.length + " awaiting order(s)");

    for(var i = 0; i < this.awaitingOrders.length; i++)
    {
        items = items.concat(this.awaitingOrders[i].getItems());
        this.pendingOrders.push(this.awaitingOrders[i]);
    }

    console.log("Manager: found " + items.length + " items to deliver");

    this.awaitingOrders = [];

    var assignments = []
    if(items.length > 0)
    {
        assignments = clarkeWrightSavings(this.depot, items, Robot.capacity);
        this.awaitingAssignments = this.awaitingAssignments.concat(assignments);
    }

    console.log("Manager: Created " + assignments.length + " assignments");
}

WarehouseManager.prototype.handleAwaitingAssignments = function()
{
    var updated = false;
    var j = 0;
    while(this.awaitingAssignments.length != 0 && j < this.robots.length)
    {
        var assignment = this.awaitingAssignments[0];

        while(j < this.robots.length)
        {
            if(this.robots[j].isBusy() == false)
            {
                this.assignItemsToRobot(this.robots[j], assignment.items);
                
                this.awaitingAssignments.splice(0, 1);
                this.pendingAssignments.push(assignment);

                updated = true;

                break;
            }

            j++;
        }

        j++;
    }    

    if(updated)
    {
        console.log("updated")
        console.log(this.awaitingAssignments.length)
        this.raiseEvent(this.ordersUpdated);
    }
}

WarehouseManager.prototype.assignItemsToRobot = function(robot, items)
{
    for(var i = 0; i < items.length; i++)
    {
        items[i].picker = robot;

        robot.addJob(new GoNextToDestinationJob(items[i]))
        robot.addJob(new FaceObjectJob(items[i]));
        robot.addJob(new CollectItemJob(items[i]));
    }   

    var robotLocation = 
    {
        x : robot.x,
        y : robot.y
    }    

    robot.addJob(new GoToDestinationJob(robotLocation)) 
    for(var i = 0; i < items.length; i++)
    {
        robot.addJob(new FaceObjectJob(robot.depot));
        robot.addJob(new DeliverItemJob(items[i]));
    }  
}

WarehouseManager.prototype.acknowledgeOrder = function(order)
{
    console.log("Manager: received an order with " + order.getCount() + " items weighing total " + order.getWeight())
    this.awaitingOrders.push(order);

    this.raiseEvent(this.ordersUpdated);
}

WarehouseManager.prototype.receiveItem = function(item)
{
    console.log("delivered");
    item.delivered = true;

    var pending = false;
    var order = item.order;
    var items = order.getItems();
    for(var i = 0; i < items.length; i++)
    {
        if(items[i].delivered == false)
        {
            pending = true;
            break;
        }
    }

    if(pending == false)
    {
        var index = this.pendingOrders.indexOf(order);
        this.pendingOrders.splice(index, 1);

        this.completedOrders.push(order);
    }

    this.raiseEvent(this.ordersUpdated);
}

WarehouseManager.prototype.raiseEvent = function(event)
{
    if(event != null)
    {
        event();
    }
}