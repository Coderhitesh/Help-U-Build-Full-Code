const ProviderService = require('../models/ProviderService.model');

// Create and Save a new ProviderService
exports.createProviderService = (req, res) => {
    try {
        const { category, conceptDesignWithStructure, buildingServiceMEP, workingDrawing, interior3D, exterior3D, provider } = req.body;
        const emptyFields = [];
        if (!category) emptyFields.push('category');
        if (!conceptDesignWithStructure) emptyFields.push('conceptDesignWithStructure');
        if (!buildingServiceMEP) emptyFields.push('buildingServiceMEP');
        if (!workingDrawing) emptyFields.push('workingDrawing');
        if (!interior3D) emptyFields.push('interior3D');
        if (!exterior3D) emptyFields.push('exterior3D');
        if (!provider) emptyFields.push('provider');
        if (emptyFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Please provide ${emptyFields.join(', ')}.`,
            });
        }
        // Create a new ProviderService object
        const providerService = new ProviderService({
            category,
            conceptDesignWithStructure,
            buildingServiceMEP,
            workingDrawing,
            interior3D,
            exterior3D,
            provider,
        });
        // Save ProviderService in the database
        providerService.save()
        res.status(201).json({
            success: true,
            message: 'ProviderService created successfully',
            data: providerService,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message,
        })
    }
}

// Retrieve and return all ProviderServices from the database.
exports.getAllProviderService = (req, res) => {
    try {
        const providerService = ProviderService.find();
        if (!providerService) {
            return res.status(404).json({
                success: false,
                message: 'ProviderService not found',
            });
        }
        res.status(200).json({
            success: true,
            message: 'ProviderService retrieved successfully',
            data: providerService,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message,
        })
    }
}

// Find a single ProviderService with a providerId
exports.getProviderServiceById = (req, res) => {
    try {
        const providerId = req.params.providerId;
        const providerService = ProviderService.findById(providerId);
        if (!providerService) {
            return res.status(404).json({
                success: false,
                message: 'ProviderService not found',
            });
        }
        res.status(200).json({
            success: true,
            message: 'ProviderService retrieved successfully',
            data: providerService,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message,
        })
    }
}

// Update a ProviderService identified by the providerId in the request
exports.updateProviderService = async (req, res) => {
    try {
        const providerId = req.params.providerId;
        const { category, conceptDesignWithStructure, buildingServiceMEP, workingDrawing, interior3D, exterior3D, provider } = req.body;

        // Validate required fields
        const emptyFields = [];
        if (!category) emptyFields.push('category');
        if (!conceptDesignWithStructure) emptyFields.push('conceptDesignWithStructure');
        if (!buildingServiceMEP) emptyFields.push('buildingServiceMEP');
        if (!workingDrawing) emptyFields.push('workingDrawing');
        if (!interior3D) emptyFields.push('interior3D');
        if (!exterior3D) emptyFields.push('exterior3D');
        if (!provider) emptyFields.push('provider');

        // If there are empty fields, return error
        if (emptyFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Please provide ${emptyFields.join(', ')}.`,
            });
        }

        // Find the existing provider service for the given providerId
        let providerService = await ProviderService.findOne({ provider: providerId, category: category }).lean(); // Check for both providerId and category

        // If no provider service is found for the given category, create a new one
        if (!providerService) {
            providerService = await ProviderService.create({
                category,
                conceptDesignWithStructure,
                buildingServiceMEP,
                workingDrawing,
                interior3D,
                exterior3D,
                provider,
            });
            return res.status(201).json({
                success: true,
                message: 'ProviderService created successfully',
                data: providerService,
            });
        }

        // Update the existing provider service if found
        providerService = await ProviderService.findByIdAndUpdate(
            providerService._id, // Use the existing document's _id
            {
                category,
                conceptDesignWithStructure,
                buildingServiceMEP,
                workingDrawing,
                interior3D,
                exterior3D,
                provider,
            },
            {
                new: true,
                runValidators: true,
            }).lean(); // Using .lean() to return a plain object

        // Send the response
        res.status(200).json({
            success: true,
            message: 'ProviderService updated successfully',
            data: providerService,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message,
        });
    }
};

exports.deleteProviderService = (req, res) => {
    try {
        const providerId = req.params.providerId;
        const providerService = ProviderService.findByIdAndDelete(providerId);
        if (!providerService) {
            return res.status(404).json({
                success: false,
                message: 'ProviderService not found',
            });
        }
        res.status(200).json({
            success: true,
            message: 'ProviderService deleted successfully',
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message,
        })
    }
}

exports.findbyProvider = async (req, res) => {
    try {
        const { providerId, category } = req.params; // Extract providerId and category from the request params

        // Add .lean() to return plain JavaScript objects
        const providerService = await ProviderService.find({ provider: providerId, category: category }).lean();
        
        if (!providerService || providerService.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Provider Service not found for the given category',
            });
        }

        res.status(200).json({
            success: true,
            data: providerService,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message,
        });
    }
};