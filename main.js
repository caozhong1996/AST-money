const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const t = require('@babel/types');

// 编写自定义规则插件
const WHITE_LIST = ['price']; // TODO: 可扩展
const PRICE_REG = new RegExp(WHITE_LIST.map(s => s + '$').join('|'), 'i');

const isPrice = str => PRICE_REG.test(str);

const Helper = {
    isPriceCalc(priceNode, numNode, operator) {
        return (
            // 直接赋值
            t.isIdentifier(priceNode) &&
            isPrice(priceNode.name) &&
            // 四则运算
            (t.isNumericLiteral(numNode) ||
                t.isIdentifier(numNode)
            ) && ['+', '-', '*', '/'].indexOf(operator) > -1);
    },
    // ...
    findScope(path, matchFunc) {
        let scope = path.scope;
        while (scope && !matchFunc(scope)) {
            scope = scope.parent;
        }
        return scope;
    }
};

// case 1: 直接赋默认值const price = 10;
// case 2: ES6解构语法赋默认值const {price = 10} = data;
// case 3: "||"运算符赋默认值const price = data.price || 10;
// ...
const visitor = {
    Identifier(path) {
        const id = path.node;
        if (isPrice(id.name)) {
            // 金额变量 匹配成功！
        }
    },
    VariableDeclarator(path) {
        const {
            id,
            init
        } = path.node;
        if (t.isIdentifier(id) && isPrice(id.name) && t.isNumericLiteral(init) && init.value > 0) {
            // case 1 直接赋默认值 匹配成功
        }
        if (t.isIdentifier(id) && isPrice(id.name)) {
            path.traverse({
                LogicalExpression(subPath) {
                    const {
                        operator,
                        right
                    } = subPath.node;
                    if (operator === '||' && t.isNumericLiteral(right) && right.value > 0) {
                        // case3  "||"运算符赋默认值 匹配成功！
                    }
                }
            });
        }
    },
    AssignmentPattern(path) {
        const {
            left,
            right
        } = path.node;
        if (t.isIdentifier(left) && isPrice(left.name) && t.isNumericLiteral(right) && right.value > 0) {
            // ES6解构语法赋默认值 匹配成功！
        }
    },
};

// 源代码
const code = `var str = "hello world";var price = 123`;
// code -> ast
const ast = parser.parse(code);
// 用自定义规则遍历ast(即代码扫描)
traverse(ast, visitor);