const catchAsyncError = require('../middlewares/catchAsyncError');
const Workshop = require('../models/workshopModel');
const WorkshopRegistration = require('../models/workshopRegisterModel');
const moment = require('moment');


exports.create = catchAsyncError(async (req, res, next) => {

    const { title, description, date, maxParticipants } = req.body;
    const createdBy = req.user.id;
    const campus = req.params.campus;
    console.log(req.user.id);
    const originalDate = moment(date);
    const adjustedDate = originalDate.add(1, 'days');

    const workshop = new Workshop({
        title: title,
        description: description,
        date: adjustedDate.toDate(),
        campus: campus,
        maxParticipants: maxParticipants,
        createdBy: createdBy
    });
    try {
        await workshop.save();

    }
    catch (error) {
        console.log(error);
    }
    res.status(201).json({
        success: true,
        message: "Workshop created successfully!"
    });


});


exports.register = catchAsyncError(async (req, res, next) => {

    console.log(req.body);
    const workshop = await Workshop.findById(req.params.id);

    if (!workshop) {
        return res.status(404)
            .json({
                success: false,
                message: "Workshop not found!"
            });
    }
    if (workshop.campus !== req.user.campus) {
        return res.status(403)
            .json({
                success: false,
                message: "You are not authorized to register for this workshop!"
            })
    }

    if (workshop.registeredUsers.includes(req.user.id)) {

        return res.status(400).json({
            success: false,
            message: "User already registered!"
        })
    }
    if (workshop.registeredUsers.length >= workshop.maxParticipants) {

        return res.status(400).json({
            success: false,
            message: "Workshop is full!"
        });
    }

    const newRegister = new WorkshopRegistration({
        workshop: req.params.id,
        user: req.user.id,
        date: req.body.date
    });
    workshop.registeredUsers.push(req.user.id);

    try {
        await newRegister.save();
        await workshop.save();

    }
    catch (error) {
        console.log(error);
    }

    res.status(201).json({
        success: true,
        message: "Workshop Registered successfully!"
    })




});

exports.deleteWorkshop = catchAsyncError(async (req, res, next) => {
    const workshop = await Workshop.findByIdAndDelete(req.params.id);
    if (!workshop) {
        return res.status(404).json({
            success: false,
            message: "Workshop not found!"
        });
    }
    await WorkshopRegistration.deleteMany({ workshop: workshop._id });
    res.status(200).json({
        success: true,
        message: "Workshop deleted successfully!"
    });

})


exports.updateWorkshop = catchAsyncError(async (req, res, next) => {
    const { title, description, maxParticipants } = req.body;

    const workshop = await Workshop.findOneAndUpdate({ _id: req.params.id }, {
        title,
        description,
        maxParticipants

    });
    if (!workshop) {
        return res.status(404).json({
            success: false,
            message: "Workshop not found!"
        })
    }


    res.status(201).json({
        success: true,
        message: "Workshop Updated Successfully!"
    })



})


exports.getWorkshop = catchAsyncError(async (req, res, next) => {
    try {
        const workshops = await Workshop.find({ campus: req.params.campus });
        if (!workshops) {
            return res.status(404).json({
                success: false,
                message: `Workshop not found for this ${req.params.campus}`
            });
        }

        res.status(201).json({
            success: true,
            message: "Workshops data fetched Successfully!",
            workshops,

        })

    }
    catch (error) {
        console.log(error);
    }

});


exports.allWorkshops = catchAsyncError(async (req, res, next) => {
    try {
        const workshops = await Workshop.find({});
        if (!workshops) {
            return res.status(404).json({
                success: false,
                message: "Workshops not found!"
            });

        }
        res.status(201).json({
            success: true,
            message: "Workshops fetched Successfully!",
            workshops
        })
    }
    catch (error) {
        console.log(error);
    }
});


exports.fetchWorkshopRegisteredUsers = catchAsyncError(async (req, res, next) => {
    try {
        const workshop = await Workshop.findById(req.params.workshopId).populate('registeredUsers');
        const registrations = await WorkshopRegistration.find({ workshop: req.params.workshopId }).populate('user');
        // console.log(status);
        if (!workshop) {
            return res.status(404).json({ message: 'Workshop not found' });
        }
        console.log(registrations);
        console.log(workshop);

        const userDetail = registrations.map(registration => ({
            user: registration.user._id,
            name: registration.user.name,
            email: registration.user.email,
            date: registration.date,
            status: registration.status,
            registerId: registration._id,
            _id: registration.workshop,
            workshop: workshop.title
        }));
        console.log(userDetail);


        res.status(201).json({
            success: true,
            message: 'User data fetched Successfully',
            userDetail,

        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }

});

exports.statusChange = catchAsyncError(async (req, res, next) => {
    const Id = req.params.Id;
    try {
        const RegisteredWorkshop = await WorkshopRegistration.findOneAndUpdate({ _id: Id }, {
            status: req.body.status
        });
        if (!RegisteredWorkshop) {
            return res.status(404)
                .json({ message: 'Registration not found' });
        }
        res.status(201).json({
            success: true,
            message: "Status updated successfully",

        })
    }
    catch (error) {
        console.log(error);
        return res.status(500)
            .json({
                success: false,
                message: error.message
            });
    }


});

exports.deleteRegisteredWorkshop = catchAsyncError(async (req, res, next) => {
    const Id = req.params.Id;
    const userId = req.user._id;
    try {

        const registeredWorkshop = await WorkshopRegistration.findByIdAndDelete(Id);
        if (!registeredWorkshop) {
            return res.status(404).json({
                success: false,
                message: "Data not found"
            });
        }
        const workshop = await Workshop.findByIdAndUpdate(
            registeredWorkshop.workshop,
            { $pull: { registeredUsers: userId } },
            { new: true }
        );

        if (!workshop) {
            return res.status(404).json({
                success: false,
                message: "Workshop not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Deleted Successfully"
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

exports.countWorkshop = catchAsyncError(async (req, res, next) => {
    try {
        const campuses = ['KTR', 'RMP', 'VDP', 'NCR', 'TPJ'];

        // Create an object to hold the counts
        const counts = {};
        for (const campus of campuses) {
            const count = await Workshop.countDocuments({ campus });
            counts[campus] = count;
        }

        console.log('Workshop counts by campus:', counts);
        return res.status(201).json({
            success: true,
            message: "fetched successfully!",
            counts
        })
    } catch (error) {
        console.error('Error counting workshops by campus:', error);
        throw error;
    }
});

exports.workhsopRegisteredDetails = catchAsyncError(async (req, res, next) => {
    const Id = req.user._id;
    console.log(req.user);
    try {


        const workshopDetails = await WorkshopRegistration.find({ user: Id });
        if (!workshopDetails) {
            return res.status(404).json({
                success: false,
                message: "Data not found"
            });
        }
        console.log(workshopDetails);
        return res.status(200).json({
            success: true,
            message: "Data fetched successfully",
            workshopDetails
        })
    }
    catch (error) {
        console.log(error);
    }
});

exports.StaffRegisteredWorkshops = catchAsyncError(async (req, res, next) => {
    const Id = req.user._id;
    try {
        const workshops = await WorkshopRegistration.find({ user: Id }).populate('workshop').exec();

        if (!workshops) {
            return res.status(404).json({
                success: false,
                message: "Data not found"
            });
        }

        const details = workshops.map(data => ({
            _id: data._id,
            workshopId: data.workshop._id,
            title: data.workshop.title,
            description: data.workshop.description,
            date: data.workshop.date,
            status: data.status,
            registeredAt: data.createdAt
        }));

        return res.status(201).json({
            success: true,
            message: 'Data fetched successfully',
            details,
            workshops
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error',
            error
        });
    }
})

exports.StaffCertifiedWorkshops = catchAsyncError(async (req, res, next) => {
    const Id = req.user._id;
    try {
        const workshops = await WorkshopRegistration.find({ user: Id, status: 'Certified' }).populate('workshop').exec();

        if (!workshops) {
            return res.status(404).json({
                success: false,
                message: "Data not found"
            });
        }

        const details = workshops.map(data => ({
            _id: data._id,
            workshopId: data.workshop._id,
            title: data.workshop.title,
            description: data.workshop.description,
            date: data.workshop.date,
            status: data.status,
            registeredAt: data.createdAt
        }));

        return res.status(201).json({
            success: true,
            message: 'Data fetched successfully',
            details,
            workshops
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error',
            error
        });
    }
})

exports.myEvents = catchAsyncError(async (req, res, next) => {
    const Id = req.user._id;
    try {
        const workshops = await Workshop.find({ createdBy: Id });
        if (!workshops) {
            return res.status(404).json({
                success: false,
                message: "Data not found"
            });
        }
        return res.status(201).json({
            success: true,
            message: "workshops fetched successfully",
            workshops
        });
    }
    catch (error) {
        console.log(error);
    }
})