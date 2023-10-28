

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

window.onload = function() {
    addEventListenner2list();
    let labels = ["Text","Heading","List","PCR temp","Table","Spread sheet","Calculator","Image editor","Checklist","Quote","Code"];
    let order = [0,1,2,3,4,5,6,7,8,9,10];
    let inputValues = ["","","","","","","","","","",""];
    generateListItems(labels, order, document.getElementById("menu_list"));
    generateTableRows(labels, order, inputValues, document.getElementById("menu_table"));
 }
  
  