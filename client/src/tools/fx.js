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