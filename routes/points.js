router.patch('/:userId/points', async (req, res) => {
    const { userId } = req.params;
    const { delta } = req.body; 
  
    try {
      const result = await pool.query(
        `UPDATE users SET points = points + $1 WHERE user_id = $2 RETURNING points`,
        [delta, userId]
      );
      res.json({ newPoints: result.rows[0].points });
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ error: 'Failed to update user points' });
    }
  });
  