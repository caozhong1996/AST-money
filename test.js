const t = require('@babel/types');

const checkPriceCalcVisitor = {
        // ... 
        CallExpression(path) {
            const {
                arguments,
                callee: {
                    name
                }
            } = path.node;
            // 匹配金额变量作为实参的函数调用
            const priceIdx = arguments.findIndex(arg => isPrice(arg));
            if (priceIdx === -1) return;
            // 寻找该函数的声明节点
            const foundFunc = Helper.findScope(path, scope => {
                const binding = scope.bindings[name];
                return binding && t.isFunctionDeclaration(binding.path.node);
            });
            if (!foundFunc) return;
            // 匹配实参和形参之间的位置关系
            const funcPath = foundFunc.bindings[name].path;
            const {params} = funcPath.node;
            const param = params[priceIdx];
            if(!t.isIdentifier(param)) return;
            // 检测函数内是否有对形参的引用
            const renamedParam = param.name;
            const {referencePaths: refPaths = []} = funcPath.scope.bindings[renamedParam] || {};
            if(refPaths.length === 0) return;
            // 检测形参的引用部分是否涉及金额计算
            for(const refPath of refPaths) {
                // TODO: checkPriceCalcVisitor支持指定变量名的检测
                refPath.getStatementParent().traverse(checkPriceCalcVisitor);
            }
        },
        BinaryExpression(path) {
            const {
                left,
                right,
                operator
            } = path.node;
            if (Helper.isPriceCalc(left, right, operator) || Helper.isPriceCalc(right, left, operator)) {
                // 金额计算 匹配成功！
            }
        }
    }
            // 一个scope
            // {
            //     path: path
            //     block: path.node,
            //     parentBlock: path.parent,
            //     parent: parentScope,
            //     bindings: [...]
            // }
            // 其中的一个binding
            // {
            //     identifier: node,
            //     scope: scope,
            //     path: path,
            //     kind: 'var',
            //     referenced: true,
            //     references: 3,
            //     referencePaths: [path, path, path],
            //     constant: false,
            //     constantViolations: [path]
            // }


function fuc (a, b, c) {
    console.log(a, b. c)
}

function insert (a, b, c) {
    window.addEventListener('click', fuc.bind(this, a, b, c))
}

function unbind (a, b, c) {
    window.removeEventListener('click', fuc.bind(this))
}
let a = {
    ttt: '111',
    fun () {
        console.log(this.ttt)
    }
}

