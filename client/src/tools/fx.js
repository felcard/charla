const makeUserColorAndFont = () => {
    const fontArr = [
        "Rancho",
        "Lakki Reddy",
        "Righteous",
        "Space Mono",
        "Rancho",
        "Lakki Reddy",
        "Righteous",
        "Space Mono",
    ];
    const users = {};
    return function (user) {
        if (users[user]) {
            return users[user];
        } else {
            const userColor = `hsl(${Math.floor(Math.random() * 359)}, 100%, 60%)`;
            const fontInd = Math.floor(Math.random() * 7.99);
            const userFont = fontArr[fontInd];
            users[user] = { color: userColor, font: userFont };
            return users[user];
        }
    };
};
export const fontColor = makeUserColorAndFont();

export const isRude = (rudeWords, userInput) => {
    const rudeArr = rudeWords.split(",");
    //separator is the regular expression \b, which matches a word boundary. A word boundary is a position between a word character (as defined by \w) and a non-word character (as defined by \W), or between a word character and the start or end of the string.
    const inputStr = userInput.toLowerCase().split(/\b/);
    let result = false;
    for (let word of inputStr) {
        if (rudeArr.includes(word)) result = true;
        break;
    }
    return result;
};

export const abcRandom = (str = '') => {
    if (str.length >= 2) return str;
    const ran0to25 = Math.floor(Math.random() * 25);
    const ran65to90 = ran0to25 + 65;
    let ranChar = String.fromCharCode(ran65to90);
    if (str.length > 0 && str[0] !== ranChar) {
        str += ranChar;
        return abcRandom(str);
    } else {
        return abcRandom(ranChar);
    };
};

function makeLetterGenerator() {
    //use closure for the alphabet array and the user names object
    const arr = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    const users = {};
    //return a function that generates a unique letter for each new user
    //when an existent user name is given the same letter is returned
    return function (user) {
        if (users[user]) {
            return users[user];
        } else {
            const arrEl = arr[Math.floor(Math.random() * arr.length)];
            arr.splice(arr.indexOf(arrEl), 1);
            users[user] = arrEl;
            return users[user];
        }
    };
}

export const makeFace = makeLetterGenerator();