const router = require('express').Router();
var mongoose = require('mongoose');
let Property = require('../models/propertyModel');
let User = require('../models/userModel');

// To search for a land with particular survey number
router.route('/:surveynumber').get((req, res) => {
    Property.findOne({
        surveynumber: req.params.surveynumber
    })
        .then(property => res.json(property))
        .catch(err => res.status(400).json('Error: ' + err));
});

//Properties owned by a user
router.route('/user/:address').get((req, res) => {
    Property.find({
        address: req.params.address
    })
        .then(properties => res.json(properties))
        .catch(err => res.status(400).json('Error: ' + err));
});

//Properties registered by an admin (admin dashboard purpose)
router.route('/admin/:address').get((req, res) => {
    Property.find({
        registeredby: req.params.address
    })
        .then(properties => res.json(properties))
        .catch(err => res.status(400).json('Error: ' + err));
});

//Register a property (admin)
router.route('/register').post((req, res) => {
    const address = req.body.address;
    const surveynumber = req.body.surveynumber;
    const type = req.body.type;
    const citytown = req.body.citytown;
    const district = req.body.district;
    const state = req.body.state;
    const registeredby = req.body.registeredby;
    const marketvalue = req.body.marketvalue;
    const sale = false;
    const approved = false;

    const newProperty = new Property({
        address,
        surveynumber,
        type,
        citytown,
        district,
        state,
        registeredby,
        marketvalue,
        sale,
        approved
    });

    newProperty.save()
        .then((property) => res.json(property))
        .catch(err => res.status(400).json('Error: ' + err));
});


router.route('/sale/:surveynumber').post((req, res) => {
    Property.findOne({
        surveynumber: req.params.surveynumber
    })
        .then(async (property) => {
            let forsale = property.sale
            if (!forsale) {
                property.sale = true;
                property.save().then((property) => res.json(property.sale))
                    .catch(err => res.status(400).json('Error: ' + err));
            } else {
                property.sale = false;

                let users = await User.find({ requestssent: { $elemMatch: { surveynumber: req.params.surveynumber } } })

                users.forEach(async (user) => {
                    let requestssent = user.requestssent;
                    let objIndex = user.requestssent.findIndex((obj => (obj.surveynumber == req.params.surveynumber)));
                    requestssent[objIndex].approved = false;
                    await User.updateOne({ _id: user._id }, { $set: { requestssent: requestssent } })
                })

                property.save().then(() => {
                    User.updateMany({ requestssent: { $elemMatch: { surveynumber: req.params.surveynumber } } },
                        { $set: { "requestssent.$[].approved": false } })
                        .then(() => {
                            User.findOne({
                                address: req.body.address
                            })
                                .then(user => {
                                    let requestsrec = user.requestsrec;
                                    requestsrec = requestsrec.filter(el => el.surveynumber !== req.params.surveynumber)
                                    user.requestsrec = requestsrec;
                                    user.markModified('requestsrec');
                                    user.save()
                                        .then((user) => res.json(user.requestsrec))
                                        .catch(err => res.status(400).json('Error: ' + err));
                                })
                                .catch(err => res.status(400).json('Error: ' + err));
                        })
                        .catch(err => res.status(400).json('Error: ' + err));
                })
            }
        })
        .catch(err => res.status(400).json('Error: ' + err));
})

//Transfer a property (user)
router.route('/transfer/:surveynumber').post((req, res) => {
    User.findOne({
        address: req.body.addressfrom
    })
        .then(user => {
            let requestsrec = user.requestsrec;
            requestsrec = requestsrec.filter(el => !(el.requester !== req.body.addressto && el.surveynumber === req.params.surveynumber))
            user.requestsrec = requestsrec;
            user.markModified('requestsrec');
            user.save()
                .then(() => {
                    User.findOne({ address: req.body.addressto })
                        .then((newowner) => {
                            let requestssent = newowner.requestssent;
                            requestssent = requestssent.filter(el => el.surveynumber !== req.params.surveynumber)
                            newowner.requestssent = requestssent;
                            newowner.markModified('requestssent');
                            newowner.save()
                                .then(() => {
                                    Property.findOne({
                                        address: req.body.addressfrom,
                                        surveynumber: req.params.surveynumber
                                    })
                                        .then((property) => {
                                            property.approved = false;
                                            property.sale = false;
                                            property.address = req.body.addressto;
                                            property.save()
                                                .then((property) => {
                                                    res.json(property)
                                                })
                                        })
                                        .catch(err => res.status(400).json('Error: ' + err));
                                })
                        })
                        .catch(err => res.status(400).json('Error: ' + err));
                })
        })
        .catch(err => res.status(400).json('Error: ' + err));
});

//Send a request regarding property
router.route('/request/:id').post((req, res) => {
    Property.findById(req.params.id)
        .then(property => {
            User.findOne({
                address: property.address
            })
                .then(user => {
                    let requestsreceived = user.requestsrec;
                    requestsreceived.push({ approved: null, propertyid: req.params.id, requester: req.body.addressrequester, surveynumber: property.surveynumber })
                    user.requestsrec = requestsreceived;
                    user.markModified('requestsrec');
                    user.save()
                        .then(() => {
                            User.findOne({
                                address: req.body.addressrequester
                            })
                                .then(requester => {
                                    let requestssent = requester.requestssent;
                                    requestssent.push({ approved: null, propertyid: req.params.id, owner: property.address, surveynumber: property.surveynumber })
                                    requester.requestssent = requestssent;
                                    requester.markModified('requestssent');
                                    requester.save()
                                        .then((user) => res.json(user.requestssent))
                                        .catch(err => res.status(400).json('Error: ' + err));
                                })
                        })
                        .catch(err => res.status(400).json('Error: ' + err));
                })
                .catch(err => res.status(400).json('Error: ' + err));
        })
});

router.route('/total').get((req, res) => {
    Property.countDocuments()
        .then(count => res.json(count))
        .catch(err => res.status(400).json('Error: ' + err));
});

module.exports = router;