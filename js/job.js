

var GoToDestinationJob = function(destination)
{
    this.searchFunction = aStarSearchTo;
    this.destination = destination;
}

GoNextToDestinationJob = function() 
{
    GoToDestinationJob.apply(this, arguments);
    this.searchFunction = aStarSearchNextTo;
}

var FaceObjectJob = function(object)
{
    this.object = object;
}

var CollectItemJob = function(item)
{
    this.item = item;
}

var DeliverItemJob = function(item)
{
    this.item = item;
}

var BringItemsJob = function()
{
}