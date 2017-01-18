
var CollectItemsJob = function(items)
{
    this.items = items;
    this.node = null;
    this.itemsOrdered;
    this.currentIndex;

    this.started = false;
    this.completed = false;

    this.node = null;
}

CollectItemsJob.prototype.init = function(robotPos)
{
    this.currentIndex = 0;
    this.itemsOrdered = tspBranchAndBound(robotPos, this.items);
}

CollectItemsJob.prototype.getCurrentItem = function()
{
    return this.itemsOrdered[this.currentIndex];
}

CollectItemsJob.prototype.moveToNextItem = function()
{
    this.currentIndex++;
}

CollectItemsJob.prototype.getCurrentNode = function()
{
    return this.node;
}

CollectItemsJob.prototype.moveToNextNode = function()
{
    return this.node;
}

var GoToDestinationJob = function(target)
{
    this.target = target;
    this.started = false;
    this.completed = false;
    this.node = null;
    this.steps = []
}

GoToDestinationJob.prototype.init = function(startLocation)
{
    this.createPath(startLocation)

    if(this.node == null)
    {
        return false;
    }

    this.started = true;
    return true;
}

GoToDestinationJob.prototype.createPath = function(startLocation)
{
    this.node = aStarSearchTo(startLocation, this.target).node;

    var node = this.node;
    this.steps = []
    while(node != null)
    {
        this.steps.push(node);
        node = node.child;
    }
}

GoToDestinationJob.prototype.nextStep = function()
{
    var node = this.node;

    if(node != null)
    {
        this.node = node.child
    }
    
    if(this.node == null)
    {
        this.completed = true;
    }
    
    return node;
}

GoNextToDestinationJob = function() 
{
    GoToDestinationJob.apply(this, arguments);
}

extend(GoNextToDestinationJob, GoToDestinationJob);

GoNextToDestinationJob.prototype.createPath = function(startLocation)
{   
    this.node = aStarSearchNextTo(startLocation, this.target).node;

    this.steps = []
    var node = this.node;
    while(node != null)
    {
        this.steps.push(node);
        node = node.child;
    }
}