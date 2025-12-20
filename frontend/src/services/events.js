import API from './api';

export const getEvents = async () => {
  try {
    const response = await API.get('/events');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch events' };
  }
};

export const createEvent = async (eventData) => {
  try {
    const response = await API.post('/events', eventData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to create event' };
  }
};