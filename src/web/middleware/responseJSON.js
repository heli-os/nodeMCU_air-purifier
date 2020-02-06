module.exports.create = (state, title, message) => {
    return {
        state: state,
        properties: {
            Title: title,
            Message: message
        }
    };
};