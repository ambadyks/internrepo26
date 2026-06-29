class MotionSenseAI {

    constructor() {

        /* =============================
           UI ELEMENTS
        ============================== */

        this.startBtn = document.getElementById("startBtn");

        this.sensorStatus =
            document.getElementById("sensorStatus");

        this.sensorMode =
            document.getElementById("sensorMode");

        this.modelStatus =
            document.getElementById("modelStatus");

        this.prediction =
            document.getElementById("prediction");

        this.confidence =
            document.getElementById("confidence");

        this.xValue =
            document.getElementById("xValue");

        this.yValue =
            document.getElementById("yValue");

        this.zValue =
            document.getElementById("zValue");

        this.fpsCounter =
            document.getElementById("fpsCounter");

        this.historyList =
            document.getElementById("historyList");

        this.clearHistoryBtn =
            document.getElementById("clearHistory");

        /* =============================
           PROBABILITY BARS
        ============================== */

        this.circleBar =
            document.getElementById("circleBar");

        this.leftBar =
            document.getElementById("leftBar");

        this.upBar =
            document.getElementById("upBar");

        this.restBar =
            document.getElementById("restBar");

        this.circleValue =
            document.getElementById("circleValue");

        this.leftValue =
            document.getElementById("leftValue");

        this.upValue =
            document.getElementById("upValue");

        this.restValue =
            document.getElementById("restValue");

        /* =============================
           CANVAS
        ============================== */

        this.canvas =
            document.getElementById("waveCanvas");

        this.ctx =
            this.canvas.getContext("2d");

        this.resizeCanvas();

        window.addEventListener(
            "resize",
            () => this.resizeCanvas()
        );

        /* =============================
           SENSOR VALUES
        ============================== */

        this.ax = 0;
        this.ay = 0;
        this.az = 0;

        /* =============================
           HISTORY FOR GRAPH
        ============================== */

        this.graphX = [];
        this.graphY = [];
        this.graphZ = [];

        this.MAX_GRAPH_POINTS = 250;

        /* =============================
           MODEL BUFFER

           Edge Impulse uses

           X Y Z
           X Y Z
           X Y Z
        ============================== */

        this.modelBuffer = [];

        this.MAX_MODEL_POINTS = 125;

        /* =============================
           FPS
        ============================== */

        this.lastFrame =
            performance.now();

        this.fps = 0;

        /* =============================
           MODEL
        ============================== */

        this.classifier = null;

        this.runner = null;

        this.modelLoaded = false;

        this.isPredicting = false;
        /* =============================
           FLAGS
        ============================== */

        this.sensorRunning = false;

        /* =============================
           INITIAL UI
        ============================== */

        this.resetUI();

        /* =============================
           EVENTS
        ============================== */

        this.startBtn.addEventListener(
            "click",
            () => this.startSensors()
        );

        this.clearHistoryBtn.addEventListener(
            "click",
            () => {
                this.historyList.innerHTML="";
            }
        );

    }

    /*======================================
        RESET UI
    ======================================*/

    resetUI() {

        this.sensorStatus.textContent =
            "Waiting";

        this.sensorMode.textContent =
            "--";

        this.modelStatus.textContent =
            "Loading...";

        this.prediction.textContent =
            "--";

        this.confidence.textContent =
            "0%";

        this.updateProbabilityBars({

            Circle:0,
            LeftRight:0,
            UpDown:0,
            Rest:0

        });

    }

    /*======================================
        CANVAS
    ======================================*/

    resizeCanvas() {

        this.canvas.width =
            this.canvas.clientWidth;

        this.canvas.height =
            this.canvas.clientHeight;

    }

    /*======================================
        PROBABILITY BAR
    ======================================*/

    updateProbabilityBars(prob){

        const lookup = this.normalizeProbKeys(prob);

        this.setBar(
            this.circleBar,
            this.circleValue,
            lookup["circle"] || 0
        );

        this.setBar(
            this.leftBar,
            this.leftValue,
            lookup["leftright"] || 0
        );

        this.setBar(
            this.upBar,
            this.upValue,
            lookup["updown"] || 0
        );

        this.setBar(
            this.restBar,
            this.restValue,
            lookup["rest"] || 0
        );

    }

    /*======================================
        NORMALIZE LABEL KEYS

        Edge Impulse label strings can vary
        in case/spacing/underscores depending
        on how the project was set up
        (e.g. "Left_Right", "left-right",
        "LeftRight" should all match).
    ======================================*/

    normalizeProbKeys(prob){

        const out={};

        for(const key in prob){

            const cleanKey=
                key.toLowerCase()
                   .replace(/[\s_-]/g,"");

            out[cleanKey]=prob[key];

        }

        return out;

    }

    setBar(bar,label,value){

        const percent =
            (value*100).toFixed(1);

        bar.style.width =
            percent+"%";

        label.textContent =
            percent+"%";

    }

    /*======================================
        START SENSOR
    ======================================*/

    async startSensors(){

        if(this.sensorRunning)
            return;

        this.sensorRunning = true;

        this.startBtn.disabled = true;

        this.startBtn.textContent =
            "Connecting...";

        if(

            typeof DeviceMotionEvent !==
            "undefined"

            &&

            typeof DeviceMotionEvent.requestPermission ===
            "function"

        ){

            try{

                const permission =
                    await DeviceMotionEvent.requestPermission();

                if(permission!=="granted"){

                    alert(
                        "Motion permission denied."
                    );

                    this.startBtn.disabled=false;

                    this.startBtn.textContent=
                        "Enable Motion Sensors";

                    return;

                }

            }

            catch(err){

                console.error(err);

            }

        }

        window.addEventListener(

            "devicemotion",

            (event)=>
            this.handleMotion(event)

        );

        this.sensorStatus.textContent =
            "Connected";

        this.sensorMode.textContent =
            "DeviceMotion";

        this.startBtn.textContent =
            "✅ Sensors Active";

    }

    /*======================================
        HANDLE SENSOR
    ======================================*/

    handleMotion(event){

    let x = 0;
    let y = 0;
    let z = 0;

    if(event.acceleration){

        x = event.acceleration.x || 0;
        y = event.acceleration.y || 0;
        z = event.acceleration.z || 0;

    }

    else if(event.accelerationIncludingGravity){

        x = event.accelerationIncludingGravity.x || 0;
        y = event.accelerationIncludingGravity.y || 0;
        z = event.accelerationIncludingGravity.z || 0;

    }

    this.ax = x;
    this.ay = y;
    this.az = z;

    /* Update sensor values */

    this.xValue.textContent = x.toFixed(2) + " m/s²";
    this.yValue.textContent = y.toFixed(2) + " m/s²";
    this.zValue.textContent = z.toFixed(2) + " m/s²";

    /* Update timestamp */

    const now = new Date();

    document.getElementById("lastUpdate").textContent =
        now.toLocaleTimeString() + "." +
        String(now.getMilliseconds()).padStart(3, "0");

}

    
    /*======================================
        UPDATE BUFFERS
    ======================================*/

    updateBuffers(){

        /* ---------- Graph ---------- */

        this.graphX.push(this.ax);
        this.graphY.push(this.ay);
        this.graphZ.push(this.az);

        if(this.graphX.length>this.MAX_GRAPH_POINTS){

            this.graphX.shift();
            this.graphY.shift();
            this.graphZ.shift();

        }

        /* ---------- Model Buffer ---------- */

        this.modelBuffer.push({

            x:this.ax,
            y:this.ay,
            z:this.az

        });

        if(this.modelBuffer.length>this.MAX_MODEL_POINTS){

            this.modelBuffer.shift();

        }

    }

    /*======================================
        DRAW GRID
    ======================================*/

    drawGrid(){

        const ctx=this.ctx;

        ctx.strokeStyle="rgba(255,255,255,.08)";

        ctx.lineWidth=1;

        /* Horizontal */

        for(let y=0;y<=this.canvas.height;y+=40){

            ctx.beginPath();

            ctx.moveTo(0,y);

            ctx.lineTo(this.canvas.width,y);

            ctx.stroke();

        }

        /* Vertical */

        for(let x=0;x<=this.canvas.width;x+=40){

            ctx.beginPath();

            ctx.moveTo(x,0);

            ctx.lineTo(x,this.canvas.height);

            ctx.stroke();

        }

    }

    /*======================================
        DRAW SIGNAL
    ======================================*/

    drawSignal(data,color){

        if(data.length<2)
            return;

        const ctx=this.ctx;

        ctx.beginPath();

        ctx.strokeStyle=color;

        ctx.lineWidth=2;

        for(let i=0;i<data.length;i++){

            const px=

                i/(data.length-1)

                *this.canvas.width;

            const py=

                this.canvas.height/2

                -

                data[i]*8;

            if(i===0)

                ctx.moveTo(px,py);

            else

                ctx.lineTo(px,py);

        }

        ctx.stroke();

    }

    /*======================================
        DRAW
    ======================================*/

    draw(){

        this.ctx.clearRect(

            0,
            0,

            this.canvas.width,
            this.canvas.height

        );

        this.drawGrid();

        this.drawSignal(

            this.graphX,

            "#00E5FF"

        );

        this.drawSignal(

            this.graphY,

            "#00FFA3"

        );

        this.drawSignal(

            this.graphZ,

            "#FF4E7A"

        );

    }

    /*======================================
        ANIMATION LOOP
    ======================================*/

    animate=(time)=>{

        const delta=time-this.lastFrame;

        this.lastFrame=time;

        this.fps=Math.round(

            1000/delta

        );

        this.fpsCounter.textContent=

            this.fps+" FPS";

        this.updateBuffers();

        this.draw();

        this.maybePredict();

        requestAnimationFrame(

            this.animate

        );

    }

    /*======================================
        START APP
    ======================================*/

    start(){

        requestAnimationFrame(

            this.animate

        );

        this.loadModel();

    }

    /*======================================
        RUN PREDICTION

        Edge Impulse expects a flat array:
        [x,y,z, x,y,z, x,y,z, ...]
    ======================================*/

    maybePredict(){

        if(!this.modelLoaded)
            return;

        if(this.isPredicting)
            return;

        if(this.modelBuffer.length<this.MAX_MODEL_POINTS)
            return;

        this.isPredicting=true;

        try{

            const flatData=[];

            for(const sample of this.modelBuffer){

                flatData.push(
                    sample.x,
                    sample.y,
                    sample.z
                );

            }

            const result=
                this.classifier.classify(flatData);

            this.handlePrediction(result);

        }

        catch(err){

            console.error(err);

        }

        finally{

            this.isPredicting=false;

        }

    }

    /*======================================
        HANDLE PREDICTION RESULT
    ======================================*/

    handlePrediction(result){

        if(!result || !result.results)
            return;

        console.log("Edge Impulse result:", result.results);

        const probs={};

        let best=null;

        for(const r of result.results){

            probs[r.label]=r.value;

            if(!best || r.value>best.value){

                best=r;

            }

        }

        this.updateProbabilityBars(probs);

        if(best){

            this.prediction.textContent=
                best.label;

            this.confidence.textContent=

                (best.value*100).toFixed(1)+"%";

            this.addHistoryEntry(

                best.label,
                best.value

            );

        }

    }

    /*======================================
        HISTORY
    ======================================*/

    addHistoryEntry(label,value){

        const li=
            document.createElement("li");

        const time=
            new Date().toLocaleTimeString();

        li.textContent=

            `${time} — ${label} `+

            `(${(value*100).toFixed(1)}%)`;

        this.historyList.prepend(li);

        while(this.historyList.children.length>20){

            this.historyList.removeChild(

                this.historyList.lastChild

            );

        }

    }
    /*======================================
    LOAD MODEL
======================================*/

async loadModel(){

    try{

        this.modelStatus.textContent="Loading...";

        this.runner=new EdgeImpulseClassifier();

        await this.runner.init();

        this.classifier=this.runner;

        this.modelLoaded=true;

        this.modelStatus.textContent="Ready";

        console.log("Model Loaded");

        console.log(

            this.runner.getProjectInfo()

        );

    }

    catch(err){

        console.error(err);

        this.modelStatus.textContent="Error";

    }

}

}

/*=========================================
    CREATE APPLICATION
=========================================*/

const app = new MotionSenseAI();
app.start();