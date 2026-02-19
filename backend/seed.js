require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('./models/Category');
const connectDB = require('./config/db');

const defaultCategories = [
    { name: 'Programming', description: 'General programming discussions, algorithms, and code help.' },
    { name: 'AI / ML', description: 'Artificial intelligence, machine learning, and data science.' },
    { name: 'Web Development', description: 'Frontend, backend, APIs, and web technologies.' },
    { name: 'Hackathons', description: 'Hackathon announcements, team formation, and results.' },
    { name: 'Internships', description: 'Internship opportunities, experiences, and advice.' },
    { name: 'Placements', description: 'Campus placement preparation, companies, and offers.' },
    { name: 'Projects', description: 'Share and discuss your personal and academic projects.' },
];

const seed = async () => {
    await connectDB();
    console.log('Seeding default categories...');

    for (const cat of defaultCategories) {
        const exists = await Category.findOne({ name: cat.name });
        if (!exists) {
            await Category.create(cat);
            console.log(`  ✓ Created: ${cat.name}`);
        } else {
            console.log(`  – Skipped (exists): ${cat.name}`);
        }
    }

    console.log('Seeding complete!');
    process.exit(0);
};

seed().catch((e) => { console.error(e); process.exit(1); });
