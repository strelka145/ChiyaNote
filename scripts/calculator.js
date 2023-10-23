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
                const result = this.#evaluateExpression(this.data);
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
                const result = this.#evaluateExpression(event.currentTarget.value);
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

    #tokenize(expr) {
        const tokens = [];
        let match;
        const pattern = /\s*(=>|{|}|\(|\)|\^|[+\-*/]|\d+\.?\d*|\.\d+|\S)\s*/g;
        while (match = pattern.exec(expr)) {
            tokens.push(match[1]);
        }
        return tokens;
    }

    #parse(tokens) {
        let i = 0;
    
        function parsePrimaryExpr() {
            let t = tokens[i++];
            if (t === "(") {
                const expr = parseExpression();
                if (tokens[i++] !== ")") {
                    throw new Error("Expected )");
                }
                return expr;
            }
            if (!/^-?(\d+(\.\d*)?|\.\d+)$/.test(t)) {
                throw new Error("Expected a number");
            }
            return { type: "number", value: parseFloat(t) };
        }
    
        function parseUnaryExpr() {
            if (tokens[i] === "+" || tokens[i] === "-") {
                return { type: tokens[i++], right: parseUnaryExpr() };
            }
            return parsePrimaryExpr();
        }
    
        function parseMultiplicativeExpr() {
            let expr = parseUnaryExpr();
            while (tokens[i] === "*" || tokens[i] === "/") {
                expr = { type: tokens[i++], left: expr, right: parseUnaryExpr() };
            }
            return expr;
        }
    
        function parseExponentialExpr() {
            let expr = parseMultiplicativeExpr();
            while (tokens[i] === "^") {
                expr = { type: tokens[i++], left: expr, right: parseUnaryExpr() };
            }
            return expr;
        }
    
        function parseAdditiveExpr() {
            let expr = parseExponentialExpr();
            while (tokens[i] === "+" || tokens[i] === "-") {
                expr = { type: tokens[i++], left: expr, right: parseExponentialExpr() };
            }
            return expr;
        }
    
        function parseExpression() {
            return parseAdditiveExpr();
        }
    
        const ast = parseExpression();
        if (i !== tokens.length) {
            throw new Error("Unexpected token: " + tokens[i]);
        }
        return ast;
    }

    #evaluateAst(node) {
        switch (node.type) {
            case "number": return node.value;
            case "+": return this.#evaluateAst(node.left) + this.#evaluateAst(node.right);
            case "-": return this.#evaluateAst(node.left) - this.#evaluateAst(node.right);
            case "*": return this.#evaluateAst(node.left) * this.#evaluateAst(node.right);
            case "/": return this.#evaluateAst(node.left) / this.#evaluateAst(node.right);
            case "^": return Math.pow(this.#evaluateAst(node.left), this.#evaluateAst(node.right));
            default: throw new Error("Unknown node type: " + node.type);
        }
    }

    #evaluateExpression(expr) {
        const tokens = this.#tokenize(expr);
        const ast = this.#parse(tokens);
        return this.#evaluateAst(ast);
    }
}
