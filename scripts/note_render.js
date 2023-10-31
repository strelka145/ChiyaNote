class PCR{
    // editor jsにブロックの情報を渡す
    static get toolbox() {
        return{
            title: 'PCR temp',
            icon: pcr_icon,
        }
    } 
    static get enableLineBreaks() {
        return true;
    }
    constructor({data}){
        this.data = data;
        this.name=Math.random().toString(32).substring(2);
    }

    render(){
        const div = document.createElement('div');
        const div_husky = document.createElement('div');
        const input_box = document.createElement('textarea');
        const style = document.createElement('style');
        div_husky.setAttribute("name",this.name);
        input_box.setAttribute("name",this.name);
        input_box.classList.add("huskyInput");
        div_husky.setAttribute("style","display:none");
        if(this.data.temperature){
            input_box.value= this.data.temperature;
            let graph = new Husky(input_box.value);
            graph.makeGraph(div_husky);
            const image = document.createElement('img');
            const textEncoder = new TextEncoder('utf-8');
            const svgData = textEncoder.encode(div_husky.innerHTML);
            const base64EncodedSVG = btoa(String.fromCharCode.apply(null, svgData));
            image.setAttribute("src","data:image/svg+xml;base64,"+base64EncodedSVG);
            div_husky.innerHTML="";
            div_husky.appendChild(image);
            input_box.setAttribute("style","display:none");
            div_husky.setAttribute("style","");
        }
        div_husky.addEventListener("dblclick", (event) =>  {
            const name=event.currentTarget.getAttribute("name");
            const div_husky=document.querySelectorAll('div[name="'+name+'"]')[0];
            const input_box=document.querySelectorAll('textarea[name="'+name+'"]')[0];
            input_box.setAttribute("style","");
            div_husky.setAttribute("style","display:none");
            input_box.focus();
        });
        input_box.addEventListener("blur", (event) =>  {
            const name=event.currentTarget.getAttribute("name");
            const div_husky=document.querySelectorAll('div[name="'+name+'"]')[0];
            const input_box=document.querySelectorAll('textarea[name="'+name+'"]')[0];
            let graph = new Husky(input_box.value);
            graph.makeGraph(div_husky);
            //CSS in Editor.js is also reflected in embedded SVG, so SVG is encoded to base64 and embedded in img tags.
            const image = document.createElement('img');
            const textEncoder = new TextEncoder('utf-8');
            const svgData = textEncoder.encode(div_husky.innerHTML);
            const base64EncodedSVG = btoa(String.fromCharCode.apply(null, svgData));
            image.setAttribute("src","data:image/svg+xml;base64,"+base64EncodedSVG);
            div_husky.innerHTML="";
            div_husky.appendChild(image);
            input_box.setAttribute("style","display:none");
            div_husky.setAttribute("style","");
        });
        div.appendChild(div_husky);
        div.appendChild(input_box);

        return div;
    }

    save(data){
        return {
            temperature: document.querySelectorAll('textarea[name="'+this.name+'"]')[0].value
        }
    }
}



async function saveFile(){
    await editor.save().then((outputData) => {
        jsonData=JSON.stringify(outputData, null , "\t");
    }).catch((error) => {
        console.log('Saving failed: ', error)
    });
    const data={
        id:id,
        data:jsonData,
        maintext:document.getElementsByClassName("codex-editor__redactor")[0].textContent,
        right:document.getElementById("rightHead").value,
        center:document.getElementById("centerHead").value,
        left:document.getElementById("leftHead").value,
    };
    window.noteAPI.updateTable(data);
}

async function saveNewFile(){
    const editorElement=document.getElementById("editor");
    editorElement.setAttribute("style","");
    const headerElement=document.getElementById("header");
    headerElement.setAttribute("style","");
    const inputDivNameElement=document.getElementById("input_name");
    inputDivNameElement.setAttribute("style","display:none;");
    const inputNameElement=document.getElementById("inputName");
    let jsonData;
    await editor.save().then((outputData) => {
        console.log(JSON.stringify(outputData, null , "\t"));
        jsonData=JSON.stringify(outputData, null , "\t");
        console.log(jsonData);
    }).catch((error) => {
        console.log('Saving failed: ', error)
    });
    const data={
        data:jsonData,
        name:inputNameElement.value,
        maintext:document.getElementsByClassName("codex-editor__redactor")[0].textContent,
        right:document.getElementById("rightHead").value,
        center:document.getElementById("centerHead").value,
        left:document.getElementById("leftHead").value,
    };
    id=await window.noteAPI.newSave(data);
    console.log(id);
    const titleData={
        windowid:windowID,
        title:inputNameElement.value
    };
    window.noteAPI.reTitle(titleData);
}

window.noteAPI.onSave((_event, value) => {
    if(Number(value)==Number(windowID)){
        if (id<0){
            const editorElement=document.getElementById("editor");
            editorElement.setAttribute("style","display:none;");
            const headerElement=document.getElementById("header");
            headerElement.setAttribute("style","display:none;");
            const inputNameElement=document.getElementById("input_name");
            inputNameElement.setAttribute("style","");
        }else{
            saveFile();
        }
    }
});

window.noteAPI.onPrint((_event, value) => {
    if(Number(value)==Number(windowID)){
        if (id<0){
            const editorElement=document.getElementById("editor");
            editorElement.setAttribute("style","display:none;");
            const headerElement=document.getElementById("header");
            headerElement.setAttribute("style","display:none;");
            const inputNameElement=document.getElementById("input_name");
            inputNameElement.setAttribute("style","");
        }else{
            window.noteAPI.outPDF({
                id:id,
                windowid:windowID
            });
        }
    }
});

window.noteAPI.setImage((_event, value) => {
    let element = document.getElementById(value.id);
    let img = element.querySelector('img');
    console.log(value.data);
    img.setAttribute("src",value.data);
})
