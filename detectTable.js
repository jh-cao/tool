const fs = require("fs");


console.log("===================start====================");

let finalArr = [];

/* 场景1:常规表格
    +-----------------------------------------------+
    |_______|_______________|____________|__________|
    |       |               |            |          |
    +-----------------------------------------------+
*/
let cellInfos = [
    {xsc: 0, xec:1, ysc:0, yec:1, word: 1},
    {xsc: 1, xec:2, ysc:0, yec:1, word: 1},
    {xsc: 2, xec:4, ysc:0, yec:1, word: 1},
    {xsc: 0, xec:1, ysc:1, yec:2, word: 1},
    {xsc: 1, xec:2, ysc:1, yec:2, word: 1},
    {xsc: 2, xec:3, ysc:1, yec:2, word: 1},
    {xsc: 3, xec:4, ysc:1, yec:2, word: 1},
    {xsc: 0, xec:1, ysc:2, yec:3, word: 1},
    {xsc: 1, xec:2, ysc:2, yec:3, word: 1},
    {xsc: 2, xec:3, ysc:2, yec:3, word: 1},
    {xsc: 3, xec:4, ysc:2, yec:3, word: 1},
];


/* 场景2:表格第一个表格或者最后一个表格与其他表格总和 【等高】
    +-----------------------------------------------+
    |       |_______________|____________|__________|
    |       |               |            |          |
    +-----------------------------------------------+

    +-----------------------------------------------+
    |_______|_______________|____________|          |
    |       |               |            |          |
    +-----------------------------------------------+

    +-----------------------------------------------+
    |       |_______________|____________|          |
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
*/
// let cellInfos = [
//     {xsc: 0, xec:1, ysc:0, yec:1, word: 1},
//     {xsc: 1, xec:2, ysc:0, yec:1, word: 1},
//     {xsc: 2, xec:4, ysc:0, yec:1, word: 1},
//     {xsc: 0, xec:1, ysc:1, yec:2, word: 1},
//     {xsc: 1, xec:2, ysc:1, yec:2, word: 1},
//     {xsc: 2, xec:3, ysc:1, yec:2, word: 1},
//     {xsc: 3, xec:4, ysc:1, yec:2, word: 1},
//     {xsc: 0, xec:1, ysc:2, yec:3, word: 1},
//     {xsc: 1, xec:2, ysc:2, yec:3, word: 1},
//     {xsc: 2, xec:3, ysc:2, yec:3, word: 1},
//     {xsc: 3, xec:4, ysc:2, yec:3, word: 1},
// ];

console.log("cellInfos: ", cellInfos);

let preColumnCount = 0;
let preStartIndex = 0;

let nextColumnCount = 1;
let nextStartIndex = 0;

let bSearch = false;  // 记录当前是否有找到一个符合的表格

/* 记录分析得出的表格信息： [[{第一个表格第1行的起始索引，第一个表格第1行列数},{第一个表格第2行的起始索引，第一个表格第2行列数},{...}], 
                            [第二个表格]] */ 
const cellInfoSplitInfo = [];

for(let i = 1; i < cellInfos.length; i++)
{
    let bSame = true;
    let bChangeRow = false;
    if(cellInfos[i - 1].ysc !== cellInfos[i].ysc ||
        (cellInfos[i - 1].ysc === cellInfos[i].ysc && i === cellInfos.length - 1))
    {
        bChangeRow = true;

        if((cellInfos[i - 1].ysc === cellInfos[i].ysc && i === cellInfos.length - 1))
        {
            nextColumnCount++;
        }
    }
    else
    {
        nextColumnCount++;
    }

    if(bChangeRow)
    {
        // console.log("preColumnCount: ", preColumnCount, ", nextColumnCount: ", nextColumnCount);
        if(preColumnCount === nextColumnCount)
        {
            let tempPreIndex = preStartIndex;
            let tempNextIndex = nextStartIndex;
            console.log("tempPreIndex: ", tempPreIndex, ", tempNextIndex: ", tempNextIndex);
            for(let tempIndex = 0; tempIndex < preColumnCount; tempIndex++)
            {
                // 相邻两行同一列的表格的左右坐标只要有一侧存在不相等的情况，即不满足表格要求
                if(cellInfos[tempPreIndex].xsc !== cellInfos[tempNextIndex].xsc ||
                    cellInfos[tempPreIndex].xec !== cellInfos[tempNextIndex].xec)
                {
                    bSame = false;
                    break;
                }
                tempPreIndex++;
                tempNextIndex++;
            }
        }
        else
        {
            bSame = false;
        }

        if(bSame)
        {
            if(!bSearch)
            {
                bSearch = true;
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
            else
            {
                cellInfoSplitInfo[cellInfoSplitInfo.length - 1].push(
                    {
                        startIndex: nextStartIndex,
                        columnCount: nextColumnCount
                    }
                );
            }
        }
        else if(!bSame && bSearch)
        {
            bSearch = false;
        }

        preStartIndex = nextStartIndex;
        preColumnCount = nextColumnCount;

        nextColumnCount = 1;
        nextStartIndex = i;
    }
}

console.log("cellInfoSplitInfo", cellInfoSplitInfo);

// 根据表格统计信息，拆分数据
for(let i = 0; i < cellInfoSplitInfo.length; i++)
{
    let arrTabel = [];
    for(let j = 0; j < cellInfoSplitInfo[i].length; j++)
    {
        let startIndex = cellInfoSplitInfo[i][j].startIndex;
        let rowData = [];
        let bEmpty = true;
        for(let k = 0; k < cellInfoSplitInfo[i][j].columnCount; k++)
        {
            rowData.push(cellInfos[startIndex + k]);
            if(0 !== cellInfos[startIndex + k].word.length)
            {
                bEmpty = false;
            }
        }

        if(!bEmpty)
        {
            arrTabel.push(rowData);
        }
        
    }
    finalArr.push(arrTabel);
}

console.log("++++++++++table++++++++++++++");
finalArr.forEach(val=>{
    console.log(val);
})

console.log("===================end====================");



