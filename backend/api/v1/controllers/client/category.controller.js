const Category = require("../../models/category.model");

// [GET]/api/v1/categories
module.exports.index = async (req, res) => {
    const categories = await Category.find({
        status: 'active',
        deleted: false
    });
    res.json(categories);
};