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
        divElement.classList.add("search-item");
        divElement.setAttribute("data-id",row.id);
        const title = document.createElement("div");
        title.classList.add("search-title");
        title.textContent=row.name;
        
        const description = document.createElement("div");
        description.classList.add("search-description");
        description.textContent=truncateString(row.maintext,100);
        divElement.appendChild(title);
        divElement.appendChild(description);
        divElement.addEventListener("dblclick", function(event){
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
    const titleElement = divWithId.querySelector('.search-title');
    titleElement.setAttribute("style","display:none;");
    const textBox = document.createElement('input');
    textBox.type = 'text';
    textBox.setAttribute("name",String(value.id));
    textBox.value=titleElement.textContent;
    divWithId.prepend(textBox);
    textBox.addEventListener("blur", function(event){
        const divWithId = document.querySelector('[data-id="'+event.currentTarget.getAttribute('name')+'"]');
        const titleElement = divWithId.querySelector('.search-title');
        titleElement.textContent=event.currentTarget.value;
        titleElement.setAttribute("style","");
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
