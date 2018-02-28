var CANVAS_WIDTH = 480
var CANVAS_HEIGHT = 360
var level = 1;
var score = 0;
var shieldHealth = 3;

var canvasElement = $("<canvas width='" + CANVAS_WIDTH + "' height='" + CANVAS_HEIGHT + "' ><script>console.log('canvas created')</script></canvas>"); 
//creates a canvas element in the document body


var ctx = canvasElement.get(0).getContext("2d");
// ctx short for canvas context

canvasElement.appendTo('body');

var FPS = 30;   //frames per second
var ExplosionInterval = 10;
setInterval (()=>{
    update();
    draw();
}, 1000/FPS);
// handles the frame


//var blanks = true; 
// blanks are used to create a dual color laser so that the bullets don't look continuous
//var blankCtr = 2; // blanks fired every 2nd iteration

//var enemySpawnRate =5;

var playerBullets = [];
function Bullet(I) {

    I.active = true;
    I.xVelocity = 0;
    I.yVelocity = -I.speed;
    I.width = 4 ;
    I.height = 7;
    I.color = "white";

    I.inBounds = function(){
        return I.x >= 0 && I.x <= CANVAS_WIDTH && I.y >= 0 && I.y <= CANVAS_HEIGHT;
    }

    I.draw = function(){
        // if(!I.blanks){    
        //     ctx.fillStyle = this.color;
        // }
        // else {
        //     I.active = false;
        //     ctx.fillStyle = "white"; 
        // }
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height); 
    }

    I.update = function() {
        I.x += I.xVelocity;
        I.y += I.yVelocity;
        I.active = I.active && I.inBounds();
    }

    return I;
} // handles bullets

enemies = [];
function Enemy(I) {
    I = I || {};

    I.active = true;
    I.age= Math.floor(Math.random()* 128);
    I.color = "#A2B";
    I.weight = 10 + (Math.floor(Math.random() * 2) )* 10;

    I.x = CANVAS_WIDTH / 4 + Math.random() * CANVAS_WIDTH/2;
    I.y = 0;
    I.xVelocity = 0;
    I.yVelocity = 1 + level; // velocity increases with level
    I.width = 32;
    I.height = 32;

    I.inBounds = function() {
        return I.x >=0 && I.x <= CANVAS_WIDTH && I.y >= 0 && I.y <= CANVAS_HEIGHT;
    };
    console.log(I.weight);
    if(I.weight == 10)
        I.sprite = Sprite("enemy");
    else
        I.sprite = Sprite("enemyMod");

    I.explode = function() {
        
        score += I.weight;
        
        console.log("Score :" + score);
        Sound.play("explosion");
        this.sprite = Sprite("explosion");
        setTimeout (()=>{this.active = false},100);
        //extra credits for explosion graphics
    }

    I.draw = function() {
        this.sprite.draw(ctx, this.x, this.y)
    }

    I.update = function() {
        I.x += I.xVelocity;
        I.y += I.yVelocity;
        if(I.weight == 10){
            I.xVelocity = 3 * Math.sin(I.age * Math.PI /64);}
        else {
            I.xVelocity = 0;
            I.yVelocity = 2 + level;
        }
        I.age++;
        I.active = I.active && I.inBounds();
    }
    return I;
} // handles enemies

var player = {
    color: "#00A",
    x: 220,
    y: 270,
    width: 32,
    height: 32,
    sprite: Sprite("player") ,
    draw: function(){
        this.sprite.draw(ctx, this.x, this.y)
    }
}; // handles player creation

var shield = {
    color: "#222239",
    x: 0,
    y: CANVAS_HEIGHT-24,
    width: CANVAS_WIDTH,
    height: 30,
    draw: function(){
        
        ctx.fillStyle = this.color;
        ctx.fillRect( this.x, this.y, this.width, this.height);
    } ,
    explode: function(){
        console.log("shield hit");
        this.color = "red"
        setTimeout(()=>{
            this.color = "#222239"}, 500
        );
    }
}


function collides (a,b) {
    return (a.x < b.x + b.width && a.x +a.width > b.x && a.y < b.y +b.height && a.y +a.height > b.y);
}


function handleCollisions() {
    
    for (var bullet in playerBullets){
        for (var enemy in enemies){
            if (collides(playerBullets[bullet],enemies[enemy])){
                console.log("enemy hit")
                playerBullets[bullet].active = false;
                enemies[enemy].explode();
                break;
            }
        }
    }
    
    for (var enemy in enemies) {
        if(collides(enemies[enemy],player)) {
            player.explode();
            enemies[enemy].explode();
            break;
        }
    }

    for (var enemy in enemies) {
        if(collides(enemies[enemy],shield)) {
            shieldHealth --;
            
            shield.explode();
            enemies[enemy].explode();
            break;
        }
    }
      

}

player.shoot =  function(){
    //console.log("beep beep");
    Sound.play("shoot");
    // blankCtr = blankCtr - 1;
    // if(blankCtr == 0){
    //     blankCtr = 2 ;
    //     blanks = !(blanks);
    // }

    player.midpoint = function(){
        return {
            x: this.x + this.width/2 - 1,
            y: this.y + this.height/2
        };
     };


    var bulletPosition = this.midpoint();

    playerBullets.push(Bullet({
        speed: 5,
        //blanks: blanks,
        x: bulletPosition.x,
        y: bulletPosition.y
    }))
    
}

player.explode = function() {
    console.log("player hit");
    Sound.play("explosion");
    this.sprite = Sprite("explosion");
    setTimeout(()=>{
        alert("Mission Control : your spaceship is hit. \n\n We salute your martyrdom in scoring \t" + score + ",\n and defending till level \t" + level + ".\n\n Play again ?");
        document.location.reload();                                        
    }, 200); 
     
    this.active = false;
}

function update(){

    if(keydown.space) {          
            player.shoot();
    }



    if(keydown.left) {
        player.x += -4
    }

    if(keydown.right) {
        player.x += +4
    }

    player.x = player.x.clamp(0, CANVAS_WIDTH - player.width) 
    //restricts player from going off-screen (x -axis)
    
    playerBullets.forEach(function(bullet) {
        bullet.update() ;
    })

    playerBullets = playerBullets.filter(function(bullet) {
        return bullet.active;
    })

    enemies.forEach(function(enemy) {
        enemy.update() ;
    });

    enemies = enemies.filter (function(enemy){
        return enemy.active;
    })

    if(Math.random() < 0.02 + 0.05 * level){
        enemies.push(Enemy());
    }

    
};

function draw_score(){
    ctx.font = "16px monospace";
    ctx.fillStyle = "#0095DD";
    ctx.fillText("Score: "+ score, 8, 20);
}

function draw_shield(){
    ctx.font = "16px monospace";
    if (shieldHealth*5 + 45 < 30){
        ctx.fillStyle = "red";
    
    }
    else {
        ctx.fillStyle = "#0095DD";
    }
    ctx.fillText("Shield:" , CANVAS_WIDTH-80, 20)
    ctx.fillRect(CANVAS_WIDTH-80,30,shieldHealth*5 + 45 ,20)
    if ((shieldHealth*5+ 45) < 0) {
        
        alert("Mission Control : The Enemy has landed. Base is lost. \n\n You scored \t" + score + ",\n and defended till level \t" + level + ".\n\n Play again ?");
        document.location.reload();                                        
    }

}

function draw_level(){
    ctx.font = "16px monospace";
    ctx.fillStyle = "#0095DD";
    level = (score - (score%500))/500;
    ctx.fillText("Level: " + level, CANVAS_WIDTH/2-40, 20 )
}



function draw(){
    //console.log("draw called")
    
    ctx.clearRect( 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    var grd=ctx.createLinearGradient(0,0,0,1 + 120 * level);
    //var grd=ctx.createRadialGradient(90,50,5,90,60,200);
    grd.addColorStop(0,"#000000");
    grd.addColorStop(1,"#53346D");

    ctx.fillStyle=grd;
    ctx.fillRect( 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
   
    
    player.draw();
    shield.draw();

    playerBullets.forEach(function(bullet){
        bullet.draw();
    });

    enemies.forEach(function(enemy){
        enemy.draw();
    });
    draw_level();
    draw_score();
    draw_shield();
    handleCollisions();
}






