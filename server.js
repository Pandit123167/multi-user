const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const multer = require('multer');
const cors = require('cors');
const { Schema } = mongoose;

const app = express();
const port = 5000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// MongoDB Connection
mongoose.connect('mongodb://127.0.0.1:27017/multi-user', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

// MongoDB Schema
const userProfileSchema = new Schema({
    profilePhoto: Buffer, // Store image as Buffer
    username: String,
    newPassword: String,
    profession: String,
    company: String,
    gender: String,
    customGender: String,
    addressLine1: String,
    country: String,
    state: String,
    city: String,
    plan: String,
    newsletter: Boolean,
});

const UserProfile = mongoose.model('UserProfile', userProfileSchema);

// Multer storage configuration (IN-MEMORY STORAGE)
const storage = multer.memoryStorage(); // Use memory storage
const upload = multer({ storage: storage }); // Configure multer with memory storage


// API endpoint to handle form submission
app.post('/api/submit', (req, res) => {
    upload.single('profilePhoto')(req, res, async (err) => {
        if (err) {
            console.error('Multer Error:', err);
            return res.status(500).json({ error: 'Failed to upload file.' });
        }

        console.log('Request Headers:', req.headers);
        console.log('req.file after Multer:', req.file);

        try {
            const {
                username,
                newPassword,
                profession,
                company,
                gender,
                customGender,
                addressLine1,
                country,
                state,
                city,
                plan,
                newsletter,
            } = req.body;

            console.log('Request Body:', req.body);

            let profilePhotoData = null;
            if (req.file) {
                profilePhotoData = req.file.buffer;
                console.log('Image data size:', profilePhotoData.length);
            }

            console.log('Data to be saved:', {
                profilePhoto: profilePhotoData ? 'Buffer' : null,
                username,
                newPassword,
                profession,
                company,
                gender,
                customGender,
                addressLine1,
                country,
                state,
                city,
                plan,
                newsletter: newsletter === 'on',
            });

            const newUserProfile = new UserProfile({
                profilePhoto: profilePhotoData,
                username,
                newPassword,
                profession,
                company,
                gender,
                customGender,
                addressLine1,
                country,
                state,
                city,
                plan,
                newsletter: newsletter === 'on',
            });

            console.log('UserProfile object before saving:', newUserProfile);

            const savedProfile = await newUserProfile.save();
            console.log('Data saved successfully!', savedProfile);
            res.status(200).json({ message: 'Profile saved successfully!', savedProfile });

        } catch (error) {
            console.error('Error saving profile:', error);
            res.status(500).json({ error: 'Failed to save profile.', details: error.message });
        }
    });
});

// API endpoint to check username availability
app.get('/api/check-username/:username', async (req, res) => {
    const { username } = req.params;
    try {
        const existingUser = await UserProfile.findOne({ username });
        res.json({ available: !existingUser });
    } catch (error) {
        console.error('Error checking username:', error);
        res.status(500).json({ error: 'Failed to check username.' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

