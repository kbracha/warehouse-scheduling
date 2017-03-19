var Order = function()
{
    this.itemsInfo = {};
    this.items = [];
    this.assigned = false;
    this.cancelled = false;

    this.id = 1000 + Order.count;
    Order.count += 1;
}

Order.count = 0;

Order.prototype.add = function(itemType, quantity)
{
    if(!(itemType.name in this.itemsInfo))
    {
        this.itemsInfo[itemType.name] = {
            quantity : 0,
            itemType: itemType // create a link because when iterating over keys in items the key reference doesn't work
        }
    }

    this.itemsInfo[itemType.name].quantity += quantity;
}

Order.prototype.remove = function(itemType, quantity)
{
    this.itemsInfo[itemType.name].quantity -= quantity;

    if(this.itemsInfo[itemType.name].quantity == 0)
    {
        delete this.itemsInfo[itemType.name];
    }
}

Order.prototype.getWeight = function()
{
    var weight = 0;

    for(var key in this.itemsInfo)
    {
        weight += this.itemsInfo[key].quantity * this.itemsInfo[key].itemType.prototype.weight;
    }

    return weight;
}

Order.prototype.getCost = function()
{
    var cost = 0;

    for(var key in this.itemsInfo)
    {
        cost += this.itemsInfo[key].quantity * this.itemsInfo[key].itemType.prototype.cost;
    }

    return cost;    
}

Order.prototype.getCount = function()
{
    var count = 0;

    for(var key in this.itemsInfo)
    {
        count += this.itemsInfo[key].quantity;
    }

    return count;
}

Order.prototype.finalize = function(getItemSourceFunction)
{
    this.items = [];

    for(var key in this.itemsInfo)
    {
        var itemSource = getItemSourceFunction(this.itemsInfo[key].itemType);

        for(var i = 0; i < this.itemsInfo[key].quantity; i++)
        {
            var item = new this.itemsInfo[key].itemType();

            item.x = itemSource.x;
            item.y = itemSource.y;
            item.order = this;

            this.items.push(item);
        }
    }
    
    return this.items;    
}

Order.prototype.getItems = function()
{
    return this.items;
}

Order.prototype.getItemsInfo = function()
{
    return this.itemsInfo;
}

