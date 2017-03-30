
var Robot = function(name)
{
    MobileObject.apply(this);

    this.collides = true;
    this.zIndex = 5;
    this.jobQueue = [];
    this.jobData = {};

// for fun purposes 
//  this.canvas = $.parseHTML("<div>" +
//                            "<div style='position: absolute; top: 0; left: 0; width:100%; height: 100%;'></div>"
//                            //+ "<div style='position: absolute; bottom: 0; left: 0; width: 30px; height: 30px; background-color: red'></div>"
//                            + "</div>") 
//  this.sprite = $(this.canvas).children().first();

    this.background = "transparent";
    this.setSpritePath('img/robot')

    this.width = 1;
    this.height = 1;

    if(name == undefined)
    {
        this.name = Robot.Names[Robot.count];
        Robot.count += 1;
    }

    this.backpack = [];
    this.depot = {x : -1, y : -1};
    this.depotStand = {x : -1, y : -1};

    this.itemDelivered = null;
    this.itemReturned = null;
    this.itemCollected = null;
    this.itemPassed = null;
    this.itemReceived = null;

    this.steps = 0; 
}


extend(Robot, MobileObject);

Robot.count = 0;
Robot.capacity = 50;

Robot.prototype.addJob = function(job)
{
    this.jobQueue.push(job);
} 

Robot.prototype.makeAction = function()
{
    if(this.isMoving == true)
    {
        this.continueMove();
        return true;
    }

    if(this.jobQueue.length == 0)
    {
        return false;
    }

    var job = this.jobQueue[0];

    if(job instanceof GoToDestinationJob || job instanceof GoNextToDestinationJob)
    {
        if(!this.handleGoToDestinationJob(job))
        {
            return this.makeAction();
        }
    }
    else if(job instanceof FaceObjectJob)
    {
        if(!this.handleFaceObjectJob(job))
        {
            return this.makeAction();
        }
    }
    else if(job instanceof CollectItemJob)
    {
        this.handleCollectItemJob(job);
    }
    else if(job instanceof DeliverItemJob)
    {
        this.handleDeliverItemJob(job);
    }
    else if(job instanceof ReturnItemJob)
    {
        this.handleReturnItemJob(job);
    }
    else if(job instanceof PassItemJob)
    {
        this.handlePassItemJob(job);
    }
    else if(job instanceof ReceiveItemJob)
    {
        this.handleReceiveItemJob(job);
    }

    return true;
}

Robot.prototype.handleGoToDestinationJob = function(job)
{
    var requiredAction = true;
    var desiredDistance = 1;
    if(job instanceof GoToDestinationJob)
    {
        desiredDistance = 0;
    }

    var distance = this.getDistance(job.destination);

    if(distance != desiredDistance)
    {
        // check whether the job just started or it was not possible before to find a path
        if(!this.jobData.node)
        {
            // if not try to calculate a new path
            this.jobData.node = job.searchFunction(this, job.destination).node;
        } 
        // check whether the previously calculated node is now free to step on 
        else if(this.canMove(this.jobData.node.x, this.jobData.node.y) == false)
        {
            // if not try to calculate a new path
            this.jobData.node = job.searchFunction(this, job.destination).node;
        }

        // if the node is still null then the move is currently not possible
        if(this.jobData.node)
        {
            this.move(this.jobData.node.x, this.jobData.node.y);
            this.jobData.node = this.jobData.node.child;
            distance = this.getDistance(job.destination);
        }
    }
    else
    {
        requiredAction = false;
    }

    if(distance == desiredDistance)
    {
        this.completeJob();
    }

    return requiredAction;
}

Robot.prototype.handleFaceObjectJob = function(job)
{
    var object = job.object;
    var actionRequired = true;
    var direction = Direction.South;

    if(this.x - job.object.x < 0)
    {
        direction = Direction.East;
    }
    else if(this.x - job.object.x > 0)
    {
        direction = Direction.West;
    }
    else if(this.y - job.object.y < 0)
    {
        direction = Direction.North;
    }

    if(this.direction != direction)
    {
        this.faceDirection(direction);
    }
    else
    {
        actionRequired = false;
    }

    this.completeJob();

    return actionRequired;
}

Robot.prototype.handleCollectItemJob = function(job)
{
    this.backpack.push(job.item);

    this.completeJob();

    this.raiseEvent(this.itemCollected, job.item);
}

Robot.prototype.handleReturnItemJob = function(job)
{
    var index = this.backpack.indexOf(job.item);
    this.backpack.splice(index, 1);

    this.completeJob(); 

    this.raiseEvent(this.itemReturned, job.item);   
}

Robot.prototype.handleDeliverItemJob = function(job)
{
    this.dropItem(job.item, this.depot.x, this.depot.y);

    this.completeJob();

    this.raiseEvent(this.itemDelivered, job.item);
}

Robot.prototype.handlePassItemJob = function(job)
{
    var item = job.item;
    var objects = graphicsManager.getObjectsAt(item.transferData.receivingRobotLocation.x, item.transferData.receivingRobotLocation.y);

    for(var i = 0; i < objects.length; i++)
    {
        if(objects[i] == item.transferData.receivingRobot)
        {
            item.picker = null;
            this.dropItem(item, item.transferData.dropoff.x, item.transferData.dropoff.y);
        
            this.completeJob();
            
            this.raiseEvent(this.itemPassed, item);
        }
    }
}

Robot.prototype.handleReceiveItemJob = function(job)
{
    var item = job.item.transferData.replaceWith;

    var items = graphicsManager.getObjectsAt(item.transferData.dropoff.x, item.transferData.dropoff.y);
    for(var i = 0; i < items.length; i++)
    {
        if(items[i] == item)
        {
            if(this.jobData.waitedTurns == undefined)
            {
                this.jobData.waitedTurns = 0;
            }
            else if(this.jobData.waitedTurns == 1)
            {
                item.picker = this;

                graphicsManager.remove(item);
                this.backpack.push(job.item);

                this.raiseEvent(this.itemReceived, job.item);                

                this.completeJob()
            }

            this.jobData.waitedTurns++;
            break;
        }
    }
}

Robot.prototype.completeJob = function()
{
    this.jobQueue.splice(0, 1);
    this.jobData = {};
}

Robot.prototype.createMark = function(x, y)
{
    return new Mark(this.name[0], x , y);
}

Robot.prototype.generateRouteMarks = function()
{
    var marks = [];
    var startLocation = this;

    for(var i = 0; i < this.jobQueue.length; i++)
    {
        var job = this.jobQueue[i];

        if(job instanceof GoToDestinationJob || job instanceof GoNextToDestinationJob)
        {
            var node = job.searchFunction(startLocation, job.destination, this).node;

            while(node != null)
            {
                marks.push(this.createMark(node.x, node.y))
                startLocation = node;
                node = node.child;
            }

            if(startLocation == null)
            {
                break;
            }
        }
    }

    return marks;
}

Robot.prototype.returnItemsToCollect = function()
{
    return this.returnItems(CollectItemJob);
}

Robot.prototype.returnItemsToReturn = function()
{
    return this.returnItems(ReturnItemJob);
}

Robot.prototype.returnItemsToDeliver = function()
{
    return this.returnItems(DeliverItemJob);
}

Robot.prototype.returnItemsToPass = function()
{
    return this.returnItems(PassItemJob);
}

Robot.prototype.returnItemsToReceive = function()
{
    return this.returnItems(ReceiveItemJob);
}

Robot.prototype.returnItems = function(jobType)
{
    var items = []

    for(var i = 0; i < this.jobQueue.length; i++)
    {
        var job = this.jobQueue[i];

        if(job instanceof jobType)
        {
            items.push(job.item);
        }
    }

    return items;
}

Robot.prototype.returnItemsCollected = function()
{
    return this.backpack;
}

Robot.prototype.isBusy = function()
{
    if(this.jobQueue.length == 0)
    {
        return false;
    }
    else
    {
        return true;
    }
}

Robot.prototype.raiseEvent = function(event)
{
    if(event != null)
    {
        if (arguments.length == 1)
            event();
        else if (arguments.length == 2)
            event(arguments[1]);
    }
}

Robot.prototype.dropItem = function(item, x ,y)
{
    var index = this.backpack.indexOf(item);
    this.backpack.splice(index, 1);

    item.x = x;
    item.y = y;

    graphicsManager.add(item);
}

Robot.prototype.pickItem = function(item)
{
    this.backpack.push(item);

    graphicsManager.remove(item);
}

Robot.prototype.hasRendezVous = function()
{
    for(var i = 0; i < this.jobQueue.length; i++)
    {
        if(this.jobQueue[i] instanceof PassItemJob || this.jobQueue[i] instanceof ReceiveItemJob)
        {
            return true;
        }
    }

    return false;
}

Robot.prototype.clearJobs = function()
{
    this.jobQueue = [];
    this.jobData = {};    
}

Robot.prototype.reset = function()
{
    this.isMoving = false;
    this.currentMoveIteration = 1;
    this.steps = 0;

    this.clearJobs();
    this.backpack = [];   
    graphicsManager.placeAt(this, this.depot.x + 1, this.depot.y, 0, 0);

    this.setSpriteName(Direction.North);
}


Robot.Names = ["Andy", "Ben", "Chris", "Dean", "Ernie", "Frank", "Greg", "Ian", "John", "Keith", "Lee", "Max", "Nick", "Ollie"]


var Mark = function(character, x , y)
{
    StaticObject.apply(this);

    this.character = character;
    this.setSprite("img/characters/letter_" + character + ".png");
    this.x = x;
    this.y = y;
}

extend(Mark, StaticObject);