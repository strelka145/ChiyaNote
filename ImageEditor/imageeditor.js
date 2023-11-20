document.addEventListener('keydown', function(event) {
    if ((event.key === 'Backspace' || event.key === 'Delete') && !isTextEditing()) {
        var activeObject = canvas.getActiveObject();
        if (activeObject) {
            canvas.remove(activeObject);
            canvas.renderAll();
        }
        event.preventDefault();
    }
});

document.addEventListener('paste', function(event) {
    var items = (event.clipboardData || event.originalEvent.clipboardData).items;

    for (var index in items) {
        var item = items[index];
        if (item.kind === 'file') {
            var blob = item.getAsFile();
            var reader = new FileReader();

            reader.onload = function(event) {
                addImageToCanvas(event.target.result);
            };
            reader.readAsDataURL(blob);
        }
    }
});

function addImageToCanvas(dataUrl) {
    fabric.Image.fromURL(dataUrl, function(img) {
        img.scale(0.5);
        canvas.add(img);
        canvas.setActiveObject(img);
        canvas.renderAll();
    });
}

function isTextEditing() {
    var activeObject = canvas.getActiveObject();
    return activeObject instanceof fabric.IText && activeObject.isEditing;
}

function addTextToCanvas(textContent) {
    var text = new fabric.IText(textContent, {
        left: 20,
        top: 60,
        fontSize: 20,
        editable: true,
        fontFamily: 'Segoe UI',
        snapAngle: 15,
    });
    canvas.add(text);
    canvas.renderAll();
}

document.onkeydown = function(e) {
    var isCtrlOrCmd = e.ctrlKey || e.metaKey; 
    if(isCtrlOrCmd && e.key === 'c'){
        if(canvas.getActiveObject()){
            canvas.getActiveObject().clone(function(cloned) {
                copiedObject = cloned;
            });
        }
    }

    if(isCtrlOrCmd && e.key === 'v'){
        if(copiedObject){
            copiedObject.clone(function(clonedObj){
                canvas.add(clonedObj);
                clonedObj.set({
                    left: clonedObj.left + 10,
                    top: clonedObj.top + 10,
                    evented: true,
                });
                canvas.setActiveObject(clonedObj);
                canvas.requestRenderAll();
            });
        }
    }
};

document.getElementById('btnAddText').addEventListener('click', function() {
    addTextToCanvas('TextBox');
});

document.getElementById('btnClear').addEventListener('click', function() {
    canvas.clear();
});

document.getElementById('btnSave').addEventListener('click', function() {
    var base64Data = canvas.toDataURL({
        format: 'webp',
        quality: 1,
        multiplier: 3
    });
    const urlParams = new URLSearchParams(window.location.search);
    window.ImageEditorAPI.sendImage({
        id:urlParams.get('id'),
        data:base64Data,
        json:canvas.toJSON(['width', 'height']),
    });
});

//Cancels the dragover event and enables the drop event.
canvas.wrapperEl.addEventListener('dragover', function(e) {
    e.preventDefault();
});

//Processes files dropped by the drop event.
canvas.wrapperEl.addEventListener('drop', function(e) {
    e.preventDefault();

    var files = e.dataTransfer.files;
    if (files.length > 0) {
        var file = files[0];
        if (file.type.includes('image')) {
            var reader = new FileReader();
            reader.onload = function(f) {
                var img = new Image();
                img.src = f.target.result;

                img.onload = function() {
                    var image = new fabric.Image(img);
                    canvas.add(image);
                    canvas.renderAll();
                }
            };
            reader.readAsDataURL(file);
        }
    }
});

const btnAddText =document.getElementById('btnAddText');
btnAddText.innerHTML = imageEditor_text_icon + btnAddText.innerHTML;

const btnClear =document.getElementById('btnClear');
btnClear.innerHTML = imageEditor_clear_icon + btnClear.innerHTML;

const btnSave =document.getElementById('btnSave');
btnSave.innerHTML = imageEditor_OK_icon + btnSave.innerHTML;
