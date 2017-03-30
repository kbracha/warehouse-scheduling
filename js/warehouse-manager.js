
var WarehouseManager = function(depot, robots)
{
    this.robots = robots;
    this.depot = depot;
    this.vrpFunction = null;
    this.tspFunction = null;
    this.useTwoOpt = false;
    this.alwaysCooperate = true;

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

        robots[i].itemPassed = function(item)
        {
            self.raiseEvent(self.ordersUpdated);
        }

        robots[i].itemReceived = function(item)
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

    this.checkCooperation();
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
            console.log(assignmentPairs[i])
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

    cost += aStar.searchUnrestricted(result.tail, robot.depotStand).cost;
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
            this.completedOrders.push(order);
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
        items = this.runTsp(robot, items);         
    }

    for(var i = 0; i < items.length; i++)
    {
        if(items[i].transferData != null)
        {
            if(items[i].order.cancelled == true)
            {
                robot.addJob(new GoToDestinationJob(items[i].transferData.passingRobotLocation));
                robot.addJob(new PassItemJob(items[i]));
            }
            else
            {
                robot.addJob(new GoToDestinationJob(items[i].transferData.receivingRobotLocation));
                robot.addJob(new ReceiveItemJob(items[i])); 
            }
        }
        else
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

WarehouseManager.prototype.runTsp = function(robot, items)
{
    items = this.tspFunction(robot, items);

    if(this.useTwoOpt == true)
    {
        items = twoOpt.deploy(items, robot);
    }  

    return items;
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
    var itemsToReturnOrPass = [];
    for(var i = 0; i < itemsCollected.length; i++)
    {
        if(itemsCollected[i].order.cancelled == true)
        {
            itemsToReturnOrPass.push(itemsCollected[i]);
            itemsCollected.splice(i, 1);
            i--;
        }
    }

    var itemsToReceive = robot.returnItemsToReceive();
    var items = itemsToCollect.concat(itemsToReturnOrPass).concat(itemsToReceive);

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

WarehouseManager.prototype.checkCooperation = function()
{
    var canPassRobots = [], canReceiveRobots = [];
    for(var i = 0; i < this.robots.length; i++)
    {
        if(this.canPassItems(this.robots[i]) == true)
        {
            canPassRobots.push(this.robots[i]);
        }

        if(this.canReceiveItems(this.robots[i]) == true)
        {
            canReceiveRobots.push(this.robots[i]);
        }
    }

    var matches;
    do
    {
        matches = [];

        for(var i = 0; i < canPassRobots.length; i++)
        {
            var passingRobot = canPassRobots[i];

            for(var j = 0; j < canReceiveRobots.length; j++)
            {
                var receivingRobot = canReceiveRobots[j];

                if(receivingRobot == passingRobot)
                {
                    continue;
                }

                var itemsToReturn = passingRobot.returnItemsToReturn().slice();
                var itemsToReceive = receivingRobot.returnItemsToCollect().slice();

                // look for pairs that can pass items from one to another
                var matchedItemsToReturn = [];
                var matchedItemsToReceive = [];
                for(var k = 0; k < itemsToReturn.length; k++)
                {
                    for(var m = 0; m < itemsToReceive.length; m++)
                    {
                        if(itemsToReturn[k].getClass() == itemsToReceive[m].getClass())
                        {
                            matchedItemsToReturn.push(itemsToReturn[k]);
                            itemsToReturn.splice(k, 1);

                            matchedItemsToReceive.push(itemsToReceive[m]);
                            itemsToReceive.splice(m, 1);
                        
                            k--;
                            break;
                        }
                    }
                }

                if(matchedItemsToReturn.length > 0)
                {
                    console.log(passingRobot);
                    console.log(receivingRobot);
                    console.log(matchedItemsToReturn);
                    console.log(matchedItemsToReceive);

                    var passingRobotOriginalJobs = passingRobot.jobQueue.slice();
                    var receivingRobotOriginalJobs = receivingRobot.jobQueue.slice();

                    var defectCost = this.calculateJobsCost(passingRobot.jobQueue, passingRobot);
                    defectCost += this.calculateJobsCost(receivingRobot.jobQueue, receivingRobot);
                    console.log("defect cost " + defectCost);

                    var passingRobotJobs = passingRobot.jobQueue.slice();
                    var receivingRobotJobs = receivingRobot.jobQueue.slice();

                    this.removeItemJobs(passingRobotJobs, matchedItemsToReturn);
                    this.removeItemJobs(receivingRobotJobs, matchedItemsToReceive);

                    var rendezVousPositions = this.findRendezVousPositions(passingRobot, receivingRobot);
                    
                    // if the robot was about to collect/return an object make it face the object again
                    if(passingRobotJobs[0] instanceof CollectItemJob || passingRobotJobs[0] instanceof ReturnItemJob)
                    {
                        passingRobotJobs.unshift(new FaceObjectJob(passingRobotJobs[0].item));
                    }
                    // if the robot was about to face an object make it come back to that object again
                    if(passingRobotJobs[0] instanceof FaceObjectJob)
                    {
                        passingRobotJobs.unshift(new GoNextToDestinationJob(passingRobotJobs[0].object));
                    }
                   
                    for(var k = 0; k < matchedItemsToReturn.length; k++)
                    {
                        matchedItemsToReturn[k].transferData = 
                        {
                            passingRobot : passingRobot,
                            receivingRobot : receivingRobot,
                            dropoff : rendezVousPositions["dropoff"],
                            passingRobotLocation : rendezVousPositions[passingRobot.name],
                            receivingRobotLocation : rendezVousPositions[receivingRobot.name],
                            replacing : matchedItemsToReceive[k]
                        }

                        passingRobotJobs.unshift(new PassItemJob(matchedItemsToReturn[k]));
                    }

                    passingRobotJobs.unshift(new FaceObjectJob(rendezVousPositions["dropoff"])); 
                    passingRobotJobs.unshift(new GoToDestinationJob(rendezVousPositions[passingRobot.name]));

                    // if the robot was about to collect/return an object make it face the object again
                    if(receivingRobotJobs[0] instanceof CollectItemJob || receivingRobotJobs[0] instanceof ReturnItemJob)
                    {
                        receivingRobotJobs.unshift(new FaceObjectJob(receivingRobotJobs[0].item));
                    }
                    // if the robot was about to face an object make it come back to that object again
                    if(receivingRobotJobs[0] instanceof FaceObjectJob)
                    {
                        receivingRobotJobs.unshift(new GoNextToDestinationJob(receivingRobotJobs[0].object));
                    }

                    for(var k = 0; k < matchedItemsToReceive.length; k++)
                    {
                        matchedItemsToReceive[k].transferData = 
                        {
                            passingRobot : passingRobot,
                            receivingRobot : receivingRobot,
                            dropoff : rendezVousPositions["dropoff"],
                            passingRobotLocation : rendezVousPositions[passingRobot.name],
                            receivingRobotLocation : rendezVousPositions[receivingRobot.name],
                            replaceWith : matchedItemsToReturn[k]
                        }

                        receivingRobotJobs.unshift(new ReceiveItemJob(matchedItemsToReceive[k]));                      
                    }

                    receivingRobotJobs.unshift(new FaceObjectJob(rendezVousPositions["dropoff"])); 
                    receivingRobotJobs.unshift(new GoToDestinationJob(rendezVousPositions[receivingRobot.name]));

                    console.log(receivingRobotJobs)

                    var coopCost = this.calculateJobsCost(passingRobotJobs, passingRobot);
                    coopCost += this.calculateJobsCost(receivingRobotJobs, receivingRobot);

                    console.log("coop cost " + coopCost);

                    var cooperationData = 
                    {
                        matchedItemsToReturn : matchedItemsToReturn,
                        matchedItemsToReturnTransferData : 
                    };
                    
                    //if(coopCost < defectCost)
                    {
                        //for(var k = 0; k < matchedItemsToReceive.length; k++)
                        //{
                        //    matchedItemsToReceive[k].picker = null;
                        //}

                        passingRobot.clearJobs();
                        passingRobot.jobQueue = passingRobotJobs;
                        receivingRobot.clearJobs();
                        receivingRobot.jobQueue = receivingRobotJobs;
                        canReceiveRobots.splice(j, 1);

                        this.raiseEvent(this.ordersUpdated);

                        break;
                    }

   
                    /*
                    var passingRobotSpots = this.getSpotsFromJobs(passingRobotJobs);
                    var receivingRobotSpots = this.getSpotsFromJobs(receivingRobotJobs);
                    passingRobotSpots[passingRobotSpots.length - 1] = rendezVousPositions[passingRobot];
                    receivingRobotSpots[receivingRobotSpots.length - 1] = rendezVousPositions[receivingRobot];

                    // <should be hamiltonian path not tsp> 
                    passingRobotSpots = this.runTsp(passingRobot, passingRobotSpots);
                    receivingRobotSpots = this.runTsp(receivingRobot, receivingRobotSpots);
                    */
                    
                }
            }
        }        
    }
    while(matches.length > 0);
}

WarehouseManager.prototype.getSpotsFromJobs = function(jobs)
{
    var spots = [];
    for(var i = 0; i < jobs.length; i++)
    {
        if(jobs[i] instanceof GoNextToDestinationJob || jobs[i] instanceof GoToDestinationJob)
        {
            spots.push(jobs[i].destination);
        }
    }
    return spots;
}

WarehouseManager.prototype.removeItemJobs = function(jobs, items)
{
    for(var i = 0; i < items.length; i++)
    {
        for(var j = 0; j < jobs.length; j++)
        {
            if(jobs[j].item == items[i])
            {
                if(jobs[j] instanceof ReturnItemJob || jobs[j] instanceof CollectItemJob)
                {
                    // 3 jobs per item: GoNextToDestinationJob, FaceObjectJob, ReturnItemJob/CollectItemJob
                    if(j > 1)
                    {
                        jobs.splice(j - 2, 3);
                        j -= 3;
                    }
                    else if(j == 1)
                    {
                        jobs.splice(j - 1, 2);
                        j -= 2;
                    }
                    else
                    {
                        jobs.splice(j, 1);
                        j -= 1;
                    }
                    //else if(jobs[j] instanceof DeliverItemJob)
                }
                
                break;
            }
        }
    }
}

WarehouseManager.prototype.findRendezVousPositions = function(robotA, robotB)
{
    var positions = {}

    if(chessboardDistance(robotA, robotB) == 0)
    {   
        positions[robotA.name] = {x : robotA.x, y: robotA.y}
        positions[robotB.name] = {x : robotB.x, y: robotB.y}
        return positions;
    }

    var result = aStar.searchUnrestricted(robotA, robotB);
    var halfwayPoint = result.cost / 2 - 2;
    var node = result.node;

    for(var i = 0; i < halfwayPoint; i++)
    {
        node = node.child;
    }

    positions[robotA.name] = {x : node.x, y: node.y} 

    node = node.child;
    positions["dropoff"] = {x : node.x, y: node.y};

    node = node.child;
    positions[robotB.name] = {x : node.x, y: node.y};
    
    return positions;
}

WarehouseManager.prototype.calculateJobsCost = function(jobs, robot)
{
    var locations = [];
    var searchfunctions = []
    for(var i = 0; i < jobs.length; i++)
    {
        if(jobs[i] instanceof GoNextToDestinationJob)
        {
            locations.push(jobs[i].destination);
            searchfunctions.push(aStar.searchUnrestrictedNextTo);
        }
        else if(jobs[i] instanceof GoToDestinationJob)
        {
            locations.push(jobs[i].destination);
            searchfunctions.push(aStar.searchUnrestricted);
        }
    }

    var cost = 0;
    var result = null;

    if(locations.length != 0)
    {
        result = searchfunctions[0](robot, locations[0]);
        cost += result.cost;
    }

    for(var j = 1; j < locations.length; j++)
    {
        result = searchfunctions[j](result.tail, locations[j]);
        cost += result.cost;
    }

    if(robot.returnItemsToDeliver().length != 0)
    {
        if(result != null)
        {
            cost += aStar.searchUnrestricted(result.tail, robot.depotStand).cost;
        }
        else
        {
            cost += aStar.searchUnrestricted(robot, robot.depotStand).cost;
        }
    }
    
    return cost;    
}

WarehouseManager.prototype.canPassItems = function(robot)
{
    if(robot.hasRendezVous() == false && robot.returnItemsToReturn().length != 0)
    {
        return true;
    }
    else
    {
        return false;
    }
}

WarehouseManager.prototype.canReceiveItems = function(robot)
{
    if(robot.hasRendezVous() == false && robot.returnItemsToCollect().length != 0)
    {
        return true;
    }
    else
    {
        return false;
    }
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
