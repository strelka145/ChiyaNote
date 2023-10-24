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
        editable: true
    });
    canvas.add(text);
    canvas.renderAll();
}

document.getElementById('btnAddText').addEventListener('click', function() {
    addTextToCanvas('TextBox');
});

document.getElementById('btnClear').addEventListener('click', function() {
    canvas.clear();
});

document.getElementById('btnSave').addEventListener('click', function() {
    var base64Data = canvas.toDataURL({
        format: 'png',
        quality: 1
    });
    const urlParams = new URLSearchParams(window.location.search);
    window.ImageEditorAPI.sendImage({
        id:urlParams.get('id'),
        data:base64Data
    });
});

const btnAddText =document.getElementById('btnAddText');
btnAddText.innerHTML = imageEditor_text_icon + btnAddText.innerHTML;

const btnClear =document.getElementById('btnClear');
btnClear.innerHTML = imageEditor_clear_icon + btnClear.innerHTML;

const btnSave =document.getElementById('btnSave');
btnSave.innerHTML = imageEditor_OK_icon + btnSave.innerHTML;
