const API_URL = 'http://localhost:5000/api';

// Get all events
export const getEvents = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/events`, {
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
      },
    });
    return await response.json();
  } catch (error) {
    console.error('Error fetching events:', error);
    return [];
  }
};

// Create new event
export const createEvent = async (eventData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/events`, {
      method: 'POST',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData),
    });
    return await response.json();
  } catch (error) {
    console.error('Error creating event:', error);
    return { error: 'Failed to create event' };
  }
};