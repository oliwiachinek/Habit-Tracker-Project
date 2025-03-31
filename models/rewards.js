const pool = require('../db');

const createReward = async (userId, title, pointsRequired) => {
    try {
        const result = await pool.query(
            'INSERT INTO rewards (user_id, title, points_required) VALUES ($1, $2, $3) RETURNING *',
            [userId, title, pointsRequired]
        );
        return result.rows[0];
    } catch (error) {
        throw error;
    }
};

const getRewardsByUser = async (userId) => {
    try {
        const result = await pool.query('SELECT * FROM rewards WHERE user_id = $1', [userId]);
        return result.rows;
    } catch (error) {
        throw error;
    }
};


const redeemReward = async (userId, rewardId) => {
    try {
        const user = await pool.query('SELECT points FROM users WHERE id = $1', [userId]);
        const reward = await pool.query('SELECT * FROM rewards WHERE id = $1', [rewardId]);

        if (user.rows[0].points < reward.rows[0].points_required) {
            throw new Error('Not enough points to redeem this reward.');
        }

        await pool.query(
            'UPDATE users SET points = points - $1 WHERE id = $2',
            [reward.rows[0].points_required, userId]
        );

        return { message: 'Reward redeemed successfully!' };
    } catch (error) {
        throw error;
    }
};

module.exports = { createReward, getRewardsByUser, redeemReward };
