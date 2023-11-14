console.log("===================start====================");

let finalArr = [];



let seq = 0;
let cellInfos = [
    // { xsc: 0, xec: 1, ysc: 0, yec: 1, word: "1", id: seq++ },
    // { xsc: 1, xec: 2, ysc: 0, yec: 1, word: "2", id: seq++ },
    // { xsc: 2, xec: 4, ysc: 0, yec: 1, word: "3", id: seq++ },

    // // 常规表格
    // { xsc: 0, xec: 1, ysc: 1, yec: 2, word: "4", id: seq++ },
    // { xsc: 1, xec: 2, ysc: 1, yec: 2, word: "5", id: seq++ },
    // { xsc: 2, xec: 3, ysc: 1, yec: 2, word: "6", id: seq++ },
    // { xsc: 3, xec: 4, ysc: 1, yec: 2, word: "7", id: seq++ },
    // { xsc: 0, xec: 1, ysc: 2, yec: 3, word: "8", id: seq++ },
    // { xsc: 1, xec: 2, ysc: 2, yec: 3, word: "9", id: seq++ },
    // { xsc: 2, xec: 3, ysc: 2, yec: 3, word: "10", id: seq++ },
    // { xsc: 3, xec: 4, ysc: 2, yec: 3, word: "11", id: seq++ },
    // // 左侧存在合成表格
    // { xsc: 0, xec: 1, ysc: 3, yec: 6, word: "12", id: seq++ },
    // { xsc: 1, xec: 2, ysc: 3, yec: 4, word: "13", id: seq++ },
    // { xsc: 2, xec: 3, ysc: 3, yec: 4, word: "14", id: seq++ },
    // { xsc: 1, xec: 2, ysc: 4, yec: 5, word: "15", id: seq++ },
    // { xsc: 2, xec: 3, ysc: 4, yec: 5, word: "16", id: seq++ },
    // { xsc: 1, xec: 2, ysc: 5, yec: 6, word: "a-1", id: seq++ },
    // { xsc: 2, xec: 3, ysc: 5, yec: 6, word: "a-2", id: seq++ },

    // // 合成表格存在两侧
    // { xsc: 0, xec: 1, ysc: 6, yec: 8, word: "999", id: seq++ },
    // { xsc: 1, xec: 2, ysc: 6, yec: 7, word: "999", id: seq++ },
    // { xsc: 2, xec: 3, ysc: 6, yec: 7, word: "999", id: seq++ },
    // { xsc: 3, xec: 4, ysc: 6, yec: 7, word: "999", id: seq++ },
    // { xsc: 4, xec: 5, ysc: 6, yec: 8, word: "999", id: seq++ },
    // { xsc: 1, xec: 2, ysc: 7, yec: 8, word: "999", id: seq++ },
    // { xsc: 2, xec: 3, ysc: 7, yec: 8, word: "999", id: seq++ },
    // { xsc: 3, xec: 4, ysc: 7, yec: 8, word: "999", id: seq++ },

    // // 右侧存在合成表格
    // { xsc: 0, xec: 1, ysc: 8, yec: 9, word: "22", id: seq++ },
    // { xsc: 1, xec: 4, ysc: 8, yec: 9, word: "23", id: seq++ },
    // { xsc: 4, xec: 6, ysc: 8, yec: 10, word: "24", id: seq++ },
    // { xsc: 0, xec: 1, ysc: 9, yec: 10, word: "25", id: seq++ },
    // { xsc: 1, xec: 4, ysc: 9, yec: 10, word: "26", id: seq++ },

    // 中间存在合成表格
    { xsc: 0, xec: 1, ysc: 15, yec: 16, word: "22", id: seq++ },
    { xsc: 1, xec: 2, ysc: 15, yec: 17, word: "23", id: seq++ },
    { xsc: 2, xec: 3, ysc: 15, yec: 16, word: "24", id: seq++ },
    { xsc: 0, xec: 1, ysc: 16, yec: 17, word: "25", id: seq++ },
    { xsc: 2, xec: 3, ysc: 16, yec: 17, word: "26", id: seq++ },

    // // // 只有一列的数据，不进行展示
    // { xsc: 0, xec: 1, ysc: 11, yec: 12, word: "999", id: seq++ },
    // { xsc: 0, xec: 1, ysc: 13, yec: 14, word: "999", id: seq++ },
    // { xsc: 0, xec: 1, ysc: 14, yec: 15, word: "999", id: seq++ },

];

console.log("cellInfos: ", cellInfos);


let rowData = [];
let oneSourceData = [];
for (let i = 0; i < cellInfos.length; i++) {
    rowData.push(cellInfos[i]);
    // 索引从0开始，最大索引n-1,需要保证比较的时候只能是N-1和N-2下表计较，不然数组会越界
    if (i < cellInfos.length - 1) {
        if (cellInfos[i].ysc !== cellInfos[i + 1].ysc) {
            // 换行
            oneSourceData.push(rowData);
            rowData = [];
        }
    }
    else if (i === cellInfos.length - 1) {
        oneSourceData.push(rowData);
    }
}
finalArr.push(oneSourceData);

console.log("++++++++++table++++++++++++++");
finalArr.forEach(val => {
    console.log(val);
})

// 分行完成后，进行占位填充
for (let index = 1; index < oneSourceData.length; index++) {
    let rowData = oneSourceData[index];
    let rowPreData = oneSourceData[index - 1];

    for (let column = 0; column < rowData.length; column++) {
        /*
            第一个表格不是从起始位置开始，说明有合成表格，需要增加占位对象
            增加的个数需要检测和前一行起始位置
        */
        let i = 0;
        if (0 === column) {
            while (rowPreData[i].xsc < rowData[0].xsc) {
                // 上一行第一个格的横向结束坐标比下一行横向起始位置还要小的情况下，认为是异常表格
                if (rowPreData[0].xec < rowData[0].xsc) {
                    console.log("invalid data");
                    break;
                }

                if (rowPreData[i].xsc === rowData[0].xsc) {
                    break;
                }

                if (i === rowPreData.length - 1 || rowPreData[i].xsc > rowData[0].xsc) {
                    break
                }

                let insertData = rowPreData[i];
                insertData.word = "";
                rowData.splice(i, 0, insertData);
                i++;
            }
        }
        else {
            console.log("column: ", column);
            if (rowData[column].xsc !== rowData[column - 1].xec) {
                // 中间存在其他表格
                i = 0;
                console.log("====i: ", i, ", column: ", column, ", pre xsc: ", rowPreData[i].xsc, ", ", rowData[column].xsc, "-", rowData[column - 1].xec);
                console.log("")
                while (i < rowPreData.length && rowPreData[i].xsc <= rowData[column].xsc) {
                    if (rowPreData[i].xsc >= rowData[column - 1].xec) {
                        let insertData = rowPreData[i];
                        insertData.word = "";
                        rowData.splice(i, 0, insertData);
                    }
                    i++;
                }
            }
        }
    }

}

console.log("++++++++++table++++++++++++++");
finalArr.forEach(val => {
    console.log(val);
})

console.log("===================end====================");
