
export const fetchEvents = async (categories, city) => {
  const apiKey = 'AIzaSyA1Jzs7jWw2IPwyU1sIVWEUG31ZVvY6MQY';
  const cx = '0344923418c0b4735';

  for (const category of categories) {
    let query = `${category} event vendor registration`;
    if (city) query += ` in ${city}`;

    const encodedQuery = encodeURIComponent(query);
    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}cx=${cx}=${encodedQuery}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.items) {
        console.log(`📦 Fetched events for "${query}":`, data.items);
        // Optional: Save to Supabase here or return parsed data
      }
    } catch (error) {
      console.error(`❌ Error fetching events for ${query}:`, error);
    }
  }
};
