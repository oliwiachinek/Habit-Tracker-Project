const express = require('express');
const router = express.Router();
const db = require('../config/db'); 

router.post('/request', async (req, res) => {
  const { requesterId, recipientEmail } = req.body;

  if (!requesterId || !recipientEmail) {
    return res.status(400).json({ error: 'Missing requesterId or recipientEmail' });
  }

  try {
    const recipientRes = await db.query(
      `SELECT user_id FROM profiles WHERE email = $1`,
      [recipientEmail]
    );
    if (recipientRes.rows.length === 0) {
      return res.status(404).json({ error: 'User does not exist' });
    }

    const recipientId = recipientRes.rows[0].user_id;

    if (parseInt(requesterId) === recipientId) {
      return res.status(400).json({ error: "You can't add yourself" });
    }


    const friendsRes = await db.query(
      `
        SELECT 1 FROM friend_requests
        WHERE (
          (requester_id = $1 AND recipient_id = $2)
          OR (requester_id = $2 AND recipient_id = $1)
        ) AND status = 'accepted'
      `,
      [requesterId, recipientId]
    );
    if (friendsRes.rows.length > 0) {
      return res.status(400).json({ error: 'You are already friends' });
    }

    const pendingRes = await db.query(
      `
        SELECT 1 FROM friend_requests
        WHERE (
          (requester_id = $1 AND recipient_id = $2)
          OR (requester_id = $2 AND recipient_id = $1)
        ) AND status = 'pending'
      `,
      [requesterId, recipientId]
    );
    if (pendingRes.rows.length > 0) {
      return res.status(400).json({ error: 'Friend request already pending' });
    }

    await db.query(
      `
        INSERT INTO friend_requests (requester_id, recipient_id, status)
        VALUES ($1, $2, 'pending')
      `,
      [requesterId, recipientId]
    );

    res.status(200).json({ message: 'Friend request sent!' });
  } catch (err) {
    console.error('Error sending friend request:', err);
    res.status(500).json({ error: 'Failed to send friend request' });
  }
});

router.post('/accept', async (req, res) => {
  const { recipientId, requesterId } = req.body;

  try {
    await db.query(`
      UPDATE friend_requests
      SET status = 'accepted'
      WHERE requester_id = $1 AND recipient_id = $2 AND status = 'pending'
    `, [requesterId, recipientId]);

    res.status(200).json({ message: 'Friend request accepted!' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to accept friend request' });
  }
});

router.get('/pending/:userId', async (req, res) => {
  const userId = req.params.userId;

  try {
    const result = await db.query(`
      SELECT fr.requester_id, p.full_name, p.email
      FROM friend_requests fr
      JOIN profiles p ON p.user_id = fr.requester_id
      WHERE fr.recipient_id = $1 AND fr.status = 'pending'
    `, [userId]);

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch pending requests' });
  }
});

router.get('/leaderboard/:userId', async (req, res) => {
  const userId = parseInt(req.params.userId);

  try {
    const friendsRes = await db.query(`
      SELECT p.user_id, p.full_name, p.email, p.points
      FROM profiles p
      JOIN friend_requests fr
        ON (
          (fr.requester_id = $1 AND fr.recipient_id = p.user_id)
          OR (fr.recipient_id = $1 AND fr.requester_id = p.user_id)
        )
        AND fr.status = 'accepted'
      ORDER BY p.points DESC
    `, [userId]);

    const selfRes = await db.query(`
      SELECT user_id, full_name, email, points FROM profiles WHERE user_id = $1
    `, [userId]);

    const leaderboard = [selfRes.rows[0], ...friendsRes.rows];
    leaderboard.sort((a, b) => b.points - a.points);

    res.status(200).json(leaderboard);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

module.exports = router;
