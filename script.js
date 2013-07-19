var $ = jQuery; 
var socket;
var id = Math.round($.now() * Math.random());
var username = "user" + id;
username = username.substring(0, 7);
var drawing = [];
var curStrokeNum;

var color = "#000000",
        size = 30,
        opacity = 0.5,
        pressure = 1.0;

var currentX,
        currentY,
        currentP;

var drawingCanvas, drawingCtx;
var tempCanvas, tempCtx;

var eraser;
var wPlugin;
var room;
var password;
var fileName;
var infoFileName;

var prevCanvasses, nextCanvasses;
var nextStrokes;

var canvasStr = "";
var numOfStrokes;
var colors = [];

var opacities = [];
var widths = [];
var times = [];
var xCoords = [];
var yCoords = [];
var pressureArrays = [];

var tempcolors = [];
var tempopacities = [];
var tempwidths = [];
var temptimes = [];
var tempxCoords = [];
var tempyCoords = [];
var temppressureArrays = [];

var CANVAS_WIDTH = 933,
        CANVAS_HEIGHT = 500,
        CANVAS_TOP = "320px",
        CANVAS_LEFT = "10px";

var chatContent = $('#content');

function getWacomPlugin() {
    return document.getElementById('wtPlugin');
}

function getPressure() {
    pressure = 1;
    if (wPlugin && wPlugin.penAPI && (wPlugin.penAPI.pointerType == 1 || wPlugin.penAPI.pointerType == 3)) {
        pressure = wPlugin.penAPI.pressure;
    }
}

$(function() {

    // The URL of your web server (the port is set in app.js)
    socket = io.connect();

    var chatContent = $('#content');
    wPlugin = getWacomPlugin();

    prevCanvasses = [];
    nextCanvasses = [];
    nextStrokes = [];

    drawing = [];
    curStrokeNum = drawing.length;

    //room = "room" + Math.floor(Math.random() * 100000);
    room = "Default";
    initializeRoom(room);


    $("#sizeSlider").slider({
        orientation: "horizontal",
        range: "min",
        max: 250,
        value: 30,
        slide: setSize,
        change: setSize
    });

    $("#opacitySlider").slider({
        orientation: "horizontal",
        range: "min",
        max: 1.0,
        value: 0.5,
        step: 0.01,
        slide: setOpacity,
        change: setOpacity
    });

//    $("#clear")
//            .button()
//            .click(function(e) {
//
//
//        prevCanvasses.push(drawingCtx.canvas.toDataURL("image/png"));
//        for (var i = 1; i < drawing.length; i++) {
//            nextStrokes.push(drawing[drawing.length - 1]);
//            drawing.length = drawing.length - 1;
//        }
//        drawingCtx.clearRect(0, 0, drawingCtx.canvas.width, drawingCtx.canvas.height);
//
//
//        socket.emit('clearCanvas', {
//            'room': room
//        });
//    });

    $("#save")
            .button()
            .click(function(e) {

        socket.emit('save drawings');

    });

    $("#toolPicker").buttonset();
    $("#radio1").click(function() {
        eraser = false;
    });
    $("#radio2").click(function() {
        eraser = true;
    });

    $("#undo")
            .button()
            .click(function(e) {

//        socket.emit('check if currently dragging', {
//            'room': room
//        });
//
//        socket.on('currently dragging info', function(data) {
//            console.log("currently dragging info received, dragging = " + data.dragging);
//            if (!data.dragging) {
//                console.log("undo");
//                if (prevCanvasses.length > 0) {
//                    nextCanvasses.push(drawingCtx.canvas.toDataURL("image/png"));
//                    tempCtx.globalCompositeOperation = 'source-over';
//                    drawingCtx.globalCompositeOperation = 'source-over';
//                    drawingCtx.globalAlpha = 1.0;
//                    tempCtx.globalAlpha = 1.0;
//                    var prevCanvasImg = new Image();
//                    prevCanvasImg.src = prevCanvasses.pop();
//                    //console.log("prevcanvas pop; length = " + prevCanvasses.length);
//                    prevCanvasImg.onload = function() {
//                        tempCtx.drawImage(prevCanvasImg, 0, 0);
//                        drawingCtx.clearRect(0, 0, drawingCtx.canvas.width, drawingCtx.canvas.height);
//                        drawingCtx.drawImage(tempCtx.canvas, 0, 0);
//                        tempCtx.clearRect(0, 0, tempCtx.canvas.width, tempCtx.canvas.height);
//                    }
//
//                    nextStrokes.push(drawing[drawing.length - 1]);
//                    drawing.length = drawing.length - 1;
//
//                    socket.emit('undo', {
//                        'room': room,
//                        'drawing': drawing
//                    });
//                }
//            } else {
//                console.log("can't undo, someone be drawing");
//            }
//        });
    });

    $("#redo")
            .button()
            .click(function(e) {

//        if (nextCanvasses.length > 0) {
//
//            tempCtx.globalCompositeOperation = 'source-over';
//            drawingCtx.globalCompositeOperation = 'source-over';
//            drawingCtx.globalAlpha = 1.0;
//            tempCtx.globalAlpha = 1.0;
//            var nextCanvasImg = new Image();
//            nextCanvasImg.src = nextCanvasses.pop();
//            nextCanvasImg.onload = function() {
//                prevCanvasses.push(drawingCtx.canvas.toDataURL("image/png"));
//                tempCtx.drawImage(nextCanvasImg, 0, 0);
//                drawingCtx.clearRect(0, 0, drawingCtx.canvas.width, drawingCtx.canvas.height);
//                drawingCtx.drawImage(tempCtx.canvas, 0, 0);
//                tempCtx.clearRect(0, 0, tempCtx.canvas.width, tempCtx.canvas.height);
//            }
//
//            console.log("drawing length = " + drawing.length);
//            if (drawing.length = 1) {
//                for (var i = 1; i < nextStrokes.length; i++) {
//                    drawing[drawing.length] = nextStrokes.pop();
//                }
//            } else {
//                drawing[drawing.length] = nextStrokes.pop();
//            }
//            console.log(drawing);
//
//        }
//
//
//
//        socket.emit('redo', {
//            'room': room,
//            'drawing': drawing
//        });
    });

    //$("#save").button();
    $("#replay").button()
            .click(function(e) {
        console.log(drawing);

        drawingCanvas = $('#drawingCanvas'),
                drawingCtx = drawingCanvas[0].getContext('2d');
        drawingCtx.clearRect(0, 0, drawingCtx.canvas.width, drawingCtx.canvas.height);

        //go through each stroke 
        var i = 1;
        var replay = setInterval(function() {

            i++;
            console.log(i);
            if (i = drawing.length) {
                clearInterval(replay);
                console.log("replay complete");
            }

            var thisColor = drawing[i][0],
                    thisSize = drawing[i][1],
                    thisOpacity = drawing[i][2],
                    thisEraser = drawing[i][3],
                    xArray = [],
                    yArray = [];

            $("#tempCanvas").css("opacity", thisOpacity);

            //go through each point in this stroke
            for (var j = 4; j < drawing[i].length; j++) {
                xArray.push(drawing[i][j][0]);
                yArray.push(drawing[i][j][1]);
                var thisPressure = drawing[i][j][2];

                if (thisEraser) {
                    drawingCtx.globalAlpha = 1.0;
                    drawLine(xArray, yArray, thisColor, thisSize * thisPressure, thisEraser, drawingCtx);
                    drawingCtx.globalAlpha = opacity;
                } else {
                    drawLine(xArray, yArray, thisColor, thisSize * thisPressure, thisEraser, tempCtx);
                }

            }

            prevCanvasses.push(drawingCtx.canvas.toDataURL("image/png"));
            drawingCtx.globalAlpha = thisOpacity;
            drawingCtx.drawImage(tempCtx.canvas, 0, 0);
            tempCtx.clearRect(0, 0, tempCtx.canvas.width, tempCtx.canvas.height);
            drawingCtx.globalAlpha = opacity;


        }, 1000);




    });

    $("#joinRoom").button().click(function(e) {
        var roomName = prompt("What would you like to name your new doodl?")
        joinRoom(roomName);
    });

    $("#setUsername").button({
        icons: {primary: "ui-icon-person"
        },
        text: false});

    socket.on('load drawing', function(data) {

        drawingCanvas = $('#drawingCanvas'),
                drawingCtx = drawingCanvas[0].getContext('2d');
        drawingCtx.clearRect(0, 0, drawingCtx.canvas.width, drawingCtx.canvas.height);

        drawing = data.drawing;
        console.log(drawing);

        //go through each stroke 
        for (var i = 1; i < drawing.length; i++) {

            var thisColor = drawing[i][0],
                    thisSize = drawing[i][1],
                    thisOpacity = drawing[i][2],
                    thisEraser = drawing[i][3],
                    xArray = [],
                    yArray = [];

            $("#tempCanvas").css("opacity", thisOpacity);

            //go through each point in this stroke
            for (var j = 4; j < drawing[i].length; j++) {
                xArray.push(drawing[i][j][0]);
                yArray.push(drawing[i][j][1]);
                var thisPressure = drawing[i][j][2];

                if (thisEraser) {
                    drawingCtx.globalAlpha = 1.0;
                    drawLine(xArray, yArray, thisColor, thisSize * thisPressure, thisEraser, drawingCtx);
                    drawingCtx.globalAlpha = opacity;
                } else {
                    drawLine(xArray, yArray, thisColor, thisSize * thisPressure, thisEraser, tempCtx);
                }

            }

            prevCanvasses.push(drawingCtx.canvas.toDataURL("image/png"));
            drawingCtx.globalAlpha = thisOpacity;
            drawingCtx.drawImage(tempCtx.canvas, 0, 0);
            tempCtx.clearRect(0, 0, tempCtx.canvas.width, tempCtx.canvas.height);
            drawingCtx.globalAlpha = opacity;
        }
    });

//Color picker stuff
    {
        var curShadeX = 100;
        colorPreviewCtx = $('#colorPreview')[0].getContext('2d');
        colorPickerCtx = $('#colorPicker')[0].getContext('2d');
        shadePickerCtx = $('#shadePicker')[0].getContext('2d');

        var cpImage = new Image();
        cpImage.src = 'Images/colorPicker2.png';
        var selectedColor;
        cpImage.onload = function() {
            colorPickerCtx.drawImage(cpImage, 0, 0);
            var data = colorPickerCtx.getImageData(200, 20, 1, 1).data;
            selectedColor = rgbToHex(data[0], data[1], data[2]);
            //console.log(selectedColor);
            //updateShadePicker(selectedColor);

            var spImage = new Image();
            spImage.src = 'Images/shadePicker2.png';
            spImage.onload = function() {
                var data = colorPickerCtx.getImageData(200, 20, 1, 1).data;
                selectedColor = rgbToHex(data[0], data[1], data[2]);
                shadePickerCtx.fillStyle = selectedColor;
                shadePickerCtx.fillRect(3, 0, shadePickerCtx.canvas.width - 6, shadePickerCtx.canvas.height);
                shadePickerCtx.drawImage(spImage, 0, 0);
                var data = shadePickerCtx.getImageData(curShadeX, 10, 1, 1).data;
                //console.log(data);
                var selectedColor = rgbToHex(data[0], data[1], data[2]);
                //console.log(selectedColor);
                setColor(selectedColor);


                //username = prompt("Welcome to Doodlr! Please select a username to get started:");

            }

        }

        colorSelectorCtx = $('#colorSelector')[0].getContext('2d');
        colorSelectorCtx.strokeStyle = "#c3c3c3";
        colorSelectorCtx.beginPath()
        colorSelectorCtx.moveTo(200, 0);
        colorSelectorCtx.lineTo(200, 44);
        colorSelectorCtx.stroke();
        colorSelectorCtx.strokeStyle = "#FFFFFF";
        colorSelectorCtx.beginPath()
        colorSelectorCtx.moveTo(202, 0);
        colorSelectorCtx.lineTo(202, 44);
        colorSelectorCtx.stroke();

        shadeSelectorCtx = $('#shadeSelector')[0].getContext('2d');
        shadeSelectorCtx.strokeStyle = "#c3c3c3";
        shadeSelectorCtx.beginPath()
        shadeSelectorCtx.moveTo(curShadeX - 1, 0);
        shadeSelectorCtx.lineTo(curShadeX - 1, 24);
        shadeSelectorCtx.stroke();
        shadeSelectorCtx.strokeStyle = "#FFFFFF";
        shadeSelectorCtx.beginPath()
        shadeSelectorCtx.moveTo(curShadeX + 1, 0);
        shadeSelectorCtx.lineTo(curShadeX + 1, 24);
        shadeSelectorCtx.stroke();

        var colorDragging = false,
                shadeDragging = false;

        $('#colorSelector').on('mousedown', function(e) {
            e.preventDefault();
            colorDragging = true;
            drawSelector(colorSelectorCtx, e.pageX - this.offsetLeft);
            var data = colorPickerCtx.getImageData(e.pageX - this.offsetLeft, 20, 1, 1).data;
            var selectedColor = rgbToHex(data[0], data[1], data[2]);
            updateShadePicker(selectedColor);
        });
        $('#colorSelector').on('mousemove', function(e) {
            e.preventDefault();
            if (colorDragging) {
                drawSelector(colorSelectorCtx, e.pageX - this.offsetLeft);
                var data = colorPickerCtx.getImageData(e.pageX - this.offsetLeft, 20, 1, 1).data;
                var selectedColor = rgbToHex(data[0], data[1], data[2]);
                updateShadePicker(selectedColor);
                var data = shadePickerCtx.getImageData(curShadeX, 10, 1, 1).data;
                var selectedColor = rgbToHex(data[0], data[1], data[2]);
                setColor(selectedColor);
            }

        });
        $('#colorSelector').on('mouseup mouseleave', function(e) {
            e.preventDefault();
            colorDragging = false;
        });

        $('#shadeSelector').on('mousedown', function(e) {
            e.preventDefault();
            curShadeX = e.pageX - this.offsetLeft;
            //console.log(curShadeX);

            shadeDragging = true;
            drawSelector(shadeSelectorCtx, e.pageX - this.offsetLeft);
            var data = shadePickerCtx.getImageData(e.pageX - this.offsetLeft, 10, 1, 1).data;
            var selectedColor = rgbToHex(data[0], data[1], data[2]);
            setColor(selectedColor);
        });
        $('#shadeSelector').on('mousemove', function(e) {
            e.preventDefault();
            if (shadeDragging) {
                curShadeX = e.pageX - this.offsetLeft;
                //console.log(curShadeX);

                drawSelector(shadeSelectorCtx, e.pageX - this.offsetLeft);
                var data = shadePickerCtx.getImageData(e.pageX - this.offsetLeft, 10, 1, 1).data;
                var selectedColor = rgbToHex(data[0], data[1], data[2]);
                setColor(selectedColor);
            }

        });
        $('#shadeSelector').on('mouseup mouseleave', function(e) {
            e.preventDefault();
            shadeDragging = false;
        });

        function drawSelector(ctx, xCoord) {
            ctx.strokeStyle = "#c3c3c3";
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            ctx.beginPath()
            ctx.moveTo(xCoord - 1, 0);
            ctx.lineTo(xCoord - 1, 44);
            ctx.stroke();
            ctx.strokeStyle = "#FFFFFF";
            ctx.beginPath()
            ctx.moveTo(xCoord + 1, 0);
            ctx.lineTo(xCoord + 1, 44);
            ctx.stroke();
        }

        function updateShadePicker(newColor) {

            var spImage = new Image();
            spImage.src = 'Images/shadePicker2.png';
            spImage.onload = function() {
                shadePickerCtx.fillStyle = newColor;
                shadePickerCtx.fillRect(3, 0, shadePickerCtx.canvas.width - 6, shadePickerCtx.canvas.height);
                shadePickerCtx.drawImage(spImage, 0, 0);
                var data = shadePickerCtx.getImageData(curShadeX, 10, 1, 1).data;
                var selectedColor = rgbToHex(data[0], data[1], data[2]);
                setColor(selectedColor);
            }
        }
    }

// This demo depends on the canvas element
    if (!('getContext' in document.createElement('canvas'))) {
        alert('Sorry, it looks like your browser does not support canvas!');
        return false;
    }

    drawingCanvas = $('#drawingCanvas'),
            drawingCtx = drawingCanvas[0].getContext('2d'),
            tempCanvas = $('#tempCanvas'),
            tempCtx = tempCanvas[0].getContext('2d');
    eraser = false;
    instructions = $('#instructions');

    // A flag for drawing activity
    var dragging = false;
    var clients = {};
    var cursors = {};
    var canvasses = {};
    var totalUsers = 1;

    socket.on('other user mousedown', function(data) {
        //console.log(['pre-o-u-m', data, drawing.length]);
        drawing[data.curStrokeNum] = [];
        drawing[data.curStrokeNum][0] = data.color;
        drawing[data.curStrokeNum][1] = data.size;
        drawing[data.curStrokeNum][2] = data.opacity;
        drawing[data.curStrokeNum][3] = data.eraser;
        //console.log(['poat-o-u-m', data, drawing.length]);

        $("#canvas" + data.id).css("opacity", data.opacity);

    });

    socket.on('moving', function(data) {

        if (!(data.id in clients)) {
            // a new user has come online. create a cursor for them
            cursors[data.id] = $('<div class="cursor">').appendTo('#cursors');
            var newCanvasId = "canvas" + data.id;

            if ($('#' + newCanvasId).length === 0) {

                var newCanvas = document.createElement('canvas');
                newCanvas.id = "canvas" + data.id;
                newCanvas.width = CANVAS_WIDTH;
                newCanvas.height = CANVAS_HEIGHT;
                newCanvas.style.position = "absolute";
                newCanvas.style.top = CANVAS_TOP;
                newCanvas.style.left = CANVAS_LEFT;
                newCanvas.style.border = "3px solid #c3c3c3";
                newCanvas.style.borderRadius = "10px";
                $('#canvasses').append(newCanvas);
                canvasses[data.id] = newCanvas.getContext("2d");
            }
            totalUsers++;
            console.log("Number of users online: " + totalUsers);

            socket.emit('new client', {
                'id': id,
                'room': room
            });
        }

        // Move the mouse pointer
        cursors[data.id].css({
            'left': data.x,
            'top': data.y
        });

        if (data.dragging && clients[data.id]) {

            nextCanvasses.length = 0;
            nextStrokes.length = 0;
            //$("#tempCanvas").css("opacity", data.opacity);

            if (data.eraser) {
                drawingCtx.globalAlpha = 1.0;
                drawLine(data.currentX, data.currentY, data.color, data.size * data.pressure, data.eraser, drawingCtx);
                drawingCtx.globalAlpha = opacity;
            } else {

                $("#canvas" + data.id).css("opacity", data.opacity);

                drawLine(data.currentX, data.currentY, data.color, data.size * data.pressure, false, canvasses[data.id]);
            }
        }

        // Saving the current client state
        clients[data.id] = data;
        clients[data.id].updated = $.now();
    });
    socket.on('otherUserMouseup', function(data) {
        prevCanvasses.push(drawingCtx.canvas.toDataURL("img/png"));
        numOfStrokes++;
        //console.log("number of strokes: " + numOfStrokes);

        drawingCtx.globalAlpha = data.opacity;
        drawingCtx.drawImage(canvasses[data.id].canvas, 0, 0);
        canvasses[data.id].clearRect(0, 0, canvasses[data.id].canvas.width, canvasses[data.id].canvas.height);
        drawingCtx.globalAlpha = opacity;
    });
    socket.on('clear', function(data) {
        clearCanvas();
    });
    socket.on('otherUserUndo', function(data) {

        nextCanvasses.push(drawingCtx.canvas.toDataURL("image/png"));
        tempCtx.globalCompositeOperation = 'source-over';
        drawingCtx.globalCompositeOperation = 'source-over';
        drawingCtx.globalAlpha = 1.0;
        tempCtx.globalAlpha = 1.0;
        var prevCanvasImg = new Image();
        prevCanvasImg.src = prevCanvasses.pop();
        //console.log("prevcanvas pop; length = " + prevCanvasses.length);
        prevCanvasImg.onload = function() {
            tempCtx.drawImage(prevCanvasImg, 0, 0);
            drawingCtx.clearRect(0, 0, drawingCtx.canvas.width, drawingCtx.canvas.height);
            drawingCtx.drawImage(tempCtx.canvas, 0, 0);
            tempCtx.clearRect(0, 0, tempCtx.canvas.width, tempCtx.canvas.height);
        }


        numOfStrokes--;
//        tempcolors.push(colors.pop());
//        tempopacities.push(opacities.pop());
//        tempwidths.push(width.pop());
//        temptime.push(times.pop());
//        tempxCoords.push(xCoords.pop());
//        tempyCoords.push(yCoords.pop());
//        temppressureArrays.push(pressureArrays.pop());
    });
    socket.on('otherUserRedo', function(data) {
        prevCanvasses.push(drawingCtx.canvas.toDataURL("image/png"));
        if (nextCanvasses.length > 0) {

            tempCtx.globalCompositeOperation = 'source-over';
            drawingCtx.globalCompositeOperation = 'source-over';
            drawingCtx.globalAlpha = 1.0;
            tempCtx.globalAlpha = 1.0;
            var nextCanvasImg = new Image();
            nextCanvasImg.src = nextCanvasses.pop();
            nextCanvasImg.onload = function() {
                prevCanvasses.push(drawingCtx.canvas.toDataURL("image/png"));
                tempCtx.drawImage(nextCanvasImg, 0, 0);
                drawingCtx.clearRect(0, 0, drawingCtx.canvas.width, drawingCtx.canvas.height);
                drawingCtx.drawImage(tempCtx.canvas, 0, 0);
                tempCtx.clearRect(0, 0, tempCtx.canvas.width, tempCtx.canvas.height);
            }

            numOfStrokes++;
            colors.push(tempcolors.pop());
            opacities.push(tempopacities.pop());
            width.push(tempwidths.pop());
            times.push(temptime.pop());
            xCoords.push(tempxCoords.pop());
            yCoords.push(tempyCoords.pop());
            pressureArrays.push(temppressureArrays.pop());
        }
    });

//##Canvas mouse events#########################################################
    tempCanvas.on('mousedown', function(e) {
        curStrokeNum = drawing.length;
        //console.log("curStrokeNum: " + curStrokeNum);

        e.preventDefault();
        dragging = true;
        nextCanvasses.length = 0;
        drawingCtx.globalAlpha = opacity;
        times.push($.now());
        currentX = [e.pageX - this.offsetLeft];
        currentY = [e.pageY - this.offsetTop];
        getPressure();
        currentP = [pressure];

        $("#tempCanvas").css("opacity", opacity);

        if (eraser) {
            drawingCtx.globalAlpha = 1.0;
            drawLine(currentX, currentY, color, size * pressure, eraser, drawingCtx);
            drawingCtx.globalAlpha = opacity;
        } else {
            drawLine(currentX, currentY, color, size * pressure, eraser, tempCtx);
        }

//        if (drawing.length > 0) {
//            drawing[drawing.length] = [];
//        } else {
//            drawing[drawing.length + 1] = [];
//        }
        drawing[curStrokeNum] = [];
        drawing[curStrokeNum][0] = color;
        drawing[curStrokeNum][1] = size;
        drawing[curStrokeNum][2] = opacity;
        drawing[curStrokeNum][3] = eraser;
        drawing[curStrokeNum][4] = [e.pageX - this.offsetLeft, e.pageY - this.offsetTop, pressure];

        //console.log(drawing);

        socket.emit('mousedown', {
            'room': room,
            'curStrokeNum': curStrokeNum,
            'eraser': eraser,
            'color': color,
            'size': size,
            'opacity': opacity,
            'id': id
        })


        var curX = [currentX[currentX.length - 1]];
        var curY = [currentY[currentY.length - 1]];
        if (currentX.length > 1) {
            curX.push(currentX[currentX.length - 2]);
            curY.push(currentY[currentY.length - 2]);
        }

        console.log("X " + curX);
        console.log("Y " + curY);

        socket.emit('mousemove', {
            'x': e.pageX,
            'y': e.pageY,
            'currentX': curX,
            'currentY': curY,
            'dragging': dragging,
            'eraser': eraser,
            'color': color,
            'size': size,
            'opacity': opacity,
            'xCoord': e.pageX - this.offsetLeft,
            'yCoord': e.pageY - this.offsetTop,
            'pressure': pressure,
            'id': id,
            'room': room,
            //'drawing': drawing,
            'curStrokeNum': curStrokeNum
        });

        instructions.fadeOut();
    });
    tempCanvas.on('mousemove', function(e) {
        curStrokeNum = drawing.length - 1;

        var curX = [];
        var curY = [];

        if (dragging) {

            //console.log("curStrokeNum: " + curStrokeNum);

            currentX.push(e.pageX - this.offsetLeft);
            currentY.push(e.pageY - this.offsetTop);
            getPressure();
            currentP.push(pressure);
            if (eraser) {
                drawingCtx.globalAlpha = 1.0;
                drawLine(currentX, currentY, color, size * pressure, eraser, drawingCtx);
                drawingCtx.globalAlpha = opacity;
            } else {
                drawLine(currentX, currentY, color, size * pressure, eraser, tempCtx);
            }
            //console.log("curStrokeNum: " + curStrokeNum); 
            drawing[curStrokeNum][drawing[curStrokeNum].length] = [e.pageX - this.offsetLeft, e.pageY - this.offsetTop, pressure];
            //console.log(drawing);
            curX = [currentX[currentX.length - 1]];
            curY = [currentY[currentY.length - 1]];
            if (currentX.length > 1) {
                curX.push(currentX[currentX.length - 2]);
                curY.push(currentY[currentY.length - 2]);
            }
        }



        socket.emit('mousemove', {
            'x': e.pageX,
            'y': e.pageY,
            'currentX': curX,
            'currentY': curY,
            'dragging': dragging,
            'eraser': eraser,
            'color': color,
            'size': size,
            'opacity': opacity,
            'xCoord': e.pageX - this.offsetLeft,
            'yCoord': e.pageY - this.offsetTop,
            'pressure': pressure,
            'id': id,
            'room': room,
            //'drawing': drawing,
            'curStrokeNum': drawing.length - 1
        });

    });
    tempCanvas.on('mouseup mouseleave', function() {

        if (dragging) {
            prevCanvasses.push(drawingCtx.canvas.toDataURL("img/png"));
            //console.log("prevcanvas push; length = " + prevCanvasses.length);

            numOfStrokes++;
            //console.log("number of strokes: " + numOfStrokes);

            colors.push(color);
            opacities.push(opacity);
            widths.push(size);
            xCoords.push(currentX);
            yCoords.push(currentY);
            pressureArrays.push(currentP);
//            erasers.push(eraser.toString()); 
//            
//            save(); 

            drawingCtx.globalAlpha = opacity;
            drawingCtx.drawImage(tempCtx.canvas, 0, 0);
            tempCtx.clearRect(0, 0, tempCtx.canvas.width, tempCtx.canvas.height);

            socket.emit('up', {
                'opacity': opacity,
                'id': id,
                'room': room
            });
        }
        dragging = false;
        pressure = 1.0;
    });

    // Remove inactive clients after 10 seconds of inactivity
    setInterval(function() {

        for (ident in clients) {
            if ($.now() - clients[ident].updated > 10000) {
                cursors[ident].remove();
                delete clients[ident];
                delete cursors[ident];
                totalUsers--;
                console.log("Number of users online: " + totalUsers);
            }
        }

    }, 10000);

    //save the drawings every 2 seconds 
    setInterval(function() {
        socket.emit('save drawings');
    }, 100000);

//    function drawLine(fromx, fromy, tox, toy, ctx) {
//        ctx.lineJoin = "round";
//        ctx.lineCap = "round";
//        ctx.strokeStyle = color;
//        ctx.lineWidth = size * pressure;
//        ctx.globalAlpha = opacity;
//        ctx.moveTo(fromx, fromy);
//        ctx.lineTo(tox, toy);
//        ctx.stroke();
//    }

    //for drawing your own strokes
    function drawStroke(ctx) {

        if (eraser) {
            tempCtx.globalCompositeOperation = 'destination-out';
            drawingCtx.globalCompositeOperation = 'destination-out';
        } else {
            tempCtx.globalCompositeOperation = 'source-over';
            drawingCtx.globalCompositeOperation = 'source-over';
        }

        ctx.lineJoin = "round";
        ctx.lineCap = "round";
        var prevX, prevY;
        if (currentX.length > 1) {
            prevX = currentX[currentX.length - 2];
            prevY = currentY[currentY.length - 2];
        } else {
            prevX = currentX[currentX.length - 1] - 0.1;
            prevY = currentY[currentY.length - 1];
        }

        ctx.lineWidth = size * pressure;
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.moveTo(prevX, prevY);
        ctx.lineTo(currentX[currentX.length - 1], currentY[currentY.length - 1]);
        ctx.stroke();
    }

    //for drawing strokes from other users 
    function drawLine(xArray, yArray, color, size, eraser, ctx) {
        if (eraser) {
            tempCtx.globalCompositeOperation = 'destination-out';
            drawingCtx.globalCompositeOperation = 'destination-out';
        } else {
            tempCtx.globalCompositeOperation = 'source-over';
            drawingCtx.globalCompositeOperation = 'source-over';
        }

        ctx.lineJoin = "round";
        ctx.lineCap = "round";
        var prevX, prevY;
        if (xArray.length > 1) {
            prevX = xArray[xArray.length - 2];
            prevY = yArray[yArray.length - 2];
        } else {
            prevX = xArray[xArray.length - 1] - 0.1;
            prevY = yArray[yArray.length - 1];
        }

        ctx.lineWidth = size;
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.moveTo(prevX, prevY);
        ctx.lineTo(xArray[xArray.length - 1], yArray[yArray.length - 1]);
        ctx.stroke();
    }

//##############MESSAGING STUFFS################################################

    chatContent = $('#content');
    var chatInput = $('#input');
    chatContent.html($('<p>', {text: 'Start chatting!'}));
    chatInput.mousedown(function(e) {
        $(this).val('');
    });
    chatInput.keydown(function(e) {
        if (e.keyCode === 13) {
            var message = $(this).val();
            if (!message) {
                return;
            }

            chatContent.append($('<p><b>' + username + ': </b>' + message + '</p>'));
            $(this).val('');
            chatContent.scrollTop(chatContent[0].scrollHeight);
            //document.getElementById('content').scrollTo(document.getElementById('content').scrollHeight); 
            //document.getElementById(numMessages).scrollIntoView(true); 
            //$(this).scrollIntoView(true); 

            socket.emit('send message', {
                'username': username,
                'message': message,
                'room': room
            });
        }
    });
    socket.on('message received', function(data) {
        chatContent.append($('<p><b>' + data.username + ': </b>' + data.message + '</p>'));
        chatContent.scrollTop(chatContent[0].scrollHeight);
    });

    socket.on('user joined room', function(data) {
        chatContent.append($('<p><b>' + data.username + ' </b> has joined the doodl. Say hello!</p>'));
        chatContent.scrollTop(chatContent[0].scrollHeight);
    });

    socket.on('user left room', function(data) {
        chatContent.append($('<p><b>' + data.username + ' </b> has left the doodl :(</p>'));
        chatContent.scrollTop(chatContent[0].scrollHeight);
    });

//############ROOMS STUFF#######################################################    

    var roomList = $('#roomList');
    //roomList.html($('<p><b> Join a room! </b></p>'));
    socket.emit('get room list');
    socket.on('room list received', function(data) {
        for (var i = 0; i < data.listOfRooms.length; i++) {
            var roomName = data.listOfRooms[i];
            roomList.prepend($('<center><button id = \"' + roomName + '\" style = "width: 230px;">' + roomName + ' (' + data.usersOnline[roomName] + ' ' + 'users)</button></center>'));
        }

        $("button").each(function(index) {
            //console.log(index + ": " + $(this).text());
            if (index > 5) {
                $(this).button()
                        .css('height', '35px')
                        .click(function() {
                    //var roomName = $(this).text().substring(0, $(this).text().indexOf("(")).trim();
                    var roomName = $(this)[0].id;
                    joinRoom(roomName);
                    chatContent.append($('<p> You have joined the doodl <b>' + roomName + '</b>. Start drawing!</p>'));
                    chatContent.scrollTop(chatContent[0].scrollHeight);
                })
            }
        });
//    var roomList = $('#roomList');
//    roomList.html($('<p><b> Join a room! </b></p>'));
//    socket.emit('get room list');
//    socket.on('room list received', function(data) {
//        for (var i = 0; i < data.listOfRooms.length; i++) {
//            var roomName = data.listOfRooms[i].substring(0, data.listOfRooms[i].length - 4);
//            roomList.append($('<button id = \"' + roomName + '\" style = "width: 191px;">' + roomName + '</button>'));
//        }
//
//        $("button").each(function(index) {
//            //console.log(index + ": " + $(this).text());
//            if (index > 3) {
//                $(this).button()
//                        .click(function() {
//                    joinRoom($(this).text());
//                    chatContent.append($('<p> You have joined the room <b>' + $(this).text() + '</b>. Start drawing!</p>'));
//                    chatContent.scrollTop(chatContent[0].scrollHeight);
//                })
//            }
//        });
    });

    socket.on('new room created', function(data) {
        roomList.prepend($('<center><button id = \"' + data.room + '\" style = "width: 230px;">' + data.room + '</button></center>'));

        $('#' + data.room).button()
                .css('height', '35px')
                .click(function() {
            joinRoom($(this)[0].id);
            chatContent.append($('<p> You have joined the room <b>' + $(this)[0].id + '</b>. Start drawing!</p>'));
            chatContent.scrollTop(chatContent[0].scrollHeight);
        });

    });

    socket.on('update rooms list', function(data) {
        $('#' + data.room).text(data.room + " (" + data.usersOnline[data.room] + " users)");
        $('#' + data.oldRoom).text(data.oldRoom + " (" + data.usersOnline[data.oldRoom] + " users)");
    });
});

function joinRoom(roomName) {

    prevCanvasses.length = 0;
    nextCanvasses.length = 0
    nextStrokes.length = 0;

    drawingCanvas = $('#drawingCanvas'),
            drawingCtx = drawingCanvas[0].getContext('2d');
    drawingCtx.clearRect(0, 0, drawingCtx.canvas.width, drawingCtx.canvas.height);

    var currentRoom = room;
    room = roomName;

    socket.emit('join room', {
        'currentRoom': currentRoom,
        'room': room,
        'username': username,
    });
}

function initializeRoom(roomName) {

    prevCanvasses.length = 0;
    nextCanvasses.length = 0
    nextStrokes.length = 0;

    drawingCanvas = $('#drawingCanvas'),
            drawingCtx = drawingCanvas[0].getContext('2d');
    drawingCtx.clearRect(0, 0, drawingCtx.canvas.width, drawingCtx.canvas.height);

    socket.emit('join room', {
        'currentRoom': "",
        'room': roomName,
        'username': username,
    });
}

function setUsername() {
    username = prompt("Enter your new username!");
}
function setSize() {
    size = $("#sizeSlider").slider("value");
}

function setOpacity(dir) {
    opacity = $("#opacitySlider").slider("value");
    $("#tempCanvas").css("opacity", opacity);
    updateColorPreview();
}

function updateColorPreview() {
    colorPreviewCtx = $('#colorPreview')[0].getContext('2d');
    $("#colorPreview").css("opacity", opacity);
    colorPreviewCtx.fillStyle = color;
    colorPreviewCtx.fillRect(0, 0, colorPreviewCtx.canvas.width, colorPreviewCtx.canvas.height);
}

function setColor(newColor) {
    color = newColor;
    updateColorPreview();
    //console.log(newColor);
}

function clearCanvas() {
    prevCanvasses.push(drawingCtx.canvas.toDataURL("image/png"));
    drawingCtx.clearRect(0, 0, drawingCtx.canvas.width, drawingCtx.canvas.height);
    //socket.emit('clearCanvas', {});
}

function toggleEraser() {
    //console.log("toggle le eraser");
    eraser = !eraser;
}

//convert RGB values to 6-digit hex value
function rgbToHex(r, g, b) {

    return "#" + convertOne(r) + convertOne(g) + convertOne(b);
}

//convert 3-digit decimal value to 2-digit hex value
function convertOne(n) {

    var hexdigits = "0123456789ABCDEF";
    var hex = "";
    hex += hexdigits.charAt(Math.floor(n / 16));
    hex += hexdigits.charAt(n % 16);
    return hex;
}