var app = require('http').createServer(handler),
        io = require('socket.io').listen(app),
        static = require('node-static'),
        fs = require('fs'), // for serving files
        util = require('util');
//var jQuery = require('jquery');
//var jsdom = require('jsdom');

var fileServer = new static.Server('./');

var port = process.env.PORT || 8080; 
app.listen(port);

function handler(request, response) {

    request.addListener('end', function() {
        fileServer.serve(request, response);
    });
    request.resume();

}


var drawings = {};
var usersOnline = {};
var drawingsFile = "test.txt";
var drawingsStr = "";
var defaultRoom = "Default";

var currentlyDragging = {};

fs.readFile(drawingsFile, function(err, info) {
    if (err)
        throw err;
    var array = info.toString().split("\n");
    for (var i = 0; i < array.length; i++)
        drawingsStr += array[i];
    //console.log("object: \n");
    drawings = eval("(" + drawingsStr + ")");
    //console.log(drawings);
    for (var room in drawings)
        usersOnline[room] = 0;
});


//drawings.cat = [];
//drawings.dog = [];
//
//drawings.cat[0] = "password";
//drawings.dog[0] = "password";
//
//drawings.cat[1] = [],
//        drawings.cat[2] = [];
//drawings.dog[1] = [];
////drawings.dog[2] = [];
//
////CAT - 2 STROKES
//drawings.cat[1][0] = "#0F2357";        //colour
//drawings.cat[1][1] = 30;               //size
//drawings.cat[1][2] = 0.7;              //opacity 
//drawings.cat[1][3] = false;            //eraser 
//drawings.cat[1][4] = [0, 0, 0.9];      //point 1
//drawings.cat[1][5] = [100, 29, 0.5];   //point 2
//drawings.cat[1][6] = [400, 300, 0.1];  //point 2
//
//drawings.cat[2][0] = "#00000C";        //colour
//drawings.cat[2][1] = 30;               //size
//drawings.cat[2][2] = 0.3;              //opacity 
//drawings.cat[2][3] = false;            //eraser 
//drawings.cat[2][4] = [100, 100, 0.9];  //point 1
//drawings.cat[2][5] = [20, 30, 0.5];    //point 2
//drawings.cat[2][6] = [500, 300, 0.1];  //point 2
//
////DOG - 1 STROKE
//drawings.dog[1][0] = "#BEEF00";
//drawings.dog[1][1] = 50;
//drawings.dog[1][2] = 0.2;
//drawings.dog[1][3] = false;
//drawings.dog[1][4] = [0, 0, 1.0];
//drawings.dog[1][5] = [200, 200, 0.7];
//drawings.dog[1][6] = [300, 200, 0.9];
//drawings.dog[1][7] = [100, 50, 0.2];

function printRooms() {
//    console.log("ROOMS------------");
//    for (var index in drawings) {
//        console.log("\nDRAWING " + index + ": ");
//        console.log(drawings[index]);
//        //console.log(index);
//    }
}

printRooms();

// Delete this row if you want to see debug messages
io.set('log level', 1);

io.configure(function () { 
	  io.set("transports", ["xhr-polling"]); 
	  io.set("polling duration", 10); 
	});

// Listen for incoming connections from clients
io.sockets.on('connection', function(socket) {

    var thisId = "";

    socket.on('new client', function(data) {
        socket.room = data.room;
        currentlyDragging[data.id] = false;
        thisId = data.id;
        //console.log("new client " + thisId);
    });

    socket.on('disconnect', function() {
        //console.log(socket.room);
        //console.log("client " + thisId + " disconnected");
        currentlyDragging[thisId] = false;
        delete currentlyDragging[thisId];
        usersOnline[socket.room]--;
        //console.log(usersOnline);
    });

    socket.on('check if currently dragging', function(data) {
        var dragging = false;
        for (var client in currentlyDragging) {
            if (currentlyDragging[client])
                dragging = true;
        }
        //console.log(dragging);
        socket.broadcast.to(data.room).emit('currently dragging info', {
            'dragging': dragging
        });

    });

    socket.on('save drawings', function() {

        //console.log(util.format('%j', drawings));
        var drawingsStr = util.format('%j', drawings); 
//        drawingsStr = "{";
//
//        for (var index in drawings) {
//            if (index != defaultRoom) {
//                try {
//                    drawingsStr += "\"" + index + "\":\n";
//                    drawingsStr += "[ 'password',\n";
//                    for (var i = 1; i < drawings[index].length; i++) {
//                        drawingsStr += "[ \'" + drawings[index][i][0] + "\',\n";
//                        drawingsStr += drawings[index][i][1] + ",\n";
//                        drawingsStr += drawings[index][i][2] + ",\n";
//                        drawingsStr += drawings[index][i][3] + ",\n";
//                        for (var j = 4; j < drawings[index][i].length; j++) {
//                            drawingsStr += "[ " + drawings[index][i][j][0] + ", " + drawings[index][i][j][1] + ", " + drawings[index][i][j][2] + " ],";
//                        }
//                        drawingsStr += "],\n";
//                    }
//                    drawingsStr += "],\n";
//                } catch (e) {
//                    console.log(e);
//                    console.log(index);
//                }
//            }
//        }
//
//        try {
//            drawingsStr += "\"" + defaultRoom + "\":\n";
//            drawingsStr += "[ 'password',\n";
//            for (var i = 1; i < drawings[defaultRoom].length; i++) {
//                drawingsStr += "[ \'" + drawings[defaultRoom][i][0] + "\',\n";
//                drawingsStr += drawings[defaultRoom][i][1] + ",\n";
//                drawingsStr += drawings[defaultRoom][i][2] + ",\n";
//                drawingsStr += drawings[defaultRoom][i][3] + ",\n";
//                for (var j = 4; j < drawings[defaultRoom][i].length; j++) {
//                    drawingsStr += "[ " + drawings[defaultRoom][i][j][0] + ", " + drawings[index][i][j][1] + ", " + drawings[index][i][j][2] + " ],";
//                }
//                drawingsStr += "],\n";
//            }
//            drawingsStr += "],\n";
//        } catch (e) {
//            console.log(e);
//        }
//        drawingsStr += "}";

        fs.writeFile(drawingsFile, drawingsStr, function(err) {
            if (err)
                console.log(err);
            //console.log("saved drawings"); 
        });


    });

    socket.on('join room', function(data) {
        socket.leave(data.currentRoom);
        usersOnline[data.currentRoom]--;
        socket.broadcast.to(data.currentRoom).emit('user left room', data);

        socket.join(data.room);
        usersOnline[data.room]++;
        socket.room = data.room;
        socket.broadcast.to(data.room).emit('user joined room', data);

        console.log(io.sockets.manager.rooms);
        console.log(usersOnline);

        if (drawings[data.room] === undefined) {
            //create new room
            //console.log("creating a new room " + data.room);
            drawings[data.room] = [];
            usersOnline[data.room] = 1;
            drawings[data.room][0] = "password";
            socket.emit('load drawing', {
                'drawing': drawings[data.room]
            });
            io.sockets.emit('new room created', data);
        } else {
            //console.log("the room exists");
            drawings[data.room][0] = "password";
            socket.emit('load drawing', {
                'drawing': drawings[data.room]
            });

        }

        io.sockets.emit('update rooms list', {
            'oldRoom': data.currentRoom,
            'room': data.room,
            'usersOnline': usersOnline
        })
        printRooms();


    });

    socket.on('mousemove', function(data) {
        //console.log(data.curStrokeNum);
        if (data.dragging) {
//            drawings[data.room] = data.drawing;
            //printRooms()
            //console.log([data.room, drawings[data.room].length, data.curStrokeNum]);
            drawings[data.room][data.curStrokeNum][drawings[data.room][data.curStrokeNum].length] = [data.xCoord, data.yCoord, data.pressure];
            currentlyDragging[data.id] = true;
            //console.log(currentlyDragging);
        }
//        drawings[data.room] = data.drawing;
        socket.broadcast.to(data.room).emit('moving', data);
    });

    socket.on('mousedown', function(data) {

        drawings[data.room][data.curStrokeNum] = [];
        drawings[data.room][data.curStrokeNum][0] = data.color;
        drawings[data.room][data.curStrokeNum][1] = data.size;
        drawings[data.room][data.curStrokeNum][2] = data.opacity;
        drawings[data.room][data.curStrokeNum][3] = data.eraser;

        socket.broadcast.to(data.room).emit('other user mousedown', data);

    });

    socket.on('clearCanvas', function(data) {
        drawings[data.room] = data.drawing;
        socket.broadcast.to(data.room).emit('clear', data);
    });

    socket.on('up', function(data) {
        currentlyDragging[data.id] = false;
        //console.log(currentlyDragging);
        socket.broadcast.to(data.room).emit('otherUserMouseup', data);
    });

    socket.on('undo', function(data) {
        drawings[data.room].length = drawings[data.room].length - 1;
        socket.broadcast.to(data.room).emit('otherUserUndo', data);
    });

    socket.on('redo', function(data) {
        drawings[data.room] = data.drawing;
        socket.broadcast.to(data.room).emit('otherUserRedo', data);
    });

    socket.on('save drawing', function(data) {

        fs.writeFile(data.fileName, data.canvasStr, function(err) {
            if (err)
                throw err;
        });

        var infoFileData = data.password + "\n" + data.numOfStrokes + "\n";

        fs.writeFile(data.infoFileName, infoFileData, function(err) {
            if (err)
                throw err;
            console.log('It\'s saved!');
        });

    });

    socket.on('list drawings', function(data) {
        fs.readdir("./DrawingFiles", function(error, allFiles) {
            for (var i = 0; i < allFiles.length; i++) {
                console.log(allFiles[i] + "\n");
                socket.emit('file goes here', allFiles[i]);
            }
        });
    });

    socket.on('get room list', function() {
        var listOfRooms = [];
        for (var room in drawings)
            listOfRooms.push(room);
        //console.log(listOfRooms);
        socket.emit('room list received', {
            'listOfRooms': listOfRooms,
            'usersOnline': usersOnline
        });
//        fs.readdir("./DrawingFiles", function(error, listOfRooms) {
//            socket.emit('room list received', {
//                'listOfRooms': listOfRooms
//            });
//        });
    });

    socket.on('load file', function(data) {
        var testPass = data.testPassword.trim();
        fs.exists(data.infoFileName, function(exists) {
            if (exists) {
                fs.readFile(data.infoFileName, function(err, info) {
                    if (err)
                        throw err;
                    var array = info.toString().split("\n");
                    var pass = array[0].trim();
                    if (pass == testPass) {
                        var num = array[1];
                        fs.readFile(data.fileName, function(err, canvas) {
                            if (err)
                                throw err;
                            socket.to(data.room).emit('loading', {
                                'alert': "false",
                                'pass': "true",
                                'num': num,
                                'canvasstr': canvas.toString()
                            });
                            console.log(canvas);

                        });
                    } else {
                        socket.to(data.room).emit('loading', {
                            'alert': "false",
                            'pass': "false"
                        });
                    }
                });
            }

            else {
                socket.to(data.room).emit('loading', {
                    'alert': "true",
                    'pass': "false"
                });
            }
        })

    });

    socket.on('send message', function(data) {
        socket.broadcast.to(data.room).emit('message received', data);
    });

});