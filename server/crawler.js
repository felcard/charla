module.exports = arrCrawler = (winLine, arr) => {
    if (winLine > arr.length) throw new Error('Array lenth must be longer than winning line!');
    //const winLine = 7;//set number of elements in a winning line
    const skewLines = (...args) => {//crawl the array matrix and return all elements in oblique lines as new one dimention arrays.
        const arr = [];
        for (let i = 0; i < args.length - winLine + 1; i++) {
            arr[i] = [];
            for (let j = 0; j < args.length - i; j++) {
                arr[i][j] = args[j][j + i];
            }
        };
        return arr;
    };
    const cols2rows = (...args) => {//crawl the array matrix and return arrays of elements in columns
        const tot = [];
        for (let i = 0; i < args.length; i++) {
            const arry = [];
            for (let j = 0; j < args[0].length; j++) {
                arry[j] = args[j][i];
            }
            tot[i] = arry;
        }
        return tot;
    };
    const arrIndexed = arr.map((curr, ind) => {//add two dimention indexes to each element of the original array
        return curr.map((curry, index) => [curry, [ind, index]]);
    });
    const rows2cols = cols2rows(...arrIndexed);
    const rows2colsReversed = cols2rows(...(arrIndexed.slice().reverse()));//use slice since reverse mutates array
    //below we get all oblique lines of the 2 dimentional array 4 corners 
    const arrSkew = skewLines(...arrIndexed).concat(skewLines(...(arrIndexed.slice().reverse())));
    const arrSkew2 = skewLines(...rows2cols).slice(1).concat(skewLines(...rows2colsReversed).slice(1));//we sliced repeated arrays
    //final array contains arrays of the skew lines and rows and columns
    const finalArr = [...arrIndexed, ...rows2cols, ...arrSkew, ...arrSkew2];
    //below we defined counter vars and arrays to store the players' scores and indexes of elements in 
    //the winning lines to be used to color ot highligth them as desired
    let aPlayer = 0; let bPlayer = 0;
    let countA; let countB;
    let lineA = []; let lineAtemp;
    let lineB = []; let lineBtemp;
    finalArr.forEach(el => {
        countA = 0; lineAtemp = [];
        countB = 0; lineBtemp = [];
        el.forEach(a => {
            if (a[0] === 'O') {
                countA++;
                lineAtemp.push(a);
                if (countA === winLine) {
                    aPlayer++;
                    lineA = lineA.concat(lineAtemp);
                    countA = 0; lineAtemp = [];
                }
                countB = 0; lineBtemp = [];
            } else {
                countB++;
                lineBtemp.push(a);
                if (countB === winLine) {
                    bPlayer++;
                    lineB = lineB.concat(lineBtemp);
                    countB = 0; lineBtemp = [];
                }
                countA = 0; lineAtemp = [];
            }
        });
    });
    //create a new array with each element of the original array including
    //a boolean to indicate wether the element belong to a winning line
    const arrWins = arr.map(a => a.map(b => [b, false]));
    lineA.forEach(el => arrWins[el[1][0]][el[1][1]][1] = true);
    lineB.forEach(el => arrWins[el[1][0]][el[1][1]][1] = true);
    return { playerO: aPlayer, playerX: bPlayer, winArr: arrWins };
};