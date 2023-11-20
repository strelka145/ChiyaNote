class ImageEditor{
    static get toolbox() {
        return{
            title: 'ImageEditor',
            icon: imageEditor_icon,
        };
    } 

    constructor({data}){
        this.data = data.image;
        this.jsonData = data.json;
        this.element=undefined;
        this.id=Math.random().toString(32).substring(2);
    }

    render(){
        if(this.data&&!(this.jsonData)){
            const div = document.createElement('div');
            div.id=this.id;
            const img = document.createElement('img');
            img.setAttribute("src",this.data);
            img.setAttribute("style","width: 100%; height: auto; display: block;");
            div.appendChild(img);
            this.element=div;
            return div;
        }else if(this.jsonData){
            const div = document.createElement('div');
            div.id=this.id;
            const img = document.createElement('img');
            img.setAttribute("src",this.data);
            img.setAttribute("data-json",this.jsonData);
            img.setAttribute("style","width: 100%; height: auto; display: block;");
            img.addEventListener("dblclick", (event) =>  {
                window.noteAPI.openImageEditor({
                    id:this.id,
                    json:event.currentTarget.getAttribute('data-json')
                });
            });
            div.appendChild(img);
            this.element=div;
            return div;
        }else{
            window.noteAPI.openImageEditor({
                id:this.id,
                json:""
            });
            const div = document.createElement('div');
            div.id=this.id;
            const img = document.createElement('img');
            img.setAttribute("src","undifined");
            img.setAttribute("style","width: 100%; height: auto; display: block;");
            img.addEventListener("dblclick", (event) =>  {
                window.noteAPI.openImageEditor({
                    id:this.id,
                    json:event.currentTarget.getAttribute('data-json')
                });
            });
            div.appendChild(img);
            this.element=div;
            return div;
        }
        
    }

    save(data){
        const img = this.element.querySelector('img');
        const src = img.src;
        return {
            image:src,
            json:img.getAttribute('data-json')
        }
    }

}
