const axios = require('axios');
const HttpError = require('../models/http-error');
const API_KEY = '';  // Add your own GeoApify API Key

async function getCoordsForAddress(address){
    
    const response = await axios.get(`https://api.geoapify.com/v1/geocode/search?text=${address}&apiKey=${API_KEY}`);
    let data = response.data;

    if(!data || data.status == 0){ 
        const error = new HttpError("Could Not find location for specified adddres", 422);
        throw error;
    }

    const coordinates = data.features[0].geometry.coordinates;

    return coordinates;
}

module.exports = getCoordsForAddress;