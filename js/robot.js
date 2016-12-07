
var Robot = function()
{
    Obj.apply(this);

    this.collides = true;
    this.zIndex = 3;
    this.jobQueue = [];
    this.currentJob = null;

    this.returnedHome = false;
}


extend(Robot, Obj);


Robot.prototype.addJob = function(job)
{
    if(this.currentJob == null)
    {
        this.currentJob = job;
    }
    else
    {
        this.jobQueue.push(job);
    }
} 

Robot.prototype.addJob2 = function(job)
{
    this.jobQueue.push(job);
} 

Robot.prototype.makeAction = function()
{
    if(this.currentJob == null)
    {
        return false;
    }

    if(this.currentJob.started == false)
    {
        this.currentJob.init(this);
        this.currentJob.started = true;
    }

    if(this.currentJob.node == null)
    {
        this.currentJob.moveToNextItem();
        if(this.currentJob.getCurrentItem() == undefined)
        {
            this.currentJob.completed = true;
            this.currentJob = null;
            return false;
        }

        this.currentJob.node = aStarSearch(this, this.currentJob.getCurrentItem()).node;
    }

    robot.move(this.currentJob.node.x, this.currentJob.node.y);
    this.currentJob.node = this.currentJob.node.child;
    
    return true;
}


Robot.prototype.makeAction2 = function()
{
    if(this.jobQueue.length == 0)
    {
        return false;
    }

    var job = this.jobQueue[0];

    if(job.started == false)
    {
        if(!job.init(this))
        {
            return false;
        }
    }

    var step = job.nextStep();
    this.move(step.x, step.y);

    if(job.completed == true)
    {
        this.jobQueue.splice(0, 1);
        manager.remove(job.target);
    }

    return true;
}