import mongoose from 'mongoose';
import { User, Admin, Cart, FoodItem, Orders, Restaurant } from './Schema.js';

const verifyCleanState = async () => {
    try {
        await mongoose.connect(
            'mongodb+srv://campusUser:MySecurepass123@team2.0faokyb.mongodb.net/foodDB'
        );

        console.log("MongoDB Atlas Connected ✅");

        // Your verification logic continues here...

    } catch (error) {
        console.error('❌ Verification error:', error.message);
        process.exit(1);
    }
};

verifyCleanState();
