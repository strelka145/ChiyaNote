class Calc{
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
