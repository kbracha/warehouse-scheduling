
var WarehouseManager = function(depot, robots)
{
    this.robots = robots;
    this.depot = depot;

    this.awaitingOrders = [];
    this.pendingOrders = [];
    this.completedOrders = []

    this.awaitingAssignments = [];
    this.pendingAssignments = [];
    this.completedAssignments = [];
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
        items = items.concat(this.awaitingOrders[i].createItems(getItemSource));
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

                break;
            }

            j++;
        }

        j++;
    }    
}

WarehouseManager.prototype.assignItemsToRobot = function(robot, items)
{
    for(var i = 0; i < items.length; i++)
    {
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
}

WarehouseManager.prototype.acknowledgeOrder = function(order)
{
    this.awaitingOrders.push(order);
}

WarehouseManager.prototype.receiveItem = function(order)
{
    this.awaitingOrders.push(order);
}