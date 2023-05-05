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
    const inputArr = userInput.split(" ");
    let result;
    rudeArr.forEach((word) => {
        inputArr.forEach((badWord) => {
            if (badWord.toLowerCase() === word) result = true;
        });
    });
    return result;
};