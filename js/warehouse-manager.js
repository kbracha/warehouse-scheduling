
var WarehouseManager = function(depot, robots)
{
    this.robots = robots;
    this.depot = depot;
    this.algorithm = clarkeWrightSavings;

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

WarehouseManager.prototype.setAlgorithm = function(algorithmFunction)
{
    this.algorithm = algorithmFunction;
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
        assignments = this.algorithm(this.depot, items, Robot.capacity);

        this.awaitingAssignments = this.awaitingAssignments.concat(assignments);
    }

    console.log("Manager: Created " + assignments.length + " assignments");
}

WarehouseManager.prototype.handleAwaitingAssignments = function()
{
    var availableRobots = this.getAvailableRobots();
    var j = 0;

    if(this.awaitingAssignments.length == 0 || availableRobots.length == 0)
    {
        return;
    }

    var assignments = this.awaitingAssignments.splice(0, availableRobots.length);
    assignments.sort(function(assignmentA, assignmentB)
    {
        return assignmentA.items[0].x - assignmentB.items[0].x;
    });
    
    while(assignments.length > 0)
    {
        var assignment = assignments[0];
        var index = findClosestRobotIndex(assignment.items[0], availableRobots);

        if(index + assignments.length - 1 < availableRobots.length)
        {
            this.assignItemsToRobot(availableRobots[index], assignment.items);
        }
        else
        {
            index = assignments.length - availableRobots.length;
            this.assignItemsToRobot(availableRobots[index], assignment.items);
        }

        assignments.splice(0, 1);
        availableRobots.splice(index, 1);
        this.pendingAssignments.push(assignment);
    }    

    function findClosestRobotIndex(item, robots)
    {
        var minDist = Number.MAX_VALUE;
        var index = 0;
        for(var i = 0; i < robots.length; i++)
        {
            var dist = aStarSearchTo(robots[i], item, robots[i]).cost;
            if(dist && dist < minDist)
            {
                minDist = dist;
                index = i;
            }
        }

        return index;
    }

    this.raiseEvent(this.ordersUpdated);
}

WarehouseManager.prototype.getAvailableRobots = function()
{
    var availableRobots = [];

    for(var i = 0; i < this.robots.length; i++)
    {
        if(this.robots[i].isBusy() == false)
        {
            availableRobots.push(this.robots[i]);
        }
    }

    return availableRobots;
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