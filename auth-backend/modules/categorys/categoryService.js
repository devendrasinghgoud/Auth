import Category from "../../models/Category.js";
import Image from "../../models/imageModel.js";
import mongoose from "mongoose";
import cloudinary from "../../config/cloudinary.js";

const uploadAndCreateImageDoc = async (file, user, categoryId = null) => {
    try {
        const b64 = Buffer.from(file.buffer).toString("base64");
        const dataURI = `data:${file.mimetype};base64,${b64}`;

        const uploadedImage = await cloudinary.uploader.upload(dataURI, {
            folder: "categories",
        });

        const imageDoc = await Image.create({
            filename: file.originalname,
            url: uploadedImage.secure_url,
            public_id: uploadedImage.public_id,
            uploadedBy: user?._id || null,
            category: categoryId,                                                                                                                                                                           
        });
        return imageDoc;

    } catch (uploadError) {
        throw new Error(`Image processing failed: ${uploadError.message || "Unknown error during file upload."}`);
    }
};

export const createCategoriesService = async (categories, file = null, user = null) => {
    if (!Array.isArray(categories) || categories.length === 0) {
        throw new Error("At least one category name is required");
    }

    let imageDoc = null;
    let categoryToLinkImage = null;

    if (file) {
        try {
            imageDoc = await uploadAndCreateImageDoc(file, user);
        } catch (error) {
            throw error;
        }
    }

    const newCategories = [];

    for (let name of categories) {
        name = name.trim();
        if (!name) continue;

        const existing = await Category.findOne({ category: name });
        if (!existing) {
            const created = await Category.create({
                category: name,
                image: imageDoc?._id || null,
            });
            newCategories.push(created);

            if (imageDoc && !categoryToLinkImage) {
                imageDoc.category = created._id;
                await imageDoc.save();
                categoryToLinkImage = created;
            }
        }
    }

    return {
        success: true,
        message:
            newCategories.length > 0
                ? "Categories created successfully"
                : "All provided categories already exist",
        results: newCategories,
        count: newCategories.length,
    };
};

export const updateCategoryService = async (id, file, user) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid category ID format");
    }

    const category = await Category.findById(id).populate('image');
    if (!category) {
        throw new Error("Category not found");
    }

    if (!file) {
        throw new Error("No image file provided for update");
    }

    if (category.image) {
        await cloudinary.uploader.destroy(category.image.public_id);
        await Image.deleteOne({ _id: category.image._id });
    }

    const newImageDoc = await uploadAndCreateImageDoc(file, user, category._id);
    
    category.image = newImageDoc._id;
    await category.save();

    const updatedCategory = await Category.findById(id).populate('image', 'url public_id');

    return { 
        success: true, 
        message: "Category image updated successfully", 
        result: updatedCategory
    };
};

export const getAllCategoriesService = async (query = {}) => {
    const { search, sort, page = 1, limit = 10 } = query;
    const filter = {};

    if (search && search.trim()) {
        filter.category = { $regex: search.trim(), $options: "i" };
    }

    let sortOption = {};
    switch (sort) {
        case "newest":
            sortOption = { createdAt: -1 };
            break;
        case "oldest":
            sortOption = { createdAt: 1 };
            break;
        case "z-a":
            sortOption = { category: -1 };
            break;
        default:
            sortOption = { category: 1 };
    }

    const totalCount = await Category.countDocuments(filter);

    const categories = await Category.find(filter)
        .populate("image", "url public_id")
        .sort(sortOption)
        .skip((page - 1) * limit)
        .limit(limit);

    return {
        success: true,
        results: categories,
        message: "Categories fetched successfully",
        pagination: {
            totalCount,
            count: categories.length,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: Number(page),
            limit: Number(limit),
        },
    };
};

export const deleteCategoryService = async (id) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid category ID");
    }

    const category = await Category.findById(id).populate("image");
    if (!category) throw new Error("Category not found");

    if (category.image) {
        await cloudinary.uploader.destroy(category.image.public_id);
        await category.image.deleteOne();
    }

    await category.deleteOne();

    return {
        success: true,
        message: "Category deleted successfully",
    };
};