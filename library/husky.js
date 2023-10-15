class Husky {
    constructor(table){
        let separatedStrings = table.split(/;/);
        separatedStrings.pop();
        if(separatedStrings.length==1){
            this.temperature_list=separatedStrings[0].match(/[\d\.]+/g).map(Number);
            this.time_list=Array(this.temperature_list.length).fill('');
            this.memo_list=Array(this.temperature_list.length).fill('');
        }else if(separatedStrings.length==2){
            this.temperature_list=separatedStrings[0].match(/[\d\.]+/g).map(Number);
            this.time_list=separatedStrings[1].split(/,/).map(item => item.trim());
            this.memo_list=Array(this.temperature_list.length).fill('');
        }else if(separatedStrings.length==3){
            this.temperature_list=separatedStrings[0].match(/[\d\.]+/g).map(Number);
            this.time_list=separatedStrings[1].split(/,/).map(item => item.trim());
            this.memo_list=separatedStrings[2].split(/,/).map(item => item.trim());
        }
        this.width=125*this.temperature_list.length;
        this.svgElement =document.createElementNS("http://www.w3.org/2000/svg", "svg");
        this.svgElement.setAttribute("height", "400");
        this.svgElement.setAttribute("width", this.width);
        this.svgElement.setAttribute("xmlns", "http://www.w3.org/2000/svg");
        this.svgElement.setAttribute("viewBox", "0 0 "+this.width+" 400");
    }

    makeGraph(targetElement){
        this.#createSVGRectangles(this.svgElement,this.memo_list);

        this.#createSVGPath(
            this.svgElement,
            this.#calculateTemperatureGraphCoordinates(this.#convertTemperatureToSVGCoordinates(this.temperature_list))
        );
        
        this.#createSVGWithText(
            this.svgElement,
            this.#calculateHeatRetentionCoordinates(this.#calculateTemperatureGraphCoordinates(this.#convertTemperatureToSVGCoordinates(this.temperature_list))),
            this.#convertTemperaturesToStrings(this.temperature_list),
            "text-after-edge"
        );

        this.#createSVGWithText(
            this.svgElement,
            this.#calculateHeatRetentionCoordinates(this.#calculateTemperatureGraphCoordinates(this.#convertTemperatureToSVGCoordinates(this.temperature_list))),
            this.time_list,
            "text-before-edge"
        );
        
        this.#createSVGWithText(
            this.svgElement,
            this.#calculateMemoTextPosition(this.memo_list),
            this.memo_list.filter(item => typeof item !== 'string' || item.trim() !== ''),
            "middle"
        );

        targetElement.innerHTML = '';
        targetElement.appendChild(this.svgElement);
    }

    #createSVGRectangles(svg, texts){
        let rectanglePositions=this.#calculateRectanglePosition(texts);
        let coordinates=[],widths=[];
        for (let i = 0; i < rectanglePositions.length; i++){
            coordinates.push([rectanglePositions[i],360]);
            //The width of the rectangle surrounding the "memo" is calculated.
            if(i+1==rectanglePositions.length){
                widths.push((125*texts.length)-rectanglePositions[i]);
            }else{
                widths.push(rectanglePositions[i+1]-rectanglePositions[i]);
            }
        }

        //Creating Rectangle Elements
        for (let i = 0; i < coordinates.length; i++){
            const rectangle = document.createElementNS("http://www.w3.org/2000/svg", "rect");

            const x = coordinates[i][0];
            const y = coordinates[i][1];
            const width = widths[i];
            const height = 60;

            rectangle.setAttribute("x", x);
            rectangle.setAttribute("y", y);
            rectangle.setAttribute("width", width);
            rectangle.setAttribute("height", height);

            //Fill alternately
            if(i%2==0){
                rectangle.setAttribute("fill", "none");
            }else{
                rectangle.setAttribute("fill", "#b7ccf4");
            }

            svg.appendChild(rectangle);

            if(i!=0){
                const path = document.createElementNS("http://www.w3.org/2000/svg", "path");

                const pathData = "M " + coordinates[i][0] + " " + 0 +" L " + coordinates[i][0] + " " +360;

                path.setAttribute("d", pathData);
                path.setAttribute("stroke", "#8d93d3");
                path.setAttribute("stroke-width", "6");
                path.setAttribute("stroke-linecap", "round");
                path.setAttribute("stroke-dasharray", "0,20");
                path.setAttribute("stroke-dashoffset", "-5");

                svg.appendChild(path);
            }
        }
    }

    #createSVGPath(svg,coordinates){
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");

        let pathData = "M " + coordinates[0][0] + " " + coordinates[0][1];
        for (let i = 1; i < coordinates.length; i++) {
            pathData += " L " + coordinates[i][0] + " " + coordinates[i][1];
        }

        path.setAttribute("d", pathData);
        path.setAttribute("stroke", "#202f55");
        path.setAttribute("stroke-width", "2");
        path.setAttribute("fill", "none");
        path.setAttribute("stroke-linejoin", "round");

        svg.appendChild(path);
    }

    #createSVGWithText(svg, coordinates, texts,base_line){
        const textGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");

        for (let i = 0; i < coordinates.length; i++){
            const text = document.createElementNS("http://www.w3.org/2000/svg", "text");

            text.setAttribute("x", coordinates[i][0]);
            text.setAttribute("y", coordinates[i][1]);
            text.setAttribute("text-anchor", "middle");
            text.setAttribute("dominant-baseline",base_line);
            text.setAttribute("font-size","25");

            text.textContent = texts[i];

            textGroup.appendChild(text);
        }
        svg.appendChild(textGroup);
    }

    #calculateRectanglePosition(texts){
        let return_list=[0];
        let i=0;
        for(let item of texts){
            if(item!=""){
                if(i!=0){
                    return_list.push(12.5+(125*i));
                }
            }
            i++;
        }
        return return_list;
    }

    #calculateTemperatureGraphCoordinates(convertedTemperatureArray){
        var return_list=[[0,225]];//The graph starts at the 25°C point
        var x_position=25;
        for(let convertedTemperature of convertedTemperatureArray){
            return_list.push([x_position,convertedTemperature]);
            x_position=x_position+100;
            return_list.push([x_position,convertedTemperature]);
            x_position=x_position+25;
        }
        return return_list;
    }

    #convertTemperatureToSVGCoordinates(temperatureArray){
        let return_list=[];
        for(let temperature of temperatureArray){
            return_list.push(300-(temperature*3)+30);
        }

        return return_list;
    }

    #calculateHeatRetentionCoordinates(convertedTemperatureArray){
        let return_list=[];
        var x_position=75;
        for(let i=0;i<(convertedTemperatureArray.length-1)/2;i++){
            return_list.push([x_position,convertedTemperatureArray[2*(i+1)][1]]);
            x_position=x_position+125;
        }
        return return_list;
    }

    #calculateMemoTextPosition(texts){
        let return_list=[];
        let temp=[];
        let i=0;

        for(let text of texts){
            if(text!=""){
                if(i==0){
                    temp.push(0);
                }else{
                    temp.push(12.5+(125*i));
                }
            }
            i++;
        }
        temp.push(125*texts.length);
        for(var ii=0;ii<temp.length-1;ii++){
            return_list.push([(temp[ii]+temp[ii+1])/2,380]);
        }
        return return_list;
    }

    #convertTemperaturesToStrings(temperatures) {
        // 数値配列から文字列配列へ変換する処理を実装する
        const strings = temperatures.map(temperature => `${temperature}°C`);
        return strings;
    }
}
