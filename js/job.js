
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



