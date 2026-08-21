export function getColorChatGradient(id) {
    const colors = {
        0 : "linear-gradient(135deg, rgb(237, 244, 248) 0%, rgb(161, 198, 219) 100%)" ,
        1 : "linear-gradient(135deg, rgb(237, 244, 248) 0%, rgb(161, 198, 219) 100%)" ,
        2 : "linear-gradient(135deg, rgb(248, 240, 237) 0%, rgb(219, 199, 161) 100%)" ,
        3 : "linear-gradient(135deg, rgb(237, 248, 240) 0%, rgb(146, 219, 162) 100%)" ,
        4 : "linear-gradient(135deg, rgb(248, 237, 241) 0%, rgb(219, 146, 185) 100%)" ,
        5 : "linear-gradient(135deg, rgb(225, 222, 246) 0%, rgb(127, 125, 238) 100%)" 
    }
    const index = Number(id) % 6;
    return colors[index];
}

export function  getShortChatName(raw) {
    const arr = raw.split(" ");
    const one = arr[0].substr(0,1).toUpperCase();
    const two = arr[1]?.substr(0,1).toUpperCase();
    return one + (two ?? "");
}