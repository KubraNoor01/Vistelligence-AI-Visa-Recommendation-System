const categoriesModel = require("../models/catagoriesModel");

const createCategory = async (req, res) => {
    try {
        const { name } = req.body;
        
        // Validate input
        if (!name) {
            return res.status(400).json({ status: "failed", message: "Category name is required" });
        }
        
        // Check if category already exists
        const existingCategory = await categoriesModel.findOne({ name });
        if (existingCategory) {
            return res.status(400).json({ status: "failed", message: "Category already exists" });
        }
        
        // Create new category
        const newCategory = new categoriesModel({ name });
        await newCategory.save();
        
        res.status(201).json({ status: "success", message: "Category created successfully", category: newCategory });
    } catch (error) {
        console.error("Error creating category:", error);
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};

const getCategory = async (req, res) => {
    try {
        // Fetch all categories
        const categories = await categoriesModel.find();

        // Check if categories exist
        if (categories.length === 0) {
            return res.status(404).json({ status: "failed", message: "No categories found" });
        }

        res.status(200).json({ status: "success", data: categories });
    } catch (error) {
        console.error("Error fetching categories:", error);
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};

const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        
        // Validate input
        if (!name) {
            return res.status(400).json({ status: "failed", message: "Category name is required" });
        }
        
        // Check if category exists
        const category = await categoriesModel.findById(id);
        if (!category) {
            return res.status(404).json({ status: "failed", message: "Category not found" });
        }
        
        // Check if new name already exists (excluding current category)
        const existingCategory = await categoriesModel.findOne({ name, _id: { $ne: id } });
        if (existingCategory) {
            return res.status(400).json({ status: "failed", message: "Category name already exists" });
        }
        
        // Update category
        const updatedCategory = await categoriesModel.findByIdAndUpdate(
            id,
            { name },
            { new: true }
        );
        
        res.status(200).json({ status: "success", message: "Category updated successfully", category: updatedCategory });
    } catch (error) {
        console.error("Error updating category:", error);
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};

const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check if category exists
        const category = await categoriesModel.findById(id);
        if (!category) {
            return res.status(404).json({ status: "failed", message: "Category not found" });
        }
        
        // Delete category
        await categoriesModel.findByIdAndDelete(id);
        
        res.status(200).json({ status: "success", message: "Category deleted successfully" });
    } catch (error) {
        console.error("Error deleting category:", error);
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};

module.exports = { createCategory, getCategory, updateCategory, deleteCategory };

