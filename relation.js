
var RelationChart = function(selector,options) {
    var me = this;
    this.options = {
        selector:null,
        canvasWith:600,
        canvasHeight:800,
        style:'',

        behavior : new CircleBehavior()
    };
    this.characters = [];
    this.relations = [];
    if(typeof selector === 'string') {
        this.options.selector = selector;
    }
    
    this.setOptions(options);

    me.canvas = document.querySelector(this.options.selector);
    me.canvas.setAttribute('width',parseInt(this.options.canvasWidth, 10)||800);
    me.canvas.setAttribute('height',parseInt(this.options.canvasWidth, 10)||600);
    me.canvas.style = this.options.style;
    me.ctx = me.canvas.getContext('2d');
    me.ctx.font = '18px SimSun';
    me.ctx.textAlign = 'center';
    me.ctx.textBaseline = 'middle';
    me.ctx.strokeStyle = '#333';
    me.ctx.lineWidth = 4;
    me.ctx.fillStyle = '#333';

    me._animationID = -1;

    // canvas event handle
    me.isMouseDown = false;
    me.mouse = {};
    me.canvas.onmousedown = function(event) {
        me.isMouseDown = true;
        for (let i in me.characters) {
            let pos = me.windowToCanvas(me.canvas,event.clientX,event.clientY);
            if (me.options.behavior.isIn(pos.x,pos.y,me.characters[i])) {
                console.log(me.characters[i].name+" be clicked.");
                me.selectedCharacter = me.characters[i];
                me.mouse.pos={x:event.clientX,y:event.clientY};
                break;
            }
        }

        event.preventDefault();
    }
    me.canvas.onmousemove = function(event) {
        if(me.isMouseDown) {
            if(me.selectedCharacter) {
                me.selectedCharacter.x += (event.clientX-me.mouse.pos.x);
                me.selectedCharacter.y += (event.clientY-me.mouse.pos.y);
                me.mouse.pos={x:event.clientX,y:event.clientY};
                me.isUpdated = true;
            }
        }
        event.preventDefault();
    }
    me.canvas.onmouseup = function(event) {
        console.log('onmouseup');
        me.isMouseDown = false;
        console.log('cancel name='+(me.selectedCharacter?me.selectedCharacter.name:'none'));
        me.selectedCharacter = null;
        event.preventDefault();
    }
    
    return me;
}

RelationChart.prototype = {
    setOptions : function (options) {
        if(!options) return;
        for (var i in options) {
            if (this.options[i] !== undefined) {
                this.options[i] = options[i];
            }
        }
    },

    addCharacter: function (character) {
        if (!character) {
            return;
        }
        let x = this.canvas.width/2;
        let y = this.canvas.height/2;
        let xw = this.ctx.measureText("X").width;
        if (character.constructor == Array) {
            let count = character.length;
            let stepAngle = 2*Math.PI/count;
            // console.log('w='+x+' y='+y);
            let radius = Math.min(this.canvas.width,this.canvas.height)*0.3;
            let t = 0;
            for (var i in character) {
                if (character[i].name) {
                    let angle = t*stepAngle-Math.PI/2;
                    t++;
                    character[i].x=x+radius*Math.cos(angle);
                    character[i].y=y+radius*Math.sin(angle);
                    character[i].radius=this.ctx.measureText(character[i].name).width/2+xw;
                    this.characters.push(character[i]);
                }
            }
        } else if (character && character.name) {
            character.x=x;
            character.y=y;
            character.radius=this.ctx.measureText(character.name).width/2+xw;
            this.characters.push(character);
        }

        this.isUpdated = true;

        if(this._animationID === -1) {
            var self = this;
            requestAnimationFrame(function(t){self.draw.call(self,t)});
        }
    },

    addRelation: function (character,target,desc) {
        var isExist = false;
        for (var i = this.relations.length - 1; i >= 0; i--) {
            if(this.relations[i].src.name==character && this.relations[i].dst.name == target) {
                this.relations[i].desc = desc;
                isExist = true;
                break;
            }
        }
        if(!isExist) {
            var src = this.characters.find(function(elt){return elt.name == character;});
            var dst = this.characters.find(function(elt){return elt.name == target;});
            src && dst ? this.relations.push({src:src, dst:dst, desc:desc}) : null;
        }
        this.isUpdated = true;
    },

    windowToCanvas: function (canvas,x,y) {
        var bbox = canvas.getBoundingClientRect();
        return {x:(x-bbox.left)*(canvas.width/bbox.width),y:(y-bbox.top)*(canvas.height/bbox.height)};
    },

    draw: function (time) {
        if(this.isUpdated) {
            let ctx = this.ctx;
            ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
            
            let pos1 = {}, pos2={};
            for(var k in this.relations) {
                pos1 = {x:this.relations[k].src.x, y:this.relations[k].src.y};
                pos2 = {x:this.relations[k].dst.x, y:this.relations[k].dst.y};
                this.options.behavior.drawRelation(ctx, pos1, pos2, this.relations[k].desc);
            }

            for (let j in this.characters) {
                this.options.behavior.drawCharacter(ctx, this.characters[j]);
            }

            this.isUpdated = false;
        }

        var self = this;
        requestAnimationFrame(function(t){self.draw.call(self,t)});
    }
}

RelationChart.Theme = {

}

RelationChart.defaultTheme = {
    categorys : []
}

var CircleBehavior = function () {
    // body...
};
CircleBehavior.prototype = {
    drawCharacter : function (context,character) {
        context.strokeStyle = '#2d78f4';
        context.fillStyle = '#3385ff';
        context.beginPath();
        context.arc(character.x,character.y,character.radius,0,2*Math.PI);
        context.fill();
        context.stroke();
        context.fillStyle = '#FFFFFF';
        context.fillText(character.name,character.x,character.y);
    },
    drawRelation : function (context,pos1,pos2,desc) {
        context.beginPath();
        context.strokeStyle = '#376956';
        context.moveTo(pos1.x,pos1.y);
        context.lineTo(pos2.x,pos2.y);
        context.stroke();
        context.fillStyle = '#DEA681';
        context.fillText(desc,(pos1.x+pos2.x)/2,(pos1.y+pos2.y)/2);
    },
    isIn : function (x,y,character) {
        var x = Math.abs(character.x-x);
        var y = Math.abs(character.y-y);
        return (x*x+y*y)<character.radius*character.radius;
    }
}