
var Robot = function()
{
    MobileObject.apply(this);

    this.collides = true;
    this.zIndex = 5;
    this.jobQueue = [];
    this.currentJob = null;

    this.returnedHome = false;

// for fun purposes 
//  this.canvas = $.parseHTML("<div>" +
//                            "<div style='position: absolute; top: 0; left: 0; width:100%; height: 100%;'></div>"
//                            //+ "<div style='position: absolute; bottom: 0; left: 0; width: 30px; height: 30px; background-color: red'></div>"
//                            + "</div>") 
//  this.sprite = $(this.canvas).children().first();


    this.background = "transparent";
    this.setSpritePath('img/robot')

    this.width = 1;
    this.height = 1.5;

    this.name = robotNames[Robot.count];
    Robot.count += 1;
}


extend(Robot, MobileObject);

Robot.count = 0;

Robot.prototype.addJob2 = function(job)
{
    this.jobQueue.push(job);
} 

Robot.prototype.makeAction2 = function()
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

    if(job.completed == true)
    {
        this.jobQueue.splice(0, 1);
        manager.remove(job.target);

        return true;
    }

    if(job.started == false)
    {
        if(!job.init(this))
        {
            return false;
        }
    }

    var step = job.nextStep();
    if(this.canMove(step.x, step.y) == false)
    {
        console.log("recalc");
        job.init(this);
        step = job.nextStep();
    }
    
    if(this.canMove(step.x, step.y) == true)
        this.move(step.x, step.y);

    return true;
}


Robot.prototype.resolveJob = function(job)
{

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
            if(job.started == false)
            {
                job.createPath(startLocation);
            }

            for(var j = 0; j < job.steps.length; j++)
            {
                marks.push(this.createMark(job.steps[j].x, job.steps[j].y))
            }

            startLocation = job.steps[job.steps.length - 1];
        }
    }

    return marks;
}


var robotNames = ["Andy", "Ben", "Chris", "Dean", "Ernie", "Frank", "Greg", "Ian", "John"]


var Mark = function(character, x , y)
{
    StaticObject.apply(this);

    this.setSprite("img/characters/letter_" + character + ".png");
    this.x = x;
    this.y = y;
}

extend(Mark, StaticObject);