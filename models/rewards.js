const pool = require('../config/db');

const createReward = async (userId, name, cost, image) => {
    try {
        const result = await pool.query(
            'INSERT INTO rewards (user_id, name, cost, image) VALUES ($1, $2, $3, $4) RETURNING *',
            [userId, name, cost, image || null]
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
        console.log("🧠 redeemReward() called with:", { userId, rewardId });

        const reward = await pool.query('SELECT * FROM rewards WHERE reward_id = $1', [rewardId]);
        const user = await pool.query('SELECT points FROM profiles WHERE user_id = $1', [userId]);

        if (user.rows.length === 0 || reward.rows.length === 0) {
            throw new Error('User or reward not found');
        }

        if (user.rows[0].points < reward.rows[0].cost) {
            throw new Error('Not enough points to redeem this reward.');
        }

        await pool.query(
            'UPDATE profiles SET points = points - $1 WHERE user_id = $2',
            [reward.rows[0].cost, userId]
        );

        await pool.query(
            'UPDATE rewards SET claimed = TRUE WHERE reward_id = $1',
            [rewardId]
        );

        return { message: 'Reward redeemed successfully!' };
    } catch (error) {
        console.error("❌ Error in redeemReward():", error);
        throw error;
    }
};

module.exports = { createReward, getRewardsByUser, redeemReward };
