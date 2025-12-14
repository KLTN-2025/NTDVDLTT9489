const mongoose = require('mongoose');
const slug = require('mongoose-slug-updater');

mongoose.plugin(slug);
const CategorySchema = new mongoose.Schema({
    title: String,
    image: String,
    description: String,
    status: {
        type: String,
        default: "active"
    },
    slug: {
        type: String,
        slug: "title",
        unique: true
    },
    deleted: {
        type: Boolean,
        default: false
    },
}, { timestamps: true });
const Category = mongoose.model('Category', CategorySchema, "categories");
module.exports = Category;