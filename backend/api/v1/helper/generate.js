module.exports.generateRandomString = (length) => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";


    for (let i = 0; i < length; i++) {

        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    return result;
};

module.exports.generateRandomNumber = (length) => {
    const characters = "0123456789";
    let result = "";


    for (let i = 0; i < length; i++) {

        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    return result;
};

// generate mã tour
module.exports.generateTourCode = (number) => {
    const code = `TOUR${String(number).padStart(6, '0')}`;
    return code;
};

// generate mã order
module.exports.generateOrderCode = (number) => {
    const code = `ORD${String(number).padStart(6, '0')}`;
    return code;
};