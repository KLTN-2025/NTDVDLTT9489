const unidecode = require('unidecode');

module.exports.convertToSlug = (text) => {
    const unidecodeText = unidecode(text.trim());
    const slug = unidecodeText.replace(/\s+/g, '-');

    return slug;
}