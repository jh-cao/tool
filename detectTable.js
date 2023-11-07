console.log("===================start====================");

let finalArr = [];

/* 场景1:常规表格
    +-----------------------------------------------+
    |_______|_______________|____________|__________|
    |       |               |            |          |
    +-----------------------------------------------+
*/
// let cellInfos = [
//     {xsc: 0, xec:1, ysc:0, yec:1, word: "1"},
//     {xsc: 1, xec:2, ysc:0, yec:1, word: "1"},
//     {xsc: 2, xec:4, ysc:0, yec:1, word: "1"},
//     {xsc: 0, xec:1, ysc:1, yec:2, word: "1"},
//     {xsc: 1, xec:2, ysc:1, yec:2, word: "1"},
//     {xsc: 2, xec:3, ysc:1, yec:2, word: "1"},
//     {xsc: 3, xec:4, ysc:1, yec:2, word: "1"},
//     {xsc: 0, xec:1, ysc:2, yec:3, word: "1"},
//     {xsc: 1, xec:2, ysc:2, yec:3, word: "1"},
//     {xsc: 2, xec:3, ysc:2, yec:3, word: "1"},
//     {xsc: 3, xec:4, ysc:2, yec:3, word: "1"},
// ];


/* 场景2:表格第一个表格或者最后一个表格与其他表格总和 【等高】
    +-----------------------------------------------+
    |       |_______________|____________|__________|
    |       |               |            |          |
    +-----------------------------------------------+

    +-----------------------------------------------+
    |_______|_______________|____________|          |
    |       |               |            |          |
    +-----------------------------------------------+

    如下表格是无效表格，不认为是需求中需要的表格,第一个表格高度占据3行，
    但是只有两行符合常规表格的情况下无法兼容处理，因为从多张表格分析得出
    很多不需要展示的表格就存在类似如下的特性
    +-----------------------------------------------+
    |       |_______________|_______________________|
    |       |_______________|____________|__________|
    |       |               |            |          |
    +-----------------------------------------------+

    左右两侧都有的情况下也是不支持的
    +-----------------------------------------------+
    |       |_______________|____________|          |
    |       |               |            |          |
    +-----------------------------------------------+
*/
let cellInfos = [
    { xsc: 0, xec: 1, ysc: 0, yec: 1, word: "1" },
    { xsc: 1, xec: 2, ysc: 0, yec: 1, word: "2" },
    { xsc: 2, xec: 4, ysc: 0, yec: 1, word: "3" },

    // 常规表格
    { xsc: 0, xec: 1, ysc: 1, yec: 2, word: "4" },
    { xsc: 1, xec: 2, ysc: 1, yec: 2, word: "5" },
    { xsc: 2, xec: 3, ysc: 1, yec: 2, word: "6" },
    { xsc: 3, xec: 4, ysc: 1, yec: 2, word: "7" },
    { xsc: 0, xec: 1, ysc: 2, yec: 3, word: "8" },
    { xsc: 1, xec: 2, ysc: 2, yec: 3, word: "9" },
    { xsc: 2, xec: 3, ysc: 2, yec: 3, word: "10" },
    { xsc: 3, xec: 4, ysc: 2, yec: 3, word: "11" },
    // 左侧存在合成表格
    { xsc: 0, xec: 1, ysc: 3, yec: 5, word: "12" },
    { xsc: 1, xec: 2, ysc: 3, yec: 4, word: "13" },
    { xsc: 2, xec: 3, ysc: 3, yec: 4, word: "14" },
    { xsc: 1, xec: 2, ysc: 4, yec: 5, word: "15" },
    { xsc: 2, xec: 3, ysc: 4, yec: 5, word: "16" },
    // 右侧存在合成表格
    { xsc: 0, xec: 1, ysc: 5, yec: 7, word: "17" },
    { xsc: 1, xec: 4, ysc: 5, yec: 7, word: "18" },
    { xsc: 4, xec: 6, ysc: 5, yec: 8, word: "19" },
    { xsc: 0, xec: 1, ysc: 7, yec: 8, word: "20" },
    { xsc: 1, xec: 4, ysc: 7, yec: 8, word: "21" },
    // 合成表格存在两侧
    { xsc: 0, xec: 1, ysc: 3, yec: 5, word: "999" },
    { xsc: 1, xec: 2, ysc: 3, yec: 4, word: "999" },
    { xsc: 2, xec: 3, ysc: 3, yec: 4, word: "999" },
    { xsc: 3, xec: 4, ysc: 3, yec: 5, word: "999" },
    { xsc: 1, xec: 2, ysc: 4, yec: 5, word: "999" },
    { xsc: 2, xec: 3, ysc: 4, yec: 5, word: "999" },
    // 右侧存在合成表格
    { xsc: 0, xec: 1, ysc: 5, yec: 7, word: "22" },
    { xsc: 1, xec: 4, ysc: 5, yec: 7, word: "23" },
    { xsc: 4, xec: 6, ysc: 5, yec: 8, word: "24" },
    { xsc: 0, xec: 1, ysc: 7, yec: 8, word: "25" },
    { xsc: 1, xec: 4, ysc: 7, yec: 8, word: "26" },
    // 不是表格
    { xsc: 0, xec: 1, ysc: 0, yec: 1, word: "999" },
    { xsc: 1, xec: 2, ysc: 0, yec: 1, word: "999" },
    { xsc: 2, xec: 4, ysc: 0, yec: 1, word: "999" },

    // 常规表格
    { xsc: 0, xec: 1, ysc: 1, yec: 2, word: "27" },
    { xsc: 1, xec: 2, ysc: 1, yec: 2, word: "28" },
    { xsc: 2, xec: 3, ysc: 1, yec: 2, word: "29" },
    { xsc: 3, xec: 4, ysc: 1, yec: 2, word: "30" },
    { xsc: 0, xec: 1, ysc: 2, yec: 3, word: "31" },
    { xsc: 1, xec: 2, ysc: 2, yec: 3, word: "32" },
    { xsc: 2, xec: 3, ysc: 2, yec: 3, word: "33" },
    { xsc: 3, xec: 4, ysc: 2, yec: 3, word: "34" },

];

console.log("cellInfos: ", cellInfos);

let preColumnCount = 0;
let preStartIndex = 0;

let nextColumnCount = 1;
let nextStartIndex = 0;

let bNormalSearch = false;  // 记录当前是否有找到一个符合的表格

let bSeachAbNormal = false;  // 记录当前是否正在处理涉及合成表格的处理

let abNormalTabInfo = {
    bCompositeTabLeft: false,   // 记录当前左侧是否检测到合成表格
    yscLeft: 0,                 // 左侧合成表格的纵向起始坐标
    yecLeft: 0,                 // 左侧合成表格的纵向结束坐标
    bCompositeTabRight: false,  // 记录当前右侧是否检测到合成表格
    yscRight: 0,                // 右侧合成表格的纵向起始坐标
    yecRight: 0,                // 右侧合成表格的纵向结束坐标
    bSeachFinish: false,        // 合成表格是否查找结束
    yEndPos: 0,                  // 左右都存在该表格的时候，该位置以内的所有表格均无法符合要求
    arrTableInfo: [],
};

/* 记录分析得出的表格信息： [[{第一个表格第1行的起始索引，第一个表格第1行列数},{第一个表格第2行的起始索引，第一个表格第2行列数},{...}], 
                            [第二个表格]] */
const cellInfoSplitInfo = [];

for (let i = 1; i < cellInfos.length; i++) {
    let bSame = true;
    let bChangeRow = false;
    if (cellInfos[i - 1].ysc !== cellInfos[i].ysc ||
        (cellInfos[i - 1].ysc === cellInfos[i].ysc && i === cellInfos.length - 1)) {
        bChangeRow = true;

        if ((cellInfos[i - 1].ysc === cellInfos[i].ysc && i === cellInfos.length - 1)) {
            nextColumnCount++;
        }
    }
    else {
        nextColumnCount++;
    }

    // 第一行统计数据不作处理
    if (0 === preColumnCount && bChangeRow) {
        preStartIndex = nextStartIndex;
        preColumnCount = nextColumnCount;

        nextColumnCount = 1;
        nextStartIndex = i;
        continue;
    }

    if (bChangeRow) {
        /* 换行的情况下判断是否满足常规表格
            不满足的条件：两行的第一个表格xsc不相同 或者 两行的最后一个表格xec不相同
            满足常规表格的情况下，可以按照常规表格处理，不满足条件的整理出可以按照常规表格处理的部分
        */
        if (cellInfos[preStartIndex].xsc === cellInfos[nextStartIndex].xsc
            && cellInfos[preStartIndex + preColumnCount - 1].xec === cellInfos[nextStartIndex + nextColumnCount - 1].xec
            && !bSeachAbNormal) {
            // console.log("preColumnCount: ", preColumnCount, ", nextColumnCount: ", nextColumnCount);
            if (preColumnCount === nextColumnCount) {
                let tempPreIndex = preStartIndex;
                let tempNextIndex = nextStartIndex;
                console.log("tempPreIndex: ", tempPreIndex, ", tempNextIndex: ", tempNextIndex);
                for (let tempIndex = 0; tempIndex < preColumnCount; tempIndex++) {
                    // 相邻两行同一列的表格的左右坐标只要有一侧存在不相等的情况，即不满足表格要求
                    if (cellInfos[tempPreIndex].xsc !== cellInfos[tempNextIndex].xsc ||
                        cellInfos[tempPreIndex].xec !== cellInfos[tempNextIndex].xec) {
                        bSame = false;
                        break;
                    }
                    tempPreIndex++;
                    tempNextIndex++;
                }
            }
            else {
                bSame = false;
            }

            if (bSame) {
                if (!bNormalSearch) {
                    bNormalSearch = true;
                    cellInfoSplitInfo.push([
                        {
                            startIndex: preStartIndex,
                            columnCount: preColumnCount
                        },
                        {
                            startIndex: nextStartIndex,
                            columnCount: nextColumnCount
                        }
                    ]);
                }
                else {
                    cellInfoSplitInfo[cellInfoSplitInfo.length - 1].push(
                        {
                            startIndex: nextStartIndex,
                            columnCount: nextColumnCount
                        }
                    );
                }
            }
            else if (!bSame && bNormalSearch) {
                bNormalSearch = false;
            }
        }
        else {
            // 上一行符合常规表格，当前行不符合需要将标志位重置
            if (bNormalSearch) {
                bNormalSearch = false;
            }
            // 规避表格宽度不等的情况下，误认为有合成表格
            let bComposite = true;
            // 不足两列的表格组不成合成表格的特性
            if (preColumnCount >= 2 && !abNormalTabInfo.bCompositeTabLeft && !abNormalTabInfo.bCompositeTabRight) {
                let topYsc;
                let bottomYec;
                if (!abNormalTabInfo.bCompositeTabLeft && cellInfos[preStartIndex].xsc !== cellInfos[nextStartIndex].xsc) {
                    topYsc = cellInfos[preStartIndex].ysc;
                    bottomYec = cellInfos[preStartIndex].yec;
                }
                else if (!abNormalTabInfo.bCompositeTabRight
                    && cellInfos[preStartIndex + preColumnCount - 1].xec !== cellInfos[nextStartIndex + nextColumnCount - 1].xec) {
                    topYsc = cellInfos[preStartIndex + preColumnCount - 1].ysc;
                    bottomYec = cellInfos[preStartIndex + preColumnCount - 1].yec;
                }

                for (let index = nextStartIndex; index < nextStartIndex + nextColumnCount; index++) {
                    if (cellInfos[index].ysc < topYsc || cellInfos[index].yec > bottomYec) {
                        bComposite = false;
                    }
                }
            }
            else {
                bComposite = false;
            }

            if (bComposite) {

                if (!bSeachAbNormal) {
                    bSeachAbNormal = true;
                    abNormalTabInfo.bCompositeTabLeft = false;
                    abNormalTabInfo.bCompositeTabRight = false;
                    abNormalTabInfo.bSeachFinish = false;
                    abNormalTabInfo.yEndPos = 0;
                    abNormalTabInfo.arrTableInfo = [];
                }

                console.log("xsc: ", cellInfos[preStartIndex].xsc, "-", cellInfos[nextStartIndex].xsc, " xec: ",
                    cellInfos[preStartIndex + preColumnCount - 1].xec, "-", cellInfos[nextStartIndex + nextColumnCount - 1].xec);
                
                // 左侧存在跨多行的表格
                if (!abNormalTabInfo.bCompositeTabLeft && cellInfos[preStartIndex].xsc !== cellInfos[nextStartIndex].xsc) {
                    abNormalTabInfo.bCompositeTabLeft = true;
                    abNormalTabInfo.yscLeft = cellInfos[preStartIndex].ysc;
                    abNormalTabInfo.yecLeft = cellInfos[preStartIndex].yec;
                    abNormalTabInfo.bSeachFinish = false;

                    abNormalTabInfo.arrTableInfo.push(
                        {
                            startIndex: (preStartIndex + 1),
                            columnCount: (preColumnCount - 1)
                        }
                    );
                    console.log("left abNormalTabInfo.arrTableInfo: ", abNormalTabInfo.arrTableInfo);
                }

                // 右侧存在跨多行的表格
                if (!abNormalTabInfo.bCompositeTabRight
                    && cellInfos[preStartIndex + preColumnCount - 1].xec !== cellInfos[nextStartIndex + nextColumnCount - 1].xec) {
                    abNormalTabInfo.bCompositeTabRight = true;
                    abNormalTabInfo.yscRight = cellInfos[preStartIndex + preColumnCount - 1].ysc;
                    abNormalTabInfo.yecRight = cellInfos[preStartIndex + preColumnCount - 1].yec;
                    abNormalTabInfo.bSeachFinish = false;
                    abNormalTabInfo.arrTableInfo.push(
                        {
                            startIndex: (preStartIndex),
                            columnCount: (preColumnCount - 1)
                        }
                    );
                    console.log("right abNormalTabInfo.arrTableInfo: ", abNormalTabInfo.arrTableInfo);
                }

                // 不支持左右同时存在合成表格的情况，遇到左右同时存在合成表格，则在该返回内的所有表格均不可能符合需要的表格
                if (abNormalTabInfo.bCompositeTabLeft && abNormalTabInfo.bCompositeTabRight) {
                    abNormalTabInfo.bSeachFinish = true;
                    abNormalTabInfo.yEndPos = abNormalTabInfo.yecLeft > abNormalTabInfo.yecRight ? abNormalTabInfo.yecLeft : abNormalTabInfo.yecRight;
                }
                else if (abNormalTabInfo.bCompositeTabLeft) {
                    // 表格需要和合成表格对齐
                    if (cellInfos[nextStartIndex].yec <= abNormalTabInfo.yecLeft) {
                        // 还未找到和合成表格纵向平行的最后一行表格,暂时记录数据
                        abNormalTabInfo.arrTableInfo.push(
                            {
                                startIndex: (nextStartIndex),
                                columnCount: (nextColumnCount)
                            });

                        // 合成表格查找完成，数据检测判断
                        if (cellInfos[nextStartIndex].yec === abNormalTabInfo.yecLeft) {
                            for (let tabIndex = 1; tabIndex < abNormalTabInfo.arrTableInfo.length; tabIndex++) {
                                if (abNormalTabInfo.arrTableInfo[tabIndex - 1].columnCount === abNormalTabInfo.arrTableInfo[tabIndex].columnCount) {
                                    let tempPreIndex = abNormalTabInfo.arrTableInfo[tabIndex - 1].startIndex;
                                    let tempNextIndex = abNormalTabInfo.arrTableInfo[tabIndex].startIndex;
                                    console.log("===tempPreIndex: ", tempPreIndex, ", tempNextIndex: ", tempNextIndex);
                                    for (let tempIndex = 0; tempIndex < abNormalTabInfo.arrTableInfo[tabIndex].columnCount; tempIndex++) {
                                        // 相邻两行同一列的表格的左右坐标只要有一侧存在不相等的情况，即不满足表格要求
                                        if (cellInfos[tempPreIndex].xsc !== cellInfos[tempNextIndex].xsc ||
                                            cellInfos[tempPreIndex].xec !== cellInfos[tempNextIndex].xec) {
                                            bSame = false;
                                            break;
                                        }
                                        tempPreIndex++;
                                        tempNextIndex++;
                                    }
                                }
                                else {
                                    bSame = false;
                                    break;
                                }
                            }

                            if (bSame) {
                                cellInfoSplitInfo.push(abNormalTabInfo.arrTableInfo);
                            }

                            // 无论是否找到合适的表格，本次合成表格的查询均满足结束条件
                            abNormalTabInfo.bSeachFinish = true;
                            abNormalTabInfo.yEndPos = abNormalTabInfo.yecLeft;
                        }
                    }
                    else {
                        // 没有与合成表格纵向相等的表格存在
                        abNormalTabInfo.bSeachFinish = true;
                        abNormalTabInfo.yEndPos = abNormalTabInfo.yecLeft;
                    }
                }
                else if(abNormalTabInfo.bCompositeTabRight){
                    // 表格需要和合成表格对齐
                    if (cellInfos[nextStartIndex].yec <= abNormalTabInfo.yecRight) {
                        // 还未找到和合成表格纵向平行的最后一行表格,暂时记录数据
                        abNormalTabInfo.arrTableInfo.push(
                            {
                                startIndex: (nextStartIndex),
                                columnCount: (nextColumnCount)
                            });

                        // 合成表格查找完成，数据检测判断
                        if (cellInfos[nextStartIndex].yec === abNormalTabInfo.yecRight) {
                            for (let tabIndex = 1; tabIndex < abNormalTabInfo.arrTableInfo.length; tabIndex++) {
                                if (abNormalTabInfo.arrTableInfo[tabIndex - 1].columnCount === abNormalTabInfo.arrTableInfo[tabIndex].columnCount) {
                                    let tempPreIndex = abNormalTabInfo.arrTableInfo[tabIndex - 1].startIndex;
                                    let tempNextIndex = abNormalTabInfo.arrTableInfo[tabIndex].startIndex;
                                    console.log("===tempPreIndex: ", tempPreIndex, ", tempNextIndex: ", tempNextIndex);
                                    for (let tempIndex = 0; tempIndex < abNormalTabInfo.arrTableInfo[tabIndex].columnCount; tempIndex++) {
                                        // 相邻两行同一列的表格的左右坐标只要有一侧存在不相等的情况，即不满足表格要求
                                        if (cellInfos[tempPreIndex].xsc !== cellInfos[tempNextIndex].xsc ||
                                            cellInfos[tempPreIndex].xec !== cellInfos[tempNextIndex].xec) {
                                            bSame = false;
                                            break;
                                        }
                                        tempPreIndex++;
                                        tempNextIndex++;
                                    }
                                }
                                else {
                                    bSame = false;
                                    break;
                                }
                            }

                            if (bSame) {
                                cellInfoSplitInfo.push(abNormalTabInfo.arrTableInfo);
                            }

                            // 无论是否找到合适的表格，本次合成表格的查询均满足结束条件
                            abNormalTabInfo.bSeachFinish = true;
                            abNormalTabInfo.yEndPos = abNormalTabInfo.yecRight;
                        }
                    }
                    else {
                        // 没有与合成表格纵向相等的表格存在
                        abNormalTabInfo.bSeachFinish = true;
                        abNormalTabInfo.yEndPos = abNormalTabInfo.yecRight;
                    }
                }

                console.log("bCompositeTabLeft: ", abNormalTabInfo.bCompositeTabLeft, ", bCompositeTabRight: ", abNormalTabInfo.bCompositeTabRight
                    , ", bSeachFinish: ", abNormalTabInfo.bSeachFinish);
                if (abNormalTabInfo.bSeachFinish) {
                    abNormalTabInfo.bCompositeTabLeft = false;
                    abNormalTabInfo.bCompositeTabRight = false;
                    let bFlag = true;
                    if (abNormalTabInfo.bCompositeTabLeft && abNormalTabInfo.bCompositeTabRight) {
                        // 若出现两边均有合成表格的情况下，将纵轴范围内的数据均跳过
                        for (let index = nextStartIndex; index < nextStartIndex + nextColumnCount; index++) {
                            console.log("word: ", cellInfos[index].word, ", ysc: ", cellInfos[index].ysc, ", yEndPos: ", abNormalTabInfo.yEndPos);
                            if (cellInfos[index].ysc < abNormalTabInfo.yEndPos) {
                                bFlag = false;
                            }
                        }
                    }
                    if (bFlag) {
                        bSeachAbNormal = false;
                    }
                }
            }
        }
        preStartIndex = nextStartIndex;
        preColumnCount = nextColumnCount;

        nextColumnCount = 1;
        nextStartIndex = i;
    }
}

console.log("cellInfoSplitInfo", cellInfoSplitInfo);

// 根据表格统计信息，拆分数据
for (let i = 0; i < cellInfoSplitInfo.length; i++) {
    let arrTabel = [];
    for (let j = 0; j < cellInfoSplitInfo[i].length; j++) {
        let startIndex = cellInfoSplitInfo[i][j].startIndex;
        let rowData = [];
        let bEmpty = true;
        for (let k = 0; k < cellInfoSplitInfo[i][j].columnCount; k++) {
            rowData.push(cellInfos[startIndex + k]);
            if (0 !== cellInfos[startIndex + k].word.length) {
                bEmpty = false;
            }
        }

        if (!bEmpty) {
            arrTabel.push(rowData);
        }
    }
    finalArr.push(arrTabel);
}

console.log("++++++++++table++++++++++++++");
finalArr.forEach(val => {
    console.log(val);
})

console.log("===================end====================");



