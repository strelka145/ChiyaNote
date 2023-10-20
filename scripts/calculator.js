class Calc{
    static get toolbox() {
        return{
            title: 'Calculator',
            icon: calculator_icon,
        }
    } 

    constructor({data}){
        this.data = data.formula;
        this.name=Math.random().toString(32).substring(2);
    }

    render(){
        const div = document.createElement('div');
        const input = document.createElement('input');
        input.setAttribute("type","text");
        input.value=this.data || '';
        input.setAttribute("name",this.name);
        div.appendChild(input);
        const p = document.createElement('p');
        if(this.data){
            input.setAttribute("style","font-size: 20pt; font-family: serif; text-align: center; width: 100%; display: none;");
            p.setAttribute("style","font-family: serif; font-size: 20pt;");
        }else{
            input.setAttribute("style","font-size: 20pt; font-family: serif; text-align: center; width: 100%;");
            p.setAttribute("style","font-family: serif; font-size: 20pt; display: none;");
        }
        try {
            if(this.data){
                const result = this.#calculate(this.data);
                p.textContent = this.data+"\n= "+result;
            }else{
                p.textContent = "";
            }
        } catch (error) {
            p.textContent = error.message;
        }
        p.setAttribute("name",this.name);
        div.appendChild(p);
        p.addEventListener("dblclick", (event) =>  {
            const name=event.currentTarget.getAttribute("name");
            const input=document.querySelectorAll('input[name="'+name+'"]')[0];
            input.setAttribute("style","font-size: 20pt; font-family: serif; text-align: center; width: 100%;");
            event.currentTarget.setAttribute("style","font-family: 'serif'; font-size: 20pt; display:none");
            input.focus();
        });
        input.addEventListener("blur", (event) =>  {
            const name=event.currentTarget.getAttribute("name");
            const p=document.querySelectorAll('p[name="'+name+'"]')[0];
            try {
                const result = this.#calculate(event.currentTarget.value);
                p.textContent = event.currentTarget.value.replace('*','×')+"\n= "+result;
            } catch (error) {
                p.textContent = error.message;
            }
            event.currentTarget.setAttribute("style","font-size: 20pt; font-family: serif; text-align: center; width: 100%; display: none;");
            p.setAttribute("style","font-family: serif; font-size: 20pt;");
        });
        return div;
    }

    save(data){
        return {
            formula: document.querySelectorAll('input[name="'+this.name+'"]')[0].value
        }
    }

    #isOperator(char){
        return ['+', '-', '*', '/'].includes(char);
    }

    #calculate(expression) {
        const operators = [];
        const values = [];
    
        for (let i = 0; i < expression.length; i++) {
            const char = expression[i];
    
            if (char === ' ') {
                continue;
            } else if (char === '(') {
                operators.push(char);
            } else if (char === ')') {
                while (operators.length > 0 && operators[operators.length - 1] !== '(') {
                    const operator = operators.pop();
                    const rightOperand = values.pop();
                    const leftOperand = values.pop();
                    values.push(this.#performOperation(leftOperand, rightOperand, operator));
                }
                operators.pop(); // Pop the opening parenthesis
            } else if (this.#isOperator(char)) {
                while (operators.length > 0 && this.#precedence(operators[operators.length - 1]) >= this.#precedence(char)) {
                    const operator = operators.pop();
                    const rightOperand = values.pop();
                    const leftOperand = values.pop();
                    values.push(this.#performOperation(leftOperand, rightOperand, operator));
                }
                operators.push(char);
            } else {
                let number = '';
                while (i < expression.length && (/[0-9.]/).test(expression[i])) {
                    number += expression[i];
                    i++;
                }
                i--; // Move back one step
                values.push(parseFloat(number));
            }
        }
    
        while (operators.length > 0) {
            const operator = operators.pop();
            const rightOperand = values.pop();
            const leftOperand = values.pop();
            values.push(this.#performOperation(leftOperand, rightOperand, operator));
        }
    
        if (values.length === 1) {
            return values[0];
        } else {
            throw new Error('Invalid expression');
        }
    }

    #precedence(operator) {
        if (operator === '+' || operator === '-') {
            return 1;
        } else if (operator === '*' || operator === '/') {
            return 2;
        }
        return 0;
    }

    #performOperation(leftOperand, rightOperand, operator) {
        switch (operator) {
            case '+':
                return leftOperand + rightOperand;
            case '-':
                return leftOperand - rightOperand;
            case '*':
                return leftOperand * rightOperand;
            case '/':
                if (rightOperand === 0) {
                    throw new Error('Cannot be divided by zero');
                }
                return leftOperand / rightOperand;
            default:
                throw new Error('Invalid operator');
        }
    }
}
