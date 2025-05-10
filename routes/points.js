router.patch('/:userId/points', async (req, res) => {
  const { userId } = req.params;
  const { delta } = req.body;

  if (typeof delta !== 'number') {
    return res.status(400).json({ error: 'Delta must be a number' });
  }

  try {
    const result = await pool.query(
      `UPDATE profiles SET points = points + $1 WHERE user_id = $2 RETURNING points`,
      [delta, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    res.json({ points: result.rows[0].points });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Failed to update profile points' });
  }
});
