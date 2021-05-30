const router = require('express').Router();
let User = require('../models/userModel');
let Property = require('../models/propertyModel');

//Check if he is an existing user or not
router.route('/:address').get((req, res) => {
    User.findOne({
        address: req.params.address
    })
        .then(user => res.json(user))
        .catch(err => res.status(400).json('Error: ' + err));
});

//Adding a user (done automatically if the user is visiting for the first time)
router.route('/add').post((req, res) => {
    const address = req.body.address;
    const name = "";
    const phone = "";
    const email = "";
    const aadhaar = "";

    const newUser = new User({
        address,
        name,
        phone,
        email,
        aadhaar
    });

    newUser.save()
        .then((saveduser) => res.json(saveduser))
        .catch(err => res.status(400).json('Error: ' + err));
});

//Update user's details if the user wants
router.route('/update/:address').post((req, res) => {
    User.findOne({
        address: req.params.address
    })
        .then(user => {
            user.name = req.body.name;
            user.phone = req.body.phone;
            user.email = req.body.email;
            user.aadhaar = req.body.aadhaar;

            user.save()
                .then((updatedUser) => res.json(updatedUser))
                .catch(err => res.status(400).json('Error: ' + err));
        })
        .catch(err => res.status(400).json('Error: ' + err));
});

//Reject requests  /* TODO THIS IS NOT GOOD PRACTICE */
router.route('/rejectrequests/:surveynumber').post((req, res) => {
    User.findOne({
        address: req.body.addressrequester
    })
        .then(requester => {
            let requestssent = requester.requestssent;
            objIndex = requestssent.findIndex((obj => (obj.surveynumber == req.params.surveynumber && obj.owner == req.body.address)))
            requestssent[objIndex].approved = false;
            requester.requestssent = requestssent;
            requester.markModified('requestssent')
            requester.save()
                .then(() => {
                    User.findOne({
                        address: req.body.address
                    })
                        .then(user => {
                            let requestsreceived = user.requestsrec;
                            objIndex = requestsreceived.findIndex((obj => (obj.surveynumber == req.params.surveynumber && obj.requester == req.body.addressrequester)))
                            requestsreceived[objIndex].approved = false;
                            user.requestsrec = requestsreceived;
                            user.markModified('requestsrec')
                            user.save()
                                .then((user) => res.json(user.requestsrec))
                                .catch(err => res.status(400).json('Error: ' + err));
                        })
                })
                .catch(err => res.status(400).json('Error: ' + err));
        })
});

//Approve Requests
router.route('/approverequests/:surveynumber').post(async (req, res) => {

    let users = await User.find({ $and: [{ requestssent: { $elemMatch: { surveynumber: req.params.surveynumber } } }, { address: { $ne: req.body.addressrequester } }] })

    users.forEach(async (user) => {
        let requestssent = user.requestssent;
        let objIndex = user.requestssent.findIndex((obj => (obj.surveynumber == req.params.surveynumber)));
        requestssent[objIndex].approved = false;
        await User.updateOne({ _id: user._id }, { $set: { requestssent: requestssent } })
    })

    User.findOne({
        address: req.body.addressrequester
    })
        .then(requester => {
            let requestssent = requester.requestssent;
            let objIndex = requestssent.findIndex((obj => (obj.surveynumber == req.params.surveynumber && obj.owner == req.body.address)))
            requestssent[objIndex].approved = true;
            requester.requestssent = requestssent;
            requester.markModified('requestssent')
            requester.save()
                .then(() => {
                    Property.findOne({ surveynumber: req.params.surveynumber })
                        .then(property => {
                            property.approved = true;
                            property.save()
                                .then(() => {
                                    User.findOne({
                                        address: req.body.address
                                    })
                                        .then(user => {
                                            let requestsreceived = user.requestsrec;
                                            requestsreceived = requestsreceived.map(el => { return { propertyid: el.propertyid, requester: el.requester, surveynumber: el.surveynumber, approved: ((el.surveynumber === req.params.surveynumber && el.requester === req.body.addressrequester) ? true : ((el.surveynumber === req.params.surveynumber && el.requester !== req.body.addressrequester) ? false : el.approved)) } })
                                            user.requestsrec = requestsreceived;
                                            user.markModified('requestsrec')
                                            user.save()
                                                .then((user) => res.json(user.requestsrec))
                                                .catch(err => res.status(400).json('Error: ' + err));
                                        })
                                        .catch(err => res.status(400).json('Error: ' + err));
                                })
                        })
                })
        })
})

//Delete Received Requests (Can be done only after Approving or Rejecting)
router.route('/requestsrec/:surveynumber').post((req, res) => {
    User.findOne({
        address: req.body.address
    })
        .then(user => {
            let requestsreceived = user.requestsrec;
            objIndex = requestsreceived.findIndex((obj => (obj.surveynumber == req.params.surveynumber && obj.requester == req.body.addressrequester)))
            requestsreceived.splice(objIndex, 1);
            user.requestsrec = requestsreceived;
            user.markModified('requestsrec');
            user.save()
                .then((user) => res.json(user.requestsrec))
                .catch(err => res.json('Error: ' + err));
        })
});

//Delete Sent Requests -- after buying (to be deleted automatically) or after rejecting
//This route can be accessed on client side only when rejected so we are not checking it again here
router.route('/delrequestssent/:surveynumber').post((req, res) => {
    User.findOne({
        address: req.body.address
    })
        .then(user => {
            let requestssent = user.requestssent;
            objIndex = requestssent.findIndex((obj => (obj.surveynumber == req.params.surveynumber && obj.owner == req.body.owner)))
            requestssent.splice(objIndex, 1);
            user.requestssent = requestssent;
            user.markModified('requestssent')
            user.save()
                .then((user) => res.json(user.requestssent))
                .catch(err => res.status(400).json('Error: ' + err));
        })
});

//Withdraw Sent Requests -- removes the request from both ends
router.route('/requestssent/:surveynumber').post((req, res) => {

    User.findOne({
        address: req.body.owner
    })
        .then(owner => {
            let requestsreceived = owner.requestsrec;
            objIndex = requestsreceived.findIndex((obj => (obj.surveynumber == req.params.surveynumber && obj.requester == req.body.address)))
            requestsreceived.splice(objIndex, 1);
            owner.requestsrec = requestsreceived;
            owner.markModified('requestsrec');
            owner.save()
                .then(() => {
                    User.findOne({
                        address: req.body.address
                    })
                        .then(user => {
                            let requestssent = user.requestssent;
                            objIndex = requestssent.findIndex((obj => obj.surveynumber == req.params.surveynumber && obj.owner == req.body.owner))
                            requestssent.splice(objIndex, 1);
                            user.requestssent = requestssent;
                            user.markModified('requestssent');
                            user.save()
                                .then((user) => res.json(user.requestssent))
                                .catch(err => res.status(400).json('Error: ' + err));
                        })
                })
                .catch(err => res.status(400).json('Error: ' + err));
        })
});

module.exports = router;