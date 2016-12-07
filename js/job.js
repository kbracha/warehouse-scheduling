
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
    this.itemsOrdered = tspBranchAndBoundYT(robotPos, this.items);
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
    this.node = aStarSearch(startLocation, this.target).node
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