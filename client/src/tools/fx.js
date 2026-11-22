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

//rudeWords is a comma-separated list; entries may be look-alikes ("b!tch") or phrases ("blow job")
export const isRude = (rudeWords, userInput) => {
    const rudeList = rudeWords.split(",").map((w) => w.trim()).filter(Boolean);
    const text = userInput.toLowerCase();
    const notLetterOrDigit = /[^\p{L}\p{N}]+/gu;
    //each word as typed, minus surrounding punctuation, keeps look-alikes whole ("b!tch,") ...
    const typedWords = text
        .split(/\s+/)
        .map((w) => w.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, ""));
    //... and plain letter runs catch words glued together by punctuation ("ok,word")
    const plainWords = text.split(notLetterOrDigit);
    const words = new Set([...typedWords, ...plainWords]);
    const spaced = ` ${text.replace(notLetterOrDigit, " ")} `;
    return rudeList.some((bad) =>
        bad.includes(" ") ? spaced.includes(` ${bad} `) : words.has(bad)
    );
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