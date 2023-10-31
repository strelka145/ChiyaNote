class Jspreadsheet{
    static get toolbox() {
        return{
            title: 'Spread sheet',
            icon: spreadsheet_icon,
        }
    } 
    static get enableLineBreaks() {
        return true;
    }
    constructor({data}){
        this.data = data;
        this.id=this.name=Math.random().toString(32).substring(2);
        this.table=undefined;
    }

    render(){
        const div = document.createElement('div');
        const divTable = document.createElement('div');
        divTable.setAttribute("id",this.id);
        div.appendChild(divTable);
        if(this.data.table){
            let data=JSON.parse(this.data.table);
            let columns=[];
            let count=0;
            for (const key in data[0]) {
                if (data[0].hasOwnProperty(key)) {
                    if(this.data.width){
                        columns.push({
                            name: key,
                            title: key,
                            width:this.data.width[count]
                        });
                    }else{
                        columns.push({
                            name: key,
                            title: key
                        });
                    }
                }
                count++;
            }

            this.table=jspreadsheet(divTable,{
                data:data,
                columns:columns
            });
        }else{
            let data=[['','',''],['','','']];
            this.table=jspreadsheet(divTable,{
                data:data,
                columns: [
                    {title:"A"},
                    {title:"B"},
                    {title:"C"}
                ]
            });
        }
        return div;
    }

    save(data){
        return {
            table: JSON.stringify(this.table.getJson()),
            width:this.table.getWidth(),
        }
    }
}
