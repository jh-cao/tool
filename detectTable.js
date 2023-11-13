console.log("===================start====================");

let finalArr = [];



let seq = 0;
let cellInfos = [
    // { xsc: 0, xec: 1, ysc: 0, yec: 1, word: "1", id: seq++ },
    // { xsc: 1, xec: 2, ysc: 0, yec: 1, word: "2", id: seq++ },
    // { xsc: 2, xec: 4, ysc: 0, yec: 1, word: "3", id: seq++ },

    // // 常规表格
    { xsc: 0, xec: 1, ysc: 1, yec: 2, word: "4", id: seq++ },
    { xsc: 1, xec: 2, ysc: 1, yec: 2, word: "5", id: seq++ },
    { xsc: 2, xec: 3, ysc: 1, yec: 2, word: "6", id: seq++ },
    { xsc: 3, xec: 4, ysc: 1, yec: 2, word: "7", id: seq++ },
    { xsc: 0, xec: 1, ysc: 2, yec: 3, word: "8", id: seq++ },
    { xsc: 1, xec: 2, ysc: 2, yec: 3, word: "9", id: seq++ },
    { xsc: 2, xec: 3, ysc: 2, yec: 3, word: "10", id: seq++ },
    { xsc: 3, xec: 4, ysc: 2, yec: 3, word: "11", id: seq++ },
    // 左侧存在合成表格
    { xsc: 0, xec: 1, ysc: 3, yec: 6, word: "12", id: seq++ },
    { xsc: 1, xec: 2, ysc: 3, yec: 4, word: "13", id: seq++ },
    { xsc: 2, xec: 3, ysc: 3, yec: 4, word: "14", id: seq++ },
    { xsc: 1, xec: 2, ysc: 4, yec: 5, word: "15", id: seq++ },
    { xsc: 2, xec: 3, ysc: 4, yec: 5, word: "16", id: seq++ },
    { xsc: 1, xec: 2, ysc: 5, yec: 6, word: "a-1", id: seq++ },
    { xsc: 2, xec: 3, ysc: 5, yec: 6, word: "a-2", id: seq++ },

    // 合成表格存在两侧
    { xsc: 0, xec: 1, ysc: 6, yec: 8, word: "999", id: seq++ },
    { xsc: 1, xec: 2, ysc: 6, yec: 7, word: "999", id: seq++ },
    { xsc: 2, xec: 3, ysc: 6, yec: 7, word: "999", id: seq++ },
    { xsc: 3, xec: 4, ysc: 6, yec: 7, word: "999", id: seq++ },
    { xsc: 4, xec: 5, ysc: 6, yec: 8, word: "999", id: seq++ },
    { xsc: 1, xec: 2, ysc: 7, yec: 8, word: "999", id: seq++ },
    { xsc: 2, xec: 3, ysc: 7, yec: 8, word: "999", id: seq++ },
    { xsc: 3, xec: 4, ysc: 7, yec: 8, word: "999", id: seq++ },

    // 右侧存在合成表格
    { xsc: 0, xec: 1, ysc: 8, yec: 9, word: "22", id: seq++ },
    { xsc: 1, xec: 4, ysc: 8, yec: 9, word: "23", id: seq++ },
    { xsc: 4, xec: 6, ysc: 8, yec: 10, word: "24", id: seq++ },
    { xsc: 0, xec: 1, ysc: 9, yec: 10, word: "25", id: seq++ },
    { xsc: 1, xec: 4, ysc: 9, yec: 10, word: "26", id: seq++ },

    // // 只有一列的数据，不进行展示
    { xsc: 0, xec: 1, ysc: 11, yec: 12, word: "999", id: seq++ },
    { xsc: 0, xec: 1, ysc: 13, yec: 14, word: "999", id: seq++ },
    { xsc: 0, xec: 1, ysc: 14, yec: 15, word: "999", id: seq++ },

];

console.log("cellInfos: ", cellInfos);


let rowData = [];
for (let i = 0; i < cellInfos.length; i++) {
    rowData.push(cellInfos[i]);
    // 索引从0开始，最大索引n-1,需要保证比较的时候只能是N-1和N-2下表计较，不然数组会越界
    if(i < cellInfos.length - 1)
    {
       if(cellInfos[i].ysc !== cellInfos[i+1].ysc)
       {
            // 换行
            finalArr.push(rowData);
            rowData = [];
       }
    }
    else if(i === cellInfos.length - 1)
    {
        finalArr.push(rowData);
    }
}

console.log("++++++++++table++++++++++++++");
finalArr.forEach(val => {
    console.log(val);
})

console.log("===================end====================");
