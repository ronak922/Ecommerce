import { getToken } from '../utils/authUtils';

const apiUrl = 'http://localhost:4000/api/products';

const fetchProducts = async() => {
    const token = getToken();

    try {
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching products:', error);
    }
};

export default fetchProducts;