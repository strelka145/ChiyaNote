function truncateString(inputString, maxLength) {
    if (inputString.length <= maxLength) {
        return inputString;
    } else {
        return inputString.slice(0, maxLength) + '...';
    }
}

async function reloadContents(input){
    const rows=await window.api.search(input);
    const contents=document.getElementById("contents");
    contents.innerHTML="";

    rows.forEach((row) => {
        const divElement = document.createElement("div");
        divElement.setAttribute("name","content");
        divElement.setAttribute("data-id",row.id);
        const h1Element = document.createElement("h1");
        const h1Text = document.createTextNode(row.name);
        h1Element.appendChild(h1Text);
        
        const pElement = document.createElement("p");
        const pText = document.createTextNode(truncateString(row.maintext,100));
        pElement.appendChild(pText);
        divElement.appendChild(h1Element);
        divElement.appendChild(pElement);
        divElement.addEventListener("dblclick", function(event){
            console.log(event.currentTarget);
            window.api.openNote(event.currentTarget.dataset.id);
        });
        divElement.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            window.api.showContextMenu(e.currentTarget.dataset.id);
        });
        contents.appendChild(divElement);
    });
}

window.api.rename((_event, value) => {
    const divWithId = document.querySelector('[data-id="'+String(value.id)+'"]');
    const h1Element = divWithId.querySelector('h1');
    h1Element.setAttribute("style","display:none;");
    const textBox = document.createElement('input');
    textBox.type = 'text';
    textBox.setAttribute("name",String(value.id));
    textBox.value=h1Element.textContent;
    divWithId.prepend(textBox);
    textBox.addEventListener("blur", function(event){
        const divWithId = document.querySelector('[data-id="'+event.currentTarget.getAttribute('name')+'"]');
        const h1Element = divWithId.querySelector('h1');
        h1Element.textContent=event.currentTarget.value;
        h1Element.setAttribute("style","");
        window.api.renameTable({
            name:event.currentTarget.value,
            id:event.currentTarget.getAttribute('name')
        });
        event.currentTarget.remove();
    });
});

function changeTab(index) {
    // Reset active status of tab buttons
    const buttons = document.querySelectorAll('.tab-button');
    buttons.forEach((button, i) => {
      if (i === index) {
        button.classList.add('active');
      } else {
        button.classList.remove('active');
      }
    });
  
    // Toggle tabbed content display
    const panes = document.querySelectorAll('.tab-pane');
    panes.forEach((pane, i) => {
      if (i === index) {
        pane.classList.add('active');
      } else {
        pane.classList.remove('active');
      }
    });
}