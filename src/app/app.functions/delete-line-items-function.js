const axios = require('axios');

const deleteLineItems = async (lineItems, HUBSPOT_PRIVATE_APP_TOKEN) => {
    try {
        // Create an array of promises for each line item deletion
        const deletePromises = lineItems.map(item =>
            axios.delete(
                `https://api.hubapi.com/crm/v3/objects/line_items/${item.hs_object_id}`,
                {
                    headers: {
                        'Authorization': `Bearer ${HUBSPOT_PRIVATE_APP_TOKEN}`,
                        'Content-Type': 'application/json'
                    }
                }
            )
        );

        // Execute all delete operations in parallel
        await Promise.all(deletePromises);
        return true;
    } catch (error) {
        console.error('Error deleting line items:', error.response?.data || error.message);
        throw error;
    }
};

exports.main = async (context = {}) => {
    try {
        const { lineItems, dealId, isFlightGroup, productType } = context.parameters;

        if (!lineItems || !dealId) {
            return {
                success: false,
                message: 'Missing required parameters: lineItems or dealId',
            };
        }

        // Get the private app token from secrets
        const HUBSPOT_PRIVATE_APP_TOKEN = process.env['PRIVATE_APP_ACCESS_TOKEN'];
        if (!HUBSPOT_PRIVATE_APP_TOKEN) {
            throw new Error('PRIVATE_APP_ACCESS_TOKEN is not configured');
        }

        // Delete the line items
        await deleteLineItems(lineItems, HUBSPOT_PRIVATE_APP_TOKEN);

        // Prepare success message based on product type and group status
        let successMessage = '';
        if (isFlightGroup) {
            successMessage = `Successfully deleted flight group with ${lineItems.length} passengers`;
        } else {
            successMessage = `Successfully deleted ${productType} line item`;
        }

        // Return success response
        return {
            success: true,
            message: successMessage,
            data: {
                dealId,
                deletedItems: lineItems.map(item => ({
                    id: item.hs_object_id,
                    type: item.hs_product_type,
                    name: item.name
                }))
            }
        };

    } catch (error) {
        console.error('Error in delete-line-items-function:', error);

        // Determine the error message to send back
        let errorMessage = 'An unexpected error occurred while deleting line items';
        if (error.response?.status === 404) {
            errorMessage = 'One or more line items not found';
        } else if (error.response?.status === 401) {
            errorMessage = 'Authentication failed';
        }

        // Return error response
        return {
            success: false,
            message: errorMessage,
            error: {
                status: error.response?.status || 500,
                details: error.response?.data || error.message
            }
        };
    }
};