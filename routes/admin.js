const express = require('express');
const router = express.Router();
const fetchuser = require('../middleware/fetchuser');
const { body, validationResult } = require('express-validator');
const items = require('../models/items');


// ROUTE 1: Get All the items using: GET "/api/admin/items" with page ,limit ,search ,sort and  category query parameters 
router.get('/items', async (req, res) => {
    try {
		const page = parseInt(req.query.page) - 1 || 0;
		const limit = parseInt(req.query.limit) || 5;
		const search = req.query.search || "";
		let sort = req.query.sort || "rating";
		let category = req.query.category || "All";

		const categoryOptions = [
			"women's clothing",
            "electronics",
            "jewelery",
            "men's clothing",
		];

		category === "All"
			? (category = [...categoryOptions])
			: (category = req.query.category.split(","));
		req.query.sort ? (sort = req.query.sort.split(",")) : (sort = [sort]);

		let sortBy = {};
		if (sort[1]) {
			sortBy[sort[0]] = sort[1];
		} else {
			sortBy[sort[0]] = "asc";
		}

		const item = await items.find({ title: { $regex: search, $options: "i" } })
			.where("category")
			.in([...category])
			.sort(sortBy)
			.skip(page * limit)
			.limit(limit);

		const total = await items.countDocuments({
			category: { $in: [...category] },
			title: { $regex: search, $options: "i" },
		});

		const response = {
			error: false,
			total,
			page: page + 1,
			limit,
			categories: categoryOptions,
			item,
		};

		res.status(200).json(response);
	} catch (err) {
		console.log(err);
		res.status(500).json({ error: true, message: "Internal Server Error" });
	}
})

// ROUTE 2: Add a new item using: POST "/api/admin/additem"
router.post('/additem',  [
    body('title', 'Enter a valid title').isLength({ min: 3 }),
    body('price', 'Enter a valid price'),
    body('image','Enter a valid image').isLength({ min: 2 }),
    body('description', 'Description must be atleast 5 characters').isLength({ min: 5 }),
    body("rating",'rating is not valid')]
    , async (req, res) => {
        try {
            const { title, description, price, image, category, rating } = req.body;

            // If there are errors, return Bad request and the errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            const item = new items({
                title, description, price, image, category,rating
            })
            const saveditem = await item.save()

            res.json(saveditem)

        } catch (error) {
            console.error(error.message);
            res.status(500).send("Internal Server Error");
        }
    })

// ROUTE 3: Update an existing item using: PUT "/api/admin/updateitem". Login required
router.put('/updateitem/:id', async (req, res) => {
    const { title, description, price,image } = req.body;
    try {
        // Create a newItem object
        const newItem = {};
        if (title) { newItem.title = title };
        if (description) { newItem.description = description };
        if (price) { newItem.price = price };
        if (image) { newItem.image = image };
        // Find the item to be updated and update it
        let item = await items.findById(req.params.id);
        if (!item) { return res.status(404).send("Not Found") }

        item = await items.findByIdAndUpdate(req.params.id, { $set: newItem }, { new: true })
        res.json({ item });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})

// ROUTE 4: Delete an existing item using: DELETE "/api/admin/deleteitem". Login required
router.delete('/deleteitem/:id', async (req, res) => {
    try {
        // Find the item to be delete and delete it
        let item = await items.findById(req.params.id);
        if (!item) { return res.status(404).send("Not Found") }

        item = await items.findByIdAndDelete(req.params.id)
        res.json({ "Success": "item has been deleted", item: item });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})

// function to insert multiple movies from json file
// const insertitems = async () => {
//     try {
//         const docs = await items.insertMany(products);
//         return Promise.resolve(docs);
//     } catch (err) {
//         return Promise.reject(err)
//     }
// };

// insertMovies()
//     .then((docs) => console.log(docs))
//     .catch((err) => console.log(err))

module.exports = router