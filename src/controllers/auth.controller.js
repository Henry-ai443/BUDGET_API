import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const register = async (req, res) => {
    const { username,email, password, currency } = req.body;

    if(!username || !email || !password || !currency) {
        return res.status(400).json({ message: "All fields are required" });
    }

    if(password.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters long" });
    }


    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const newUser = new User({ username, email, password, currency });
        await newUser.save();

        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ message: "Server error", error: String(error), stack: error.stack });
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;

    if(!email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({ token });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: "Server error", error: String(error), stack: error.stack });
    }
};