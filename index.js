//fps control
(function(){
    var script=document.createElement('script');
    script.onload=function(){var stats=new Stats();
        document.body.appendChild(stats.dom);
        requestAnimationFrame(function loop(){stats.update();
            requestAnimationFrame(loop)});
    };
    script.src='//rawgit.com/mrdoob/stats.js/master/build/stats.min.js';
    document.head.appendChild(script);})()

//Declare three.js variables
var camera,
    scene,
    renderer,
    obs = [],
    car  = null,
    rock = null,
    coin = null,
    snow = null,
    heart = null,
    obstacle,
    shield = false;

var texture, texture1;

var pBar = document.getElementById("myBar");
var mBar = document.getElementById("myBarMoney");
var lifeProg = document.getElementById("myProgress");
var moneyProg = document.getElementById("myProgressMoney");
var shieldIcon = document.getElementById("myShieldIcon");
var heartIcon = document.getElementById("myProgressIcon");
var moneyIcon = document.getElementById("myProgressMoneyIcon");
var loading = document.getElementById("loading");
var loadingImg = document.getElementById("loading-image");

var recordAlert = document.getElementById("recordAlert");

var container = document.getElementById("container");
var speedUpContainer = document.getElementById("speedUpContainer");
var buttonRestart = document.getElementById("btn-restart");
var buttonReturn = document.getElementById("btn-return");
var buttonSoundOn = document.getElementById("btn-soundOn");
var buttonSoundOff = document.getElementById("btn-soundOff");

//cronoometro
var chrono = document.getElementById("chrono");
var zecsec = 0;
var score = 0;
var seconds = 0;
var mints = 0;
var startchron = 0;

var gameover = false;
var paused = false;
var cameraSwitched = false;
var timer = 0 ;
var timerStarted = false;
var soundON = true;
var id;

var leftBound=-3.5;
var rightBound=3.5;
var current = new THREE.Vector3(0.0, 0.0, -6.0);
var plane, planeCopy, bridgert, bridgelt, bridgeltcopy, bridgertcopy;
var bgTexture, bgWidth, bgHeight;
var rotationW = true;
var frozen = false;
var wheel, wheel1, wheel2, wheel3;
var body, spoiler, trunk, doorR, doorL, hood_carbon, fenderR, fenderL, bumperF, bumperR, skirtR, skirtL;

var wheelSpeed = 0.1;
var last = 5000;

var NUM_LOADED = 0;
var ROCK_LOADED = false;   //rock
var HEART_LOADED = false;  //heart
var SNOW_LOADED = false;  //snow
var CAR_LOADED = false;  //car
var COIN_LOADED = false;  //coin
var SHIELD_REQ = 10;
var DELTA_LIFE = 5;
var widthLife = 100;
var widthMoney = 0;
var obsFreq = 20;
var obsSpeed = 0.5;
var DELTA_SPEED;
var carSpeed = 0.4;
var DELTA_CARSPEED;
var NUMB_OBSTACLES = 10;

var rockSound;
var coinSound;
var lifeSound;
var iceSound;
var shieldSound;
var gameOverSound;
var shieldImpactSound;
var backgroundSound;
var soundPath = "sounds/";
var cutOff;

var username = getParams(window.location.href)["username"];
var difficulty = getParams(window.location.href)["difficulty"];

var rockEmoji, iceEmoji, coinEmoji, heartEmoji;

//assign three.js objects to each variable
function init() {

    //camera
    camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 1000 );
    camera.position.z = 0;
    camera.position.y = 2;
    rockSound = new sound(soundPath + "rock.mp3");
    coinSound = new sound(soundPath + "coin.mp3");
    lifeSound = new sound(soundPath + "life.mp3");
    iceSound = new sound(soundPath + "ice.mp3");
    shieldSound = new sound(soundPath + "shield.mp3");
    shieldImpactSound = new sound(soundPath + "shield-impact.mp3");
    backgroundSound = new sound(soundPath + "background.mp3");
    gameOverSound = new sound(soundPath + "gameover.mp3");
    console.log("username: "+username);
    console.log("difficulty: "+difficulty);

    if(difficulty=="medium")
        NUMB_OBSTACLES = 20;
    if(difficulty=="hard")
        NUMB_OBSTACLES = 30;

    window.addEventListener('resize', onWindowResize, false);//resize callback
    document.onkeydown = handleKeyDown;
    //scene

    scene = new THREE.Scene();
    var loader = new THREE.TextureLoader();
    loader.setCrossOrigin("");
    bgTexture = loader.load('textures/backgroundL.jpg',
        function ( texture ) {
            var img = texture.image;
            bgWidth= img.width;
            bgHeight = img.height;
            //    resize();
            NUM_LOADED++;
        }
    );
    scene.background = bgTexture;
    bgTexture.wrapS = THREE.MirroredRepeatWrapping;
    bgTexture.wrapT = THREE.MirroredRepeatWrapping;


    spotLight = new THREE.SpotLight( 0xCCCCCC, 0.75);
    spotLight.position.set( 10, 20, 10 );

    spotLight.castShadow = true;
    spotLight.shadowCameraVisible = true;


    scene.add( spotLight );
    scene.add( new THREE.AmbientLight( 0x000000, 0.3 ) );

    rockEmoji = addEmoji("sad");
    heartEmoji = addEmoji("happy");
    coinEmoji = addEmoji("money");
    iceEmoji = addEmoji("ice");


    // skybox();
    texture = new THREE.TextureLoader().load( 'textures/road1.jpg', function ( texture ) {

        // in this example we create the material when the texture is loaded
        NUM_LOADED++;


    });
    //
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.rotation = ( Math.PI / 2 );
    texture.repeat.set( 50, 1 );
    texture.minFilter = THREE.NearestFilter;

    texture1 = new THREE.TextureLoader().load( 'textures/grailstryL.jpg' , function ( texture ) {

        // in this example we create the material when the texture is loaded
        NUM_LOADED++;

    });


    texture1.wrapS = THREE.RepeatWrapping;
    texture1.wrapT = THREE.RepeatWrapping;
    texture1.rotation = ( Math.PI / 2 );
    texture1.repeat.set( 50, 1 );
    texture1.minFilter = THREE.NearestFilter;

    bridgert = new THREE.Mesh(
        new THREE.PlaneGeometry(1, 10000, 10, 10),
        new THREE.MeshBasicMaterial({map:texture1, side : THREE.DoubleSide, color: 0xffffff}));
    bridgert.rotation.x = (Math.PI/2);
    bridgert.position.x = +6;
    bridgert.position.z = -500;
    bridgert.position.y = 0;
    bridgert.rotateY(Math.PI/2);
    //  plane.receiveShadow = true;
    scene.add(bridgert);

    bridgertcopy = bridgert.clone();
    bridgertcopy.position.z = -1500;
    scene.add(bridgertcopy);

    bridgelt = new THREE.Mesh(
        new THREE.PlaneGeometry(1, 10000, 10, 10),
        new THREE.MeshBasicMaterial({map:texture1, side : THREE.DoubleSide, color: 0xffffff}));
    bridgelt.rotation.x = (Math.PI/2);
    bridgelt.position.x = -6;
    bridgelt.position.z = -500;
    bridgelt.position.y = 0;
    bridgelt.rotateY(Math.PI/2);
    //  plane.receiveShadow = true;
    scene.add(bridgelt);

    bridgeltcopy = bridgelt.clone();
    bridgeltcopy.position.z = -1500;
    scene.add(bridgeltcopy);


    plane = new THREE.Mesh(
        new THREE.PlaneGeometry(10, 10000, 10, 10),
        new THREE.MeshPhongMaterial({map:texture, side : THREE.DoubleSide, color: 0xffffff}));

    plane.rotation.x = (Math.PI/2);
    plane.position.z = -500;
    plane.receiveShadow = true;
    scene.add(plane);


    planeCopy = plane.clone();
    planeCopy.position.z = -1500;
    scene.add(planeCopy);


    //renderer
    renderer = new THREE.WebGLRenderer();

    //set the size of the renderer
    renderer.setSize( window.innerWidth, window.innerHeight );



    //add the renderer to the html document body
    document.body.appendChild( renderer.domElement );

    renderer.shadowMapEnabled = true;
    renderer.shadowMapType = THREE.PCFSoftShadowMap;

}

function addRock(){
    var loader = new THREE.ObjectLoader();

    loader.load(
        "models/rock/rock.json",
        function (obj){
            rock = obj;
            ROCK_LOADED = true;
            NUM_LOADED++;
            rock.position.y = 0.5;
            rock.scale.z =  1.25;
            rock.scale.x = 1;
            rock.scale.y = 0.5;
            rock.position.z = -0.2;
        },

        // onProgress callback
        function (xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },

        // onError callback
        function (err) {
            console.error('An error happened');
            ROCK_LOADED = false;
        }                );

}

function getParams(url) {
    var params = {};
    var parser = document.createElement('a');
    parser.href = url;
    var query = parser.search.substring(1);
    var vars = query.split('&');
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        params[pair[0]] = decodeURIComponent(pair[1]);
    }
    return params;
};

function addSnow(){
    var loader2 = new THREE.ObjectLoader();

    loader2.load(
        "models/snow/snow-flake.json",
        function (obj){
            snow = obj;
            snow.position.y = 0.7;
            snow.rotation.x = (Math.PI/2);
            snow.scale.z = snow.scale.y = snow.scale.x = 2.5;
            SNOW_LOADED = true;
            NUM_LOADED++;

        },

        // onProgress callback
        function (xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },

        // onError callback
        function (err) {
            console.error('An error happened');
            SNOW_LOADED = false;
        }                );

}
function addHeart(){
    var loader1 = new THREE.ObjectLoader();
    loader1.load(
        "models/heart/heart.json",
        function (obj){
            heart = obj;
            heart.scale.x =0.015;
            heart.scale.y =0.015;
            heart.scale.z = 0.015;
            heart.position.y = 0.6;
            heart.rotation.y = (Math.PI/3);
            HEART_LOADED = true;
            NUM_LOADED++;
        },

        // onProgress callback
        function (xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },

        // onError callback
        function (err) {
            console.error('An error happened');
            HEART_LOADED = false;
        }                );

}


function addCar() {
    // The loop will move from z position of -1000 to z position 1000, adding a random particle at each position.
    // instantiate a loader
    var loader = new THREE.ObjectLoader();

    loader.load(
        // resource URL
        "models/nissan/nissan5.json",

        // onLoad callback
        // Here the loaded data is assumed to be an object
        function (obj) {
            // Add the loaded object to the scene
            car = obj;
            CAR_LOADED = true;
            NUM_LOADED++;
            car.position.z = -5.5;
            car.position.y = 0.58;
            car.scale.x = car.scale.y = car.scale.z =0.7;
            car.is_ob = true;
            scene.add(obj);

            wheel = scene.getObjectByName('TireFL');//left wheel
            wheel1 = scene.getObjectByName('TireFR');//right wheel
            wheel2 = scene.getObjectByName('TireRL');//left wheel
            wheel3 = scene.getObjectByName('TireRR');//right wheel
            body = scene.getObjectByName('Body');
            spoiler = scene.getObjectByName('Spoiler');
            trunk = scene.getObjectByName('Trunk');
            doorR = scene.getObjectByName('DoorR');
            doorL = scene.getObjectByName('DoorL');
            hood_carbon = scene.getObjectByName('Hood_Carbon');
            fenderR = scene.getObjectByName('FenderR');
            fenderL = scene.getObjectByName('FenderL');
            bumperF = scene.getObjectByName('BumperF');
            bumperR = scene.getObjectByName('BumperR');
            skirtL = scene.getObjectByName('SkirtL');
            skirtR = scene.getObjectByName('SkirtR');



        },

        // onProgress callback
        function (xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');

        },

        // onError callback
        function (err) {
            CAR_LOADED = false;
            console.error('An error happened');
        }
    );
}

function addCoin(){

    var loader4 = new THREE.ObjectLoader();
    loader4.load(
        "models/coin/coinM1.json",
        function (obj){
            coin = obj;
            //    coin.position.y = 0.7;
            coin.position.y = 1;
            coin.rotation.x = (Math.PI);
            coin.scale.z = coin.scale.y = coin.scale.x = 0.25;
            COIN_LOADED = true;
            NUM_LOADED++;
        },

        // onProgress callback
        function (xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },

        // onError callback
        function (err) {
            console.error('An error happened');
            COIN_LOADED = false;
        }                );



}
function randomIntFromInterval(min,max)
{
    return Math.floor(Math.random()*(max-min+1)+min);
}

function chooseObs(){
    var randomNumber = randomIntFromInterval(1,7);
    switch(randomNumber) {
        case 1:
        case 5:
        case 6:
        case 7:

            var temp = rock.clone();
            temp.code = 0;


            break;

        case 2:
            var temp = heart.clone();
            temp.code = 1;
            break;

        case 3:
            var temp = snow.clone();
            temp.code = 2;

            break;
        case 4:
            var temp = coin.clone();
            temp.code = 3;

            break;


    }
    return temp;

}
function addObjToScene(obj){
    if( obs.length<1){
        obj.position.x = randomIntFromInterval(-4, 4);
        obj.position.z = randomIntFromInterval(-50, -300);
    }
    else{
        obj.position.x = randomIntFromInterval(-4,4);
        obj.position.z = obs[obs.length-1].position.z - obsFreq;
    }
    scene.add( obj );
}

function addObs(){
    var temp1 = rock.clone();
    temp1.code = 0;
    addObjToScene(temp1);
    obs.push(temp1);

    var temp2 = heart.clone();
    temp2.code = 1;
    addObjToScene(temp2);
    obs.push(temp2);

    var temp3 = snow.clone();
    temp3.code = 2;
    addObjToScene(temp3);
    obs.push(temp3);

    var temp4 = coin.clone();
    temp4.code = 3;
    addObjToScene(temp4);
    obs.push(temp4);




    for ( var z = 0; z < NUMB_OBSTACLES; z += 1 ) {
        //}
        temp = chooseObs();
        // This time we give the sphere random x and y positions between -500 and 500
        addObjToScene(temp);
        //finally push it to the obstacles array
        obs.push( temp );
    }
}


function sound(src) {
    this.sound = document.createElement("audio");
    this.sound.src = src;
    this.sound.setAttribute("preload", "auto");
    this.sound.setAttribute("controls", "none");
    this.sound.style.display = "none";
    document.body.appendChild(this.sound);
    this.play = function(){
        this.sound.play();
    }
    this.stop = function(){
        this.sound.pause();
        this.sound.currentTime = 0;
    }
    this.speedUp = function(){
        this.sound.playbackRate= 3;
    }
    this.pause = function () {
        this.sound.pause();
    }
}


function animateObs() {
    // loop through each obstacle
    for ( var i = 0; i < obs.length; i++ ) {

        obstacle = obs[i];

        // move it forward
        obstacle.position.z += obsSpeed;
        //0.015


        // once the obstacle is too close, reset its z position to the end of the plane
        if (obstacle.position.z > 0) {
            obstacle.position.z = obs[obs.length-1].position.z - obsFreq + obsSpeed;
            obstacle.position.x = randomIntFromInterval(-4, 4);
            obs.shift();     //remove first element
            obs.push(obstacle);  //push in last position
            //console.log("nuova posizione: x -> : "+obstacle.position.x+", z -> : "+obstacle.position.z);
        }
        if (CAR_LOADED == true){
            if(obstacle.position.z - obsSpeed >= car.position.z && Math.abs(obstacle.position.x - car.position.x) <= 1.0 ){
                obstacle.position.x = 1000; //sparisce l'oggetto
                handleCollisions(obstacle.code);
            }
        }
    }


}

function addEmoji(obj){
    var textureS = new THREE.TextureLoader().load( 'textures/'+obj+'.jpg' );

    textureS.minFilter = THREE.NearestFilter;
    var geometry = new THREE.CircleGeometry( 0.5, 32 );
    var material = new THREE.MeshBasicMaterial( { map:textureS} );
    var img = new THREE.Mesh( geometry, material );
    img.name = obj;
    img.position.z = -5.5;
    img.position.y = 2.5;
    img.scale.x = img.scale.y = img.scale.z = 0.75;

    return img;

}


function handleImg(img){

    if(!cameraSwitched) {
        img.position.z = -5.5;
        img.position.y = 2.5;
        img.scale.x = img.scale.y = img.scale.z = 0.75;
        speedUpContainer.style.top = "0";

    }else {
        img.position.z = -5.5;
        img.position.y = 2;
        img.scale.x = img.scale.y = img.scale.z = 0.5;
        speedUpContainer.style.top = "20%";


    }
    scene.add(img);

    setTimeout(function() {
        removeImg(img.name, true);
    }, 1000);

}



function removeImg(name, bool){
    if(bool)
        scene.remove(scene.getObjectByName(name));
    else {
        rotationW = true;
        car.remove(car.getObjectByName("cerchio"));
        pBar.style.backgroundColor = '#00FF00';
        shield = false;
        timerStarted = false;
    }




}
function handleCollisions(code){
    switch(code) {
        case 0:
            //rock
            if (!shield) {
                if(soundON) {
                   handleSound(rockSound, cutOff);
                }
                removeImg("sad", true);
                removeImg("money", true);
                removeImg("ice", true);
                removeImg("happy", true);
                handleImg(rockEmoji);
                if(widthLife > DELTA_LIFE) {
                    widthLife -= DELTA_LIFE;
                } else if (widthLife >= 1 && widthLife <= DELTA_LIFE){
                    widthLife = 0;

                }

                pBar.style.width = widthLife + '%';
                pBar.innerHTML = widthLife;
            } else
                if (soundON) handleSound(shieldImpactSound, cutOff);

            break;

        case 1:
            //heart

            handleImg(heartEmoji);
            if(soundON) {
                handleSound(lifeSound, cutOff);
            }
            if(widthLife < 100) {
                widthLife += 5;
                pBar.style.width = widthLife + '%';
                pBar.innerHTML = widthLife;
            }

            break;

        case 2:
            //snow
            if (!shield) {
                if(soundON) {
                    handleSound(iceSound, cutOff);
                }
                handleImg(iceEmoji);
                //cambia colore
                frozen = true;
                rotationWheels();
                changeCarColor();
                timer = new Timer(function() {
                    restoreCarColor()
                }, 3000);
                timerStarted = true;
            }
            else
            if (soundON) handleSound(shieldImpactSound, cutOff);
            break;

        case 3:
            //coin
            if(widthMoney < 100) {
                if(soundON) {
                    handleSound(coinSound, cutOff);
                }
                widthMoney += 5;
                handleImg(coinEmoji);
            }
            break;

    }            }

    function handleSound(name, time){
       if(name == coinSound) {
           name.speedUp();
       }
       if (name == rockSound) {
           rockSound.playbackRate = 1;

       }
        name.play();
        setTimeout(function () {
            name.stop();
        }, time);
    }

function changeCarColor(){
    body.material.color.setHex(0xb4cffa);
    spoiler.material.color.setHex(0xb4cffa);
    trunk.material.color.setHex(0xb4cffa);
    doorR.material.color.setHex(0xb4cffa);
    doorL.material.color.setHex(0xb4cffa);
    body.material.color.setHex(0xb4cffa);
    hood_carbon.material.color.setHex(0xb4cffa);
    fenderR.material.color.setHex(0xb4cffa);
    fenderL.material.color.setHex(0xb4cffa);
    bumperF.material.color.setHex(0xb4cffa);
    bumperR.material.color.setHex(0x000000);
    skirtR.material.color.setHex(0x000000);
    skirtL.material.color.setHex(0x000000);
}

function restoreCarColor(){
    frozen = false;
    body.material.color.setHex(0x000000);
    spoiler.material.color.setHex(0x000000);
    trunk.material.color.setHex(0x000000);
    doorR.material.color.setHex(0x000000);
    doorL.material.color.setHex(0x000000);
    body.material.color.setHex(0x000000);
    hood_carbon.material.color.setHex(0x000000);
    fenderR.material.color.setHex(0x000000);
    fenderL.material.color.setHex(0x000000);
    bumperF.material.color.setHex(0x000000);
    bumperR.material.color.setHex(0xFFFFFF);
    skirtR.material.color.setHex(0x000000);
    skirtL.material.color.setHex(0x000000);
    timerStarted = false;

}

function restoreFrontWheels(){
    rotationW = true;
    wheel.rotation.y = Math.PI/2;

    wheel1.rotation.y = -Math.PI/2;

}

function handleKeyDown(keyEvent){

    var circle;

    if(frozen &&  keyEvent.keyCode != 80){
        return;
    }


    rotationW = false;
    var validMove = true;
    wheel.rotation.x = 0;
    wheel1.rotation.x = 0;


    if ( keyEvent.keyCode === 37) {//left
        if(current.x > leftBound ){
            car.position.x -= carSpeed;
            current.setX(car.position.x);
            wheel.rotation.y = Math.PI/4;
            wheel1.rotation.y = -3/4 * Math.PI;

            setTimeout(restoreFrontWheels, 100);

        } else{
            rotationW = true;
            validMove = false;
        }

    } else if ( keyEvent.keyCode === 39) {//right
        if(current.x < rightBound){
            car.position.x += (carSpeed);
            current.setX(car.position.x);
            wheel.rotation.y = 3/4 * Math.PI;
            wheel1.rotation.y = -Math.PI/4;

            setTimeout(restoreFrontWheels, 100);
        }else{
            rotationW = true;
            validMove = false;
        }

    }else if ( keyEvent.keyCode === 82){// R: resume
        rotationW = true;
    }
    else if (keyEvent.keyCode === 80){ // P: pause
        rotationW = true;

        if (!paused) {
            paused = !paused;
            cancelAnimationFrame( id );
            if(shield) shieldSound.pause();

            backgroundSound.pause();
            if(timerStarted) {
                timer.pause();

            }
            stopChr();
        } else{
            paused = !paused;
            requestAnimationFrame(render);
            if(shield) shieldSound.play();
            if (soundON) backgroundSound.play();
            if (timerStarted) {
                timer.resume();

            }
            startChr();
        }


    } else if (keyEvent.keyCode === 40){ // down
        rotationW = true;
        if(shield) {
            return;
        }
        if(widthMoney >= SHIELD_REQ) {
            if (soundON)
                handleSound(shieldSound, 5000);

            var textureS = new THREE.TextureLoader().load('textures/captain_shield3.jpg');
            textureS.minFilter = THREE.NearestFilter;

            var geometry = new THREE.CircleGeometry(1.5, 32);
            var material = new THREE.MeshBasicMaterial({map: textureS, transparent: true, opacity: 0.5});
            circle = new THREE.Mesh(geometry, material);
            circle.position.z = -3.5;
            circle.position.y = -0.5;
            //
            circle.name = "cerchio";
            car.add(circle);
            shield = true;
            widthMoney -= SHIELD_REQ;
            timer = new Timer(function() {
                removeImg(name, false);
            }, 5000);
            timerStarted = true;
        }
    } else  if(keyEvent.keyCode === 67){ // "C"
        //rimozione scudo
        if(!cameraSwitched) {
            cameraSwitched = !cameraSwitched;
            rotationW = true;
            camera.position.z = -3;
            camera.position.y = 1.5;
        }
        else{
            cameraSwitched = !cameraSwitched;
            rotationW = true;
            camera.position.z = 0;
            camera.position.y = 2;
        }
    }
    else return;

}

function onWindowResize() {
    //resize & align
    sceneHeight = window.innerHeight;
    sceneWidth = window.innerWidth;
    renderer.setSize(sceneWidth, sceneHeight);
    camera.aspect = sceneWidth/sceneHeight;
    camera.updateProjectionMatrix();
}
function rotationWheels(){
    wheel.rotation.x += wheelSpeed * 2;
    wheel1.rotation.x += wheelSpeed * 2;

}

function levelUp(){
    if(obsSpeed < 1.4) {
        speedUpContainer.style.visibility = 'visible';
        speedUpContainer.style.color = '#ff0000';
        DELTA_SPEED = obsSpeed/5;   //aumento del 20% per gli ostacoli
        DELTA_CARSPEED = carSpeed/10; //aumento del 10% per la macchina
        carSpeed = carSpeed + DELTA_CARSPEED;
        obsSpeed = obsSpeed + DELTA_SPEED;
        setTimeout(function (){speedUpContainer.style.visibility = 'hidden'}, 1000);

    }
}

function Timer(callback, delay) {
    var timerId, start, remaining = delay;

    this.pause = function() {
        window.clearTimeout(timerId);
        remaining -= new Date() - start;
    };

    this.resume = function() {
        start = new Date();
        window.clearTimeout(timerId);
        timerId = window.setTimeout(callback, remaining);
    };

    this.resume();


}


function gameOver(){

    removeImg("sad", true);
    removeImg("happy", true);
    removeImg("ice", true);
    removeImg("money", true);

    if(soundON) {
        backgroundSound.stop();
        gameOverSound.play();
        setTimeout(function () {
            gameOverSound.stop();
        }, 4000);
    }
    speedUpContainer.style.visibility = 'hidden';
    container.style.visibility = 'visible';
    container.style.color = '#ff0000';
    score = mints * 60 + seconds;

    switch(difficulty){
        case "easy":
            score = score * 1;
            break;

        case "medium":
            score = score * 2;
            break;



        case "hard":
            score = score * 3;

    }


    if (localStorage.getItem(username) == null){ //se non ci sta il record, è un record
        localStorage.setItem(username, score);
        recordAlert.innerHTML = "new record: "+ score;
        console.log(localStorage.getItem(username));
    } else {
        if (score > parseInt(localStorage.getItem(username))) {
            recordAlert.innerHTML = "new record: " + score;
            localStorage.setItem(username, score);

        }
        else {
            recordAlert.innerHTML =  "score: " + score;

        }

    }

    buttonRestart.style.visibility = 'visible';
    buttonReturn.style.visibility = 'visible';

    stopChr();
    cancelAnimationFrame( id );
    buttonRestart.onclick = function(){window.location.reload();};
    buttonReturn.onclick = function(){
        this.innerHTML = loadPage('menu.html');
    }

}

function loadPage(href)
{
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", href, false);
    xmlhttp.send();
    return xmlhttp.responseText;
}

var canStart = false;

function activateGame(){
        console.log("activateGame");
        canStart = true;
}
function chronometer() {
    if (startchron == 1) {
      seconds +=1;

        // set minutes
        if (seconds > 59) {
            seconds = 0;
            mints += 1;
        }

        // adds data in #showtm
        chrono.innerHTML = mints + ' \' ' + seconds + ' \'\' '; //+ zecsec + ' decimi ';
        setTimeout(chronometer, 1000);

    }
}
function startChr() { startchron = 1; chronometer(); }      // starts the chronometer
function stopChr() { startchron = 0; }                      // stops the chronometer
function resetChr() {
    zecsec = 0;  seconds = 0; mints = 0; startchron = 0;
    chrono.innerHTML = mints+ ' : '+ seconds+ ' : '+ zecsec;
}

function render(now) {

    if (NUM_LOADED > 7){

        moneyIcon.style.visibility = 'visible';
        heartIcon.style.visibility = 'visible';
        pBar.style.visibility = 'visible';
        mBar.style.visibility = 'visible';
        lifeProg.style.visibility = 'visible';
        moneyProg.style.visibility = 'visible';
        loading.style.visibility = 'hidden';
        loadingImg.style.visibility = 'hidden';
        cutOff = 300 - obsSpeed * 80;

        if(soundON) {
            buttonSoundOn.style.visibility = 'visible';
            backgroundSound.play();
        }

        buttonSoundOn.onclick = function () {
            soundON=false;
            buttonSoundOn.style.visibility = 'hidden';
            buttonSoundOff.style.visibility = 'visible';
            backgroundSound.pause();
        };

        buttonSoundOff.onclick = function () {
            soundON=true;
            buttonSoundOn.style.visibility = 'visible';
            buttonSoundOff.style.visibility = 'hidden';
        };


    if(!last || now - last >= 5000) { //level up ogni cinque secondi
        last = now;
        levelUp();
    }

    if(shield){
        pBar.style.backgroundColor = '#1689FC';
    }
    else {

        if (widthLife <= 25)
            pBar.style.backgroundColor = '#FF0000';
        if (widthLife <= 50 && widthLife > 25)
            pBar.style.backgroundColor = '#FF9900';
        if (widthLife <= 75 && widthLife > 50)
            pBar.style.backgroundColor = '#FFFF00';
        if (widthLife > 75)
            pBar.style.backgroundColor = '#00FF00';

    }
    if(widthLife==0) {
        gameOver();
        gameover = true;
    }
    if (!timerStarted && !shield){
        shieldSound.stop();
    }
    if (ROCK_LOADED == true && HEART_LOADED == true && SNOW_LOADED == true && COIN_LOADED == true) {
        addObs();

        ROCK_LOADED = false;
        HEART_LOADED = false;
        SNOW_LOADED = false;
        COIN_LOADED = false;
        startChr();

    }
    if (CAR_LOADED == true) {

        wheel2.rotation.x += wheelSpeed * 2;
        wheel3.rotation.x += wheelSpeed * 2;

        if(rotationW == true){
            wheel.rotation.y = Math.PI/2;
            wheel1.rotation.y = -Math.PI/2;

            rotationWheels();
        }

    }


    //render the scene
    animateObs();

    //gestione saldo coin
    mBar.style.width = widthMoney + '%';
    mBar.innerHTML = widthMoney;
    //gestione icona shield
    if(widthMoney >= SHIELD_REQ){
        shieldIcon.style.visibility = 'visible';
    }
    else
        shieldIcon.style.visibility = 'hidden';



    if (plane.position.z != 500) { //faccio scorrere il piano "verso lo schermo"
        plane.position.z += 1;
    } else
        plane.position.z = -1500; //al posto del secondo

    if (planeCopy.position.z != 500) { //faccio scorrere il piano "verso lo schermo"
        planeCopy.position.z += 1;
    } else
        planeCopy.position.z = -1500; //al posto del secondo

    if(bridgelt.position.z != 500){
        bridgelt.position.z += 1;
    } else
        bridgelt.position.z = -1500;

    if(bridgeltcopy.position.z != 500){
        bridgeltcopy.position.z += 1;
    } else
        bridgeltcopy.position.z = -1500;

    if(bridgert.position.z != 500){
        bridgert.position.z += 1;
    } else
        bridgert.position.z = -1500;

    if(bridgertcopy.position.z != 500){
        bridgertcopy.position.z += 1;
    } else
        bridgertcopy.position.z = -1500;

    camera.updateProjectionMatrix();
    renderer.render( scene, camera );
    }

    if(!gameover)
        id = requestAnimationFrame(render);



}


init();
addRock();
addHeart();
addSnow();
addCoin();
addCar();
setTimeout(render, 5000);


