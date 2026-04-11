import { getEventStatus, getAllEventStatuses } from './event-state.js';

export default async function handler(req, res) {
  try {
    const { event_name } = req.query;
    if (event_name) {
      const is_open = await getEventStatus(event_name);
      return res.status(200).json({ event_name, is_open });
    }
    const statuses = await getAllEventStatuses();
    return res.status(200).json(statuses);
  } catch (err) {
    console.error('get-event-status error:', err);
    return res.status(500).json({ error: 'Failed to fetch event statuses' });
  }
}
