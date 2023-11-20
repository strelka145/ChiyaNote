class ImageEditor{
    static get toolbox() {
        return{
            title: 'ImageEditor',
            icon: imageEditor_icon,
        };
    } 

    constructor({data}){
        this.data = data.image;
        this.id=Math.random().toString(32).substring(2);
    }

    render(){
        if(this.data){
            const div = document.createElement('div');
            div.id=this.id;
            const img = document.createElement('img');
            img.setAttribute("src",this.data);
            img.setAttribute("style","width: 100%; height: auto; display: block;");
            div.appendChild(img);
            return div;
        }else{
            window.noteAPI.openImageEditor({
                id:this.id
            });
            const div = document.createElement('div');
            div.id=this.id;
            const img = document.createElement('img');
            img.setAttribute("src","undifined");
            img.setAttribute("style","width: 100%; height: auto; display: block;");
            div.appendChild(img);
            return div;
        }
        
    }

    save(data){
        const element = document.getElementById(this.id);
        const img = element.querySelector('img');
        const src = img.src;
        return {
            image:src,
            json:img.getAttribute('data-json')
        }
    }

}
