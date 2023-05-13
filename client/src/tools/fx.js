export const fonts = () => {
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
    const fontInd = Math.floor(Math.random() * 7);
    return fontArr[fontInd];
};

export const color = () => {
    return `hsl(${Math.floor(Math.random() * 359)}, 100%, 60%)`;
};

export const isRude = (rudeWords, userInput) => {
    const rudeArr = rudeWords.split(",");
    //separator is the regular expression \b, which matches a word boundary. A word boundary is a position between a word character (as defined by \w) and a non-word character (as defined by \W), or between a word character and the start or end of the string.
    const inputStr = userInput.split(/\b/);
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