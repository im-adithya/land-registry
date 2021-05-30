const router = require('express').Router();
let Admin = require('../models/adminModel');

//To display all admins in SuperAdmin's dashboard
router.route('/').get((req, res) => {
    Admin.find()
        .then(admins => res.json(admins))
        .catch(err => res.status(400).json('Error: ' + err));
});

//To check if he is an admin, if not address uses /user endpoint
router.route('/:address').get((req, res) => {
    Admin.findOne({
        address: req.params.address
    })
        .then(admin => res.json(admin))
        .catch(err => res.status(400).json('Error: ' + err));
});

//Added by SuperAdmin
router.route('/add').post((req, res) => {
    const address = req.body.address;
    const name = req.body.name;
    const aadhaar = req.body.aadhaar;
    const citytown = req.body.citytown;
    const district = req.body.district;
    const state = req.body.state;

    const newAdmin = new Admin({
        address,
        name,
        aadhaar,
        citytown,
        district,
        state
    });

    newAdmin.save()
        .then((savedAdmin) => res.json(savedAdmin))
        .catch(err => res.status(400).json('Error: ' + err));
});

//To delete an Admin if required
router.route('/:id').delete((req, res) => {
    Admin.deleteOne({ "user.phone": req.params.phone })
        .then(() => res.json('Deleted Successfully'))
        .catch(err => res.status(400).json('Error: ' + err));
});

module.exports = router;