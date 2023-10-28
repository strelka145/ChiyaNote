

function addEventListenner2list() {
    document.querySelectorAll('.drag-list li').forEach(elm => {
        elm.ondragstart = function(e) {
            e.dataTransfer.setData('text/plain', e.target.id);
        };
        elm.ondragover = function(e) {
            e.preventDefault();
            let rect = this.getBoundingClientRect();
            if ((e.clientY - rect.top) < (this.clientHeight / 2)) {
                this.style.borderTop = '2px solid #666666';
                this.style.borderBottom = '';
            } else {
                this.style.borderTop = '';
                this.style.borderBottom = '2px solid #666666';
            }
        };
        elm.ondragleave = function() {
            this.style.borderTop = '';
            this.style.borderBottom = '';
        };
        elm.ondrop = function(e) {
            e.preventDefault();
            let id = e.dataTransfer.getData('text/plain');
            let elm_drag = document.getElementById(id);

            let rect = this.getBoundingClientRect();
            if ((e.clientY - rect.top) < (this.clientHeight / 2)) {
                this.parentNode.insertBefore(elm_drag, this);
            } else {
                this.parentNode.insertBefore(elm_drag, this.nextSibling);
            }
            this.style.borderTop = '';
            this.style.borderBottom = '';
        };
    });
}

  
  
function getLiNumbers(ulId) {
    const ulElement = document.getElementById(ulId);
  
    // Get the id from the li of the child element of ul and take out only the integer part after it and store it in an array
    const numbers = Array.from(ulElement.children)
                         .map(li => li.id)
                         .map(id => parseInt(id.replace('item', ''), 10));
  
    return numbers;
}

function generateListItems(elements, order, parentElement) {
    parentElement.innerHTML = "";

    for(let i = 0; i < order.length; i++) {
        let li = document.createElement("li");
        li.id = "item" + order[i];
        li.draggable = true;
        li.textContent = elements[order[i]];
        parentElement.appendChild(li);
    }
    addEventListenner2list();
}
  
function generateTableRows(labels, order, inputValues, parentElement) {
    parentElement.innerHTML = "";

    for(let i = 0; i < order.length; i++) {
        let tr = document.createElement("tr");
  
        let td1 = document.createElement("td");
        td1.textContent = labels[order[i]];
        tr.appendChild(td1);
  
        let td2 = document.createElement("td");
        let input = document.createElement("input");
        input.type = "text";
        input.className = "text-input";
        input.id = "input" + order[i];
        input.value = inputValues[order[i]];
        td2.appendChild(input);
        tr.appendChild(td2);
  
        parentElement.appendChild(tr);
      }
}

function getInputValuesFromTable(tableElement) {
    const inputs = tableElement.querySelectorAll(".text-input");
    let valuesArray = [];

    Array.from(inputs).sort((a, b) => {
        const aNum = parseInt(a.id.replace("input", ""), 10);
        const bNum = parseInt(b.id.replace("input", ""), 10);
        return aNum - bNum;
    }).forEach(input => {
        valuesArray.push(input.value);
    });

    return valuesArray;
}

function setSettings(){
    window.api.setConfigs({
        label:configs.label,
        order:getLiNumbers("menu_list"),
        shortcut:getInputValuesFromTable(document.getElementById("menu_table")),
        saveDirectory:document.getElementById("saveD").value,
        tableName:document.getElementById("TableName").value,
    });
}

async function selectDir(){
    const save_path = await window.api.selctDir();
    if(save_path!=""){
        document.getElementById("saveD").value=save_path;
    }
}

function validateAlphabetOnly(inputElement) {
    // Replace any non-alphabet characters
    inputElement.value = inputElement.value.replace(/[^a-zA-Z]/g, '');
}

window.onload = async function() {
    configs = await window.api.getConfigs();
    addEventListenner2list();
    generateListItems(configs.label, configs.order, document.getElementById("menu_list"));
    generateTableRows(configs.label, configs.order, configs.shortcut, document.getElementById("menu_table"));
    document.getElementById("saveD").value=configs.saveDirectory;
    document.getElementById("TableName").value=configs.tableName;
}

let configs;