const fs= require("fs/promises");
const { createInflate } = require("zlib");
(async () =>{
    //commands
    const CREATE_FILE="create a file";
    const DELETE_FILE="delete the file";
    const RENAME_FILE="rename the file";
    const ADD_TO_FILE="add to the file";
    const createFile = async(path) => {
        //to give error if there is already a file with that path
       let existingFileHandle;
        try{
        existingFileHandle = await fs.open(path,"r")
       existingFileHandle.close();
        //have the error
        return console.log("File already exits with that path");
    } catch(e) {
        //we dont have the file , now we should create it
        const newFileHandle=await fs.open(path,"w");
        console.log("A new file was successfully created");
        newFileHandle.close();
    }
       
        
    };

    const deleteFile=async(path)=>{
        //unlink cannot delete multiple files and directories but rm function can
        try{
          await fs.unlink(path);
          console.log("File was sucessfully removed");
        }
        catch(e){
            if(e.code === "ENOENT"){
                console.log("No file in the directory");
            }
            else{
                console.log("An error occured while removing the file");
                console.log(e);
            }

        }
    };
    const renameFile= async (oldPath,newPath) => {
       //using this function you can actually move the file around 
       try{ 
        await fs.rename(oldPath,newPath)
        console.log("File successfully renamed");
    }
        catch(e){
            if(e.code === "ENOENT"){
                console.log("No file in the directory to rename or destination does not exist");
        }
            else{
                console.log("An error occured while removing the file");
                console.log(e);
        }

    }
    };
    let addedContent;
    const addToFile= async (path,content) =>{
        //to prevent writing the content twice which is caused by doubl saving feature of vscode
        if(addedContent===content){ return};
        try{
            const fileHandle=await fs.open(path,"w");
            fileHandle.write(content);
            addedContent=content
            console.log("Content was added successfully");
        }
        catch(e){
            console.log("An error occured");
            console.log(e);
        }
    };
    
    const command_file_handler= await fs.open("./command.txt","r");
    //variables inside async are local to that block
    
    
  command_file_handler.on("change", async () => {
    const size = (await command_file_handler.stat()).size;
    const buff = Buffer.alloc(size);
    const offset = 0;
    const length = buff.byteLength;
    const position = 0;
    await command_file_handler.read(buff, offset, length, position);
    const commands = buff.toString("utf-8").split("\n");

    for (const command of commands) {
      // creating a file
      if (command.startsWith(CREATE_FILE)) {
        const filePath = command.substring(CREATE_FILE.length + 1);
        createFile(filePath);
      }

      // deleting a file with <path>
      if (command.startsWith(DELETE_FILE)) {
        const filePath = command.substring(DELETE_FILE.length + 1);
        deleteFile(filePath);
      }

      // renaming the file
      if (command.startsWith(RENAME_FILE)) {
        const _idx = command.indexOf(" to ");
        const oldFilePath = command.substring(RENAME_FILE.length + 1, _idx);
        const newFilePath = command.substring(_idx + 4);
        renameFile(oldFilePath, newFilePath);
      }

      // add to the file
      if (command.startsWith(ADD_TO_FILE)) {
        const _idx = command.indexOf(" this content: ");
        const filePath = command.substring(ADD_TO_FILE.length + 1, _idx);
        const content = command.substring(_idx + 15);
        addToFile(filePath, content);
      }
    }
  });
    //watch function invokes at any change in the file
    //async iterator
    //watching the whole directory("./")
    const watcher=fs.watch("./command.txt");
    for await (const event of watcher){
        //the file was chaged
        if(event.eventType === "change"){
            
            //to read a file you must open it first then you may read it or append it 
            //read() let us store the content as hexadecimals in a large buffer.
            //const content=await command_file_handler.read();
            command_file_handler.emit("change");
           
        }
        
    }
})();
