

var GoToDestinationJob = function(destination)
{
    this.searchFunction = aStar.search;
    this.destination = destination;
}

GoNextToDestinationJob = function() 
{
    GoToDestinationJob.apply(this, arguments);
    this.searchFunction = aStar.searchNextTo;
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

var ReturnItemJob = function(item)
{
    this.item = item;
}

var BringItemsJob = function()
{
}