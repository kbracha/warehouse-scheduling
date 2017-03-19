
var WarehouseManager = function(depot, robots)
{
    this.robots = robots;
    this.depot = depot;
    this.vrpFunction = null;
    this.tspFunction = null;
    this.useTwoOpt = false;

    var self = this;
    for(var i = 0; i < robots.length; i++)
    {
        robots[i].itemDelivered = function(item) 
        {
            self.receiveItem(item);
        } 

        robots[i].itemReturned = function(item)
        {
            item.returned = true;
            self.raiseEvent(self.ordersUpdated);
        }

        robots[i].itemCollected = function(item)
        {
            self.raiseEvent(self.ordersUpdated);
        }
    }

    this.awaitingOrders = [];
    this.pendingOrders = [];
    this.completedOrders = []
    this.cancelledOrders = []

    this.awaitingAssignments = [];
    this.pendingAssignments = [];
    this.completedAssignments = [];

    this.ordersUpdated = null;
}

WarehouseManager.prototype.setVrpFunction = function(vrp)
{
    this.vrpFunction = vrp;
}

WarehouseManager.prototype.setTspFunction = function(tsp)
{
    this.tspFunction = tsp;
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

    this.handleCancelledOrders();
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
        assignments = this.vrpFunction(this.depot, items, Robot.capacity, this.tspFunction);

        if(this.useTwoOpt == true)
        {
            for(var i = 0; i < assignments.length; i++)
            {
                assignments[i].items = twoOpt.deploy(assignments[i].items, this.depot);
            }
        }
        

        this.awaitingAssignments = this.awaitingAssignments.concat(assignments);

        var cost = 0;
        var assignmentPairs = this.pairAwaitingAssignmentsWithRobots();
        for(var i = 0; i < assignmentPairs.length; i++)
        {
            cost += this.calculateAssignmentCost(assignmentPairs[i].robot, assignmentPairs[i].assignment);
        }

        var unpairedAssignments = this.awaitingAssignments.slice();
        for(var i = 0; i < assignmentPairs.length; i++)
        {
            var index = unpairedAssignments.indexOf(assignmentPairs[i].assignment);
            unpairedAssignments.splice(index, 1);
        }

        for(var i = 0; i < unpairedAssignments.length; i++)
        {
            cost += this.calculateAssignmentCost(this.depot, unpairedAssignments[i]);
        }

        console.log("Estimated total cost: " + cost);
    }

    console.log("Manager: Created " + assignments.length + " assignments");
}

WarehouseManager.prototype.calculateAssignmentCost = function(robot, assignment)
{
    var cost = 0;
    var assItems = assignment.items;

    var result = aStar.searchUnrestrictedNextTo(robot, assItems[0]);
    cost += result.cost;

    for(var j = 1; j < assItems.length; j++)
    {
        result = aStar.searchUnrestrictedNextTo(result.tail, assItems[j]);
        cost += result.cost;
    }

    cost += aStar.searchUnrestricted(result.tail, robot).cost;
    return cost;
}

WarehouseManager.prototype.handleAwaitingAssignments = function()
{
    var assignmentPairs = this.pairAwaitingAssignmentsWithRobots();
    
    for(var i = 0; i < assignmentPairs.length; i++)
    {
        var assignment = assignmentPairs[i].assignment;
        this.assignItemJobsToRobot(assignmentPairs[i].robot, assignment.items);

        var index = this.awaitingAssignments.indexOf(assignment);
        this.awaitingAssignments.splice(index, 1);
        this.pendingAssignments.push(assignment);
    }    

    if(assignmentPairs.length != 0)
    {
        this.raiseEvent(this.ordersUpdated);
    }
}

WarehouseManager.prototype.cancelOrder = function(order)
{
    order.cancelled = true;

    for(var i = 0; i < this.awaitingOrders.length; i++)
    {
        if(this.awaitingOrders[i] == order)
        {
            this.awaitingOrders.splice(i, 1);
            this.raiseEvent(this.ordersUpdated);
            return;
        }
    }

    // tidy up awaiting assignments affected by order
    for(var i = 0; i < this.awaitingAssignments.length; i++)
    {
        var assignment = this.awaitingAssignments[i];

        for(var j = 0; j < assignment.items.length; j++)
        {
            var item = assignment.items[j];
            
            if(item.order.cancelled == true)
            {
                assignment.items.splice(j, 1);
                j--;
            }
        }

        if(assignment.items.length == 0)
        {
            this.awaitingAssignments.splice(i, 1);
            i--;
        }
    }

    // order is pending
    var involvedRobots = [];
    for(var i = 0; i < order.items.length; i++)
    {
        if(order.items[i].delivered == false)
        {
            var picker = order.items[i].picker;
            if(picker != null && involvedRobots.indexOf(picker) == -1)
            {
                involvedRobots.push(picker);
            }
        }
    }

    for(var i = 0; i < involvedRobots.length; i++)
    {
        this.rescheduleRobot(involvedRobots[i]);
    }

    this.raiseEvent(this.ordersUpdated);

    this.handleCancelledOrders();
}

WarehouseManager.prototype.handleCancelledOrders = function()
{
    var updated = false;

    for(var i = 0; i < this.pendingOrders.length; i++)
    {
        var order = this.pendingOrders[i];
        var hasCompleted = true;

        if(order.cancelled == true)
        {
            for(var j = 0; j < order.items.length; j++)
            {
                var item = order.items[j];
                if(item.picker != null && item.picker.backpack.indexOf(item) != -1)
                {
                    hasCompleted = false;
                }
            }

            if(hasCompleted == true)
            {
                this.pendingOrders.splice(i, 1);
                i--;
                this.completedOrders.push(order);
                updated = true;
            }
        }
    }

    if(updated)
    {
        this.raiseEvent(this.ordersUpdated);
    }
}

WarehouseManager.prototype.pairAwaitingAssignmentsWithRobots = function()
{
    var pairs = [];

    var availableRobots = this.getAvailableRobots();

    if(this.awaitingAssignments.length == 0 || availableRobots.length == 0)
    {
        return pairs;
    }

    var assignments = this.awaitingAssignments.slice();
    assignments = assignments.splice(0, availableRobots.length);
    assignments.sort(function(assignmentA, assignmentB)
    {
        return assignmentA.items[0].x - assignmentB.items[0].x;
    });
    
    while(assignments.length > 0)
    {
        var assignment = assignments[0];

        var index = this.findClosestRobotIndex(assignment.items[0], availableRobots);

        if(index + assignments.length - 1 >= availableRobots.length)
        {
            index = availableRobots.length - assignments.length;
        }
    
        pairs.push(
        {
            assignment : assignment,
            robot : availableRobots[index]
        })

        availableRobots.splice(index, 1);
        assignments.splice(0, 1);
    }

    return pairs;
}

WarehouseManager.prototype.findClosestRobotIndex = function(item, robots)
{
    var minDist = Number.MAX_VALUE;
    var index = 0;
    for(var i = 0; i < robots.length; i++)
    {
        var dist = aStar.search(robots[i], item, robots[i]).cost;
        if(dist && dist < minDist)
        {
            minDist = dist;
            index = i;
        }
    }

    return index;
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

WarehouseManager.prototype.assignItemJobsToRobot = function(robot, items)
{
    // robot has become free while not carrying any items and did not return to depo
    // run tsp over items assigned to him since his starting position is different 
    if(items.length > 1 && chessboardDistance(robot, robot.depotStand) != 0)
    {
        items = this.tspFunction(robot, items);

        if(this.useTwoOpt == true)
        {
            items = twoOpt.deploy(items, robot);
        }           
    }

    for(var i = 0; i < items.length; i++)
    {
        items[i].picker = robot;

        robot.addJob(new GoNextToDestinationJob(items[i]))
        robot.addJob(new FaceObjectJob(items[i]));

        if(items[i].order.cancelled == false)
        {
            robot.addJob(new CollectItemJob(items[i]));
        }
        else 
        {
            robot.addJob(new ReturnItemJob(items[i]));
        }
    }   

    robot.addJob(new GoToDestinationJob(robot.depotStand)) 
    robot.addJob(new FaceObjectJob(robot.depot));

    for(var i = 0; i < items.length; i++)
    {
        if(items[i].order.cancelled == false)
        {
            robot.addJob(new DeliverItemJob(items[i]));
        }
    }  
}

WarehouseManager.prototype.rescheduleRobot = function(robot)
{
    var itemsToCollect = robot.returnItemsToCollect();
    for(var i = 0; i < itemsToCollect.length; i++)
    {
        if(itemsToCollect[i].order.cancelled == true)
        {
            itemsToCollect.splice(i, 1);
            i--;
        }
    }

    var itemsCollected = robot.returnItemsCollected().slice();
    var itemsToReturn = [];
    for(var i = 0; i < itemsCollected.length; i++)
    {
        if(itemsCollected[i].order.cancelled == true)
        {
            itemsToReturn.push(itemsCollected[i]);
            itemsCollected.splice(i, 1);
            i--;
        }
    }

    var items = itemsToCollect.concat(itemsToReturn);

    robot.clearJobs();

    this.assignItemJobsToRobot(robot, items);    
    for(var i = 0; i < itemsCollected.length; i++)
    {
        robot.addJob(new DeliverItemJob(itemsCollected[i]));
    } 

    // check if the only thing the robot has to do
    // is to return to depot (with no items)
    if(robot.jobQueue.length == 2)
    {
        // if yes, free robot
        robot.clearJobs();
    }

    console.log(robot.jobQueue);   
}

WarehouseManager.prototype.acknowledgeOrder = function(order)
{
    console.log("Manager: received an order with " + order.getCount() + " items weighing total " + order.getWeight())
    this.awaitingOrders.push(order);

    this.raiseEvent(this.ordersUpdated);
}

WarehouseManager.prototype.receiveItem = function(item)
{
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

WarehouseManager.prototype.reset = function()
{
    this.awaitingOrders = [];
    this.pendingOrders = [];
    this.completedOrders = []

    this.awaitingAssignments = [];
    this.pendingAssignments = [];
    this.completedAssignments = [];

    this.raiseEvent(this.ordersUpdated);
}
