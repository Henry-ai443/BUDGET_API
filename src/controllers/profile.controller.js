import User from "../models/User.js";
import Transaction from "../models/Transaction.js";
import Budget from "../models/Budget.js";
import cloudinary from "../config/cloudinary.js";
import multer from "multer";

const storage = multer.memoryStorage();
const upload = multer({ storage });

export const uploadMiddleware = upload;

export const getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await User.findById(userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    const transactions = await Transaction.find({ user: userId }).sort({ date: -1 });
    const budgets = await Budget.find({ user: userId });

    res.json({
      profile: {
        id: user._id,
        username: user.username,
        email: user.email,
        profilePicture: user.profilePicture,
        currency: user.currency,
        createdAt: user.createdAt,
      },
      transactions,
      budgets,
    });
  } catch (error) {
    console.error("Profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { username, email, password } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // If email being changed, ensure it's not taken
    if (email && email !== user.email) {
      const exists = await User.findOne({ email });
      if (exists) return res.status(400).json({ message: "Email already in use" });
      user.email = email;
    }

    if (username) user.username = username;
    if (password) user.password = password; // will be hashed by pre-save hook

    // If an image file was uploaded, upload to Cloudinary
    if (req.file && req.file.buffer) {
      const dataUri = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
      const result = await cloudinary.uploader.upload(dataUri, { folder: "profile_images" });
      user.profilePicture = result.secure_url;
    }

    await user.save();

    const userObj = user.toObject();
    delete userObj.password;

    res.json({ message: "Profile updated", user: userObj });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export default { getProfile, updateProfile, uploadMiddleware };
