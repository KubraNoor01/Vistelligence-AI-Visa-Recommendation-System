const express = require("express");
const {createCategory, getCategory, updateCategory, deleteCategory} = require("../controllers/catagories")
const router = express.Router();

router.post("/AddCatagory", createCategory)
router.get("/getCatagories", getCategory)
router.put("/updateCategory/:id", updateCategory)
router.delete("/deleteCategory/:id", deleteCategory)

module.exports = router;

