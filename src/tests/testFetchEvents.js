// testFetchEvents.js
import { fetchEvents } from '../services/fetchEvents.js';

const test = async () => {
  const categories = ['food']; // Example categories
  const location = 'Toronto'; // Example location

  const events = await fetchEvents(categories, location);
  console.log(`\u2705 Fetched ${events.length} events.`);

  events.forEach((e, i) => {
    console.log(`${i + 1}. ${e.title}`);
    console.log(`   \ud83d\udccd URL: ${e.link}`);
    console.log(`   \ud83d\udcdd Snippet: ${e.snippet}`);
    if (e.start_date || e.start_time) {
      console.log(`   \u23f0 Date/Time: ${e.start_date || ''} ${e.start_time || ''}`);
    }
    console.log('');
  });
};

test();
