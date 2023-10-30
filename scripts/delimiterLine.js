class Delimiter{
    static get toolbox() {
        return{
            title: 'Delimiter',
            icon: delimiterLine_icon,
        }
    } 

    render(){
        const div = document.createElement('div');
        const hr = document.createElement('hr');
        hr.style.cssText ='border: 1.5px solid #666; border-radius: 5px; margin: 80px 0;';
        div.appendChild(hr);
        return div;
    }

    save(data){
        return {};
    }

}